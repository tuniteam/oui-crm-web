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
import { ERRORS, FIELDS, PLACEHOLDERS } from '../constants/constants';
import type { CreateBackofficeUserHooks } from '../hooks/useCreateBackofficeUserForm';

export function CreateBackofficeUserBody({
  hooks,
}: {
  hooks: CreateBackofficeUserHooks;
}) {
  const { form, roles, rolesLoading, rolesError } = hooks;

  return (
    <Form {...form}>
      <form className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FIELDS.FIRST_NAME} *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={PLACEHOLDERS.FIRST_NAME} />
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
                <FormLabel>{FIELDS.LAST_NAME} *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={PLACEHOLDERS.LAST_NAME} />
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
              <FormLabel>{FIELDS.EMAIL} *</FormLabel>
              <FormControl>
                <Input {...field} placeholder={PLACEHOLDERS.EMAIL} />
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
              <FormLabel>{FIELDS.ROLE} *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger data-testid="backoffice-user-role">
                    <SelectValue placeholder={PLACEHOLDERS.ROLE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.code} value={role.code}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rolesError && !rolesLoading ? (
                <p className="text-sm text-destructive">
                  {ERRORS.FETCH_ROLES}
                </p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
