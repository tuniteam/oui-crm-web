import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { useReferenceLabels } from '@/features/settings/hooks/useReferenceLabels';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  CUSTOMER_STATUS_LABELS,
  PRIORITY_LABELS,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import { useOrganizationSummaryForm } from '../hooks/useOrganizationSummaryForm';
import type { Control } from 'react-hook-form';
import type { OrganizationSummarySchemaType } from '../forms/organization-summary-schema';
import type { OrganizationDetail } from '../types/organizationDetail';
import { PRIORITY_VALUES } from '../types/organizationList';
import { OrganizationCompletenessNotice } from './OrganizationCompletenessNotice';

const UI = ORGANIZATION_DETAIL_UI;
const { LABELS, SECTIONS, HINTS, ACTIONS, EMPTY_VALUE, UNASSIGNED } = UI;

type Props = {
  organization: OrganizationDetail;
};

/** Champs du schema rendus par un simple `<Input>`. */
type TextFieldName = Exclude<
  keyof OrganizationSummarySchemaType,
  'type' | 'solution' | 'services' | 'tags' | 'priority'
>;

/** Titre de section, comme les `.section-title` de la V8. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-border pb-2 text-sm font-semibold">
      {children}
    </h3>
  );
}

/** Champ non modifiable : valeur derivee, ou pilotee par une autre route. */
function ReadOnlyField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <Input value={value} disabled readOnly />
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Champ texte du schema.
 *
 * Declare au niveau du module et non dans le corps du composant : une
 * definition interne cree un nouveau type de composant a chaque rendu, React
 * demonte alors tout le sous-arbre — le champ perd le focus a chaque frappe et
 * les composants a etat interne (le selecteur Radix) se reinitialisent.
 */
function TextField({
  control,
  name,
  label,
  disabled,
  type = 'text',
}: {
  control: Control<OrganizationSummarySchemaType>;
  name: TextFieldName;
  label: string;
  disabled: boolean;
  type?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              data-testid={`organization-field-${name}`}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Cases a cocher d'une liste de referentiel (services, etiquettes). */
function CheckboxGroup({
  control,
  name,
  label,
  options,
  disabled,
}: {
  control: Control<OrganizationSummarySchemaType>;
  name: 'services' | 'tags';
  label: string;
  options: { value: string; label: string }[];
  disabled: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((o) => (
              <Label
                key={o.value}
                className="flex items-center gap-2 text-sm font-normal"
              >
                <Checkbox
                  checked={field.value.includes(o.value)}
                  disabled={disabled}
                  onCheckedChange={(next) =>
                    field.onChange(
                      next
                        ? [...field.value, o.value]
                        : field.value.filter((v: string) => v !== o.value),
                    )
                  }
                />
                {o.label}
              </Label>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function OrganizationSummaryTab({ organization }: Props) {
  const { form, update, submit, reset } =
    useOrganizationSummaryForm(organization);
  const { optionsOf } = useReferenceLabels();
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.UPDATE),
  );

  const disabled = !canUpdate || update.loading;
  const typeOptions = optionsOf('STRUCTURE_TYPE');
  const solutionOptions = optionsOf('SOLUTION');
  const serviceOptions = optionsOf('SERVICE');
  const tagOptions = optionsOf('TAG');

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
      >
        <OrganizationCompletenessNotice completeness={organization.completeness} />

        <SectionTitle>{SECTIONS.IDENTITY}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField control={form.control} disabled={disabled} name="name" label={`${LABELS.NAME} *`} />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.TYPE} *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger data-testid="organization-field-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <TextField control={form.control} disabled={disabled} name="siret" label={LABELS.SIRET} />
          <TextField control={form.control} disabled={disabled} name="inseeCode" label={LABELS.INSEE} />
          <TextField control={form.control} disabled={disabled} name="address" label={LABELS.ADDRESS} />
          <TextField control={form.control} disabled={disabled} name="postalCode" label={LABELS.POSTAL_CODE} />
          <TextField control={form.control} disabled={disabled} name="city" label={LABELS.CITY} />
          <TextField control={form.control} disabled={disabled} name="department" label={`${LABELS.DEPARTMENT} *`} />

          <ReadOnlyField
            label={LABELS.REGION}
            value={organization.region ?? EMPTY_VALUE}
            hint={HINTS.REGION}
          />
          <TextField control={form.control} disabled={disabled} name="population" label={LABELS.POPULATION} type="number" />
          <ReadOnlyField
            label={LABELS.BRACKET}
            value={organization.bracketLabel ?? EMPTY_VALUE}
            hint={HINTS.BRACKET}
          />
          <TextField control={form.control} disabled={disabled} name="epci" label={LABELS.EPCI} />
          <TextField control={form.control} disabled={disabled} name="phone" label={LABELS.PHONE} />
          <TextField control={form.control} disabled={disabled} name="email" label={LABELS.EMAIL} />
          <TextField control={form.control} disabled={disabled} name="website" label={LABELS.WEBSITE} />
        </div>

        <SectionTitle>{SECTIONS.ENVIRONMENT}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="solution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.SOLUTION}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger data-testid="organization-field-solution">
                      <SelectValue placeholder={EMPTY_VALUE} />
                    </SelectTrigger>
                    <SelectContent>
                      {solutionOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <TextField
            control={form.control}
            disabled={disabled}
            name="schoolCount"
            label={LABELS.SCHOOL_COUNT}
            type="number"
          />
          <TextField
            control={form.control}
            disabled={disabled}
            name="childCount"
            label={LABELS.CHILD_COUNT}
            type="number"
          />
        </div>
        <CheckboxGroup
          control={form.control}
          name="services"
          label={LABELS.SERVICES}
          options={serviceOptions}
          disabled={disabled}
        />

        <SectionTitle>{SECTIONS.FOLLOW_UP}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Les deux statuts sont refuses par PATCH : lecture seule, avec la
              raison sous le champ plutot qu'un selecteur qui echouerait. */}
          <ReadOnlyField
            label={LABELS.SALES_STATUS}
            value={SALES_STATUS_LABELS[organization.salesStatus]}
            hint={HINTS.SALES_STATUS_READ_ONLY}
          />
          <ReadOnlyField
            label={LABELS.CUSTOMER_STATUS}
            value={CUSTOMER_STATUS_LABELS[organization.customerStatus]}
            hint={HINTS.CUSTOMER_STATUS_READ_ONLY}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{LABELS.PRIORITY}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger data-testid="organization-field-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {PRIORITY_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* `salesRepId` est modifiable au contrat, mais demande la liste des
              membres du projet — a cabler avec l'ecran Utilisateurs. */}
          <ReadOnlyField
            label={LABELS.SALES_REP}
            value={organization.salesRep?.fullName ?? UNASSIGNED}
          />
        </div>
        <CheckboxGroup
          control={form.control}
          name="tags"
          label={LABELS.TAGS}
          options={tagOptions}
          disabled={disabled}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.NOTES}</FormLabel>
              <FormControl>
                <Textarea rows={4} disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {canUpdate ? (
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              disabled={update.loading}
            >
              {ACTIONS.CANCEL}
            </Button>
            <Button
              type="button"
              data-testid="organization-save"
              onClick={submit}
              disabled={update.loading}
            >
              {ACTIONS.SAVE}
            </Button>
          </div>
        ) : null}
      </form>
    </Form>
  );
}
