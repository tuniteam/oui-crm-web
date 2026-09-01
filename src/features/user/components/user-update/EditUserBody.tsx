import { useMeStore } from '@/contexts/useMeStore';
import {
  Form,
  FormControl,
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
import { UPDATE_USER_WINDOW } from '../../constants/editUser.constants';
import { USER_STATUS_LABELS } from '../../constants/userList.constants';
import { CREATE_USER_WINDOW } from '../../constants/users.constants';
import type { EditUserHooks } from '../../hooks/useEditUserForm';
import { useRoles } from '../../hooks/useRoles';
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

  const { LABELS, PLACEHOLDERS } = UPDATE_USER_WINDOW;

  const roles = useRoles({ isBackoffice: rolesFilter }, { enabled: open });

  const currentRoleId =
    roles.data.find((r) => r.code === user?.roleCode)?.id ?? '';

  if ((loadingUser || fetchingUser) && !update.loading) {
    return <EditUserBodySkeleton />;
  }

  // Prefill roleId once
  if (currentRoleId && !form.getValues('roleId')) {
    form.setValue('roleId', currentRoleId, { shouldValidate: false });
  }
  const currentStatus = user?.status;
  const canSetPending = currentStatus === 'PENDING';
  const statusOptions = canSetPending
    ? USER_STATUS_LABELS
    : USER_STATUS_LABELS.filter((o) => o.value !== 'PENDING');

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Names */}
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

        {/* Status + Role (same grid style as Create) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* STATUS SELECT */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.STATUS} *</FormLabel>

                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isBusy}
                  >
                    <SelectTrigger data-testid="user-edit-status-select">
                      <SelectValue placeholder={PLACEHOLDERS.STATUS} />
                    </SelectTrigger>

                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          {/* ROLE SELECT (same structure as CreateUserBody) */}
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.ROLE} *</FormLabel>

                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      isBusy ||
                      roles.loading ||
                      isCurrentUser 
                    }
                  >
                    <SelectTrigger data-testid="user-edit-role-select">
                      <SelectValue
                        placeholder={
                          roles.loading
                            ? 'Chargement des rôles...'
                            : PLACEHOLDERS.ROLE
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {roles.error ? (
                        <SelectItem value="__error__" disabled>
                          {CREATE_USER_WINDOW.ROLES?.ERROR}
                        </SelectItem>
                      ) : roles.data.length === 0 ? (
                        <SelectItem value="__empty__" disabled>
                          {CREATE_USER_WINDOW.ROLES?.NO_ROLE}
                        </SelectItem>
                      ) : (
                        roles.data
                          
                          .map((r) => (
                            <SelectItem
                              key={r.id}
                              value={r.id}
                             
                            >
                              {r.label}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>

                {/* same helper style as Create */}
                {roles.error ? (
                  <div className="text-xs text-destructive">
                    {roles.error.message}
                  </div>
                ) : null}

                {/* optional: inform why role disabled */}
                {isCurrentUser ? (
                  <div className="text-xs text-muted-foreground">
                    {CREATE_USER_WINDOW.ROLES?.CANNOT_EDIT}
                  </div>
                ) : null}

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
