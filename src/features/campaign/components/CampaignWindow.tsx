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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import {
  CAMPAIGN_WINDOW,
  CAMPAIGNS_UI,
} from '../constants/campaign.constants';
import {
  emptyCampaignValues,
  getCampaignSchema,
  toCampaignFormValues,
  type CampaignSchemaType,
} from '../forms/campaign-schema';
import { useCampaignMutations } from '../hooks/useCampaignMutations';
import type { Campaign } from '../types/campaign';

const UI = CAMPAIGN_WINDOW;
const { FIELDS } = UI;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` pour une création. */
  campaign: Campaign | null;
};

type Hooks = {
  form: ReturnType<typeof useForm<CampaignSchemaType>>;
  mutations: ReturnType<typeof useCampaignMutations>;
};

/** Hook nommé : les règles des hooks s'y appliquent normalement. */
function useCampaignWindow(): Hooks {
  return {
    form: useForm<CampaignSchemaType>({
      resolver: zodResolver(getCampaignSchema()),
      defaultValues: emptyCampaignValues(),
      mode: 'onSubmit',
    }),
    mutations: useCampaignMutations(),
  };
}

function Body({ hooks, campaign }: { hooks: Hooks; campaign: Campaign | null }) {
  const { form, mutations } = hooks;
  const disabled = mutations.saving;

  useEffect(() => {
    form.reset(campaign ? toCampaignFormValues(campaign) : emptyCampaignValues());
  }, [campaign, form]);

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                {FIELDS.NAME}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid="campaign-name"
                  placeholder={FIELDS.NAME_PLACEHOLDER}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FIELDS.START}</FormLabel>
                <FormControl>
                  {/* `type="date"` rend exactement `YYYY-MM-DD`, la forme que
                      le serveur attend. */}
                  <Input
                    type="date"
                    {...field}
                    data-testid="campaign-start"
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FIELDS.END}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="campaign-end"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FIELDS.DESCRIPTION}</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  {...field}
                  data-testid="campaign-description"
                  placeholder={FIELDS.DESCRIPTION_PLACEHOLDER}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* La maquette met six filtres de ciblage ici, ce qui promettrait une
            cible qui se recalcule. Elle ne se recalcule pas : on le dit. */}
        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          {UI.HINTS.TARGET}
        </p>
      </form>
    </Form>
  );
}

/** Création et modification d'une campagne — L1 · US-01-11. */
export function CampaignWindow({ open, onOpenChange, campaign }: Props) {
  return (
    <ReusableWindow<Hooks>
      open={open}
      onOpenChange={onOpenChange}
      title={campaign ? UI.EDIT_TITLE : UI.CREATE_TITLE}
      useHooks={useCampaignWindow}
      preventClose
      renderBody={(hooks) => <Body hooks={hooks} campaign={campaign} />}
      renderFooter={(hooks) => (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            data-testid="campaign-submit"
            disabled={hooks.mutations.saving}
            onClick={() =>
              void hooks.form.handleSubmit(async (values) => {
                /*
                 * Création : un champ vide n'est pas transmis, le serveur
                 * applique son défaut. Modification : il part en `null` pour
                 * être effacé. Le nom ne s'efface jamais.
                 */
                const outcome = campaign
                  ? await hooks.mutations.update(campaign.id, {
                      name: values.name.trim(),
                      description: values.description.trim() || null,
                      startDate: values.startDate || null,
                      endDate: values.endDate || null,
                    })
                  : await hooks.mutations.create({
                      name: values.name.trim(),
                      ...(values.description.trim()
                        ? { description: values.description.trim() }
                        : {}),
                      ...(values.startDate
                        ? { startDate: values.startDate }
                        : {}),
                      ...(values.endDate ? { endDate: values.endDate } : {}),
                    });

                if (outcome.status === 'saved') {
                  onOpenChange(false);
                  return;
                }
                if (outcome.status === 'name-taken') {
                  hooks.form.setError(
                    'name',
                    { message: CAMPAIGNS_UI.ERRORS.NAME_TAKEN },
                    { shouldFocus: true },
                  );
                }
              })()
            }
          >
            {campaign ? UI.ACTIONS.SAVE : UI.ACTIONS.CREATE}
          </Button>
        </>
      )}
    />
  );
}
