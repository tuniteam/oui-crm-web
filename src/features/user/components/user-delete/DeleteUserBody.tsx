import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DELETE_USER_WINDOW } from '@/features/user/constants/delete-user.constants';

export function DeleteUserBody() {
  return (
    <div className="space-y-6 py-1">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>

        <div className="space-y-1">
          <div className="text-lg font-semibold text-red-600">
            {DELETE_USER_WINDOW.TITLE}
          </div>
          <div className="text-sm text-muted-foreground">
            {DELETE_USER_WINDOW.EXPECTED_ACTION}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="text-sm text-muted-foreground">
        {DELETE_USER_WINDOW.INTRO}
      </div>

      <Card className="border border-red-200 bg-red-50/70 shadow-sm">
        <div className="space-y-3 p-5">
          <div className="text-sm font-semibold text-red-600">
            {DELETE_USER_WINDOW.WARNING.TITLE}
          </div>

          <div className="text-sm text-muted-foreground">
            {DELETE_USER_WINDOW.WARNING.INTRO}
          </div>

          <ul className="list-disc pl-6 text-sm text-muted-foreground">
            {DELETE_USER_WINDOW.WARNING.BULLETS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
