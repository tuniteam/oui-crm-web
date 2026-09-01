import { LoaderCircleIcon, Save, X } from 'lucide-react';
import { COMMON } from '@/constants';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { Button } from '@/components/ui/button';
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
import { EDIT_WINDOW, FIELDS, PLACEHOLDERS } from '../constants/constants';
import {
  useEditBackofficeUserForm,
  type EditBackofficeUserHooks,
} from '../hooks/useEditBackofficeUserForm';
import type { BackofficeUserDetails } from '../types/backofficeUser';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: BackofficeUserDetails;
};

export function EditBackofficeUserWindow({ open, onOpenChange, user }: Props) {
  return (
    <ReusableWindow<EditBackofficeUserHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={EDIT_WINDOW.TITLE}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={() => useEditBackofficeUserForm(user)}
      preventClose
      renderBody={({ form, roles }) => (
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

            {/* L'e-mail n'est pas modifiable : PATCH ne l'accepte pas. */}
            <FormField
              control={form.control}
              name="roleCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{FIELDS.ROLE} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
      renderFooter={({ submit, loading }) => (
        <div className="flex w-full justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X aria-hidden="true" />
            {COMMON.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={async () => {
              const updated = await submit();
              if (updated) onOpenChange(false);
            }}
          >
            {loading ? (
              <LoaderCircleIcon
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {COMMON.ACTIONS.SAVE}
          </Button>
        </div>
      )}
    />
  );
}
