import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { ACTIVITY_COMPLETE_WINDOW } from '../constants/activity.constants';
import {
  getCompleteSchema,
  type CompleteSchemaType,
} from '../forms/activity-schema';
import { useActivityMutations } from '../hooks/useActivityMutations';
import { useActivityReference } from '../hooks/useActivityReference';
import type { Activity } from '../types/activity';

const UI = ACTIVITY_COMPLETE_WINDOW;
const { FIELDS } = UI;

/** `''` est interdit comme valeur de `SelectItem`. */
const NO_RESULT = '__none__';

type Props = {
  activity: Activity | null;
  onOpenChange: (open: boolean) => void;
};

type Hooks = {
  form: ReturnType<typeof useForm<CompleteSchemaType>>;
  mutations: ReturnType<typeof useActivityMutations>;
};

function useCompleteWindow(): Hooks {
  return {
    form: useForm<CompleteSchemaType>({
      resolver: zodResolver(getCompleteSchema()),
      defaultValues: { report: '', result: '' },
      mode: 'onSubmit',
    }),
    mutations: useActivityMutations(),
  };
}

function Body({ hooks, activity }: { hooks: Hooks; activity: Activity | null }) {
  const { form, mutations } = hooks;
  const { results } = useActivityReference();
  const disabled = mutations.saving;

  useEffect(() => {
    // Les notes prises à la planification amorcent le compte rendu plutôt que
    // d'être perdues — l'utilisateur les complète.
    form.reset({ report: activity?.report ?? '', result: '' });
  }, [activity, form]);

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="report"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                {FIELDS.REPORT}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={5}
                  placeholder={FIELDS.REPORT_PLACEHOLDER}
                  data-testid="activity-complete-report"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FIELDS.RESULT}</FormLabel>
              <Select
                value={field.value || NO_RESULT}
                onValueChange={(v) => field.onChange(v === NO_RESULT ? '' : v)}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger data-testid="activity-complete-result">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_RESULT}>{FIELDS.RESULT_NONE}</SelectItem>
                  {results.map((r) => (
                    <SelectItem key={r.key} value={r.key}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deux phrases, deux raisons. La première dit pourquoi le compte rendu
            est obligatoire ; la seconde annonce une bascule de statut que rien
            ne rendrait visible depuis cet écran. */}
        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            {UI.HINT}
            <br />
            {UI.SIDE_EFFECT}
          </span>
        </p>
      </form>
    </Form>
  );
}

/**
 * Marquer une action réalisée — L1 · US-01-08.
 *
 * Un geste distinct de la planification, parce que le contrat en fait un :
 * le compte rendu y est obligatoire, et c'est lui qui rend l'action réelle.
 */
export function ActivityCompleteWindow({ activity, onOpenChange }: Props) {
  return (
    <ReusableWindow<Hooks>
      open={!!activity}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={useCompleteWindow}
      preventClose
      className="max-w-xl"
      renderBody={(hooks) => <Body hooks={hooks} activity={activity} />}
      renderFooter={(hooks) => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="activity-complete-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            data-testid="activity-complete-submit"
            disabled={hooks.mutations.saving}
            onClick={() =>
              void hooks.form.handleSubmit(async (values) => {
                if (!activity) return;
                const outcome = await hooks.mutations.complete(activity.id, {
                  report: values.report.trim(),
                  ...(values.result ? { result: values.result } : {}),
                });
                if (outcome.status !== 'error') onOpenChange(false);
              })()
            }
          >
            {UI.ACTIONS.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
