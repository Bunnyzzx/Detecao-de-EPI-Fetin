import { APP_MESSAGES } from '@/constants/messages';
import { colors } from '@/theme';

import type { DetectionStatus, MaterialCommunityIconName } from '../types';

export interface StatusPresentation {
  headline: string;
  subtitle: string;
  cardTitle: string;
  accessBadge: string;
  /** Rótulo textual — o resultado nunca é comunicado apenas por cor. */
  shortLabel: string;
  icon: MaterialCommunityIconName;
  color: string;
  colorDark: string;
  colorDeep: string;
  softColor: string;
  textColor: string;
}

const PRESENTATION: Record<DetectionStatus, StatusPresentation> = {
  approved: {
    headline: APP_MESSAGES.result.approvedHeadline,
    subtitle: APP_MESSAGES.result.approvedSubtitle,
    cardTitle: APP_MESSAGES.result.approvedCardTitle,
    accessBadge: APP_MESSAGES.result.accessValidBadge,
    shortLabel: 'Aprovado',
    icon: 'check-circle',
    color: colors.status.approved,
    colorDark: colors.status.approvedDark,
    colorDeep: colors.status.approvedDeep,
    softColor: colors.status.approvedSoft,
    textColor: colors.status.approvedText,
  },
  warning: {
    headline: APP_MESSAGES.result.warningHeadline,
    subtitle: APP_MESSAGES.result.warningSubtitle,
    cardTitle: APP_MESSAGES.result.warningCardTitle,
    accessBadge: APP_MESSAGES.result.accessReviewBadge,
    shortLabel: 'Atenção',
    icon: 'alert-circle-outline',
    color: colors.status.warning,
    colorDark: colors.status.warningDark,
    colorDeep: colors.status.warningDeep,
    softColor: colors.status.warningSoft,
    textColor: colors.status.warningText,
  },
  rejected: {
    headline: APP_MESSAGES.result.rejectedHeadline,
    subtitle: APP_MESSAGES.result.rejectedNoDetection,
    cardTitle: APP_MESSAGES.result.rejectedCardTitle,
    accessBadge: APP_MESSAGES.result.accessInvalidBadge,
    shortLabel: 'Reprovado',
    icon: 'close-circle',
    color: colors.status.rejected,
    colorDark: colors.status.rejectedDark,
    colorDeep: colors.status.rejectedDeep,
    softColor: colors.status.rejectedSoft,
    textColor: colors.status.rejectedText,
  },
};

export const getStatusPresentation = (status: DetectionStatus): StatusPresentation =>
  PRESENTATION[status];
