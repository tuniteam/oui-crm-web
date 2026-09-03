import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarClock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { useContacts } from '@/features/organization/hooks/useContacts';
import { ACTIVITY_WINDOW, TIME_SLOTS } from '../constants/activity.constants';
import {
  activityToValues,
  emptyActivityValues,
  getActivitySchema,
  type ActivitySchemaType,
} from '../forms/activity-schema';
import { useActivityMutations } from '../hooks/useActivityMutations';
import { useActivityReference } from '../hooks/useActivityReference';
import type { Activity } from '../types/activity';

const UI = ACTIVITY_WINDOW;
const { FIELDS } = UI;

/** Valeur du `Select` pour « aucun interlocuteur » : `''` y est interdit. */
const NO_CONTACT = '__none__';
/** L'heure est facultative : `''` etant interdit comme valeur d'option. */
const NO_TIME = '__none__';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  /** `null` pour une planification. */
  activity: Activity | null;
};

type Hooks = {
  form: ReturnType<typeof useForm<ActivitySchemaType>>;
  mutations: ReturnType<typeof useActivityMutations>;
};

/** Hook nommé : les règles des hooks s'y appliquent normalement. */
function useActivityWindow(): Hooks {
  return {
    form: useForm<ActivitySchemaType>({
      resolver: zodResolver(getActivitySchema()),
      defaultValues: emptyActivityValues(),
      mode: 'onSubmit',
    }),
    mutations: useActivityMutations(),
  };
}

function Body({
  hooks,
  activity,
  organizationId,
}: {
  hooks: Hooks;
  activity: Activity | null;
  organizationId: string;
}) {
  const { form, mutations } = hooks;
  const disabled = mutations.saving;
  const { types, loading: typesLoading } = useActivityReference();
  const { contacts } = useContacts(organizationId);

  const selectedType = form.watch('type');
  const typeMeta = types.find((t) => t.key === selectedType);

  /*
   * Les valeurs sont posees **pendant le rendu**, pas dans un effet.
   *
   * Un effet s'execute apres le premier rendu : le `Select` du type serait
   * alors monte avec une valeur vide, et Radix, voyant ensuite une valeur sans
   * option correspondante, emet `onValueChange('')` — le type d'une action en
   * modification etait efface avant meme l'affichage, et le formulaire
   * s'ouvrait en « Champ requis ». Le garde-fou empeche la boucle.
   */
  const applied = useRef<string | null>(null);
  const wanted = activity?.id ?? 'new';
  if (applied.current !== wanted) {
    applied.current = wanted;
    form.reset(activity ? activityToValues(activity) : emptyActivityValues());
  }

  /*
   * Rien ne se rend tant que le referentiel n'est pas la.
   *
   * Radix emet `onValueChange('')` quand la valeur controlee ne correspond a
   * aucune option — et au premier rendu la liste des types est vide. Le type
   * d'une action en modification etait donc efface avant meme l'affichage, et
   * le formulaire s'ouvrait en « Champ requis ».
   */
  if (typesLoading) {
    return (
      <div className="space-y-3" data-testid="activity-form-loading">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                  {FIELDS.TYPE}
                </FormLabel>
                {/* Les types viennent du référentiel du projet : la maquette
                    les code en dur, ce qui casserait dès qu'un projet
                    personnalise ses libellés. */}
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    // Durée suggérée par le référentiel, si le champ est vide.
                    const meta = types.find((t) => t.key === v);
                    if (!form.getValues('durationMin') && meta?.defaultDurationMin) {
                      form.setValue('durationMin', String(meta.defaultDurationMin));
                    }
                  }}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger data-testid="activity-type">
                      {/* Le libelle vient de nos donnees, pas de Radix, qui ne
                          le resout qu'une fois la liste ouverte au moins une
                          fois — le type d'une action en modification
                          resterait sinon invisible a l'ouverture. */}
                      <SelectValue placeholder={FIELDS.TYPE_PLACEHOLDER}>
                        {typeMeta?.label}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                  {FIELDS.DATE}
                </FormLabel>
                <FormControl>
                  {/* `type="date"` rend exactement `YYYY-MM-DD`. */}
                  <Input
                    type="date"
                    {...field}
                    data-testid="activity-date"
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FIELDS.TIME}</FormLabel>
                {/* Un déroulant de créneaux, pas un `input type="time"` : le
                    sélecteur natif affiche les soixante minutes quoi qu'on
                    mette dans `step`. L'heure reste la chaîne `HH:MM` que le
                    serveur attend, transportée telle quelle. */}
                <Select
                  value={field.value || NO_TIME}
                  onValueChange={(v) => field.onChange(v === NO_TIME ? '' : v)}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger data-testid="activity-time">
                      <SelectValue>
                        {field.value || FIELDS.TIME_NONE}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_TIME}>{FIELDS.TIME_NONE}</SelectItem>
                    {/* Une action venue d'ailleurs peut porter une heure hors
                        créneau : on l'ajoute plutôt que de l'effacer en
                        silence à l'ouverture. */}
                    {(TIME_SLOTS.includes(field.value)
                      ? TIME_SLOTS
                      : [field.value, ...TIME_SLOTS].filter(Boolean)
                    ).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FIELDS.DURATION}</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    {...field}
                    data-testid="activity-duration"
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FIELDS.LOCATION}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid="activity-location"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {contacts.length > 0 ? (
          <FormField
            control={form.control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FIELDS.CONTACT}</FormLabel>
                <Select
                  value={field.value || NO_CONTACT}
                  onValueChange={(v) =>
                    field.onChange(v === NO_CONTACT ? '' : v)
                  }
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger data-testid="activity-contact">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_CONTACT}>
                      {FIELDS.CONTACT_NONE}
                    </SelectItem>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {[c.firstName, c.lastName].filter(Boolean).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="report"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FIELDS.REPORT}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder={FIELDS.REPORT_PLACEHOLDER}
                  data-testid="activity-report"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* La maquette met ici un sélecteur « Réalisée / Planifiée » et le
            compte rendu. Le contrat ne le permet pas : on le dit, plutôt que
            de laisser chercher où marquer l'action réalisée. */}
        <p
          data-testid="activity-planned-hint"
          className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0" />
          {UI.HINTS.PLANNED}
        </p>

        {/* Automatisme du contrat : sans cette phrase, la bascule de statut
            commercial est invisible jusqu'à ce qu'elle se produise. */}
        {typeMeta?.ics ? (
          <p
            data-testid="activity-meeting-hint"
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <CalendarClock className="mt-0.5 size-4 shrink-0" />
            {UI.HINTS.MEETING}
          </p>
        ) : null}
      </form>
    </Form>
  );
}

