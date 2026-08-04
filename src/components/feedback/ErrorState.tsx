import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

import { APP_MESSAGES } from '@/constants/messages';
import { describeError } from '@/services/errors';

import { StateView, type StateViewProps } from './StateView';

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
  onDark?: boolean;
}

/** Traduz um erro em um estado visual coerente com o código do `AppError`. */
export const ErrorState = ({
  error,
  onRetry,
  retryLabel = APP_MESSAGES.states.retryButton,
  compact = false,
  onDark = false,
}: ErrorStateProps) => {
  const { title, description, isConnectivity } = describeError(error);

  const props: StateViewProps = {
    icon: isConnectivity ? WifiOff : AlertCircle,
    title,
    description,
    tone: isConnectivity ? 'warning' : 'danger',
    compact,
    onDark,
    ...(onRetry ? { actions: [{ label: retryLabel, onClick: onRetry, icon: RefreshCw }] } : {}),
  };

  return <StateView {...props} />;
};
