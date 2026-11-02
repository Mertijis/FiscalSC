import { CityAdapter } from './cityAdapter.interface';
import { florianopolisAdapter } from './florianopolisAdapter';

const adapters: Record<string, CityAdapter> = {
  florianopolis: florianopolisAdapter,
};

export function getCityAdapter(cityId: string): CityAdapter {
  const adapter = adapters[cityId.toLowerCase()];
  if (!adapter) {
    throw new Error(`Adaptador não implementado para a cidade: '${cityId}'. Cidades disponíveis: ${Object.keys(adapters).join(', ')}`);
  }
  return adapter;
}

export * from './cityAdapter.interface';
export * from './florianopolisAdapter';
