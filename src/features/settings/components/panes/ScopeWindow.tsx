import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import {
  SCOPE_NATURE_LABELS,
  SCOPE_WINDOW,
  SCOPES_UI,
} from '../../constants/scopes.constants';
import {
  emptyScopeValues,
  getScopeSchema,
  toScopeFormValues,
  toScopeGeography,
  type ScopeSchemaType,
} from '../../forms/scope-schema';
import { useGeoRegions } from '../../hooks/useScopes';
import { useScopeMutations } from '../../hooks/useScopeMutations';
import { SCOPE_NATURES, type Scope } from '../../types/scopes';
import { RegionTree } from './RegionTree';

const UI = SCOPE_WINDOW;
const { FIELDS } = UI;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` pour une création. */
  scope: Scope | null;
};

type Hooks = {
  form: ReturnType<typeof useForm<ScopeSchemaType>>;
  mutations: ReturnType<typeof useScopeMutations>;
  regions: ReturnType<typeof useGeoRegions>;
};

/** Hook nommé : les règles des hooks s'y appliquent normalement. */
function useScopeWindow(): Hooks {
  return {
    form: useForm<ScopeSchemaType>({
      resolver: zodResolver(getScopeSchema()),
      defaultValues: emptyScopeValues(),
      mode: 'onSubmit',
    }),
    mutations: useScopeMutations(),
    regions: useGeoRegions(),
  };
}

function Body({ hooks, scope }: { hooks: Hooks; scope: Scope | null }) {
  const { form, regions, mutations } = hooks;
  const disabled = mutations.saving;

  // Le formulaire suit le périmètre ouvert. Les régions enregistrées sont
  // dépliées en départements : c'est la forme sur laquelle l'écran travaille.
  useEffect(() => {
    if (regions.loading) return;
    form.reset(
      scope ? toScopeFormValues(scope, regions.regions) : emptyScopeValues(),
    );
  }, [scope, regions.regions, regions.loading, form]);

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
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
                    data-testid="scope-name"
                    placeholder={FIELDS.NAME_PLACEHOLDER}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FIELDS.NATURE}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger data-testid="scope-nature">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SCOPE_NATURES.map((nature) => (
                      <SelectItem key={nature} value={nature}>
                        {SCOPE_NATURE_LABELS[nature]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Input {...field} data-testid="scope-description" disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolioOnly"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                    data-testid="scope-portfolio-only"
                    className="mt-0.5"
                  />
                </FormControl>
                <div>
                  <FormLabel>{FIELDS.PORTFOLIO_ONLY}</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {FIELDS.PORTFOLIO_HINT}
                  </p>
                </div>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="border-b border-border pb-2 text-sm font-semibold">
            {FIELDS.GEOGRAPHY}
          </h3>
          <FormField
            control={form.control}
            name="departments"
            render={({ field }) => (
              <FormItem>
                <RegionTree
                  regions={regions.regions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

/** Création et modification d'un périmètre — US-00-07, tranche B. */
export function ScopeWindow({ open, onOpenChange, scope }: Props) {
  return (
    <ReusableWindow<Hooks>
      open={open}
      onOpenChange={onOpenChange}
      title={scope ? UI.EDIT_TITLE : UI.CREATE_TITLE}
      useHooks={useScopeWindow}
      preventClose
      renderBody={(hooks) => <Body hooks={hooks} scope={scope} />}
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
            data-testid="scope-submit"
            disabled={hooks.mutations.saving}
            onClick={() =>
              void hooks.form.handleSubmit(async (values) => {
                /*
                 * Les deux listes partent **toujours**, même vides : le `PATCH`
                 * les remplace en bloc, il ne les fusionne pas. Poster
                 * `regions` sans `departments` effacerait les départements
                 * explicites.
                 */
                const geography = toScopeGeography(
                  values.departments,
                  hooks.regions.regions,
                );
                const payload = {
                  name: values.name.trim(),
                  description: values.description.trim(),
                  nature: values.nature,
                  portfolioOnly: values.portfolioOnly,
                  ...geography,
                };

                const outcome = scope
                  ? await hooks.mutations.update(scope.id, payload)
                  : await hooks.mutations.create(payload);

                if (outcome.status === 'saved') {
                  onOpenChange(false);
                  return;
                }
                // Nom deja pris : la correction se fait dans le champ, pas
                // dans un message qui disparait.
                if (outcome.status === 'name-taken') {
                  hooks.form.setError(
                    'name',
                    { message: SCOPES_UI.ERRORS.NAME_TAKEN },
                    { shouldFocus: true },
                  );
                }
              })()
            }
          >
            {scope ? UI.ACTIONS.SAVE : UI.ACTIONS.CREATE}
          </Button>
        </>
      )}
    />
  );
}
