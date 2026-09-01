import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon, Save } from 'lucide-react';
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
  BUSINESS_RULES_UI,
  SETTINGS_ACTIONS,
  STAGE_LABELS,
  STAGE_ORDER,
} from '../../constants/constants';
import {
  businessRulesSchema,
  type BusinessRulesSchema,
} from '../../forms/business-rules-schema';
import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import {
  FIXED_STAGE_PROBABILITIES,
  type SettingsResponse,
  type Stage,
} from '../../types/settings';

const F = BUSINESS_RULES_UI.FIELDS;

type ScalarName = Exclude<keyof BusinessRulesSchema, 'stageProbabilities'>;

const SCALARS: { name: ScalarName; label: string; step?: string }[] = [
  { name: 'vatRate', label: F.VAT_RATE, step: '0.01' },
  { name: 'discountCap', label: F.DISCOUNT_CAP },
  { name: 'revenueTarget', label: F.REVENUE_TARGET },
  { name: 'meetingTarget', label: F.MEETING_TARGET },
  { name: 'quoteValidityDays', label: F.QUOTE_VALIDITY_DAYS },
  { name: 'noticeMonths', label: F.NOTICE_MONTHS },
  { name: 'defaultCommitmentMonths', label: F.DEFAULT_COMMITMENT_MONTHS },
  { name: 'retentionMonths', label: F.RETENTION_MONTHS },
];

function toValues(settings: SettingsResponse): BusinessRulesSchema {
  return {
    vatRate: settings.vatRate,
    discountCap: settings.discountCap,
    revenueTarget: settings.revenueTarget,
    meetingTarget: settings.meetingTarget,
    quoteValidityDays: settings.quoteValidityDays,
    noticeMonths: settings.noticeMonths,
    defaultCommitmentMonths: settings.defaultCommitmentMonths,
    retentionMonths: settings.retentionMonths,
    stageProbabilities: { ...settings.stageProbabilities },
  };
}

export function BusinessRulesPane({
  settings,
  canUpdate,
}: {
  settings: SettingsResponse;
  canUpdate: boolean;
}) {
  const { update, loading } = useUpdateSettings();

  const form = useForm<BusinessRulesSchema>({
    resolver: zodResolver(businessRulesSchema),
    defaultValues: toValues(settings),
    mode: 'onSubmit',
  });

  useEffect(() => form.reset(toValues(settings)), [settings, form]);

  const onSubmit = async (values: BusinessRulesSchema) => {
    const payload: Record<string, unknown> = {};

    for (const { name } of SCALARS) {
      if (values[name] !== settings[name]) payload[name] = values[name];
    }

    // Fusion cle par cle : seules les etapes modifiees partent. WON et LOST
    // sont figees cote serveur, les envoyer autrement produit un 400.
    const stages = Object.fromEntries(
      STAGE_ORDER.filter(
        (stage) =>
          FIXED_STAGE_PROBABILITIES[stage] === undefined &&
          values.stageProbabilities[stage] !==
            settings.stageProbabilities[stage],
      ).map((stage) => [stage, values.stageProbabilities[stage]]),
    );
    if (Object.keys(stages).length) payload.stageProbabilities = stages;

    // Un PATCH vide est refuse (400 EMPTY_UPDATE_PAYLOAD).
    if (!Object.keys(payload).length) return;
    await update(payload);
  };

  const submitButton = canUpdate ? (
    <div className="mt-6 flex justify-end">
      <Button type="submit" disabled={loading}>
        {loading ? (
          <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? SETTINGS_ACTIONS.SAVING : SETTINGS_ACTIONS.SAVE}
      </Button>
    </div>
  ) : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">
              {BUSINESS_RULES_UI.TITLE}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {BUSINESS_RULES_UI.DESCRIPTION}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {SCALARS.map(({ name, label, step }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={step ?? '1'}
                          disabled={!canUpdate}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : e.target.valueAsNumber,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">
              {BUSINESS_RULES_UI.PROBABILITIES.TITLE}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {BUSINESS_RULES_UI.PROBABILITIES.DESCRIPTION}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {STAGE_ORDER.map((stage: Stage) => {
                const fixed = FIXED_STAGE_PROBABILITIES[stage] !== undefined;

                return (
                  <FormField
                    key={stage}
                    control={form.control}
                    name={`stageProbabilities.${stage}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{STAGE_LABELS[stage]}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            disabled={!canUpdate || fixed}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? undefined
                                  : e.target.valueAsNumber,
                              )
                            }
                          />
                        </FormControl>
                        {fixed ? (
                          <p className="text-xs text-muted-foreground">
                            {BUSINESS_RULES_UI.PROBABILITIES.FIXED_HINT}
                          </p>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>

            {submitButton}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
