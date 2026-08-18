import { useEffect } from 'react';
import { AlertTriangle, Info, LoaderCircleIcon, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CORRECT_EMAIL } from '../../constants/correct-email.constants';
import { USER_STATUS } from '../../constants/userList.constants';
import { useCorrectEmailForm } from '../../hooks/useCorrectEmailForm';
import type { UserStatus } from '../../types/userList';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  status: UserStatus;
  onSuccess?: () => void;
};

const D = CORRECT_EMAIL.DIALOG;

export function CorrectEmailDialog({
  open,
  onOpenChange,
  userId,
  status,
  onSuccess,
}: Props) {
  const { form, loading, submit, reset, errorMessage } = useCorrectEmailForm(
    userId,
    status,
  );

  // Réinitialise le formulaire à chaque fermeture (pas de state périmé).
  useEffect(() => {
    if (!open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleConfirm = async () => {
    const res = await submit();
    if (res.ok) {
      onSuccess?.();
      onOpenChange(false);
    } else if (res.close) {
      onOpenChange(false);
    }
  };

  const disabled = loading || !form.formState.isValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{D.TITLE}</DialogTitle>
          <DialogDescription>{D.DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 py-1" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{D.LABEL} *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={D.PLACEHOLDER}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === USER_STATUS.PENDING && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{D.HINT_PENDING}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-md border-l-3 border-l-destructive bg-destructive/5 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span className="text-sm text-destructive">{errorMessage}</span>
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            {D.BUTTONS.CANCEL}
          </Button>
          <Button onClick={handleConfirm} disabled={disabled}>
            {loading ? (
              <>
                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                {D.LOADING}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {D.BUTTONS.CONFIRM}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
