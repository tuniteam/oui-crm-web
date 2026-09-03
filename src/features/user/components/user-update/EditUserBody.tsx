import { useMeStore } from '@/contexts/useMeStore';
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
import { UPDATE_USER_WINDOW } from '../../constants/editUser.constants';
import { CREATE_USER_WINDOW } from '../../constants/users.constants';
import type { EditUserHooks } from '../../hooks/useEditUserForm';
import { useRoles } from '../../hooks/useRoles';
import { ScopeSelectField } from '../ScopeSelectField';
import { EditUserBodySkeleton } from './skeleton/EditUserBodySkeleton';

type Props = {
  hooks: EditUserHooks;
  open: boolean;
  rolesFilter?: 'true' | 'false';
};

export function EditUserBody({ hooks, open, rolesFilter = 'false' }: Props) {
  const { form, loadingUser, fetchingUser, update, user } = hooks;

  const { me } = useMeStore();
  const isCurrentUser = me?.email === user?.email;

  const isBusy = loadingUser || update.loading;

  const { LABELS, PLACEHOLDERS, HINTS } = UPDATE_USER_WINDOW;

  const roles = useRoles({ isBackoffice: rolesFilter }, { enabled: open });

  const isExternal = form.watch('isExternal');

  if ((loadingUser || fetchingUser) && !update.loading) {
    return <EditUserBodySkeleton />;
  }

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
                    data-testid="user-edit-firstname-input"
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
                    data-testid="user-edit-lastname-input"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="initials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.INITIALS} *</FormLabel>
                <FormControl>
                  <Input
                    data-testid="user-edit-initials-input"
                    placeholder={PLACEHOLDERS.INITIALS}
                    maxLength={3}
                    className="uppercase"
                    disabled={isBusy}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
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
                    disabled={isBusy || roles.loading || isCurrentUser}
                  >
                    <SelectTrigger data-testid="user-edit-role-select">
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

                {isCurrentUser ? (
                  <FormDescription>{HINTS.OWN_ACCOUNT}</FormDescription>
                ) : null}

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ScopeSelectField
          control={form.control}
          name="scopeId"
          disabled={isBusy || isCurrentUser}
          testId="user-edit-scope-select"
        />

        {/* Sur son propre compte, le serveur refuse aussi le changement
            d'acces (CANNOT_UPDATE_OWN_ACCESS) : on desactive plutot que de
            laisser l'utilisateur decouvrir le refus a l'enregistrement. */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isExternal"
            render={({ field }) => (
              <FormItem className="flex items-start justify-between gap-4">
                <FormLabel>{LABELS.EXTERNAL}</FormLabel>
                <FormControl>
                  <Switch
                    data-testid="user-edit-external-switch"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isBusy || isCurrentUser}
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
                    <FormDatePicker
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      disabled={isBusy || isCurrentUser}
                      data-testid="user-edit-expires-input"
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

