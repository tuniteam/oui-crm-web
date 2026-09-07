import { useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { noWindowHooks } from '@/components/window/ReusableWindow';
import { formatShortDateFr } from '@/shared/utils/date-utils';
import {
  PRICING_PAGE_SIZE,
  PRICING_UI,
} from '../constants/pricing.constants';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { usePricingGrid, usePricingGrids } from '../hooks/usePricingGrids';
import { usePricingDraft } from '../hooks/usePricingDraft';
import { useCreatePricingGrid } from '../hooks/usePricingMutations';
import { useUpdatePricingGrid } from '../hooks/useUpdatePricingGrid';
import { PRICING_HAS_QUOTES } from '../constants/pricing.constants';
import { SavePricingGridWindow } from './SavePricingGridWindow';
import type { PricingGridSummary } from '../types/pricingGrid';
import { PricingGridBody } from './PricingGridDrawer';

const UI = PRICING_UI;
const EMPTY_VALUE = '—';

/** L'état d'une version, en un mot. */
function StateBadge({ grid }: { grid: PricingGridSummary }) {
  if (grid.active) {
    return (
      <Badge variant="success" appearance="outline" size="sm" className="whitespace-nowrap">
        {UI.STATE.ACTIVE}
      </Badge>
    );
  }
  /* « Remplacée » et « en préparation » se distinguent par les devis : une
     version qui en porte a chiffré, donc elle a été active. */
  const replaced = grid.quotesCount > 0;
  return (
    /* `whitespace-nowrap` : « En préparation » se coupait en deux lignes et
       débordait de la pilule, dont la hauteur est fixe. La colonne s'élargit,
       et le tableau défile déjà dans son conteneur. */
    <Badge variant="secondary" appearance="outline" size="sm" className="whitespace-nowrap">
      {replaced ? UI.STATE.REPLACED : UI.STATE.PREPARED}
    </Badge>
  );
}

/**
 * Paramètres › Grille tarifaire — L2 · US-02-01, tranche A (lecture).
 *
 * **L'écran montre les versions, pas les prix.** Une grille n'est pas un
 * réglage mais un document daté : une seule chiffre les devis, et les devis
 * déjà émis restent attachés à la leur. Un écran unique et modifiable, comme
 * dans la V8, ferait croire qu'un prix corrigé s'applique aussitôt.
 *
 * Choisir une ligne ouvre son contenu dans un tiroir — la liste ne porte pas
 * `content`, il se charge à la demande.
 */
export function PricingGridsPane() {
  const { grids, loading } = usePricingGrids({ page: 1, limit: PRICING_PAGE_SIZE });
  const [openedId, setOpenedId] = useState<string | null>(null);
  const opened = grids.find((g) => g.id === openedId) ?? null;

  /* Preparer et activer relevent de `pricing:update`, reserve a
     l'administrateur de projet ; la lecture, elle, est ouverte aux
     commerciaux. */
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.PRICING.UPDATE),
  );

  const { grid } = usePricingGrid(openedId);
  const { draft, editing, dirtyCount, start, stop, setPrice, setLabel } =
    usePricingDraft(grid?.content ?? null);
  const { saving, create } = useCreatePricingGrid();
  const { saving: fixing, update } = useUpdatePricingGrid();
  const [askDate, setAskDate] = useState(false);

  /* La version suivante est attribuee par le serveur ; on l'annonce depuis la
     plus haute connue, ce qui suffit a rendre le versionnement visible. */
  const nextVersion = Math.max(0, ...grids.map((g) => g.version)) + 1;
  const activeVersion = grids.find((g) => g.active)?.version ?? null;

  const close = () => {
    stop();
    setOpenedId(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pricing-grids-pane">
      {/* Le modèle mental, dit avant le tableau. */}
      <p className="text-sm text-muted-foreground">{UI.LEAD}</p>

      {grids.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
          <p className="text-sm text-muted-foreground">{UI.EMPTY.BODY}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.COLUMNS.VERSION}</TableHead>
                <TableHead>{UI.COLUMNS.EFFECTIVE_DATE}</TableHead>
                <TableHead>{UI.COLUMNS.STATE}</TableHead>
                <TableHead className="text-end">{UI.COLUMNS.QUOTES}</TableHead>
                <TableHead>{UI.COLUMNS.CREATED_BY}</TableHead>
                <TableHead>{UI.COLUMNS.CREATED_AT}</TableHead>
                {/* Derniere colonne, en-tete centre : le patron de tous les
                    tableaux du projet. Voir `docs/REGLE-OUVRIR-UNE-LIGNE.md`. */}
                <TableHead className="text-center">
                  {UI.COLUMNS.ACTIONS}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grids.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    {/* Une valeur s'affiche, elle ne s'actionne pas : ouvrir
                        passe par la colonne Actions, comme partout ailleurs. */}
                    <span className="font-semibold">{UI.VERSION(g.version)}</span>
                    {/* La filiation, quand elle existe : c'est le signal qui
                        manque à qui active une version préparée sur une grille
                        entre-temps remplacée. */}
                    {g.basedOnVersion !== null ? (
                      <span className="block text-xs text-muted-foreground">
                        {UI.DERIVED_FROM(g.basedOnVersion)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatShortDateFr(g.effectiveDate) || EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    <StateBadge grid={g} />
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {g.quotesCount}
                  </TableCell>
                  {/* `createdBy` vaut `null` pour la version du seed : un
                      tiret, jamais « null ». */}
                  <TableCell>{g.createdBy?.fullName ?? EMPTY_VALUE}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatShortDateFr(g.createdAt) || EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            mode="icon"
                            variant="ghost"
                            aria-label={UI.VIEW}
                            data-testid={`pricing-view-${g.version}`}
                            onClick={() => setOpenedId(g.id)}
                          >
                            <Eye />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{UI.VIEW}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ReusableSheet<Record<string, never>>
        open={openedId !== null}
        onOpenChange={(open) => !open && close()}
        title={opened ? UI.VERSION(opened.version) : ''}
        description={
          opened
            ? [
                opened.active ? UI.STATE.ACTIVE : UI.STATE.PREPARED,
                formatShortDateFr(opened.effectiveDate),
                opened.basedOnVersion !== null
                  ? UI.DERIVED_FROM(opened.basedOnVersion)
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')
            : ''
        }
        useHooks={noWindowHooks}
        /* Une saisie en cours ne doit pas partir sur un clic a cote : seules
           la croix et « Annuler » ferment, comme le panneau de fiche. */
        preventClose
        /* Large : les frais de mise en place font huit colonnes, et le tiroir
           de fiche est taillé pour deux colonnes de champs. */
        className="sm:max-w-4xl"
        renderBody={() => (
          <div className="space-y-4">
            {/* Modifier une version qui n'est pas l'active repart de **son**
                contenu : le dire avant d'enregistrer, pas apres. */}
            {/* Corriger l'active applique les prix sur-le-champ : ce n'est
                plus preparer une version. */}
            {editing && opened?.active ? (
              <p
                data-testid="pricing-active-warning"
                className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm"
              >
                {UI.EDIT.ACTIVE_WARNING}
              </p>
            ) : null}

            {editing && opened && activeVersion !== null && !opened.active ? (
              <p
                data-testid="pricing-not-active-warning"
                className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm"
              >
                {UI.EDIT.NOT_ACTIVE(opened.version, activeVersion)}
              </p>
            ) : null}

            <PricingGridBody
              gridId={openedId}
              draft={draft}
              setPrice={setPrice}
              setLabel={setLabel}
            />
          </div>
        )}
        renderFooter={() =>
          canUpdate ? (
            <>
              {dirtyCount > 0 ? (
                <span
                  data-testid="pricing-dirty"
                  className="me-auto text-xs font-medium text-warning"
                >
                  {UI.EDIT.DIRTY(dirtyCount)}
                </span>
              ) : null}

              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="pricing-edit-cancel"
                    onClick={stop}
                  >
                    {UI.EDIT.CANCEL}
                  </Button>
                  {/*
                    * On **corrige la version**, on n'en empile plus une.
                    *
                    * `PATCH` est permis tant qu'aucun devis emis n'est
                    * attache — les brouillons, eux, sont recalcules. Le front
                    * ne le decide pas : `quotesCount` melange les deux, donc
                    * on tente et on lit `409 PRICING_GRID_HAS_QUOTES`, qui
                    * bascule alors sur la creation d'une version.
                    */}
                  <Button
                    type="button"
                    disabled={dirtyCount === 0 || fixing}
                    data-testid="pricing-edit-save"
                    onClick={async () => {
                      if (!draft || !opened) return;
                      const r = await update({ id: opened.id, content: draft });
                      if (r.ok) close();
                      else if (r.code === PRICING_HAS_QUOTES) setAskDate(true);
                    }}
                  >
                    {UI.EDIT.FIX}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  data-testid="pricing-edit-start"
                  onClick={start}
                >
                  <Pencil />
                  {UI.EDIT.START}
                </Button>
              )}
            </>
          ) : null
        }
      />

      <SavePricingGridWindow
        open={askDate}
        onOpenChange={setAskDate}
        nextVersion={nextVersion}
        saving={saving}
        onConfirm={async (effectiveDate) => {
          if (!draft || !opened) return;
          /* `fromVersion` accompagne le contenu : il declare la filiation, sans
             laquelle le garde-fou d'activation du serveur ne se declenche
             jamais. */
          const created = await create({
            fromVersion: opened.version,
            content: draft,
            effectiveDate,
          });
          if (created) {
            setAskDate(false);
            close();
          }
        }}
      />
    </div>
  );
}
