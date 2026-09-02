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

export type CreateUserHooks = ReturnType<typeof useCreateUserForm>;

type Props = {
  hooks: CreateUserHooks;
  open: boolean;
  rolesFilter?: 'true' | 'false';
};

export function CreateUserBody({ hooks, open, rolesFilter = 'false' }: Props) {
  const { form, create } = hooks;
  const isBusy = create.loading;

  const { LABELS, PLACEHOLDERS, HINTS } = CREATE_USER_WINDOW;
  const roles = useRoles({ isBackoffice: rolesFilter }, { enabled: open });

  const isExternal = form.watch('isExternal');

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
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS.EXPIRES_AT} *</FormLabel>
                  <FormControl>
                    {/* `type="date"` rend exactement `YYYY-MM-DD` : le serveur
                        refuse une date-heure ISO. */}
                    <Input
                      type="date"
                      data-testid="user-expires-input"
                      disabled={isBusy}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </form>
    </Form>
  );
}

