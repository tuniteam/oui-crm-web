import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FILTER_ALL, FILTER_DEBOUNCE_MS, FILTER_OPTIONS_LIMIT, PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useGeoRegions } from '@/features/settings/hooks/useScopes';
import { useActivePricingGrid } from '@/features/pricing/hooks/useActivePricingGrid';
import { useUsers } from '@/features/user/hooks/useUsers';
import { CirclePlus, Link2, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyTableComponent from '@/components/table/reusable-empty-table-component';
import { ReusableTable } from '@/components/table/reusable-table';
import {
  CUSTOMER_STATUS_LABELS,
  ORGANIZATIONS_UI,
  PRIORITY_LABELS,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import { CREATE_ORGANIZATION_UI } from '../constants/organizationCreate.constants';
import { useOrganizations } from '../hooks/useOrganizations';
import { useReferenceLabels } from '@/features/settings/hooks/useReferenceLabels';
import {
  CUSTOMER_STATUS_VALUES,
  PRIORITY_VALUES,
  SALES_STATUS_VALUES,
  type CustomerStatus,
  type OrganizationListItem,
  type OrganizationListParams,
  type Priority,
  type SalesStatus,
} from '../types/organizationList';
import { OPENING_DAYS, type OpeningDay } from '../types/organizationDetail';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import { organizationColumns } from './organizationColumns';
import { CreateOrganizationWindow } from './CreateOrganizationWindow';
import { OrganizationPanel } from './OrganizationPanel';
import { OrganizationsBulkBar } from './OrganizationsBulkBar';
import type { BulkFilters } from '../types/bulk';

const { SEARCH, EMPTY_STATE } = ORGANIZATIONS_UI;

/**
 * Liste des organismes — US-01-01, ecran Organismes de la maquette V8.
 *
 * La maquette propose dix filtres ; on cable ceux que l'API sert directement,
 * plus le compteur « fiches incompletes » (`completenessMax=99`), qui n'est pas
 * un filtre de sa barre mais son raccourci de tete de page.
 *
 * Deux filtres de la V8 restent de cote : la strate, que l'API ne filtre pas,
 * et le commercial, qui demande la liste des membres du projet.
 */
/**
 * Les filtres d'une liste, moins ce qui ne designe qu'une page.
 *
 * `selectAll` porte sur un **ensemble**, pas sur un ecran : le contrat refuse
 * `page`, `limit`, `sort` et `order`.
 */
/** Ce que `filters` ne doit pas porter : le contrat agit sur tout l'ensemble. */
const PAGINATION_KEYS = ['page', 'limit', 'sort', 'order'] as const;

function stripPagination(params: OrganizationListParams | null): BulkFilters {
  if (!params) return {};
  const filters: OrganizationListParams = { ...params };
  for (const key of PAGINATION_KEYS) delete filters[key];
  return filters;
}

/**
 * Une enumeration en options de menu.
 *
 * Quatre listes — statuts, priorite, jours — se transformaient a l'identique.
 * Le cast en `string` est inevitable : les valeurs sont des unions litterales,
 * le selecteur ne connait que des chaines.
 */
const enumOptions = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
) => values.map((v) => ({ value: v as string, label: labels[v] }));


/**
 * Les filtres s'ecrivent dans l'URL, sous les noms du contrat.
 *
 * Un seul sens de synchronisation : l'URL **initialise** l'etat au premier
 * rendu, l'etat **reecrit** l'URL ensuite. Deux sens auraient demande de
 * casser une boucle ; celui-ci n'en cree aucune.
 *
 * La recherche plein texte n'y figure pas : elle vit dans `ReusableTable`,
 * hors de portee de cet ecran. Un lien partage porte donc les filtres, pas la
 * saisie libre.
 */
const urlFilter = (key: string, fallback: string) =>
  new URLSearchParams(window.location.search).get(key) ?? fallback;

/** Idem, mais une valeur hors enumeration est ignoree plutot que renvoyee a
 *  l'API, qui repondrait `400` et casserait l'ecran sur un lien mal recopie. */
const urlEnum = (key: string, values: readonly string[]) => {
  const v = new URLSearchParams(window.location.search).get(key);
  return v && values.includes(v) ? v : FILTER_ALL;
};

export default function OrganizationsTable() {
  const hasPermission = useMeStore((s) => s.hasPermission);
  const { labelOf, optionsOf } = useReferenceLabels();

  const [type, setType] = useState<string>(() => urlFilter('type', FILTER_ALL));
  const [salesStatus, setSalesStatus] = useState<string>(() =>
    urlEnum('salesStatus', SALES_STATUS_VALUES),
  );
  const [customerStatus, setCustomerStatus] = useState<string>(() =>
    urlEnum('customerStatus', CUSTOMER_STATUS_VALUES),
  );
  const [priority, setPriority] = useState<string>(() =>
    urlEnum('priority', PRIORITY_VALUES),
  );
  const [department, setDepartment] = useState(() => urlFilter('department', ''));
  const [solution, setSolution] = useState<string>(() => urlFilter('solution', FILTER_ALL));
  const [tag, setTag] = useState<string>(() => urlFilter('tag', FILTER_ALL));
  const [incompleteOnly, setIncompleteOnly] = useState(
    () => urlFilter('incomplete', '') === '1',
  );
  /* Les quatre criteres du contrat que la liste n'exposait pas encore.
     `bracket` reste absent : il se peuple depuis la grille tarifaire active,
     que le front ne lit pas encore (L2 · US-02-01). */
  const [region, setRegion] = useState<string>(() => urlFilter('region', FILTER_ALL));
  const [leadSource, setLeadSource] = useState<string>(() =>
    urlFilter('leadSource', FILTER_ALL),
  );
  const [salesRepId, setSalesRepId] = useState<string>(() =>
    urlFilter('salesRepId', FILTER_ALL),
  );
  const [openOn, setOpenOn] = useState<string>(() => urlEnum('openOn', OPENING_DAYS));
  const [bracket, setBracket] = useState<string>(() => urlFilter('bracket', FILTER_ALL));
  const [openCreate, setOpenCreate] = useState(false);
  const canCreate = hasPermission(PERMISSIONS.ORGANIZATIONS.CREATE);
  /** Fiche ouverte dans le panneau lateral, ou `null`. */
  // La fiche ouverte vit dans l'URL : elle survit au rafraichissement, et une
  // fiche peut etre proposee depuis ailleurs — un doublon signale a la
  // creation, par exemple.
  const [params, setParams] = useSearchParams();
  const openedId = params.get(ORGANIZATIONS_UI.PANEL_PARAM);
  // Mise a jour fonctionnelle : sans elle le callback dependrait de `params`,
  // et les colonnes memorisees garderaient une version perimee qui effacerait
  // les autres parametres de l'URL.
  const setOpenedId = useCallback(
    (id: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set(ORGANIZATIONS_UI.PANEL_PARAM, id);
          else next.delete(ORGANIZATIONS_UI.PANEL_PARAM);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const debouncedType = useDebouncedValue(type, FILTER_DEBOUNCE_MS);
  const debouncedSalesStatus = useDebouncedValue(salesStatus, FILTER_DEBOUNCE_MS);
  const debouncedCustomerStatus = useDebouncedValue(customerStatus, FILTER_DEBOUNCE_MS);
  const debouncedPriority = useDebouncedValue(priority, FILTER_DEBOUNCE_MS);
  const debouncedDepartment = useDebouncedValue(department, FILTER_DEBOUNCE_MS);
  const debouncedSolution = useDebouncedValue(solution, FILTER_DEBOUNCE_MS);
  const debouncedTag = useDebouncedValue(tag, FILTER_DEBOUNCE_MS);
  const debouncedIncompleteOnly = useDebouncedValue(incompleteOnly, FILTER_DEBOUNCE_MS);
  const debouncedRegion = useDebouncedValue(region, FILTER_DEBOUNCE_MS);
  const debouncedLeadSource = useDebouncedValue(leadSource, FILTER_DEBOUNCE_MS);
  const debouncedSalesRepId = useDebouncedValue(salesRepId, FILTER_DEBOUNCE_MS);
  const debouncedOpenOn = useDebouncedValue(openOn, FILTER_DEBOUNCE_MS);
  const debouncedBracket = useDebouncedValue(bracket, FILTER_DEBOUNCE_MS);



  const resetFilters = useCallback(() => {
    setType(FILTER_ALL);
    setSalesStatus(FILTER_ALL);
    setCustomerStatus(FILTER_ALL);
    setPriority(FILTER_ALL);
    setDepartment('');
    setSolution(FILTER_ALL);
    setTag(FILTER_ALL);
    setRegion(FILTER_ALL);
    setLeadSource(FILTER_ALL);
    setSalesRepId(FILTER_ALL);
    setOpenOn(FILTER_ALL);
    setBracket(FILTER_ALL);
    setIncompleteOnly(false);
  }, []);

  const typeOptions = useMemo(() => optionsOf('STRUCTURE_TYPE'), [optionsOf]);
  const solutionOptions = useMemo(() => optionsOf('SOLUTION'), [optionsOf]);
  const tagOptions = useMemo(() => optionsOf('TAG'), [optionsOf]);

  /** Les menus se construisent depuis l'API : referentiels et perimetres
   *  appartiennent au projet, jamais a une liste ecrite en dur. */
  const { regions } = useGeoRegions();
  /* `pricing:read` est un droit que les commerciaux ont. Sans grille active,
     `brackets` est vide et le menu ne parait pas — voir useActivePricingGrid. */
  const canReadPricing = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.PRICING.READ),
  );
  const { brackets } = useActivePricingGrid(canReadPricing);

  /*
   * Une strate disparue de la grille active.
   *
   * Les strates sont **versionnees** : un lien envoye en novembre peut porter
   * « 0 – 500 hab. » alors que la grille de janvier a renomme la tranche.
   * L'API repondrait `400` et l'ecran serait vide sans explication. On retire
   * le critere et on le dit.
   */
  useEffect(() => {
    if (bracket === FILTER_ALL || brackets.length === 0) return;
    if (brackets.some((b) => b.label === bracket)) return;
    setBracket(FILTER_ALL);
    toast.info(SEARCH.BRACKET_GONE);
  }, [bracket, brackets]);

  const { users } = useUsers({ page: 1, limit: FILTER_OPTIONS_LIMIT });
  const leadSourceOptions = useMemo(() => optionsOf('LEAD_SOURCE'), [optionsOf]);

  const columns = useMemo(
    () => organizationColumns(labelOf, setOpenedId),
    [labelOf, setOpenedId],
  );

  const getData = useCallback(
    (r: ReturnType<typeof useOrganizations>) => r.organizations,
    [],
  );
  const getMeta = useCallback(
    (r: ReturnType<typeof useOrganizations>) => r.meta,
    [],
  );

  const [total, setTotal] = useState(0);
  /*
   * Le total **sans filtre**, pour pouvoir dire « 12 sur 160 ».
   *
   * Une seule ligne demandee : seul `meta.total` nous interesse. La requete
   * est mise en cache par sa cle, donc payee une fois par session — et sans
   * elle, « 0 » laisserait croire que la base est vide alors que c'est le
   * filtre qui est trop etroit.
   */
  const baseTotal = useOrganizations({ page: 1, limit: 1 }).meta?.total ?? 0;

  /**
   * Les criteres repliables, decrits une fois.
   *
   * Six selecteurs ecrits a la main tenaient trois lignes de barre et se
   * repetaient a l'identique. Les decrire en donnees les rend uniformes, et le
   * panneau comme les pastilles lisent la meme source — un critere ajoute ici
   * apparait aux deux endroits.
   */
  const filterFields = useMemo(
    () => [
      /*
       * Region et strate en tete : ce sont les deux criteres par lesquels un
       * commercial entre dans la base — son secteur, puis la taille de commune
       * qu'il vend. Le reste affine.
       */
      {
        key: 'region',
        label: SEARCH.CHIPS.REGION,
        all: SEARCH.ALL_REGIONS,
        value: region,
        debounced: debouncedRegion,
        set: setRegion,
        /* La liste vient de `GET /geo/regions`, deja consommee par les
           perimetres — jamais d'une liste ecrite en dur. */
        options: regions.map((r) => ({ value: r.name, label: r.name })),
      },
      ...(brackets.length > 0
        ? [
            {
              key: 'bracket',
              label: SEARCH.CHIPS.BRACKET,
              all: SEARCH.ALL_BRACKETS,
              value: bracket,
              debounced: debouncedBracket,
              set: setBracket,
              /* Le libelle **est** la valeur envoyee : le serveur la traduit
                 en intervalle de population. Son tiret demi-cadratin est
                 encode par axios, une URL concatenee a la main ne le ferait
                 pas. */
              options: brackets.map((b) => ({ value: b.label, label: b.label })),
            },
          ]
        : []),
      {
        key: 'type',
        label: SEARCH.CHIPS.TYPE,
        all: SEARCH.ALL_TYPES,
        value: type,
        debounced: debouncedType,
        set: setType,
        options: typeOptions,
      },
      {
        key: 'salesStatus',
        label: SEARCH.CHIPS.SALES_STATUS,
        all: SEARCH.ALL_SALES_STATUSES,
        value: salesStatus,
        debounced: debouncedSalesStatus,
        set: setSalesStatus,
        options: enumOptions(SALES_STATUS_VALUES, SALES_STATUS_LABELS),
      },
      {
        key: 'customerStatus',
        label: SEARCH.CHIPS.CUSTOMER_STATUS,
        all: SEARCH.ALL_CUSTOMER_STATUSES,
        value: customerStatus,
        debounced: debouncedCustomerStatus,
        set: setCustomerStatus,
        options: enumOptions(CUSTOMER_STATUS_VALUES, CUSTOMER_STATUS_LABELS),
      },
      {
        key: 'priority',
        label: SEARCH.CHIPS.PRIORITY,
        all: SEARCH.ALL_PRIORITIES,
        value: priority,
        debounced: debouncedPriority,
        set: setPriority,
        options: enumOptions(PRIORITY_VALUES, PRIORITY_LABELS),
      },
      {
        key: 'solution',
        label: SEARCH.CHIPS.SOLUTION,
        all: SEARCH.ALL_SOLUTIONS,
        value: solution,
        debounced: debouncedSolution,
        set: setSolution,
        options: solutionOptions,
      },
      {
        key: 'tag',
        label: SEARCH.CHIPS.TAG,
        all: SEARCH.ALL_TAGS,
        value: tag,
        debounced: debouncedTag,
        set: setTag,
        options: tagOptions,
      },
      {
        key: 'leadSource',
        label: SEARCH.CHIPS.LEAD_SOURCE,
        all: SEARCH.ALL_LEAD_SOURCES,
        value: leadSource,
        debounced: debouncedLeadSource,
        set: setLeadSource,
        options: leadSourceOptions,
      },
      {
        key: 'salesRepId',
        label: SEARCH.CHIPS.SALES_REP,
        all: SEARCH.ALL_SALES_REPS,
        value: salesRepId,
        debounced: debouncedSalesRepId,
        set: setSalesRepId,
        options: users.map((u) => ({
          value: u.id,
          label: [u.firstName, u.lastName].filter(Boolean).join(' '),
        })),
      },
      {
        key: 'openOn',
        label: SEARCH.CHIPS.OPEN_ON,
        all: SEARCH.ANY_DAY,
        value: openOn,
        debounced: debouncedOpenOn,
        set: setOpenOn,
        options: enumOptions(
          OPENING_DAYS,
          ORGANIZATION_DETAIL_UI.OPENING_HOURS.DAYS as Record<OpeningDay, string>,
        ),
      },
    ],
    [
      type,
      salesStatus,
      customerStatus,
      priority,
      solution,
      tag,
      debouncedType,
      debouncedSalesStatus,
      debouncedCustomerStatus,
      debouncedPriority,
      debouncedSolution,
      debouncedTag,
      debouncedRegion,
      debouncedLeadSource,
      debouncedSalesRepId,
      debouncedOpenOn,
      debouncedBracket,
      typeOptions,
      solutionOptions,
      tagOptions,
      region,
      leadSource,
      salesRepId,
      openOn,
      regions,
      leadSourceOptions,
      users,
      bracket,
      brackets,
    ],
  );

  /*
   * L'etat reecrit l'URL — en `replace`, jamais en `push`.
   *
   * La saisie est deboncee a 500 ms : en `push`, chaque frappe empilerait une
   * entree d'historique et le bouton Retour deviendrait inutilisable.
   *
   * La pagination n'y figure pas a dessein : un lien partage doit ouvrir la
   * **premiere** page de la meme recherche, pas la page 7 de celui qui l'a
   * envoye.
   */
  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        /* Les noms viennent de `filterFields` : ecrits ici en plus, ils
           finiraient par diverger de ceux qu'on relit au chargement. */
        for (const f of filterFields) {
          if (f.debounced !== FILTER_ALL) next.set(f.key, f.debounced);
          else next.delete(f.key);
        }
        const dept = debouncedDepartment.trim();
        if (dept) next.set('department', dept);
        else next.delete('department');
        if (debouncedIncompleteOnly) next.set('incomplete', '1');
        else next.delete('incomplete');
        return next;
      },
      { replace: true },
    );
  }, [setParams, filterFields, debouncedDepartment, debouncedIncompleteOnly]);

  const hasActiveFilters =
    filterFields.some((f) => f.debounced !== FILTER_ALL) ||
    debouncedDepartment.trim() !== '' ||
    debouncedIncompleteOnly;

  /** Ce qui agit vraiment sur la liste, en toutes lettres. */
  const activeChips = useMemo(() => {
    /* `field` porte le menu du critere : le changer depuis sa pastille evite
       de rouvrir « Affiner la recherche » et d'y retrouver la bonne ligne
       parmi onze. `null` pour la bascule « fiches incompletes », qui n'a rien
       a choisir — on ne peut que la retirer. */
    type Chip = {
      key: string;
      text: string;
      field: (typeof filterFields)[number] | null;
      clear: () => void;
    };

    const chips: Chip[] = filterFields
      .filter((f) => f.value !== FILTER_ALL)
      .map((f) => ({
        key: f.key,
        text: `${f.label} : ${f.options.find((o) => o.value === f.value)?.label ?? f.value}`,
        field: f,
        clear: () => f.set(FILTER_ALL),
      }));
    if (incompleteOnly) {
      chips.push({
        key: 'incomplete',
        text: SEARCH.CHIPS.INCOMPLETE,
        field: null,
        clear: () => setIncompleteOnly(false),
      });
    }
    return chips;
  }, [filterFields, incompleteOnly]);

  const headerFilters = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        {/* Departement : saisie libre plutot qu'un selecteur. La V8 construit
            sa liste depuis les fiches affichees ; ici la liste est paginee, et
            les departements de la page courante ne sont pas ceux de la base.
            Il reste visible avec la recherche : c'est le critere que les
            commerciaux posent en premier, leur secteur etant departemental. */}
        <Input
          data-testid="organization-filter-department"
          value={department}
          onChange={(e) => setDepartment(e.target.value.toUpperCase())}
          placeholder={SEARCH.DEPARTMENT_PLACEHOLDER}
          className="w-32"
          maxLength={3}
        />


        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" data-testid="organization-filters-open">
              <SlidersHorizontal />
              {SEARCH.FILTERS}
              {/* Le compte, sinon un critere replie agit sans se voir. */}
              {activeChips.length > 0 ? (
                <Badge size="sm" variant="primary">
                  {activeChips.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          {/* Deux colonnes, et une hauteur bornee.
              Six selecteurs empiles faisaient six cents pixels : sur un
              portable, les deux derniers tombaient sous l'ecran et on
              filtrait sans les voir. En deux colonnes ils tiennent en trois
              rangees ; le `max-h` garde un defilement interne si le
              referentiel s'allonge un jour. */}
          <PopoverContent
            align="start"
            className="max-h-[70vh] w-[34rem] space-y-4 overflow-y-auto"
          >
            <p className="text-sm font-semibold">{SEARCH.FILTERS_TITLE}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filterFields.map((f) => {
              /* Un critere qui agit se voit dans le panneau, pas seulement
                 dans la bande : sans cela, on rouvre « Affiner la recherche »
                 sans savoir lesquels des onze sont deja poses. */
              const actif = f.value !== FILTER_ALL;
              return (
              <div key={f.key} className="space-y-1.5">
                <Label
                  className={
                    actif
                      ? 'text-xs font-medium text-primary'
                      : 'text-xs text-muted-foreground'
                  }
                >
                  {f.label}
                </Label>
                <Select value={f.value} onValueChange={f.set}>
                  <SelectTrigger
                    data-testid={`organization-filter-${f.key}`}
                    data-active={actif ? 'true' : undefined}
                    /* Filet et texte azur, jamais d'aplat : un fond pastel sur
                       une commande la ferait passer pour une pastille. */
                    className={
                      actif
                        ? 'w-full border-primary text-primary'
                        : 'w-full'
                    }
                  >
                    <SelectValue placeholder={f.all} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL}>{f.all}</SelectItem>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              );
            })}
            </div>

            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                data-testid="organization-filter-incomplete"
                checked={incompleteOnly}
                onCheckedChange={setIncompleteOnly}
              />
              {SEARCH.INCOMPLETE_ONLY}
            </Label>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                data-testid="organization-filters-reset"
                onClick={resetFilters}
                className="w-full gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="size-3.5" />
                {SEARCH.RESET}
              </Button>
            ) : null}
          </PopoverContent>
        </Popover>

      </div>

    ),
    [
      department,
      filterFields,
      activeChips,
      incompleteOnly,
      hasActiveFilters,
      resetFilters,
    ],
  );

  /**
   * Les filtres **effectivement envoyés** par la liste, mémorisés au vol.
   *
   * `selectAll` les rejoue côté serveur : les reconstruire ailleurs les ferait
   * diverger tôt ou tard, et l'action porterait alors sur un autre ensemble
   * que celui qu'on regarde — sur une suppression, ce serait grave.
   */

  /**
   * Les criteres actifs, dans leur propre bande sous la barre.
   *
   * Rendue par `subHeader`, **hors de l'en-tete** : melangee aux champs, elle
   * les faisait passer sur deux lignes des le troisieme critere, et le
   * compteur comme « Nouvel organisme » tombaient avec. Ici la premiere ligne
   * ne bouge plus, et la bande **defile horizontalement** au lieu de grandir.
   */
  const activeFiltersBand =
    activeChips.length > 0 ? (
        <div
          data-testid="organization-active-filters"
          /*
           * Accolee a la barre, sans marge : un `mt` laissait une bande
           * blanche entre l'en-tete et la zone, qui la faisait flotter.
           *
           * Teinte azur, et non un gris : `bg-muted` a deux intensites
           * restait indistinct de l'en-tete du tableau, qui utilise le meme
           * jeton. L'azur est deja, dans le composant partage, le signal
           * « un filtre est actif » — le bouton Filtres s'y teinte.
           *
           * Aucune confusion avec la barre de selection groupee, qui partage
           * la famille mais pas la forme : elle est une carte encadree et
           * arrondie, posee en retrait ; cette bande file d'un bord a l'autre.
           */
          className="flex items-center gap-2 border-y border-primary/20 bg-primary/5 px-5 py-2"
        >
          {/* `py-1` laisse passer l'anneau de focus, que le defilement
              rognerait sinon. */}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 pe-2">
          {/*
            * Chaque critere actif : son menu, puis sa croix.
            *
            * Deux commandes reunies dans un meme cadre plutot qu'un bouton
            * unique — imbriquer un bouton dans un bouton n'est pas du HTML
            * valide, et `docs/REGLE-BADGE-VS-BOUTON.md` veut que ce qui se
            * clique ait la forme d'un bouton. Le chevron rouvre la liste des
            * valeurs sans passer par « Affiner la recherche », la croix retire
            * le critere.
            */}
          {activeChips.map((c) => (
            <div
              key={c.key}
              className="flex shrink-0 items-center rounded-lg border border-input bg-background shadow-xs"
            >
              {c.field ? (
                <Select value={c.field.value} onValueChange={c.field.set}>
                  <SelectTrigger
                    data-testid={`organization-chip-${c.key}`}
                    className="h-8 border-0 bg-transparent px-2.5 text-xs shadow-none focus-visible:ring-0"
                  >
                    {c.text}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL}>{c.field.all}</SelectItem>
                    {c.field.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="px-2.5 text-xs">{c.text}</span>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                mode="icon"
                aria-label={SEARCH.REMOVE_FILTER(c.text)}
                data-testid={`organization-chip-clear-${c.key}`}
                onClick={c.clear}
                className="size-7 text-muted-foreground"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
          </div>

          {/*
            * Les actions, dans leur propre zone.
            *
            * Epinglees hors du defilement — sinon elles s'eloigneraient a
            * mesure qu'on ajoute des criteres. Le filet et le fond opaque les
            * separent des pastilles : sans eux, la derniere pastille passait
            * **sous** les boutons et paraissait coupee au hasard plutot que
            * tronquee par un bord.
            */}
          {/* `-my-2 -me-5` annulent les marges de la bande : la zone file
              jusqu'au bord de la carte, au lieu de laisser un liseré azur
              derriere elle. */}
          <div className="-my-2 -me-5 flex shrink-0 items-center gap-1 self-stretch border-s border-border bg-card ps-3 pe-4">
          {/*
            * En icones : deux libelles prenaient plus de place que les
            * criteres qu'ils accompagnent. L'infobulle porte le sens, et la
            * regle du projet admet le bouton-icone — un rond portant une seule
            * icone ne se lit pas comme une etiquette.
            */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                mode="icon"
                aria-label={SEARCH.COPY_LINK}
                data-testid="organization-copy-link"
                onClick={() => {
                  void navigator.clipboard.writeText(window.location.href);
                  toast.success(SEARCH.LINK_COPIED);
                }}
                className="text-muted-foreground"
              >
                <Link2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{SEARCH.COPY_LINK}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                mode="icon"
                aria-label={SEARCH.RESET}
                data-testid="organization-filters-reset"
                onClick={resetFilters}
                className="text-muted-foreground"
              >
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{SEARCH.RESET}</TooltipContent>
          </Tooltip>
          </div>
        </div>
    ) : null;

  const lastParams = useRef<OrganizationListParams | null>(null);
  // Le formateur ne l'a pas : ni cases à cocher, ni barre.
  const canBulk = useMeStore((s) => s.hasPermission(PERMISSIONS.ORGANIZATIONS.BULK));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionKey, setSelectionKey] = useState(0);

  const buildParams = useCallback(
    (pagination: { pageIndex: number; pageSize: number }, search: string) => {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        type: debouncedType === FILTER_ALL ? undefined : debouncedType,
        salesStatus:
          debouncedSalesStatus === FILTER_ALL
            ? undefined
            : (debouncedSalesStatus as SalesStatus),
        customerStatus:
          debouncedCustomerStatus === FILTER_ALL
            ? undefined
            : (debouncedCustomerStatus as CustomerStatus),
        priority:
          debouncedPriority === FILTER_ALL
            ? undefined
            : (debouncedPriority as Priority),
        department: debouncedDepartment.trim() || undefined,
        solution: debouncedSolution === FILTER_ALL ? undefined : debouncedSolution,
        tag: debouncedTag === FILTER_ALL ? undefined : debouncedTag,
        // 99 et non 100 : le contrat est inclusif, 100 ramenerait toute la base.
        completenessMax: debouncedIncompleteOnly ? 99 : undefined,
        /* `region` et `department` se cumulent en ET : demander la Normandie
           et le 89 ne ramene rien — verifie en direct, ce n'est pas un
           defaut. La barre les montre donc tous les deux. */
        region: debouncedRegion === FILTER_ALL ? undefined : debouncedRegion,
        leadSource:
          debouncedLeadSource === FILTER_ALL ? undefined : debouncedLeadSource,
        salesRepId:
          debouncedSalesRepId === FILTER_ALL ? undefined : debouncedSalesRepId,
        openOn:
          debouncedOpenOn === FILTER_ALL
            ? undefined
            : (debouncedOpenOn as OpeningDay),
        bracket: debouncedBracket === FILTER_ALL ? undefined : debouncedBracket,
      } satisfies OrganizationListParams;
      lastParams.current = params;
      return params;
    },
    [
      debouncedType,
      debouncedSalesStatus,
      debouncedCustomerStatus,
      debouncedPriority,
      debouncedDepartment,
      debouncedSolution,
      debouncedTag,
      debouncedIncompleteOnly,
      debouncedRegion,
      debouncedLeadSource,
      debouncedSalesRepId,
      debouncedOpenOn,
      debouncedBracket,
    ],
  );

  return (
    <>
      <CreateOrganizationWindow
        open={openCreate}
        onOpenChange={setOpenCreate}
        // On enchaine sur la fiche creee : c'est la ou l'utilisateur va
        // completer ce que la creation ne demande pas.
        onCreated={(id) => setOpenedId(id)}
      />
      <OrganizationPanel
        organizationId={openedId}
        onOpenChange={(next) => !next && setOpenedId(null)}
      />
      <ReusableTable<
      OrganizationListItem,
      OrganizationListParams,
      ReturnType<typeof useOrganizations>
    >
      columns={columns}
       
      useData={useOrganizations}
      getData={getData}
      getMeta={getMeta}
      buildParams={buildParams}
      /* `key` : vider la sélection après une action groupée demande de
         remonter la table, qui garde son état de cases cochées. */
      key={selectionKey}
      enableRowSelection={canBulk}
      onSelectedIdsChange={setSelectedIds}
      onDataChange={(result) => setTotal(result.meta?.total ?? 0)}
      subHeader={
        <>
          {activeFiltersBand}
          {canBulk && selectedIds.length > 0 ? (
          <OrganizationsBulkBar
            ids={selectedIds}
            total={total}
            /* Les filtres tels que la liste les a envoyés — jamais une copie
               reconstruite, qui divergerait. */
            filters={stripPagination(lastParams.current)}
            onClear={() => setSelectionKey((k) => k + 1)}
            onDone={(done) => {
              setSelectionKey((k) => k + 1);
              /*
               * La fiche ouverte vit dans l'URL : une suppression groupee qui
               * l'emporte laisserait le panneau ouvert sur une fiche disparue,
               * que le rechargement ferait echouer en 404. En `selectAll` on
               * ne sait pas ce qui a ete pris — la fermer est le seul choix
               * sur.
               */
              if (
                done.action === 'DELETE' &&
                openedId &&
                (done.allMatching || done.ids.includes(openedId))
              ) {
                setOpenedId(null);
              }
            }}
          />
          ) : null}
        </>
      }
      enableSearch
      searchPlaceholder={SEARCH.PLACEHOLDER}
      searchToolTipText={SEARCH.TOOLTIP}
      headerFilters={headerFilters}
      hasActiveFilters={hasActiveFilters}
      defaultPageSize={10}
      toolbarActions={
        <>
          {/* A droite, contre les actions : sa largeur change avec le filtrage
              — « 34 969 organismes » puis « 545 sur 34 969 » — et poussait le
              bouton Filtres de 40 px des le premier critere. Ici il n'a plus
              de voisin a deplacer. */}
          {baseTotal > 0 ? (
            <Badge
              variant="secondary"
              appearance="outline"
              data-testid="organization-count"
              className="tabular-nums"
            >
              {total === baseTotal
                ? SEARCH.COUNT(total)
                : SEARCH.COUNT_FILTERED(total, baseTotal)}
            </Badge>
          ) : null}

          {canCreate ? (
            <Button
              data-testid="organization-create-btn"
              onClick={() => setOpenCreate(true)}
            >
              <CirclePlus />
              {CREATE_ORGANIZATION_UI.TITLE}
            </Button>
          ) : null}
        </>
      }
      emptyTableMessage={
        <EmptyTableComponent
          hasPermission={canCreate}
          illustration={EMPTY_STATE.ILLUSTRATION}
          title={EMPTY_STATE.TITLE}
          description={[...EMPTY_STATE.DESCRIPTION]}
          tip={{
            title: EMPTY_STATE.TIP.TITLE,
            content: EMPTY_STATE.TIP.CONTENT,
          }}
          onClick={() => setOpenCreate(true)}
          buttonIcon={<CirclePlus />}
          buttonText={CREATE_ORGANIZATION_UI.TITLE}
          buttonId="organization-create-btn"
          />
        }
      />
    </>
  );
}
