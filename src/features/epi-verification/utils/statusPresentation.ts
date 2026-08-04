import { AlertCircle, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react';

import { APP_MESSAGES } from '@/constants/messages';

import type { VerificationStatus } from '../types';

export interface StatusPresentation {
  headline: string;
  subtitle: string;
  cardTitle: string;
  accessBadge: string;
  /** Rótulo textual — o resultado nunca é comunicado apenas por cor. */
  shortLabel: string;
  icon: LucideIcon;
  /** Sufixo usado nas classes CSS modificadoras, ex.: `panel--approved`. */
  modifier: VerificationStatus;
  /** Cor sólida do status, para gráficos e barras. */
  color: string;
}

const PRESENTATION: Record<VerificationStatus, StatusPresentation> = {
  approved: {
    headline: APP_MESSAGES.result.approvedHeadline,
    subtitle: APP_MESSAGES.result.approvedSubtitle,
    cardTitle: APP_MESSAGES.result.approvedCardTitle,
    accessBadge: APP_MESSAGES.result.accessValidBadge,
    shortLabel: 'Aprovado',
    icon: CheckCircle2,
    modifier: 'approved',
    color: '#22c55e',
  },
  warning: {
    headline: APP_MESSAGES.result.warningHeadline,
    subtitle: APP_MESSAGES.result.warningSubtitle,
    cardTitle: APP_MESSAGES.result.warningCardTitle,
    accessBadge: APP_MESSAGES.result.accessReviewBadge,
    shortLabel: 'Atenção',
    icon: AlertCircle,
    modifier: 'warning',
    color: '#f59e0b',
  },
  rejected: {
    headline: APP_MESSAGES.result.rejectedHeadline,
    subtitle: APP_MESSAGES.result.rejectedSubtitle,
    cardTitle: APP_MESSAGES.result.rejectedCardTitle,
    accessBadge: APP_MESSAGES.result.accessInvalidBadge,
    shortLabel: 'Reprovado',
    icon: XCircle,
    modifier: 'rejected',
    color: '#ef4444',
  },
};

export const getStatusPresentation = (status: VerificationStatus): StatusPresentation =>
  PRESENTATION[status];
