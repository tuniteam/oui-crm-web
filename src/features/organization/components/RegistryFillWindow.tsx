import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import { useRegistrySearch } from '../hooks/useRegistrySearch';
import type { UseFormReturn } from 'react-hook-form';
import type { OrganizationSummarySchemaType } from '../forms/organization-summary-schema';
import type { RegistryMatch } from '../types/organizationCreate';
import { RegistrySearchPane } from './RegistrySearchPane';

const UI = ORGANIZATION_DETAIL_UI.REGISTRY_FILL;
/* Une constante, et non `new Set()` a chaque fermeture : un ensemble neuf est
   une nouvelle reference, que React tient pour un changement d'etat — l'effet
   de reinitialisation se rappellerait sans fin. */
const NONE_CHECKED: Set<FillableField> = new Set();
const { LABELS } = ORGANIZATION_DETAIL_UI;

/**
 * Le champ du formulaire qu'alimente chaque champ du registre.
 *
 * L'intersection des deux formes, plutot qu'une liste tenue a la main : un
 * champ qui disparaitrait de l'une ou de l'autre casse ici, a la compilation,
 * et le tableau ci-dessous n'a plus besoin d'un cast pour lire le resultat.
 */
type FillableField = Extract<
  keyof OrganizationSummarySchemaType,
  keyof RegistryMatch
>;

/**
 * Ce que le registre sait remplir, et où ça va.
 *
 * Sept champs sur les neuf que rend la route : `siren` n'a pas de place au
 * formulaire, et `isActive` n'est pas une donnée de la fiche. Ni la population
 * ni l'e-mail n'y figurent — deux des six critères de complétude restent donc
 * à la saisie, ce que la fenêtre annonce plutôt que de le laisser découvrir.
 */
const FILLABLE: { field: FillableField; label: string }[] = [
  { field: 'name', label: LABELS.NAME },
  { field: 'siret', label: LABELS.SIRET },
  { field: 'inseeCode', label: LABELS.INSEE },
  { field: 'address', label: LABELS.ADDRESS },
  { field: 'postalCode', label: LABELS.POSTAL_CODE },
  { field: 'city', label: LABELS.CITY },
  { field: 'department', label: LABELS.DEPARTMENT },
];

/** Une ligne proposée à l'utilisateur, telle qu'elle se lit. */
type Row = {
  field: FillableField;
  label: string;
  current: string;
  found: string;
  /** La fiche ne porte rien : reprendre ne coûte rien. */
  fills: boolean;
  /** La fiche porte déjà cette valeur exacte : rien à faire. */
  same: boolean;
};

function buildRows(
  match: RegistryMatch,
  values: OrganizationSummarySchemaType,
): Row[] {
  return FILLABLE.flatMap(({ field, label }) => {
    const found = (match[field] ?? '').toString().trim();
    // Un champ que le registre ne rend pas n'a rien à proposer.
    if (found === '') return [];
    const current = (values[field] ?? '').toString().trim();
    return [
      {
        field,
        label,
        current,
        found,
        fills: current === '',
        same: current !== '' && current.toUpperCase() === found.toUpperCase(),
      },
    ];
  });
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Le formulaire de l'onglet Synthèse : c'est lui qu'on remplit. */
  form: UseFormReturn<OrganizationSummarySchemaType>;
  /** Le nom de la fiche, posé d'emblée dans la recherche. */
  organizationName: string;
  onFilled: (count: number) => void;
};

/**
 * Compléter une fiche existante depuis le registre officiel.
 *
 * **Rien ne part au serveur.** La fenêtre pose des valeurs dans le formulaire
 * de la fiche ; l'enregistrement reste le geste de l'utilisateur, avec sa
 * relecture et son bouton. Le seul appel réseau du parcours est la recherche
 * elle-même.
 *
 * C'est ce qui la sépare de la création, où la saisie est vide et où tout se
 * pose sans risque : ici la fiche existe, et une valeur du registre peut en
 * effacer une juste. Un département dérivé du code INSEE contredira une saisie
 * commerciale erronée — ou l'inverse, et l'écran ne peut pas en juger. Donc :
 * les champs vides sont cochés d'office, les champs déjà remplis sont montrés
 * côte à côte et **décochés**. L'écrasement est un geste, jamais un défaut.
 */
