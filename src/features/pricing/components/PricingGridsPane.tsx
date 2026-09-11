import { useState } from 'react';
import { CircleCheck, Eye, Pencil, Trash2 } from 'lucide-react';
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
import { useActivatePricingGrid } from '../hooks/useActivatePricingGrid';
import { useDeletePricingGrid } from '../hooks/useDeletePricingGrid';
import {
  PRICING_BASE_OUTDATED,
  PRICING_HAS_QUOTES,
} from '../constants/pricing.constants';
import { AddPlanWindow } from './AddPlanWindow';
import { AddSetupFeeWindow } from './AddSetupFeeWindow';
import { PricingIssuesPane } from './PricingIssuesPane';
import { SavePricingGridWindow } from './SavePricingGridWindow';
import { ActivatePricingGridWindow } from './ActivatePricingGridWindow';
import { DeletePricingGridWindow } from './DeletePricingGridWindow';
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
 * Ce que le serveur reproche a une version, quand il lui reproche quelque
 * chose. `null` si elle est activable.
 */
const outdatedOf = (g: PricingGridSummary) =>
  g.activation.reason === 'BASE_OUTDATED'
    ? { activeVersion: g.activation.activeVersion, basedOnVersion: g.basedOnVersion }
    : null;

/**
 * Le bouton « Activer », et la raison quand il ne s'active pas.
 *
 * **Deux refus, deux traitements.** `ALREADY_ACTIVE` est une impasse : la
 * version est deja celle qui chiffre, le bouton est grise et l'infobulle le
 * dit. `BASE_OUTDATED` n'en est pas une : la version derive d'une grille
 * perimee, le serveur refuse **sans `force`**, mais revenir volontairement a
 * une grille anterieure est legitime. Griser la aussi enfermerait
 * l'administrateur ; le bouton reste donc cliquable et c'est la fenetre qui
 * expose le risque avant de forcer.
 *
 * `<span tabIndex={0}>` : un bouton desactive ne recoit pas d'evenement de
 * pointeur, son infobulle ne s'ouvrirait jamais. Meme parade que
 * `CorrectEmailCard`.
 */
