import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { COMPANY_UI, SETTINGS_ACTIONS } from '../../constants/constants';
import {
  companySchema,
  type CompanySchema,
} from '../../forms/company-schema';
import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import type { CompanySettings } from '../../types/settings';

const FIELDS = COMPANY_UI.FIELDS;

const LAYOUT: { name: keyof CompanySchema; label: string; wide?: boolean }[] = [
  { name: 'name', label: FIELDS.NAME, wide: true },
  { name: 'siren', label: FIELDS.SIREN },
  { name: 'siret', label: FIELDS.SIRET },
  { name: 'rcs', label: FIELDS.RCS, wide: true },
  { name: 'address', label: FIELDS.ADDRESS, wide: true },
  { name: 'phone', label: FIELDS.PHONE },
  { name: 'email', label: FIELDS.EMAIL },
  { name: 'signatory', label: FIELDS.SIGNATORY },
];

export function CompanyPane({
  company,
  canUpdate,
}: {
  company: CompanySettings;
  canUpdate: boolean;
}) {
  const { update, loading } = useUpdateSettings();

  const form = useForm<CompanySchema>({
    resolver: zodResolver(companySchema),
    defaultValues: company,
    mode: 'onSubmit',
  });

  // Resynchronise sur les donnees fraiches plutot que de garder un etat local.
  useEffect(() => form.reset(company), [company, form]);

  const onSubmit = async (values: CompanySchema) => {
    // On n'envoie que ce qui change : le serveur fusionne cle par cle, et un
    // envoi complet ecraserait un champ modifie entre-temps.
    const changed = Object.fromEntries(
      Object.entries(values).filter(
        ([key, value]) => value !== company[key as keyof CompanySettings],
      ),
    );
    if (!Object.keys(changed).length) return;
    await update({ company: changed });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-base font-semibold">{COMPANY_UI.TITLE}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {COMPANY_UI.DESCRIPTION}
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {LAYOUT.map(({ name, label, wide }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className={wide ? 'md:col-span-2' : undefined}>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canUpdate} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {canUpdate && (
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <LoaderCircleIcon
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  {loading ? SETTINGS_ACTIONS.SAVING : SETTINGS_ACTIONS.SAVE}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
