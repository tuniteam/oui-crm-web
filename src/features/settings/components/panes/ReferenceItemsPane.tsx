import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CirclePlus,
  GripVertical,
  LoaderCircleIcon,
  Save,
  Search,
  X,
} from 'lucide-react';
import { z } from 'zod';
import { COMMON } from '@/constants';
import { cn } from '@/lib/utils';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sortable, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { Switch } from '@/components/ui/switch';
import {
  REFERENCE_CATEGORY_LABELS,
  REFERENCE_CATEGORY_ORDER,
  REFERENCES_UI as UI,
} from '../../constants/reference-items.constants';
import {
  useCreateReferenceItem,
  useReferenceItems,
  useReorderReferenceItems,
  useUpdateReferenceItem,
} from '../../hooks/useReferenceItems';
import type {
  ReferenceCategory,
  ReferenceItem,
} from '../../types/reference-items';

const KEY_PATTERN = /^[A-Z0-9_]+$/;
const LABEL_MAX = 150;

const createSchema = z.object({
  key: z
    .string()
    .min(1, UI.ZOD.REQUIRED)
    .max(60, UI.ZOD.KEY_MAX)
    .regex(KEY_PATTERN, UI.ZOD.KEY_FORMAT),
  label: z.string().min(1, UI.ZOD.REQUIRED).max(LABEL_MAX, UI.ZOD.LABEL_MAX),
});

type CreateSchema = z.infer<typeof createSchema>;

/**
 * Ajout d'une valeur.
 *
 * Seule action qui ouvre encore une fenetre : la cle est immuable, elle
 * merite une saisie deliberee. Le reste — libelle, activation, ordre — se
 * regle directement dans la liste.
 */
