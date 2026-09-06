import { useState } from 'react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/constants';
import { formatShortDateFr } from '@/shared/utils/date-utils';
import { formatInteger } from '@/shared/utils/string-utils';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { RegistryFillWindow } from './RegistryFillWindow';
import { OrganizationOpeningHours } from './OrganizationOpeningHours';
import { OpeningHoursWindow } from './OpeningHoursWindow';
import { DeleteOrganizationWindow } from './DeleteOrganizationWindow';
import { ORGANIZATION_DELETE_CARD } from '../constants/organizationDelete.constants';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Building2, ExternalLink } from 'lucide-react';

const UI = ORGANIZATION_DETAIL_UI;
const { LABELS, SECTIONS, HINTS, ACTIONS, EMPTY_VALUE, UNASSIGNED } = UI;

type Props = {
  organization: OrganizationDetail;
  /** Ferme le panneau : c'est ce que fait « Annuler ». */
  onClose: () => void;
};

/** Champs du schema rendus par un simple `<Input>`. */
type TextFieldName = Exclude<
  keyof OrganizationSummarySchemaType,
  'type' | 'solution' | 'services' | 'tags' | 'priority' | 'openingHours'
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
/**
 * Ouvre le site de la commune dans un onglet.
 *
 * L'adresse vient du **formulaire**, pas de la fiche enregistree : le lien
 * suit ce qui est a l'ecran, sinon il ouvrirait l'ancienne adresse juste apres
 * qu'on l'a corrigee. Beaucoup de petites communes n'ont pas de site — rien ne
 * s'affiche alors, l'absence n'etant pas une anomalie.
 */
function WebsiteLink({ url }: { url: string }) {
  const trimmed = url.trim();
  if (trimmed === '') return null;

  /* Une adresse saisie a la main arrive souvent sans protocole ; sans lui, le
     navigateur la lit comme un chemin relatif de l'application. */
  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          target="_blank"
          /* `noopener` coupe l'acces de la page ouverte a la notre : sans lui,
             elle peut rediriger l'onglet du CRM. */
          rel="noopener noreferrer"
          aria-label={ACTIONS.OPEN_WEBSITE}
          data-testid="organization-website-open"
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </TooltipTrigger>
      <TooltipContent>{ACTIONS.OPEN_WEBSITE}</TooltipContent>
    </Tooltip>
  );
}

