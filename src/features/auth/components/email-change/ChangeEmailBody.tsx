import { AlertTriangle, Mail } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EMAIL_CHANGE } from '../../constants/email-change.constants';
import type { EmailChangeHooks } from '../../hooks/useEmailChangeForm';

type Props = {
  hooks: EmailChangeHooks;
};

const L = EMAIL_CHANGE.REQUEST;

export function ChangeEmailBody({ hooks }: Props) {
  const { form, request, sent, sentEmail, errorMessage } = hooks;
  const isBusy = request.loading;

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-muted">
          <Mail className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{L.SUCCESS.TITLE}</h3>
        <p className="text-sm text-muted-foreground">
          {L.SUCCESS.DESCRIPTION(sentEmail)}
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-6 py-1" onSubmit={(e) => e.preventDefault()}>
        <p className="text-sm text-muted-foreground">{L.DESCRIPTION}</p>

        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{L.LABELS.NEW_EMAIL} *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={L.PLACEHOLDERS.NEW_EMAIL}
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
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{L.LABELS.CURRENT_PASSWORD} *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={L.PLACEHOLDERS.CURRENT_PASSWORD}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-xs text-muted-foreground">{L.HINT}</p>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-md border-l-3 border-l-destructive bg-destructive/5 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span className="text-sm text-destructive">{errorMessage}</span>
          </div>
        )}
      </form>
    </Form>
  );
}