function ActivateAction({
  grid,
  onActivate,
}: {
  grid: PricingGridSummary;
  onActivate: () => void;
}) {
  const blocked = grid.activation.reason === 'ALREADY_ACTIVE';
  const button = (
    <Button
      mode="icon"
      variant="ghost"
      disabled={blocked}
      aria-label={UI.ACTIVATE}
      data-testid={`pricing-activate-${grid.version}`}
      onClick={onActivate}
    >
      <CircleCheck />
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {blocked ? <span tabIndex={0}>{button}</span> : button}
      </TooltipTrigger>
      <TooltipContent>
        {blocked
          ? UI.CANNOT_ACTIVATE.ALREADY_ACTIVE
          : outdatedOf(grid)
            ? UI.CANNOT_ACTIVATE.BASE_OUTDATED(
                grid.basedOnVersion ?? 0,
                grid.activation.activeVersion ?? 0,
              )
            : UI.ACTIVATE}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Le bouton « Supprimer », grise quand il echouerait a coup sur.
 *
 * Les deux refus du serveur se lisent sur la ligne : la version **active** ne
 * part pas, et **tout** devis attache bloque, brouillon compris. Offrir un
 * bouton qui repondra toujours 409 apprend la regle par l'echec ; la dire dans
 * l'infobulle l'apprend avant. Les toasts d'erreur restent en filet pour la
 * course entre deux administrateurs.
 */
function DeleteAction({
  grid,
  onDelete,
}: {
  grid: PricingGridSummary;
  onDelete: () => void;
}) {
  const reason = grid.active
    ? UI.CANNOT_DELETE.ACTIVE
    : grid.quotesCount > 0
      ? UI.CANNOT_DELETE.HAS_QUOTES(grid.quotesCount)
      : null;
  const button = (
    <Button
      mode="icon"
      variant="ghost"
      disabled={reason !== null}
      aria-label={UI.DELETE}
      data-testid={`pricing-delete-${grid.version}`}
      onClick={onDelete}
    >
      <Trash2 />
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {reason ? <span tabIndex={0}>{button}</span> : button}
      </TooltipTrigger>
      <TooltipContent>{reason ?? UI.DELETE}</TooltipContent>
    </Tooltip>
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
  const {
    draft,
    editing,
    dirtyCount,
    start,
    stop,
    setPrice,
    setLabel,
    ...ops
  } = usePricingDraft(grid?.content ?? null);
  const { saving, create } = useCreatePricingGrid();
  const { saving: fixing, update } = useUpdatePricingGrid();
  const { activating, activate } = useActivatePricingGrid();
  const { deleting, remove } = useDeletePricingGrid();
  const [askDate, setAskDate] = useState(false);
  /* Ce que le serveur a refuse au dernier envoi, garde brut : la traduction
     vit dans `PricingIssuesPane`, qui sait devant quel champ la poser. */
  const [issues, setIssues] = useState<string[]>([]);
  /* Ajouter une formule ou un poste demande une saisie, et un controle avant
     l'envoi : les deux passent par une fenetre. */
  const [addPlan, setAddPlan] = useState(false);
  const [addSetup, setAddSetup] = useState(false);

  /* Activer et supprimer se font depuis la liste, sur une ligne qui n'est pas
     forcement celle du tiroir : chacun garde donc sa cible. */
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [outdated, setOutdated] = useState<{
    activeVersion: number | null;
    basedOnVersion: number | null;
  } | null>(null);

  const toActivate = grids.find((g) => g.id === activatingId) ?? null;
  const toDelete = grids.find((g) => g.id === deletingId) ?? null;

  const activeVersion = grids.find((g) => g.active)?.version ?? null;

  /* Les devis deja emis, toutes versions confondues : ce sont eux qui gardent
     leur chiffrage quand la grille bascule. */
  const issuedQuotes = grids.reduce((n, g) => n + g.quotesCount, 0);

  const close = () => {
    stop();
    setIssues([]);
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

                      {canUpdate ? (
                        <>
                          <ActivateAction
                            grid={g}
                            onActivate={() => {
                              setOutdated(outdatedOf(g));
                              setActivatingId(g.id);
                            }}
                          />
                          <DeleteAction
                            grid={g}
                            onDelete={() => setDeletingId(g.id)}
                          />
                        </>
                      ) : null}
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
                className="rounded-lg border border-warning bg-warning-soft p-3 text-sm"
              >
                {UI.EDIT.ACTIVE_WARNING}
              </p>
            ) : null}

            {editing && opened && activeVersion !== null && !opened.active ? (
              <p
                data-testid="pricing-not-active-warning"
                className="rounded-lg border border-warning bg-warning-soft p-3 text-sm"
              >
                {UI.EDIT.NOT_ACTIVE(opened.version, activeVersion)}
              </p>
            ) : null}

            <PricingIssuesPane details={issues} content={draft} />

            <PricingGridBody
              gridId={openedId}
              draft={draft}
              setPrice={setPrice}
              setLabel={setLabel}
              /* Les gestes n'existent qu'en modification : en lecture, le
                 tiroir ne montre ni corbeille ni bouton d'ajout. */
              ops={editing ? ops : undefined}
              onAddPlan={() => setAddPlan(true)}
              onAddSetupFee={() => setAddSetup(true)}
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
                    onClick={() => {
                      setIssues([]);
                      stop();
                    }}
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
                      setIssues([]);
                      const r = await update({ id: opened.id, content: draft });
                      if (r.ok) close();
                      else if (r.code === PRICING_HAS_QUOTES) setAskDate(true);
                      else setIssues(r.details);
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
                  onClick={() => {
                    setIssues([]);
                    start();
                  }}
                >
                  <Pencil />
                  {UI.EDIT.START}
                </Button>
              )}
            </>
          ) : null
        }
      />

      <ActivatePricingGridWindow
        open={activatingId !== null}
        onOpenChange={(open) => !open && setActivatingId(null)}
        grid={toActivate}
        issuedQuotes={issuedQuotes}
        busy={activating}
        outdated={outdated}
        onConfirm={async (payload) => {
          if (!toActivate) return;
          const r = await activate({ id: toActivate.id, ...payload });
          if (r.ok) {
            setActivatingId(null);
            setOutdated(null);
            return;
          }
          /* Le serveur a le dernier mot : si sa filiation est perimee alors
             que la liste la disait bonne — un autre administrateur a active
             entre-temps — la fenetre reste ouverte et pose la question. */
          if (r.code === PRICING_BASE_OUTDATED) {
            setOutdated({
              activeVersion: r.activeVersion,
              basedOnVersion: r.basedOnVersion,
            });
          }
        }}
      />

      <DeletePricingGridWindow
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        grid={toDelete}
        busy={deleting}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await remove({ id: toDelete.id, version: toDelete.version });
          if (ok) {
            setDeletingId(null);
            /* La version supprimee pouvait etre celle du tiroir. */
            if (openedId === toDelete.id) close();
          }
        }}
      />

      <AddPlanWindow
        open={addPlan}
        onOpenChange={setAddPlan}
        content={draft}
        onConfirm={(name) => {
          ops.addPlan(name);
          setAddPlan(false);
        }}
      />

      <AddSetupFeeWindow
        open={addSetup}
        onOpenChange={setAddSetup}
        content={draft}
        onConfirm={(label, nature) => {
          ops.addSetupFee(label, nature);
          setAddSetup(false);
        }}
      />

      <SavePricingGridWindow
        open={askDate}
        onOpenChange={setAskDate}
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
