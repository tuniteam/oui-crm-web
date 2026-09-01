import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CirclePlus, LoaderCircleIcon, Pencil, Save, X } from 'lucide-react';
import { z } from 'zod';
import { COMMON } from '@/constants';
import { cn } from '@/lib/utils';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  REFERENCE_CATEGORY_LABELS,
  REFERENCE_CATEGORY_ORDER,
  REFERENCES_UI as UI,
} from '../../constants/reference-items.constants';
import {
  useCreateReferenceItem,
  useReferenceItems,
  useUpdateReferenceItem,
} from '../../hooks/useReferenceItems';
import type {
  ReferenceCategory,
  ReferenceItem,
} from '../../types/reference-items';

const KEY_PATTERN = /^[A-Z0-9_]+$/;

const createSchema = z.object({
  key: z
    .string()
    .min(1, UI.ZOD.REQUIRED)
    .max(60, UI.ZOD.KEY_MAX)
    .regex(KEY_PATTERN, UI.ZOD.KEY_FORMAT),
  label: z.string().min(1, UI.ZOD.REQUIRED).max(150, UI.ZOD.LABEL_MAX),
  order: z.number().int(UI.ZOD.ORDER_POSITIVE).min(0, UI.ZOD.ORDER_POSITIVE).optional(),
});

const editSchema = z.object({
  label: z.string().min(1, UI.ZOD.REQUIRED).max(150, UI.ZOD.LABEL_MAX),
  order: z.number().int(UI.ZOD.ORDER_POSITIVE).min(0, UI.ZOD.ORDER_POSITIVE),
  active: z.boolean(),
});

type CreateSchema = z.infer<typeof createSchema>;
type EditSchema = z.infer<typeof editSchema>;

function NumberField({
  field,
  placeholder,
}: {
  field: { value?: number; onChange: (v: number | undefined) => void };
  placeholder?: string;
}) {
  return (
    <Input
      type="number"
      step="1"
      placeholder={placeholder}
      value={field.value ?? ''}
      onChange={(e) =>
        field.onChange(
          e.target.value === '' ? undefined : e.target.valueAsNumber,
        )
      }
    />
  );
}

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
    defaultValues: { key: '', label: '', order: undefined },
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
                      // La clé est immuable : on la normalise à la saisie
                      // plutôt que de refuser après coup.
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      className="font-mono"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {UI.HINTS.KEY}
                  </p>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.FIELDS.ORDER}</FormLabel>
                  <FormControl>
                    <NumberField field={field} />
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
              const values = form.getValues();
              const created = await create({ category, ...values });
              if (created) onOpenChange(false);
            }}
          >
            {loading ? (
              <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
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

function EditWindow({
  item,
  open,
  onOpenChange,
}: {
  item: ReferenceItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { update, loading } = useUpdateReferenceItem();

  const form = useForm<EditSchema>({
    resolver: zodResolver(editSchema),
    values: item
      ? { label: item.label, order: item.order, active: item.active }
      : { label: '', order: 0, active: true },
    mode: 'onSubmit',
  });

  return (
    <ReusableWindow<null>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.EDIT_WINDOW.TITLE}
      description={UI.EDIT_WINDOW.DESCRIPTION}
      useHooks={() => null}
      preventClose
      renderBody={() => (
        <Form {...form}>
          <form className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">{UI.FIELDS.CATEGORY}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item ? REFERENCE_CATEGORY_LABELS[item.category] : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{UI.FIELDS.KEY}</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {item?.key}
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.FIELDS.LABEL} *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.FIELDS.ORDER}</FormLabel>
                  <FormControl>
                    <NumberField field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer font-normal">
                      {UI.FIELDS.ACTIVE}
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {UI.INACTIVE_HINT}
                    </p>
                  </div>
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
              if (!item) return;
              const ok = await form.trigger();
              if (!ok) return;
              const values = form.getValues();
              // On n'envoie que ce qui change : un corps vide est refusé.
              const payload = Object.fromEntries(
                Object.entries(values).filter(
                  ([k, v]) => v !== item[k as keyof ReferenceItem],
                ),
              );
              if (!Object.keys(payload).length) {
                onOpenChange(false);
                return;
              }
              const saved = await update(item.id, payload);
              if (saved) onOpenChange(false);
            }}
          >
            {loading ? (
              <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {COMMON.ACTIONS.SAVE}
          </Button>
        </div>
      )}
    />
  );
}

export function ReferenceItemsPane({ canUpdate }: { canUpdate: boolean }) {
  const { items, loading } = useReferenceItems();
  const [creating, setCreating] = useState<ReferenceCategory | null>(null);
  const [editing, setEditing] = useState<ReferenceItem | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<ReferenceCategory, ReferenceItem[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [items]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-48" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-24 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">{UI.TITLE}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {UI.DESCRIPTION}
          </p>
        </CardContent>
      </Card>

      {REFERENCE_CATEGORY_ORDER.map((category) => {
        const list = byCategory.get(category) ?? [];
        return (
          <Card key={category}>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-base font-semibold">
                  {REFERENCE_CATEGORY_LABELS[category]}
                </h3>
                <Badge variant="secondary" appearance="outline" size="sm">
                  {list.length}
                </Badge>
                {canUpdate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ms-auto"
                    data-testid={`reference-add-${category}`}
                    onClick={() => setCreating(category)}
                  >
                    <CirclePlus className="h-4 w-4" aria-hidden="true" />
                    {UI.ACTIONS.ADD}
                  </Button>
                )}
              </div>

              {list.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {UI.EMPTY_CATEGORY}
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {list.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!canUpdate}
                      onClick={() => setEditing(item)}
                      title={`${item.key} — ${UI.USAGE(item.usageCount)}`}
                      className={cn(
                        'group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
                        item.active
                          ? 'border-border bg-muted/40'
                          : // Inactive : reste affichee, mais visuellement en retrait.
                            'border-dashed border-border text-muted-foreground opacity-70',
                        canUpdate && 'hover:border-primary hover:text-foreground',
                      )}
                    >
                      {item.label}
                      {!item.active && (
                        <span className="text-[10px] uppercase tracking-wide">
                          {UI.INACTIVE}
                        </span>
                      )}
                      {canUpdate && (
                        <Pencil
                          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <CreateWindow
        category={creating}
        open={creating !== null}
        onOpenChange={(v) => !v && setCreating(null)}
      />
      <EditWindow
        item={editing}
        open={editing !== null}
        onOpenChange={(v) => !v && setEditing(null)}
      />
    </div>
  );
}
