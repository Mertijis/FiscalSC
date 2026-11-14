/**
 * Códigos de erro estáveis expostos ao frontend.
 * O frontend decide qual aviso exibir pelo `code`, nunca pelo texto da mensagem.
 */
export const ERROR_CODES = {
  MUNICIPIO_INDISPONIVEL: 'MUNICIPIO_INDISPONIVEL',
  ERRO_INTERNO: 'ERRO_INTERNO',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

/** O portal de transparência da prefeitura não respondeu ou respondeu com erro. */
export class MunicipioIndisponivelError extends AppError {
  readonly cityId: string;

  constructor(cityId: string, cityName: string, motivo: string) {
    super(ERROR_CODES.MUNICIPIO_INDISPONIVEL, `Portal de transparência de ${cityName} indisponível: ${motivo}`);
    this.name = 'MunicipioIndisponivelError';
    this.cityId = cityId;
  }
}

/** Formato padronizado de erro para respostas REST e eventos WebSocket. */
export function toErrorPayload(err: unknown): { error: string; code: ErrorCode } {
  if (err instanceof AppError) {
    return { error: err.message, code: err.code };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { error: message, code: ERROR_CODES.ERRO_INTERNO };
}
