import { fetchCityData } from './cityApiService';
import { getCache, setCache } from '../redis/client';
import crypto from 'crypto';

export type ReceitaMesDetalhe = {
  mes: string;
  subtotal: number;
  quantidadeRegistros: number;
  totalRegistrosBase: number;
  status: number;
  error?: string;
};

export type ReceitaTrimestreResultado = {
  success: boolean;
  trimestreReferencia: string;
  mesesConsultados: string[];
  somaTotalTrimestre: number;
  mediaMensal: number;
  detalhesPorMes: ReceitaMesDetalhe[];
  tempoExecucaoMs: number;
  source: 'cache' | 'worker';
  cacheKey: string;
  timestamp: string;
  error?: string;
};

function resolveMesesTrimestre(params: {
  meses?: string[];
  ano?: string | number;
  trimestre?: string | number;
}): { meses: string[]; rotulo: string } {
  if (params.meses && Array.isArray(params.meses) && params.meses.length >= 3) {
    const valid = params.meses.slice(0, 3);
    return {
      meses: valid,
      rotulo: `Meses: ${valid.join(', ')}`,
    };
  }

  const ano = String(params.ano || '2024');
  const trimestre = String(params.trimestre || '1');

  switch (trimestre) {
    case '2':
      return {
        meses: [`04/${ano}`, `05/${ano}`, `06/${ano}`],
        rotulo: `2º Trimestre de ${ano}`,
      };
    case '3':
      return {
        meses: [`07/${ano}`, `08/${ano}`, `09/${ano}`],
        rotulo: `3º Trimestre de ${ano}`,
      };
    case '4':
      return {
        meses: [`10/${ano}`, `11/${ano}`, `12/${ano}`],
        rotulo: `4º Trimestre de ${ano}`,
      };
    case '1':
    default:
      return {
        meses: [`01/${ano}`, `02/${ano}`, `03/${ano}`],
        rotulo: `1º Trimestre de ${ano}`,
      };
  }
}

export async function aggregateReceitasTrimestre(
  cityId: string,
  params: {
    meses?: string[];
    ano?: string | number;
    trimestre?: string | number;
    limit?: number;
  }
): Promise<ReceitaTrimestreResultado> {
  const startTime = Date.now();
  const { meses, rotulo } = resolveMesesTrimestre(params);
  const limit = Math.max(1, Math.min(Number(params.limit || 500), 2000));

  const hash = crypto.createHash('md5').update(JSON.stringify({ cityId, meses, limit })).digest('hex');
  const cacheKey = `aggregate_${cityId}_receita_${hash}`;

  // 1. Verificar Cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      source: 'cache',
      tempoExecucaoMs: Date.now() - startTime,
    };
  }

  // 2. Consulta sequencial controlada para prevenir rate-limiting da prefeitura
  const detalhesPorMes: ReceitaMesDetalhe[] = [];

  for (const mes of meses) {
    try {
      const data = await fetchCityData(cityId, {
        tipo: 'receita',
        mes,
        limit,
      });

      const registros = data?.registros || [];
      let subtotal = 0;

      for (const item of registros) {
        const reg = item.registro || item;
        const movimentos = reg.listMovimentos || [];
        for (const mov of movimentos) {
          const tipo = String(mov.tipoMovimento || '').toLowerCase();
          const val = Number(mov.valorMovimento);
          if (isNaN(val)) continue;

          if (tipo.includes('arrecadação') || tipo.includes('arrecadacao')) {
            if (tipo.includes('estorno') || tipo.includes('anula') || tipo.includes('cancela')) {
              subtotal -= Math.abs(val);
            } else {
              subtotal += val;
            }
          } else if (
            tipo.includes('restituição') ||
            tipo.includes('restituicao') ||
            tipo.includes('dedução') ||
            tipo.includes('deducao')
          ) {
            subtotal -= Math.abs(val);
          }
        }
      }

      detalhesPorMes.push({
        mes,
        subtotal: Math.round(subtotal * 100) / 100,
        quantidadeRegistros: registros.length,
        totalRegistrosBase: data?.totalRegistros ?? registros.length,
        status: 200,
      });

      // Pequena pausa (80ms) para proteger o servidor municipal
      await new Promise((resolve) => setTimeout(resolve, 80));
    } catch (err: unknown) {
      detalhesPorMes.push({
        mes,
        subtotal: 0,
        quantidadeRegistros: 0,
        totalRegistrosBase: 0,
        status: 500,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const somaTotalTrimestre = Math.round(
    detalhesPorMes.reduce((acc, m) => acc + m.subtotal, 0) * 100
  ) / 100;
  const mediaMensal = Math.round((somaTotalTrimestre / detalhesPorMes.length) * 100) / 100;
  const tempoExecucaoMs = Date.now() - startTime;

  const resultado: ReceitaTrimestreResultado = {
    success: true,
    trimestreReferencia: rotulo,
    mesesConsultados: meses,
    somaTotalTrimestre,
    mediaMensal,
    detalhesPorMes,
    tempoExecucaoMs,
    source: 'worker',
    cacheKey,
    timestamp: new Date().toISOString(),
  };

  // Salvar no Cache por 24 horas (86400s)
  await setCache(cacheKey, resultado, 86400);

  return resultado;
}
