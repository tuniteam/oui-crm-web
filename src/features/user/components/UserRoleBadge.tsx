import { Badge } from '@/components/ui/badge';

type Props = { roleLabel: string };

export function UserRoleBadge({ roleLabel }: Props) {
  return (
    <Badge variant="secondary" appearance="outline">
      {roleLabel}
    </Badge>
  );
}
