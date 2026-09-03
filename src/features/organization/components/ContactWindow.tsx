import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { cn } from '@/lib/utils';
import { CONTACT_WINDOW } from '../constants/contact.constants';
import {
  emptyContactValues,
  getContactSchema,
  type ContactSchemaType,
} from '../forms/contact-schema';
import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
} from '../types/contact';

const UI = CONTACT_WINDOW;
const { FIELDS, HINTS } = UI;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` pour une création. */
  contact: Contact | null;
  saving: boolean;
  onSubmit: (values: ContactSchemaType) => Promise<boolean>;
};

/**
 * Modification : un champ vidé s'efface, et le serveur attend `null` pour cela
 * sur les champs libres. `firstName` et `lastName` ne s'effacent jamais.
 */
export const contactUpdatePayload = (
  values: ContactSchemaType,
): UpdateContactPayload => ({
  civility: values.civility.trim() || null,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  role: values.role.trim() || null,
  email: values.email.trim() || null,
  phone: values.phone.trim() || null,
  mobile: values.mobile.trim() || null,
  notes: values.notes.trim() || null,
  isPrimary: values.isPrimary,
  optOut: values.optOut,
});

/**
 * Création : un champ vide n'est pas transmis du tout. Y envoyer `null`
 * enregistrerait un effacement explicite là où le serveur n'attend rien.
 */
export const contactCreatePayload = (
  values: ContactSchemaType,
): CreateContactPayload => {
  const text = (v: string) => (v.trim() === '' ? undefined : v.trim());
  return {
    civility: text(values.civility),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    role: text(values.role),
    email: text(values.email),
    phone: text(values.phone),
    mobile: text(values.mobile),
    notes: text(values.notes),
    isPrimary: values.isPrimary,
    optOut: values.optOut,
  };
};

const toFormValues = (c: Contact): ContactSchemaType => ({
  civility: c.civility ?? '',
  firstName: c.firstName ?? '',
  lastName: c.lastName ?? '',
  role: c.role ?? '',
  email: c.email ?? '',
  phone: c.phone ?? '',
  mobile: c.mobile ?? '',
  notes: c.notes ?? '',
  isPrimary: c.isPrimary,
  optOut: c.optOut,
});

type Hooks = { form: ReturnType<typeof useForm<ContactSchemaType>> };

/** Hook nommé plutôt qu'une fonction inline dans `useHooks` : les règles des
 *  hooks s'y appliquent normalement. */
function useContactForm(): Hooks {
  return {
    form: useForm<ContactSchemaType>({
      resolver: zodResolver(getContactSchema()),
      defaultValues: emptyContactValues(),
      mode: 'onSubmit',
    }),
  };
}

/** Champ texte simple. Hissé hors du rendu : déclaré à l'intérieur, il
 *  remonterait à chaque frappe et perdrait le focus. */
function TextField({
  hooks,
  name,
  label,
  required,
  hint,
  ...input
}: {
  hooks: Hooks;
  name: keyof ContactSchemaType;
  label: string;
  required?: boolean;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField
      control={hooks.form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className={cn(
              required && "after:ml-0.5 after:text-destructive after:content-['*']",
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              {...input}
              value={String(field.value ?? '')}
              data-testid={`contact-${name}`}
            />
          </FormControl>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Case a cocher, hissee pour la meme raison que `TextField`. */
function CheckboxField({
  hooks,
  name,
  label,
  hint,
}: {
  hooks: Hooks;
  name: 'isPrimary' | 'optOut';
  label: string;
  hint: string;
}) {
  return (
    <FormField
      control={hooks.form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-start gap-3">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid={`contact-${name}`}
                className="mt-0.5"
              />
            </FormControl>
            <div>
              <FormLabel>{label}</FormLabel>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}

function Body({ hooks, contact }: { hooks: Hooks; contact: Contact | null }) {
  const { form } = hooks;

  // Le formulaire suit le contact ouvert : la fenêtre est montée une fois et
  // sert aussi bien la création que la modification.
  useEffect(() => {
    form.reset(contact ? toFormValues(contact) : emptyContactValues());
  }, [contact, form]);

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField hooks={hooks} name="civility" label={FIELDS.CIVILITY} />
          <TextField hooks={hooks} name="firstName" label={FIELDS.FIRST_NAME} required />
          <TextField hooks={hooks} name="lastName" label={FIELDS.LAST_NAME} required />
        </div>

        <TextField hooks={hooks} name="role" label={FIELDS.ROLE} />

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            hooks={hooks}
            name="email"
            label={FIELDS.EMAIL}
            type="email"
            hint={HINTS.EMAIL}
          />
          <TextField hooks={hooks} name="phone" label={FIELDS.PHONE} />
          <TextField hooks={hooks} name="mobile" label={FIELDS.MOBILE} />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FIELDS.NOTES}</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} data-testid="contact-notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <CheckboxField
            hooks={hooks}
            name="isPrimary"
            label={FIELDS.IS_PRIMARY}
            hint={HINTS.IS_PRIMARY}
          />
          <CheckboxField
            hooks={hooks}
            name="optOut"
            label={FIELDS.OPT_OUT}
            hint={HINTS.OPT_OUT}
          />
        </div>
      </form>
    </Form>
  );
}

/** Création et modification d'un contact — US-01-04. */
export function ContactWindow({
  open,
  onOpenChange,
  contact,
  saving,
  onSubmit,
}: Props) {
  return (
    <ReusableWindow<Hooks>
      open={open}
      onOpenChange={onOpenChange}
      title={contact ? UI.EDIT_TITLE : UI.CREATE_TITLE}
      preventClose
      useHooks={useContactForm}
      renderBody={(hooks) => <Body hooks={hooks} contact={contact} />}
      renderFooter={(hooks) => (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            data-testid="contact-submit"
            disabled={saving}
            onClick={() =>
              void hooks.form.handleSubmit(async (values) => {
                if (await onSubmit(values)) onOpenChange(false);
              })()
            }
          >
            {contact ? UI.ACTIONS.SAVE : UI.ACTIONS.CREATE}
          </Button>
        </>
      )}
    />
  );
}
