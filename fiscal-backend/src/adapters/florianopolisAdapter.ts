import { CityAdapter, CityQueryParams, ModuleType } from './cityAdapter.interface';

export interface EpublicaAdapterOptions {
  cityId: string;
  cityName: string;
  baseUrl: string;
  tenantSlug: string;
  licitacaoMaxDays?: number;
}

type EndpointConfig = {
  getPath: (tenantSlug: string) => string;
  buildQuery: (params: CityQueryParams) => Record<string, string>;
};

const ENDPOINTS: Record<ModuleType, EndpointConfig> = {
  receita: {
    getPath: (slug) => `/rest/${slug}/api/v1/receita`,
    buildQuery: (params) => {
      const periodo = params.periodo || params.mes || '01/2024';
      return {
        periodo_inicial: periodo,
        periodo_final: periodo,
        inicio_registro: String(params.offset || 0),
        quantidade_registro: String(params.limit || 50),
        ...(params.codigoUnidade ? { codigo_unidade: String(params.codigoUnidade) } : {}),
      };
    },
  },
  despesa: {
    getPath: (slug) => `/rest/${slug}/api/v1/despesa`,
    buildQuery: (params) => {
      const periodo = params.periodo || params.mes || '01/2024';
      return {
        periodo_inicial: periodo,
        periodo_final: periodo,
        inicio_registro: String(params.offset || 0),
        quantidade_registro: String(params.limit || 50),
        ...(params.codigoUnidade ? { codigo_unidade: String(params.codigoUnidade) } : {}),
      };
    },
  },
  despesaOrcamentaria: {
    getPath: (slug) => `/rest/${slug}/api/v1/despesaOrcamentaria`,
    buildQuery: (params) => {
      const periodo = params.periodo || params.mes || '01/2024';
      return {
        periodo_inicial: periodo,
        periodo_final: periodo,
        inicio_registro: String(params.offset || 0),
        quantidade_registro: String(params.limit || 50),
        ...(params.codigoUnidade ? { codigo_unidade: String(params.codigoUnidade) } : {}),
      };
    },
  },
  licitacao: {
    getPath: (slug) => `/rest/${slug}/api/v1/licitacao`,
    buildQuery: (params) => {
      const dataInicio = params.dataInicio || '01/01/2024';
      const dataFim = params.dataFim || '15/01/2024';
      return {
        periodo_inicial: dataInicio,
        periodo_final: dataFim,
        inicio_registro: String(params.offset || 0),
        quantidade_registro: String(params.limit || 50),
        ...(params.codigoUnidade ? { codigo_unidade: String(params.codigoUnidade) } : {}),
      };
    },
  },
  contrato: {
    getPath: (slug) => `/rest/${slug}/api/v1/contrato`,
    buildQuery: (params) => {
      const dataInicio = params.dataInicio || '01/01/2024';
      const dataFim = params.dataFim || '15/01/2024';
      return {
        periodo_inicial: dataInicio,
        periodo_final: dataFim,
        inicio_registro: String(params.offset || 0),
        quantidade_registro: String(params.limit || 50),
        ...(params.codigoUnidade ? { codigo_unidade: String(params.codigoUnidade) } : {}),
      };
    },
  },
  pessoal: {
    getPath: (slug) => `/rest/${slug}/api/v1/pessoal`,
    buildQuery: (params) => {
      const referencia = params.periodo || params.mes || '01/2024';
      return {
        referencia,
        inicio_registro: String(params.offset || 0),
        quantidade_registro: String(params.limit || 50),
        ...(params.codigoUnidade ? { codigo_unidade: String(params.codigoUnidade) } : {}),
      };
    },
  },
};

export class EpublicaCityAdapter implements CityAdapter {
  cityId: string;
  cityName: string;
  baseUrl: string;
  tenantSlug: string;
  licitacaoMaxDays: number;

  constructor(options: EpublicaAdapterOptions) {
    this.cityId = options.cityId;
    this.cityName = options.cityName;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.tenantSlug = options.tenantSlug;
    this.licitacaoMaxDays = options.licitacaoMaxDays ?? 31;
  }

  async fetchData(queryParams: CityQueryParams): Promise<any> {
    const tipo = (queryParams.tipo as ModuleType) || 'receita';
    const config = ENDPOINTS[tipo];

    if (!config) {
      throw new Error(
        `Módulo '${tipo}' não suportado para ${this.cityName}. Opções: ${Object.keys(ENDPOINTS).join(', ')}`
      );
    }

    const query = config.buildQuery(queryParams);
    const path = config.getPath(this.tenantSlug);
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(query).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'FiscalSC-Worker/2.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Servidor da prefeitura (${this.cityName}) retornou status HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        tipo,
        cityId: this.cityId,
        cityName: this.cityName,
        targetUrl: url.toString(),
        totalRegistros: data?.totalRegistros ?? (Array.isArray(data?.registros) ? data.registros.length : 0),
        ultimaAtualizacao: data?.ultimaAtualizacao ?? null,
        registros: data?.registros ?? (Array.isArray(data) ? data : []),
        raw: data,
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      throw err;
    }
  }
}

export class FlorianopolisAdapter extends EpublicaCityAdapter {
  constructor() {
    super({
      cityId: 'florianopolis',
      cityName: 'Florianópolis',
      baseUrl: 'https://transparencia.e-publica.net/epublica-portal',
      tenantSlug: 'florianopolis',
      licitacaoMaxDays: 15,
    });
  }
}

export const florianopolisAdapter = new FlorianopolisAdapter();

export const joinvilleAdapter = new EpublicaCityAdapter({
  cityId: 'joinville',
  cityName: 'Joinville',
  baseUrl: 'https://transparencia.joinville.sc.gov.br/epublica-portal',
  tenantSlug: 'joinville',
  licitacaoMaxDays: 31,
});

export const itajaiAdapter = new EpublicaCityAdapter({
  cityId: 'itajai',
  cityName: 'Itajaí',
  baseUrl: 'https://portaltransparencia.itajai.sc.gov.br/epublica-portal',
  tenantSlug: 'itajai',
  licitacaoMaxDays: 31,
});

export const chapecoAdapter = new EpublicaCityAdapter({
  cityId: 'chapeco',
  cityName: 'Chapecó',
  baseUrl: 'https://transparencia.e-publica.net/epublica-portal',
  tenantSlug: 'chapeco',
  licitacaoMaxDays: 31,
});
