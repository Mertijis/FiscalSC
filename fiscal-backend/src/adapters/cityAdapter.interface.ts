export type ModuleType =
  | 'receita'
  | 'despesa'
  | 'despesaOrcamentaria'
  | 'licitacao'
  | 'contrato'
  | 'pessoal';

export interface CityQueryParams {
  tipo?: ModuleType;
  mes?: string;
  periodo?: string;
  dataInicio?: string;
  dataFim?: string;
  limit?: number;
  offset?: number;
  codigoUnidade?: string;
  [key: string]: any;
}

export interface CityAdapter {
  cityId: string;
  cityName: string;
  fetchData(queryParams: CityQueryParams): Promise<any>;
}
