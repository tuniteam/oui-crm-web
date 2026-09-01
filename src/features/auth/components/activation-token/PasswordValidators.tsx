import { PASSWORD_RULES } from '@/shared/constants/password-policy';
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

  // Les criteres affiches sont exactement ceux que le serveur applique.
  // Avant, cette liste exigeait majuscule et caractere special que l'API ne
  // demande pas, et annoncait 8 caracteres la ou elle en exige 10 : elle
  // decourageait des mots de passe valides et en laissait passer d'invalides.
  const rules: Rule[] = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    ok: rule.test(password ?? ''),
  }));

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