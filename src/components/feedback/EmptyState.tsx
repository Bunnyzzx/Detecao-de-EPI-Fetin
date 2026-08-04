import { Inbox, type LucideIcon } from 'lucide-react';

import { StateView, type StateAction } from './StateView';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: StateAction;
  compact?: boolean;
}

export const EmptyState = ({
  title,
  description,
  icon = Inbox,
  action,
  compact = false,
}: EmptyStateProps) => (
  <StateView
    icon={icon}
    title={title}
    {...(description ? { description } : {})}
    tone="neutral"
    compact={compact}
    {...(action ? { actions: [action] } : {})}
  />
);
