import { LoaderCircle } from 'lucide-react';

import { APP_MESSAGES } from '@/constants/messages';

import styles from './RouteFallback.module.css';

/** Placeholder exibido enquanto uma rota carregada sob demanda chega. */
export const RouteFallback = () => (
  <div className={styles.fallback} role="status">
    <LoaderCircle size={20} className={styles.spinner} aria-hidden="true" />
    {APP_MESSAGES.states.loading}
  </div>
);
