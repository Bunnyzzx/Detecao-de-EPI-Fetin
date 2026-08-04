/**
 * Acesso único às variáveis de ambiente.
 * Nenhuma URL, chave ou token é escrito diretamente no código.
 */
const readString = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const readNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(readString(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  epiApiUrl: readString(import.meta.env.VITE_EPI_API_URL),
  epiApiTimeoutMs: readNumber(import.meta.env.VITE_EPI_API_TIMEOUT_MS, 20000),
  terminalResetSeconds: readNumber(import.meta.env.VITE_TERMINAL_RESET_SECONDS, 20),
} as const;

/** Enquanto a URL não for configurada, o terminal opera em modo simulado. */
export const isApiConfigured = (): boolean => Boolean(env.epiApiUrl);
