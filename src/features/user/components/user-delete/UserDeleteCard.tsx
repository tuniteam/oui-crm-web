import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useContent } from '@/hooks/useContent';

type Props = {
  user: { id: string } | null;
  onDeleteClick: () => void;
  title?: string;
  description?: string;
};

export function UserDeleteCard({ user, onDeleteClick, title, description }: Props) {
  const content = useContent();

  return (
    <Card className="my-4">
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div>
          <div className="text-sm font-semibold">{title ?? content.user.delete.card.TITLE}</div>
          <div className="text-xs text-muted-foreground">
            {description ?? content.user.delete.card.DESCRIPTION}
          </div>
        </div>

        <Button variant="destructive" onClick={onDeleteClick} disabled={!user}>
          <Trash2 className="mr-2 h-4 w-4" />
          {content.common.ACTIONS.DELETE}
        </Button>
      </CardContent>
    </Card>
  );
}
