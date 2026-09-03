import { useEffect, useRef } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CREATE_USER_WINDOW } from '../constants/users.constants';
import type { useCreateUserForm } from '../hooks/useCreateUserForm';
import { useRoles } from '../hooks/useRoles';
import { ScopeSelectField } from './ScopeSelectField';

export type CreateUserHooks = ReturnType<typeof useCreateUserForm>;

type Props = {
  hooks: CreateUserHooks;
  open: boolean;
};

export function CreateUserBody({ hooks, open }: Props) {
  const { form, create } = hooks;
  const isBusy = create.loading;

  const { LABELS, PLACEHOLDERS, HINTS } = CREATE_USER_WINDOW;
  // Ecran des utilisateurs de projet : jamais les roles back-office.
  const roles = useRoles({ isBackoffice: 'false' }, { enabled: open });

  const isExternal = form.watch('isExternal');

  /*
   * « Fin d'acces » apparait au bas d'un formulaire deja long : sur un ecran
   * court, elle nait sous le pied de fenetre. Un champ obligatoire qu'on ne
   * voit pas apparaitre passe pour absent — on l'amene donc a l'ecran.
   */
  const expiresRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isExternal) return;
    // Instantane, pas anime : le champ est obligatoire et vient d'apparaitre,
    // il doit etre la tout de suite. Une animation le ferait aussi arriver
    // apres coup pour qui mesure sa position.
    expiresRef.current?.scrollIntoView({ block: 'nearest' });
  }, [isExternal]);

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.FIRST_NAME} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={PLACEHOLDERS.FIRST_NAME}
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.LAST_NAME} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={PLACEHOLDERS.LAST_NAME}
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.EMAIL} *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={PLACEHOLDERS.EMAIL}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Initiales : servent a numeroter les devis, d'ou la contrainte. */}
          <FormField
            control={form.control}
            name="initials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.INITIALS} *</FormLabel>
                <FormControl>
                  <Input
                    data-testid="user-initials-input"
                    placeholder={PLACEHOLDERS.INITIALS}
                    maxLength={3}
                    className="uppercase"
                    disabled={isBusy}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>{HINTS.INITIALS}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.ROLE} *</FormLabel>

                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isBusy || roles.loading}
                  >
                    <SelectTrigger data-testid="user-role-select">
                      <SelectValue
                        placeholder={
                          roles.loading
                            ? CREATE_USER_WINDOW.ROLES.LOADING
                            : PLACEHOLDERS.ROLE
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {roles.error ? (
                        <SelectItem value="__error__" disabled>
                          {CREATE_USER_WINDOW.ROLES.ERROR}
                        </SelectItem>
                      ) : roles.data.length === 0 ? (
                        <SelectItem value="__empty__" disabled>
                          {CREATE_USER_WINDOW.ROLES.NO_ROLE}
                        </SelectItem>
                      ) : (
                        // La valeur est le `code` : l'API refuse un `roleId`.
                        roles.data.map((r) => (
                          <SelectItem key={r.id} value={r.code}>
                            {r.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>

                {roles.error ? (
                  <div className="text-xs text-destructive">
                    {roles.error.message}
                  </div>
                ) : null}

                <FormMessage />
              </FormItem>
            )}
          />

          <ScopeSelectField
            control={form.control}
            name="scopeId"
            disabled={isBusy}
            testId="user-create-scope-select"
          />
        </div>

        {/* Acces externe : le serveur exige une date de fin des que la case
            est cochee (EXPIRATION_REQUIRED_FOR_EXTERNAL). */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isExternal"
            render={({ field }) => (
              <FormItem className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <FormLabel>{LABELS.EXTERNAL}</FormLabel>
                  <FormDescription>{HINTS.EXTERNAL}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    data-testid="user-external-switch"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isBusy}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {isExternal && (
            <div ref={expiresRef}>
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS.EXPIRES_AT} *</FormLabel>
                  <FormControl>
                    {/* Le calendrier de la charte. La valeur reste le jour
                        `YYYY-MM-DD` : le serveur refuse une date-heure ISO. */}
                    <FormDatePicker
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      disabled={isBusy}
                      data-testid="user-expires-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

