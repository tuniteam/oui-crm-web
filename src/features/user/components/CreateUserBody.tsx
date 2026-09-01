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

  const { LABELS, PLACEHOLDERS } = CREATE_USER_WINDOW;
  const roles = useRoles({ isBackoffice: rolesFilter }, { enabled: open });

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

        {/* ROLE SELECT */}
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
                  disabled={isBusy || roles.loading}
                >
                  <SelectTrigger data-testid="user-role-select">
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
                        {CREATE_USER_WINDOW.ROLES.ERROR}
                      </SelectItem>
                    ) : roles.data.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        {CREATE_USER_WINDOW.ROLES.NO_ROLE}
                      </SelectItem>
                    ) : (
                      roles.data
                        
                        .map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.label}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>

              {/* Optional helper text */}
              {roles.error ? (
                <div className="text-xs text-destructive">
                  {roles.error.message}
                </div>
              ) : null}

              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
