/**
 * Identificador único para verificações e registros locais.
 * Usa `crypto.randomUUID` quando disponível e cai num gerador simples em
 * navegadores antigos ou contextos não seguros.
 */
export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