function TextField({
  control,
  name,
  label,
  disabled,
  type = 'text',
  labelAction,
  numeric = false,
}: {
  control: Control<OrganizationSummarySchemaType>;
  name: TextFieldName;
  label: string;
  disabled: boolean;
  type?: string;
  /** Rendu a cote de l'intitule : une action qui porte sur la valeur du champ. */
  labelAction?: React.ReactNode;
  /** Groupe les milliers a l'affichage. La valeur stockee reste brute. */
  numeric?: boolean;
}) {
  /*
   * Un `<input type="number">` refuse tout ce qui n'est pas un chiffre : il ne
   * peut pas afficher « 149 695 ». D'ou un champ texte, avec `inputMode` pour
   * garder le pave numerique sur mobile.
   */
  const [focused, setFocused] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1.5">
            {label}
            {labelAction}
          </FormLabel>
          <FormControl>
            <Input
              type={numeric ? 'text' : type}
              inputMode={numeric ? 'numeric' : undefined}
              data-testid={`organization-field-${name}`}
              disabled={disabled}
              {...field}
              /* Groupe au repos, brut sous le curseur : les espaces qui
                 s'inserent pendant la frappe deplacent le point d'insertion. */
              value={
                numeric && !focused
                  ? formatInteger(field.value as string)
                  : (field.value as string)
              }
              onChange={
                numeric
                  ? (e) => field.onChange(e.target.value.replace(/\D/g, ''))
                  : field.onChange
              }
              onFocus={() => numeric && setFocused(true)}
              onBlur={() => {
                if (numeric) setFocused(false);
                field.onBlur();
              }}
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

export function OrganizationSummaryTab({ organization, onClose }: Props) {
  const { form, update, submit } = useOrganizationSummaryForm(organization);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { optionsOf, labelOf, metaOf } = useReferenceLabels();

  /** Libelle de l'editeur d'une solution, ou `null` s'il n'y en a pas.
   *  `NONE` est la valeur du referentiel pour « sans editeur » : afficher
   *  « Editeur : Sans editeur » n'apprendrait rien. */
  const vendorLabel = (solutionKey: string) => {
    const vendor = metaOf('SOLUTION', solutionKey)?.vendor;
    if (typeof vendor !== 'string' || vendor === '' || vendor === 'NONE') {
      return null;
    }
    return labelOf('VENDOR', vendor);
  };
  const canDelete = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.DELETE),
  );
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.UPDATE),
  );
  /*
   * `search-registry` est gardee par `organizations:create`, pas par le droit
   * de modification : un profil qui peut corriger une fiche sans en creer
   * prendrait un 403. On masque donc sur les deux — chercher sans pouvoir
   * enregistrer n'aurait pas de sens non plus.
   */
  const canSearchRegistry = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.CREATE),
  );
  const [openRegistry, setOpenRegistry] = useState(false);
  const [openHours, setOpenHours] = useState(false);

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

        {/* Sous le bandeau qui constate le manque, le geste qui le comble :
            c'est la que l'utilisateur regarde en le decouvrant. */}
        {canUpdate && canSearchRegistry ? (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="registry-fill-open"
              onClick={() => setOpenRegistry(true)}
            >
              <Building2 className="size-4" />
              {UI.REGISTRY_FILL.OPEN}
            </Button>
          </div>
        ) : null}

        <RegistryFillWindow
          open={openRegistry}
          onOpenChange={setOpenRegistry}
          form={form}
          organizationName={organization.name}
          onFilled={(n) => toast.success(UI.REGISTRY_FILL.FILLED(n))}
        />

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
          <TextField control={form.control} disabled={disabled} name="population" label={LABELS.POPULATION} numeric />
          <ReadOnlyField
            label={LABELS.BRACKET}
            value={organization.bracketLabel ?? EMPTY_VALUE}
            hint={HINTS.BRACKET}
          />
          <TextField control={form.control} disabled={disabled} name="epci" label={LABELS.EPCI} />
          <TextField control={form.control} disabled={disabled} name="phone" label={LABELS.PHONE} />
          <TextField control={form.control} disabled={disabled} name="email" label={LABELS.EMAIL} />
          <TextField
            control={form.control}
            disabled={disabled}
            name="website"
            label={LABELS.WEBSITE}
            labelAction={<WebsiteLink url={form.watch('website')} />}
          />
        </div>

        {/* A cote des coordonnees, et non dans la grille : ce sont des donnees
            en lecture seule, que l'API refuse en ecriture. */}
        {/* Le formulaire fait foi, pas la fiche lue : ce qu'on vient de saisir
            doit s'afficher avant meme d'etre enregistre. */}
        <OrganizationOpeningHours
          openingHours={form.watch('openingHours')}
          onEdit={disabled ? undefined : () => setOpenHours(true)}
        />

        <OpeningHoursWindow
          open={openHours}
          onOpenChange={setOpenHours}
          value={form.watch('openingHours')}
          onChange={(next) =>
            form.setValue('openingHours', next, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

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
                {/* L'editeur de la solution, comme la V8. Il vit dans le
                    `metadata` du referentiel et reste une cle : on le resout
                    contre `VENDOR` plutot que de l'afficher tel quel. */}
                {vendorLabel(field.value) ? (
                  <p className="text-xs text-muted-foreground">
                    {HINTS.VENDOR(vendorLabel(field.value) as string)}
                  </p>
                ) : null}
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

        {/* En fin de formulaire : la position ne se saisit pas au quotidien,
            elle vient de l'import et se corrige a la marge. */}
        <SectionTitle>{SECTIONS.GEO}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            disabled={disabled}
            name="latitude"
            label={LABELS.LATITUDE}
          />
          <TextField
            control={form.control}
            disabled={disabled}
            name="longitude"
            label={LABELS.LONGITUDE}
          />
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">{UI.GEO_HINT}</p>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          {/* Dates de la V8, a gauche des actions. Rendues seulement si le
              serveur les envoie : elles sont facultatives au contrat. */}
          {organization.createdAt && organization.updatedAt ? (
            <span
              data-testid="organization-timestamps"
              className="me-auto text-xs text-muted-foreground"
            >
              {UI.TIMESTAMPS(
                formatShortDateFr(organization.createdAt),
                formatShortDateFr(organization.updatedAt),
              )}
            </span>
          ) : null}

          {canUpdate ? (
            <>
            <Button
              type="button"
              variant="outline"
              data-testid="organization-cancel"
              onClick={onClose}
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
            </>
          ) : null}
        </div>

        {/* Action destructrice, tenue a l'ecart des actions du formulaire. */}
        {canDelete ? (
          <Card>
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div>
                <div className="text-sm font-semibold">
                  {ORGANIZATION_DELETE_CARD.TITLE}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ORGANIZATION_DELETE_CARD.DESCRIPTION}
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                data-testid="organization-delete"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" />
                {ORGANIZATION_DELETE_CARD.TITLE}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <DeleteOrganizationWindow
          counts={organization.counts}
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          organizationId={organization.id}
          organizationName={organization.name}
          onDeleted={onClose}
        />
      </form>
    </Form>
  );
}
