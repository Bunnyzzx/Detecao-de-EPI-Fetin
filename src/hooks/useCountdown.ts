import { useEffect, useRef, useState } from 'react';

export interface UseCountdownOptions {
  seconds: number;
  /** Quando falso, a contagem fica parada. */
  active: boolean;
  onFinish: () => void;
}

const TICK_MS = 250;

/**
 * Contagem regressiva do terminal: depois do resultado, ele volta sozinho à
 * tela inicial para atender a próxima pessoa.
 *
 * O tempo restante é derivado de um instante-limite em vez de um contador
 * decrescente, então a contagem não se atrasa se a aba ficar em segundo plano.
 */
export const useCountdown = ({ seconds, active, onFinish }: UseCountdownOptions): number => {
  const [remaining, setRemaining] = useState(seconds);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const deadline = Date.now() + seconds * 1000;

    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        clearInterval(interval);
        onFinishRef.current();
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [active, seconds]);

  return remaining;
};
