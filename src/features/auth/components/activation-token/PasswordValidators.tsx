import { CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useContent } from '@/hooks/useContent'; // ✅ adjust path
import { cn } from '@/lib/utils';

type Rule = {
  id: string;
  label: string;
  ok: boolean;
};


export function PasswordValidators({ password }: { password: string }) {
  const content = useContent();
  const ui = content.activation.PASSWORD_VALIDATORS;

  const rules: Rule[] = [
    { id: 'min', label: ui.RULES.MIN, ok: (password?.length ?? 0) >= 8 },
    { id: 'upper', label: ui.RULES.UPPER, ok: /[A-Z]/.test(password ?? '') },
    { id: 'lower', label: ui.RULES.LOWER, ok: /[a-z]/.test(password ?? '') },
    { id: 'number', label: ui.RULES.NUMBER, ok: /[0-9]/.test(password ?? '') },
    { id: 'special', label: ui.RULES.SPECIAL, ok: /[^A-Za-z0-9]/.test(password ?? '') },
  ];

  const passed = rules.filter((r) => r.ok).length;
  const total = rules.length;
  const progress = total === 0 ? 0 : Math.round((passed / total) * 100);

  const strengthLabel =
    progress === 0
      ? ui.STRENGTH.EMPTY
      : progress < 60
        ? ui.STRENGTH.WEAK
        : progress < 100
          ? ui.STRENGTH.MEDIUM
          : ui.STRENGTH.STRONG;

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{ui.TITLE}</div>
        <div className={cn('text-xs', progress === 100 ? 'text-emerald-600' : 'text-muted-foreground')}>
          {strengthLabel}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <ul className="mt-3 space-y-2">
        {rules.map((r) => (
          <li
            key={r.id}
            className={cn('flex items-center gap-2 text-sm', r.ok ? 'text-emerald-600' : 'text-muted-foreground')}
          >
            {r.ok ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}