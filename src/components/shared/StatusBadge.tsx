import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from './status-config';

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <Badge variant="outline" appearance="light" size="sm">
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} appearance="light" size="sm">
      {config.label}
    </Badge>
  );
}