/** Planifier ou re-planifier une action — L1 · US-01-08. */
export function ActivityWindow({
  open,
  onOpenChange,
  organizationId,
  activity,
}: Props) {
  return (
    <ReusableWindow<Hooks>
      open={open}
      onOpenChange={onOpenChange}
      title={activity ? UI.EDIT_TITLE : UI.CREATE_TITLE}
      useHooks={useActivityWindow}
      preventClose
      renderBody={(hooks) => (
        <Body
          hooks={hooks}
          activity={activity}
          organizationId={organizationId}
        />
      )}
      renderFooter={(hooks) => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="activity-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            data-testid="activity-submit"
            disabled={hooks.mutations.saving}
            onClick={() =>
              void hooks.form.handleSubmit(async (values) => {
                const duration = values.durationMin
                  ? Number(values.durationMin)
                  : null;

                /*
                 * Modification : les champs vides partent en `null` pour être
                 * effacés. Création : ils sont absents, le serveur applique
                 * ses défauts.
                 */
                const outcome = activity
                  ? await hooks.mutations.update(activity.id, {
                      type: values.type,
                      date: values.date,
                      time: values.time || null,
                      durationMin: duration,
                      location: values.location.trim() || null,
                      contactId: values.contactId || null,
                      report: values.report.trim() || null,
                    })
                  : await hooks.mutations.create({
                      organizationId,
                      type: values.type,
                      date: values.date,
                      ...(values.time ? { time: values.time } : {}),
                      ...(duration ? { durationMin: duration } : {}),
                      ...(values.location.trim()
                        ? { location: values.location.trim() }
                        : {}),
                      ...(values.contactId
                        ? { contactId: values.contactId }
                        : {}),
                      ...(values.report.trim()
                        ? { report: values.report.trim() }
                        : {}),
                    });

                // Une action close est de l'histoire : la fenêtre se ferme et
                // la frise, rechargée, montre l'état réel.
                if (outcome.status !== 'error') onOpenChange(false);
              })()
            }
          >
            {activity ? UI.ACTIONS.SAVE : UI.ACTIONS.CREATE}
          </Button>
        </>
      )}
    />
  );
}
