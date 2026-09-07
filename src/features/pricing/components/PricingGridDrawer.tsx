import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Layers,
  Package,
  Plus,
  Repeat,
  SlidersHorizontal,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatInteger, formatPrice } from '@/shared/utils/string-utils';
import { PRICING_UI } from '../constants/pricing.constants';
import { usePricingGrid } from '../hooks/usePricingGrids';
import { canAdd } from '../utils/grid-edit';
import { PRICING_LIMITS } from '../types/pricingGrid';
import type { PricingGridContent } from '../types/pricingGrid';
import type { GridOps } from '../hooks/usePricingDraft';
import type { LabelCell, PriceCell } from '../hooks/usePricingDraft';

const UI = PRICING_UI.DRAWER;
const SECTIONS = PRICING_UI.DRAWER.SECTIONS;

/**
 * Le bouton d'ajout d'une section, plafond compris.
 *
 * Le plafond se dit **avant** le clic : le serveur le refuserait par un
 * `at most 20 brackets` en anglais, découvert après avoir saisi la ligne.
 */
function AddRow({
  content,
  family,
  label,
  onAdd,
  testId,
}: {
  content: PricingGridContent;
  family: 'brackets' | 'plans' | 'options' | 'setupFees' | 'extras';
  label: string;
  onAdd: () => void;
  testId: string;
}) {
  const room = canAdd(content, family);
  const button = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!room}
      data-testid={testId}
      onClick={onAdd}
    >
      <Plus />
      {label}
    </Button>
  );

  if (room) return <div className="mt-3">{button}</div>;
  return (
    <div className="mt-3">
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Un bouton désactivé ne reçoit pas d'événement de pointeur : le
              `span` porte le focus pour que la raison s'affiche. */}
          <span tabIndex={0}>{button}</span>
        </TooltipTrigger>
        <TooltipContent>
          {UI.AT_MOST(PRICING_LIMITS[family], UI.FAMILIES[family])}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * La cellule de retrait d'une ligne.
 *
 * Dernière colonne, en-tête centré, bouton-icône avec infobulle : le patron de
 * `docs/REGLE-OUVRIR-UNE-LIGNE.md`, qui vaut pour toutes les actions d'une
 * ligne, pas seulement pour l'ouverture.
 */
function RemoveCell({
  label,
  blocked,
  onRemove,
  testId,
  rowSpan,
}: {
  label: string;
  /** La raison quand le retrait n'est pas possible, `null` sinon. */
  blocked: string | null;
  onRemove: () => void;
  testId: string;
  /** Un poste de frais occupe une ligne par formule : sa cellule les enjambe. */
  rowSpan?: number;
}) {
  const button = (
    <Button
      mode="icon"
      variant="ghost"
      disabled={blocked !== null}
      aria-label={label}
      data-testid={testId}
      onClick={onRemove}
    >
      <Trash2 />
    </Button>
  );

  return (
    <TableCell rowSpan={rowSpan} className="align-top">
      <div className="flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            {blocked ? <span tabIndex={0}>{button}</span> : button}
          </TooltipTrigger>
          <TooltipContent>{blocked ?? label}</TooltipContent>
        </Tooltip>
      </div>
    </TableCell>
  );
}

/**
 * Un prix, jamais recalculé — le moteur tarifaire est la seule autorité.
 *
 * Et jamais arrondi : `formatInteger` affichait « 20 € » pour un abonnement à
 * 19,90 €. Les centimes sont le prix lui-même, pas un détail de présentation.
 */
const price = (n: number) => formatPrice(n);

/**
 * Une case de prix : lue, ou saisie.
 *
 * En édition, la valeur part dans le brouillon **en mémoire** — jamais au
 * serveur. Le pas de `0,1` suit la V8 : les abonnements se chiffrent au dixième
 * d'euro, les frais à l'euro.
 */
/**
 * Le champ **discret** : sans bordure au repos, cernee au survol et au focus.
 *
 * Une bordure permanente sur chaque case transformait le tableau en grille de
 * boites : quarante rectangles ou l'oeil cherchait des prix. Le contenu doit
 * primer sur le contenant — la bordure ne sert qu'a designer la case qu'on
 * s'apprete a modifier, elle n'a pas a etre la le reste du temps.
 *
 * Toutes les couleurs viennent du theme : `border`, `accent` au survol,
 * `ring` au focus.
 */
const QUIET_FIELD =
  'h-8 rounded-md border border-transparent bg-transparent px-2 shadow-none ' +
  'hover:border-border hover:bg-accent/40 ' +
  'focus-visible:border-primary focus-visible:bg-background';

function PriceCellInput({
  value,
  editing,
  onChange,
  testId,
}: {
  value: number;
  editing: boolean;
  onChange: (v: number) => void;
  testId: string;
}) {
  if (!editing) return <>{price(value)}</>;
  return (
    <Input
      type="number"
      step="0.1"
      min="0"
      data-testid={testId}
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={`${QUIET_FIELD} w-24 text-end tabular-nums`}
    />
  );
}

/**
 * L'en-tete d'une colonne de strate.
 *
 * Le libelle porte son unite — « 0 – 500 hab. » — et six colonnes la
 * repetaient six fois, en cassant chaque en-tete sur deux lignes. On la dit
 * une seule fois sous la rangee ; le libelle stocke, lui, ne bouge pas.
 */
const shortBracket = (label: string) =>
  label.replace(/\s*hab\.?\s*$/i, '').trim() || label;

/**
 * Un tableau large défile **dans son propre conteneur**.
 *
 * Les frais de mise en place forment une matrice de trois postes × trois
 * formules × six strates : huit colonnes. La règle du projet veut qu'un tel
 * contenu ne fasse jamais partir la page de travers.
 */
function Wide({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

/**
 * L'icone de chaque section — SVG inline, jamais une image.
 *
 * Cinq titres alignes et de meme graisse se ressemblent tous : l'oeil doit
 * les lire pour retrouver celle qu'il cherche. Une icone donne un point
 * d'accroche different par section, ce qui compte d'autant plus que le tiroir
 * s'ouvre entierement replie.
 *
 * Elles heritent de `currentColor` et suivent donc le theme sans reglage.
 */
const SECTION_ICONS = {
  brackets: Layers,
  subscription: Repeat,
  options: SlidersHorizontal,
  setup: Wrench,
  extras: Package,
} as const;

function Section({
  value,
  title,
  count,
  children,
}: {
  value: keyof typeof SECTION_ICONS;
  title: string;
  count: string;
  children: React.ReactNode;
}) {
  const Icon = SECTION_ICONS[value];
  return (
    <AccordionItem value={value}>
      <AccordionTrigger data-testid={`pricing-section-${value}`}>
        <span className="flex w-full items-center justify-between pe-3">
          <span className="flex items-center gap-2.5">
            {/* `text-muted-foreground` : l'icone repere, elle ne rivalise pas
                avec le titre. */}
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            {title}
          </span>
          {/* Ce que la section contient, dit sans l'ouvrir : replié, un
              accordéon muet oblige à tout déplier pour trouver. */}
          <span className="text-xs font-normal text-muted-foreground">
            {count}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

/**
 * Le contenu d'une version tarifaire, en lecture — L2 · US-02-01, tranche A.
 *
 * Les cinq tableaux de la V8, repliés en accordéon : dépliés, ils font une
 * soixantaine de cases sur plusieurs écrans de haut, et on lit un prix d'option
 * en ayant perdu de vue ce qu'on regarde.
 *
 * **Aucun prix n'est calculé ici.** Le moteur tarifaire est la seule
 * implémentation du chiffrage ; cet écran ne fait qu'afficher ce que la version
 * porte.
 */
export function PricingGridBody({
  gridId,
  draft,
  setPrice,
  setLabel,
  ops,
  onAddPlan,
  onAddSetupFee,
}: {
  gridId: string | null;
  /** Le brouillon quand on modifie, `null` en lecture. */
  draft?: PricingGridContent | null;
  setPrice?: (cell: PriceCell, value: number) => void;
  setLabel?: (cell: LabelCell, value: string) => void;
  /** Les gestes d'ajout et de retrait, absents en lecture. */
  ops?: GridOps;
  /* Ajouter une formule ou un poste demande une saisie : ces deux-la passent
     par une fenetre, que le parent porte. */
  onAddPlan?: () => void;
  onAddSetupFee?: () => void;
}) {
  const { grid, loading } = usePricingGrid(gridId);
  const editing = !!draft;

  if (loading || !grid) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  /* Le brouillon fait foi dès qu'il existe : ce qu'on vient de saisir doit
     s'afficher, pas la version telle qu'elle est enregistrée. */
  const c: PricingGridContent = draft ?? grid.content;
  const n = (v: number, [one, many]: readonly [string, string]) =>
    UI.COUNT(v, one, many);
  const setupKeys = Object.keys(c.setupFees ?? {});

  return (
    /* **Tout replie a l'ouverture.** Le tiroir s'ouvre alors sur la carte des
       cinq groupes et leurs decomptes — 6 strates, 3 formules, 6 options — et
       on deplie ce qu'on est venu voir. Ouvrir une section d'office rendait la
       liste des groupes invisible en dessous, donc ce qui est disponible. */
    <Accordion
      type="multiple"
      className="w-full"
      data-testid="pricing-grid-body"
    >
      <Section
        value="brackets"
        title={SECTIONS.BRACKETS}
        count={n(c.brackets.length, UI.BRACKET_COUNT)}
      >
        <Wide>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.LABEL}</TableHead>
                <TableHead className="text-end">{UI.FROM}</TableHead>
                <TableHead className="text-end">{UI.TO}</TableHead>
                {ops ? (
                  <TableHead className="text-center">{UI.ACTIONS}</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.brackets.map((b, i) => (
                <TableRow key={`${b.min}-${b.max}`}>
                  <TableCell className="font-medium">
                    {editing ? (
                      <Input
                        data-testid={`pricing-bracket-label-${i}`}
                        value={b.label}
                        onChange={(e) =>
                          setLabel?.(
                            { kind: 'bracket', index: i, field: 'label' },
                            e.target.value,
                          )
                        }
                        className={`${QUIET_FIELD} w-full font-medium`}
                      />
                    ) : (
                      b.label
                    )}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {formatInteger(b.min)}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {/* La strate ouverte porte `max: null` et clôt toujours la
                        grille : « et plus », jamais un nombre inventé. */}
                    {b.max === null ? UI.OPEN_ENDED : formatInteger(b.max)}
                  </TableCell>
                  {ops ? (
                    <RemoveCell
                      label={UI.REMOVE.BRACKET}
                      /* Une grille sans strate ne chiffre plus rien : le
                         serveur le refuse, l'écran ne le propose pas. */
                      blocked={
                        c.brackets.length <= 1 ? UI.LAST_ONE.BRACKET : null
                      }
                      testId={`pricing-bracket-remove-${i}`}
                      onRemove={() => ops.removeBracket(i)}
                    />
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Wide>
        {ops ? (
          <>
            {/* Ce que le geste fait vraiment : ajouter coupe, retirer rend la
                plage. Sans le dire, l'utilisateur croit insérer une ligne et
                s'étonne que les bornes voisines bougent. */}
            <p className="mt-3 text-xs text-muted-foreground">
              {UI.BRACKET_HINT}
            </p>
            <AddRow
              content={c}
              family="brackets"
              label={UI.ADD.BRACKET}
              testId="pricing-bracket-add"
              /* On coupe la dernière strate, celle qui est ouverte : c'est
                 celle qui a toujours de la place. */
              onAdd={() => ops.addBracket(c.brackets.length - 1)}
            />
          </>
        ) : null}
      </Section>

      <Section
        value="subscription"
        title={SECTIONS.SUBSCRIPTION}
        count={n(c.plans.length, UI.PLAN_COUNT)}
      >
        <Wide>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.PLAN}</TableHead>
                {c.brackets.map((b) => (
                  <TableHead key={b.label} className="text-end whitespace-nowrap">
                    {shortBracket(b.label)}
                  </TableHead>
                ))}
                {ops ? (
                  <TableHead className="text-center">{UI.ACTIONS}</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.plans.map((p) => (
                <TableRow key={p}>
                  <TableCell className="font-medium">{p}</TableCell>
                  {(c.subscription[p] ?? []).map((v, i) => (
                    <TableCell key={i} className="text-end tabular-nums">
                      <PriceCellInput
                        value={v}
                        editing={editing}
                        testId={`pricing-sub-${p}-${i}`}
                        onChange={(nv) =>
                          setPrice?.({ kind: 'subscription', plan: p, bracket: i }, nv)
                        }
                      />
                    </TableCell>
                  ))}
                  {ops ? (
                    <RemoveCell
                      label={UI.REMOVE.PLAN}
                      blocked={c.plans.length <= 1 ? UI.LAST_ONE.PLAN : null}
                      testId={`pricing-plan-remove-${p}`}
                      /* Retirer la formule emporte **toutes** ses tables de
                         prix — l'abonnement et chaque poste de frais. Le
                         serveur refuse un prix orphelin plutôt que de
                         l'ignorer : il ressusciterait d'anciens tarifs le jour
                         où le nom revient. */
                      onRemove={() => ops.removePlan(p)}
                    />
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Wide>
        {ops ? (
          <AddRow
            content={c}
            family="plans"
            label={UI.ADD.PLAN}
            testId="pricing-plan-add"
            onAdd={() => onAddPlan?.()}
          />
        ) : null}
      </Section>

      <Section
        value="options"
        title={SECTIONS.OPTIONS}
        count={n(c.options?.length ?? 0, UI.OPTION_COUNT)}
      >
        {c.options?.length ? (
          <Wide>
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Le libellé ne s'enroule pas : trois lignes de nom
                      faisaient des rangées de 93 px, et le tableau défile
                      déjà dans son conteneur. */}
                  <TableHead className="min-w-56 whitespace-nowrap">
                    {UI.LABEL}
                  </TableHead>
                  {/* La franchise est une colonne, non une note pendue sous
                      le nom : c'est une donnee de la ligne, elle se lit et se
                      compare comme les prix. */}
                  <TableHead className="text-end whitespace-nowrap">
                    {UI.INCLUDED_FIELD}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {UI.INCLUDED_SUBHEAD}
                    </span>
                  </TableHead>
                  {c.brackets.map((b) => (
                    <TableHead key={b.label} className="text-end whitespace-nowrap">
                      {shortBracket(b.label)}
                    </TableHead>
                  ))}
                  {ops ? (
                    <TableHead className="text-center">{UI.ACTIONS}</TableHead>
                  ) : null}
                </TableRow>
                {/* L'unite, une seule fois : six en-tetes portant « hab. » se
                    cassaient chacun sur deux lignes. */}
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="h-auto p-0" />
                  <TableHead className="h-auto p-0" />
                  <TableHead
                    colSpan={c.brackets.length}
                    className="h-auto p-0 pb-2 text-center text-xs font-normal text-muted-foreground"
                  >
                    {UI.BRACKET_UNIT}
                  </TableHead>
                  {ops ? <TableHead className="h-auto p-0" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {c.options.map((o, oi) => (
                  /* Le rang, non l'`id` : un élément neuf n'en a pas encore,
                     le serveur le lui donne à l'enregistrement. */
                  <TableRow key={`option-${oi}`}>
                    <TableCell className="whitespace-nowrap">
                      {/* Le nom se saisit : une option ajoutée arrive nommée
                          « Nouvelle option », et `options[].name` est requis —
                          un champ vide serait refusé en anglais au moment
                          d'enregistrer toute la grille. */}
                      {editing ? (
                        <Input
                          data-testid={`pricing-opt-name-${oi}`}
                          value={o.name}
                          onChange={(e) =>
                            setLabel?.({ kind: 'option', index: oi }, e.target.value)
                          }
                          className={`${QUIET_FIELD} w-full min-w-56 font-medium`}
                        />
                      ) : (
                        <span className="font-medium">{o.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {editing ? (
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          data-testid={`pricing-opt-included-${oi}`}
                          value={o.included ?? 0}
                          onChange={(e) =>
                            ops?.setOptionIncluded(oi, Number(e.target.value) || 0)
                          }
                          className={`${QUIET_FIELD} w-20 text-end tabular-nums`}
                        />
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {/* `0` s'affiche : une colonne à trous ferait
                                croire à une donnée manquante. */}
                            <span tabIndex={0}>{o.included ?? 0}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {o.included
                              ? UI.INCLUDED_HINT(o.included)
                              : UI.INCLUDED_NONE}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    {o.unitPrice.map((v, i) => (
                      <TableCell key={i} className="text-end tabular-nums">
                        <PriceCellInput
                          value={v}
                          editing={editing}
                          testId={`pricing-opt-${o.id}-${i}`}
                          onChange={(nv) =>
                            setPrice?.(
                              { kind: 'option', index: oi, bracket: i },
                              nv,
                            )
                          }
                        />
                      </TableCell>
                    ))}
                    {ops ? (
                      <RemoveCell
                        label={UI.REMOVE.OPTION}
                        blocked={null}
                        testId={`pricing-opt-remove-${oi}`}
                        onRemove={() => ops.removeOption(oi)}
                      />
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Wide>
        ) : (
          <p className="text-sm text-muted-foreground">{UI.NO_OPTIONS}</p>
        )}
        {ops ? (
          <AddRow
            content={c}
            family="options"
            label={UI.ADD.OPTION}
            testId="pricing-opt-add"
            onAdd={ops.addOption}
          />
        ) : null}
      </Section>

      <Section
        value="setup"
        title={SECTIONS.SETUP}
        count={n(setupKeys.length, UI.SETUP_COUNT)}
      >
        {setupKeys.length ? (
          <Wide>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{UI.POST}</TableHead>
                  <TableHead>{UI.PLAN}</TableHead>
                  {c.brackets.map((b) => (
                    <TableHead key={b.label} className="text-end whitespace-nowrap">
                      {shortBracket(b.label)}
                    </TableHead>
                  ))}
                  {ops ? (
                    <TableHead className="text-center">{UI.ACTIONS}</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {setupKeys.map((key) =>
                  c.plans.map((p, pi) => (
                    <TableRow key={`${key}-${p}`}>
                      {pi === 0 ? (
                        <TableCell
                          rowSpan={c.plans.length}
                          className="font-medium align-top"
                        >
                          {/* Le libellé s'affiche, la clé ne se voit jamais.
                              Depuis SPEC-19 c'est `nature` qui commande la
                              ventilation du une-fois, plus la clé : deux
                              postes identiques à l'œil peuvent ventiler
                              différemment, l'écran doit donc le dire. */}
                          <span className="block">
                            {c.setupFees?.[key]?.label ?? key}
                          </span>
                          <Badge
                            variant="secondary"
                            appearance="outline"
                            size="sm"
                            className="mt-1 font-normal"
                          >
                            {UI.NATURE[c.setupFees?.[key]?.nature ?? 'SETUP']}
                          </Badge>
                        </TableCell>
                      ) : null}
                      <TableCell>{p}</TableCell>
                      {((c.setupFees?.[key]?.[p] as number[]) ?? []).map(
                        (v, i) => (
                          <TableCell key={i} className="text-end tabular-nums">
                            <PriceCellInput
                              value={v}
                              editing={editing}
                              testId={`pricing-setup-${key}-${p}-${i}`}
                              onChange={(nv) =>
                                setPrice?.(
                                  { kind: 'setup', key, plan: p, bracket: i },
                                  nv,
                                )
                              }
                            />
                          </TableCell>
                        ),
                      )}
                      {ops && pi === 0 ? (
                        <RemoveCell
                          label={UI.REMOVE.SETUP}
                          blocked={null}
                          testId={`pricing-setup-remove-${key}`}
                          rowSpan={c.plans.length}
                          onRemove={() => ops.removeSetupFee(key)}
                        />
                      ) : null}
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </Wide>
        ) : (
          <p className="text-sm text-muted-foreground">{UI.NO_SETUP}</p>
        )}
        {ops ? (
          <AddRow
            content={c}
            family="setupFees"
            label={UI.ADD.SETUP}
            testId="pricing-setup-add"
            onAdd={() => onAddSetupFee?.()}
          />
        ) : null}
      </Section>

      <Section
        value="extras"
        title={SECTIONS.EXTRAS}
        count={n(c.extras?.length ?? 0, UI.EXTRA_COUNT)}
      >
        {c.extras?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.LABEL}</TableHead>
                <TableHead className="text-end">{UI.UNIT_PRICE}</TableHead>
                {ops ? (
                  <TableHead className="text-center">{UI.ACTIONS}</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.extras.map((e, ei) => (
                /* Le rang, non l'`id` : un élément neuf n'en a pas encore. */
                <TableRow key={`extra-${ei}`}>
                  <TableCell className="font-medium">
                    {editing ? (
                      <Input
                        data-testid={`pricing-extra-name-${ei}`}
                        value={e.name}
                        onChange={(ev) =>
                          setLabel?.({ kind: 'extra', index: ei }, ev.target.value)
                        }
                        className={`${QUIET_FIELD} w-full min-w-56 font-medium`}
                      />
                    ) : (
                      e.name
                    )}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    <PriceCellInput
                      value={e.unitPrice}
                      editing={editing}
                      testId={`pricing-extra-${e.id}`}
                      onChange={(nv) => setPrice?.({ kind: 'extra', index: ei }, nv)}
                    />
                  </TableCell>
                  {ops ? (
                    <RemoveCell
                      label={UI.REMOVE.EXTRA}
                      blocked={null}
                      testId={`pricing-extra-remove-${ei}`}
                      onRemove={() => ops.removeExtra(ei)}
                    />
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">{UI.NO_EXTRAS}</p>
        )}
        {ops ? (
          <AddRow
            content={c}
            family="extras"
            label={UI.ADD.EXTRA}
            testId="pricing-extra-add"
            onAdd={ops.addExtra}
          />
        ) : null}
      </Section>
    </Accordion>
  );
}
