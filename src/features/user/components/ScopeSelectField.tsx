import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { useScopes } from '@/features/settings/hooks/useScopes';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { UPDATE_USER_WINDOW } from '../constants/editUser.constants';

/** Un `<SelectItem>` Radix refuse la chaîne vide comme valeur : jeton explicite
 *  pour « aucun périmètre », traduit en `null` ou en champ absent à l'envoi. */
const NO_SCOPE = '__none__';

const { LABELS, PLACEHOLDERS, HINTS } = UPDATE_USER_WINDOW;

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
  testId: string;
};

/**
 * Périmètre d'un utilisateur — US-00-07.
 *
 * Partagé par la création et la modification : c'est le second appelant qui
 * justifie l'extraction, pas le premier.
 *
 * Deux règles portées ici plutôt que dans chaque formulaire :
 *
 * - **Sans périmètre, l'utilisateur voit toute la base.** L'option le dit en
 *   clair ; une ligne vide laisserait deviner l'inverse.
 * - **Masqué sans `scopes:read`.** Le serveur refuserait la liste, et un
 *   sélecteur vide vaut moins que pas de sélecteur du tout.
 */
export function ScopeSelectField<T extends FieldValues>({
  control,
  name,
  disabled,
  testId,
}: Props<T>) {
  const canReadScopes = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.SCOPES.READ),
  );
  const { scopes, loading } = useScopes(canReadScopes);

  if (!canReadScopes) return null;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{LABELS.SCOPE}</FormLabel>
          <FormControl>
            <Select
              value={field.value || NO_SCOPE}
              onValueChange={(v) => field.onChange(v === NO_SCOPE ? '' : v)}
              disabled={disabled || loading}
            >
              <SelectTrigger data-testid={testId}>
                <SelectValue placeholder={PLACEHOLDERS.SCOPE} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SCOPE}>{PLACEHOLDERS.SCOPE}</SelectItem>
                {scopes.map((scope) => (
                  <SelectItem key={scope.id} value={scope.id}>
                    {scope.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>{HINTS.SCOPE}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