function CreateWindow({
  category,
  open,
  onOpenChange,
}: {
  category: ReferenceCategory | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { create, loading } = useCreateReferenceItem();

  const form = useForm<CreateSchema>({
    resolver: zodResolver(createSchema),
    defaultValues: { key: '', label: '' },
    mode: 'onSubmit',
  });

  return (
    <ReusableWindow<null>
      open={open}
      onOpenChange={onOpenChange}
      title={`${UI.CREATE_WINDOW.TITLE} — ${category ? REFERENCE_CATEGORY_LABELS[category] : ''}`}
      description={UI.CREATE_WINDOW.DESCRIPTION}
      useHooks={() => null}
      preventClose
      onClosed={() => form.reset()}
      renderBody={() => (
        <Form {...form}>
          <form className="space-y-5">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.FIELDS.KEY} *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={UI.PLACEHOLDERS.KEY}
                      // La cle est immuable : on la normalise a la saisie
                      // plutot que de refuser apres coup.
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      className="font-mono"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{UI.HINTS.KEY}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.FIELDS.LABEL} *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={UI.PLACEHOLDERS.LABEL} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {UI.HINTS.ORDER}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
      renderFooter={() => (
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X aria-hidden="true" />
            {COMMON.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={async () => {
              if (!category) return;
              const ok = await form.trigger();
              if (!ok) return;
              const created = await create({ category, ...form.getValues() });
              if (created) onOpenChange(false);
            }}
          >
            {loading ? (
              <LoaderCircleIcon
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {COMMON.ACTIONS.CREATE}
          </Button>
        </div>
      )}
    />
  );
}

/**
 * Libelle modifiable sur place : un clic, on tape, Entree valide, Echap
 * annule. Renommer une valeur est l'operation la plus frequente ; elle ne
 * justifie pas d'ouvrir une fenetre.
 */
function EditableLabel({
  item,
  canUpdate,
  onSave,
}: {
  item: ReferenceItem;
  canUpdate: boolean;
  onSave: (label: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  // Evite un second enregistrement quand Entree fait aussi perdre le focus.
  const settled = useRef(false);

  if (!canUpdate) {
    return <span className="truncate text-sm">{item.label}</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        title={UI.RENAME}
        onClick={() => setEditing(true)}
        className="truncate rounded px-1 py-0.5 text-start text-sm hover:bg-accent"
      >
        {item.label}
      </button>
    );
  }

  const commit = (value: string) => {
    if (settled.current) return;
    settled.current = true;
    setEditing(false);
    const label = value.trim();
    if (label && label !== item.label && label.length <= LABEL_MAX) {
      onSave(label);
    }
  };

  return (
    <Input
      autoFocus
      defaultValue={item.label}
      maxLength={LABEL_MAX}
      className="h-8"
      onFocus={() => {
        settled.current = false;
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit(e.currentTarget.value);
        if (e.key === 'Escape') {
          settled.current = true;
          setEditing(false);
        }
      }}
    />
  );
}

function ValueRow({
  item,
  rank,
  canUpdate,
  reorderable,
  onUpdate,
}: {
  item: ReferenceItem;
  rank: number;
  canUpdate: boolean;
  reorderable: boolean;
  onUpdate: (id: string, patch: { label?: string; active?: boolean }) => void;
}) {
  return (
    <SortableItem
      value={item.id}
      disabled={!reorderable}
      className={cn(
        'flex items-center gap-3 bg-background px-3 py-2',
        !item.active && 'bg-muted/30',
      )}
    >
      {reorderable ? (
        <SortableItemHandle
          className="text-muted-foreground/60 hover:text-foreground"
          aria-label={UI.DRAG_HANDLE}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </SortableItemHandle>
      ) : (
        <span className="w-4" aria-hidden="true" />
      )}

      <span
        className="w-6 shrink-0 text-end font-mono text-xs text-muted-foreground"
        title={UI.RANK(rank)}
      >
        {rank}
      </span>

      <span className={cn('min-w-0 flex-1', !item.active && 'opacity-60')}>
        <EditableLabel
          item={item}
          canUpdate={canUpdate}
          onSave={(label) => onUpdate(item.id, { label })}
        />
      </span>

      <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
        {item.key}
      </span>

      {item.usageCount > 0 && (
        <Badge variant="secondary" appearance="outline" size="sm">
          {UI.USAGE(item.usageCount)}
        </Badge>
      )}

      <Switch
        size="sm"
        checked={item.active}
        disabled={!canUpdate}
        aria-label={UI.FIELDS.ACTIVE}
        title={item.active ? UI.FIELDS.ACTIVE : UI.INACTIVE}
        data-testid={`reference-active-${item.key}`}
        onCheckedChange={(active) => onUpdate(item.id, { active })}
      />
    </SortableItem>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function ReferenceItemsPane({ canUpdate }: { canUpdate: boolean }) {
  const { items, loading } = useReferenceItems();
  const { update } = useUpdateReferenceItem();
  const { reorder } = useReorderReferenceItems();

  const [category, setCategory] = useState<ReferenceCategory>(
    REFERENCE_CATEGORY_ORDER[0],
  );
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  /** Nombre de valeurs par categorie : affiche dans le selecteur, pour
   *  savoir ou il y a quelque chose avant d'ouvrir. */
  const counts = useMemo(() => {
    const map = new Map<ReferenceCategory, number>();
    for (const item of items) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const list = useMemo(
    () =>
      items
        .filter((item) => item.category === category)
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
    [items, category],
  );

  const needle = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      needle
        ? list.filter(
            (item) =>
              item.label.toLowerCase().includes(needle) ||
              item.key.toLowerCase().includes(needle),
          )
        : list,
    [list, needle],
  );

  // Reordonner une liste filtree deplacerait la valeur par rapport a des
  // voisins qu'on ne voit pas : on desactive le geste plutot que de risquer
  // un ordre subi.
  const reorderable = canUpdate && !needle;
  const inactive = list.filter((item) => !item.active).length;

  const handleUpdate = (
    id: string,
    patch: { label?: string; active?: boolean },
  ) => {
    void update(id, patch);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">{UI.TITLE}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{UI.DESCRIPTION}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v as ReferenceCategory);
                setSearch('');
              }}
            >
              <SelectTrigger
                className="w-full sm:w-72"
                data-testid="reference-category"
                aria-label={UI.CATEGORY_LABEL}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFERENCE_CATEGORY_ORDER.map((key) => (
                  <SelectItem key={key} value={key}>
                    {REFERENCE_CATEGORY_LABELS[key]} ({counts.get(key) ?? 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative min-w-40 flex-1">
              <Search
                className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={UI.SEARCH_PLACEHOLDER}
                data-testid="reference-search"
                className="ps-8"
              />
            </div>

            {canUpdate && (
              <Button
                variant="outline"
                data-testid="reference-add"
                onClick={() => setCreating(true)}
              >
                <CirclePlus className="h-4 w-4" aria-hidden="true" />
                {UI.ACTIONS.ADD}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {UI.COUNTS(list.length, inactive)}
            {canUpdate && (
              <> — {reorderable ? UI.REORDER_HINT : UI.REORDER_LOCKED}</>
            )}
          </p>

          {loading ? (
            <ListSkeleton />
          ) : visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {needle ? UI.EMPTY_SEARCH : UI.EMPTY_CATEGORY}
            </p>
          ) : (
            <Sortable
              value={visible}
              onValueChange={reorder}
              getItemValue={(item) => item.id}
              className="divide-y overflow-hidden rounded-lg border"
            >
              {visible.map((item, index) => (
                <ValueRow
                  key={item.id}
                  item={item}
                  // Le rang affiche est celui de la categorie, pas celui du
                  // resultat filtre : c'est lui qui pilote les listes.
                  rank={needle ? item.order : index + 1}
                  canUpdate={canUpdate}
                  reorderable={reorderable}
                  onUpdate={handleUpdate}
                />
              ))}
            </Sortable>
          )}
        </CardContent>
      </Card>

      <CreateWindow
        category={creating ? category : null}
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  );
}