export function RegistryFillWindow({
  open,
  onOpenChange,
  form,
  organizationName,
  onFilled,
}: Props) {
  const registry = useRegistrySearch();
  const [match, setMatch] = useState<RegistryMatch | null>(null);
  const [checked, setChecked] = useState<Set<FillableField>>(new Set());

  /* `reset` est stable, l'objet `registry` ne l'est pas : en dépendre ferait
     rejouer l'effet à chaque rendu. */
  const { reset: resetRegistry } = registry;

  // Rouvrir la fenêtre ne doit pas hériter du choix précédent.
  useEffect(() => {
    if (open) return;
    setMatch(null);
    setChecked(NONE_CHECKED);
    resetRegistry();
  }, [open, resetRegistry]);

  const rows = useMemo(
    () => (match ? buildRows(match, form.getValues()) : []),
    [match, form],
  );

  const pick = (picked: RegistryMatch) => {
    setMatch(picked);
    // Les champs vides d'abord : c'est le cas qui n'appelle aucune décision.
    setChecked(
      new Set(buildRows(picked, form.getValues()).filter((r) => r.fills).map((r) => r.field)),
    );
  };

  const toggle = (field: FillableField) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (!next.delete(field)) next.add(field);
      return next;
    });

  const confirm = () => {
    for (const row of rows) {
      if (!checked.has(row.field)) continue;
      form.setValue(row.field, row.found, {
        // Sans `shouldDirty`, le formulaire se croirait intact et le bouton
        // d'enregistrement resterait sourd à ce qu'on vient de poser.
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    onFilled(checked.size);
    onOpenChange(false);
  };

  const actionable = rows.filter((r) => !r.same);
  const toFill = actionable.filter((r) => r.fills);
  const toReplace = actionable.filter((r) => !r.fills);

  const row = (r: Row) => (
    <li key={r.field} className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Checkbox
        id={`registry-fill-${r.field}`}
        className="mt-0.5"
        data-testid={`registry-fill-${r.field}`}
        checked={checked.has(r.field)}
        onCheckedChange={() => toggle(r.field)}
      />
      <label htmlFor={`registry-fill-${r.field}`} className="min-w-0 flex-1 cursor-pointer">
        <span className="text-sm font-medium">{r.label}</span>
        {r.fills ? (
          <p className="truncate text-sm text-muted-foreground">{r.found}</p>
        ) : (
          /* Les deux valeurs côte à côte : c'est le seul moment où
             l'utilisateur peut voir ce qu'il perdrait. */
          <p className="flex items-center gap-2 text-sm">
            <span className="truncate text-muted-foreground line-through">{r.current}</span>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">{r.found}</span>
          </p>
        )}
      </label>
    </li>
  );

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-2xl"
      renderBody={() => (
        <div className="space-y-4" data-testid="registry-fill-window">
          <p className="text-sm text-muted-foreground">{UI.LEAD}</p>

          {match === null ? (
            <RegistrySearchPane
              registry={registry}
              onPick={pick}
              useLabel={UI.USE}
              initialQuery={organizationName}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">{match.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="registry-fill-back"
                  onClick={() => setMatch(null)}
                >
                  {UI.BACK}
                </Button>
              </div>

              {actionable.length === 0 ? (
                <p
                  data-testid="registry-fill-nothing"
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                >
                  {UI.NOTHING}
                </p>
              ) : null}

              {toFill.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {UI.EMPTY_FIELDS}
                  </p>
                  <ul className="space-y-2">{toFill.map(row)}</ul>
                </div>
              ) : null}

              {toReplace.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {UI.FILLED_FIELDS}
                  </p>
                  <ul className="space-y-2">{toReplace.map(row)}</ul>
                </div>
              ) : null}

              {/* Ce que le registre ne couvre pas, dit avant qu'on croie la
                  fiche complète. */}
              <p className="text-xs text-muted-foreground">{UI.NOT_COVERED}</p>
            </div>
          )}
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="registry-fill-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={match === null || checked.size === 0}
            data-testid="registry-fill-confirm"
            onClick={confirm}
          >
            {UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
