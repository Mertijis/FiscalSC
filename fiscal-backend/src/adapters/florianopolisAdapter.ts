import { CityAdapter, CityQueryParams, ModuleType } from './cityAdapter.interface';

const BASE_URL = 'https://transparencia.e-publica.net/epublica-portal';

type EndpointConfig = {
  path: string;
  buildQuery: (params: CityQueryParams) => Record<string, string>;
};

const ENDPOINTS: Record<ModuleType, EndpointConfig> = {
  receita: {
    path: '/rest/florianopolis/api/v1/receita',
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
    path: '/rest/florianopolis/api/v1/despesa',
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
    path: '/rest/florianopolis/api/v1/despesaOrcamentaria',
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
    path: '/rest/florianopolis/api/v1/licitacao',
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
    path: '/rest/florianopolis/api/v1/contrato',
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
    path: '/rest/florianopolis/api/v1/pessoal',
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

export class FlorianopolisAdapter implements CityAdapter {
  cityId = 'florianopolis';
  cityName = 'Florianópolis';

  async fetchData(queryParams: CityQueryParams): Promise<any> {
    const tipo = (queryParams.tipo as ModuleType) || 'receita';
    const config = ENDPOINTS[tipo];

    if (!config) {
      throw new Error(`Módulo '${tipo}' não suportado para Florianópolis. Opções: ${Object.keys(ENDPOINTS).join(', ')}`);
    }

    const query = config.buildQuery(queryParams);
    const url = new URL(`${BASE_URL}${config.path}`);
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
        throw new Error(`Servidor da prefeitura retornou status HTTP ${res.status}`);
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

export const florianopolisAdapter = new FlorianopolisAdapter();
