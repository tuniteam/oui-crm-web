import { useMeStore } from '@/contexts/useMeStore';
import { useReferenceLabels } from '@/features/settings/hooks/useReferenceLabels';
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
import { cn } from '@/lib/utils';
import { PRIORITY_LABELS } from '../constants/organizationList.constants';
import {
  CREATE_MODES,
  CREATE_ORGANIZATION_UI,
} from '../constants/organizationCreate.constants';
import { PRIORITY_VALUES } from '../types/organizationList';
import type { Control } from 'react-hook-form';
import type { OrganizationCreateSchemaType } from '../forms/organization-create-schema';
import type { CreateOrganizationHooks } from '../hooks/useCreateOrganizationForm';
import { DuplicateWarning } from './DuplicateWarning';
import { RegistrySearchPane } from './RegistrySearchPane';

const UI = CREATE_ORGANIZATION_UI;
const { FIELDS } = UI;

/** Marque visuelle des trois champs que le serveur exige. */
const REQUIRED_MARK = "after:ml-0.5 after:text-destructive after:content-['*']";

/** Champs rendus par un simple `<Input>`. */
type TextFieldName = Exclude<
  keyof OrganizationCreateSchemaType,
  'type' | 'solution' | 'priority'
>;

/**
 * Hissee hors du corps du composant : declaree a l'interieur, chaque rendu
 * creerait un nouveau type de composant, React remonterait le sous-arbre et le
 * champ perdrait le focus a chaque frappe.
 */
function TextField({
  control,
  name,
  label,
  required,
  ...input
}: {
  control: Control<OrganizationCreateSchemaType>;
  name: TextFieldName;
  label: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn(required && REQUIRED_MARK)}>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...input} data-testid={`org-create-${name}`} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-border pb-2 text-sm font-semibold">
      {children}
    </h3>
  );
}

export function CreateOrganizationBody({
  hooks,
}: {
  hooks: CreateOrganizationHooks;
}) {
  const { form, mode, setMode, duplicates, dismissDuplicates, submit, loading } =
    hooks;
  const { optionsOf } = useReferenceLabels();
  const projectId = useMeStore((s) => s.activeProjectId);

  const control = form.control;
  const isManual = mode === CREATE_MODES.MANUAL;

  return (
    <div className="space-y-6">
      {/* Deux chemins, jamais un seul : la saisie manuelle reste ouverte meme
          quand le registre repond, et surtout quand il ne repond pas. */}
      <div className="inline-flex rounded-lg border border-border p-1">
        {[
          { key: CREATE_MODES.REGISTRY, label: UI.MODES.REGISTRY },
          { key: CREATE_MODES.MANUAL, label: UI.MODES.MANUAL },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            data-testid={`org-create-mode-${m.key}`}
            onClick={() => setMode(m.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              mode === m.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!isManual && <RegistrySearchPane hooks={hooks} />}

      {isManual && (
        <Form {...form}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {duplicates && (
              <DuplicateWarning
                candidates={duplicates}
                projectId={projectId}
                loading={loading}
                onCancel={dismissDuplicates}
                onConfirm={() => void submit(true)}
              />
            )}

            <SectionTitle>{UI.SECTIONS.IDENTITY}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={control} name="name" label={FIELDS.NAME} required />

              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={REQUIRED_MARK}>{FIELDS.TYPE}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="org-create-type">
                          <SelectValue placeholder={FIELDS.TYPE_PLACEHOLDER} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {optionsOf('STRUCTURE_TYPE').map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TextField
                control={control}
                name="siret"
                label={FIELDS.SIRET}
                placeholder={FIELDS.SIRET_PLACEHOLDER}
              />
              <TextField control={control} name="inseeCode" label={FIELDS.INSEE} />
            </div>

            <SectionTitle>{UI.SECTIONS.LOCATION}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={control} name="address" label={FIELDS.ADDRESS} />
              <TextField control={control} name="postalCode" label={FIELDS.POSTAL_CODE} />
              <TextField control={control} name="city" label={FIELDS.CITY} />
              <TextField
                control={control}
                name="department"
                label={FIELDS.DEPARTMENT}
                required
              />
              <TextField
                control={control}
                name="population"
                label={FIELDS.POPULATION}
                inputMode="numeric"
              />
              <TextField control={control} name="epci" label={FIELDS.EPCI} />
            </div>

            <SectionTitle>{UI.SECTIONS.CONTACT}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={control} name="phone" label={FIELDS.PHONE} />
              <TextField control={control} name="email" label={FIELDS.EMAIL} type="email" />
            </div>

            <SectionTitle>{UI.SECTIONS.COMMERCIAL}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{FIELDS.SOLUTION}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="org-create-solution">
                          <SelectValue placeholder={FIELDS.SOLUTION_PLACEHOLDER} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {optionsOf('SOLUTION').map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{FIELDS.PRIORITY}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="org-create-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_VALUES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {PRIORITY_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
