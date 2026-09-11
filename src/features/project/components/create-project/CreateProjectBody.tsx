import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CREATE_PROJECT_UI, PROJECT_RULES } from '../../constants/constants';
import type { CreateProjectHooks } from '../../hooks/useCreateProjectForm';

const UI = CREATE_PROJECT_UI;

export function CreateProjectBody({ hooks }: { hooks: CreateProjectHooks }) {
  const { form, sources, sourcesLoading, onSlugInput } = hooks;

  return (
    <Form {...form}>
      <form className="space-y-5" data-testid="project-create-form">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI.FIELDS.NAME} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    data-testid="project-create-name"
                    maxLength={PROJECT_RULES.NAME_MAX}
                    placeholder={UI.PLACEHOLDERS.NAME}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI.FIELDS.SLUG} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    data-testid="project-create-slug"
                    maxLength={PROJECT_RULES.SLUG_MAX}
                    placeholder={UI.PLACEHOLDERS.SLUG}
                    className="font-mono"
                    onChange={(e) => {
                      onSlugInput(e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                {/*
                  * « Définitif » est dit avant, pas découvert après : aucune
                  * route ne modifie l'identifiant, qui sert dans les URL et
                  * les noms de fichiers d'export. Une erreur se garde toute la
                  * vie du projet.
                  */}
                <FormDescription>
                  {UI.HINTS.SLUG} {UI.HINTS.SLUG_AUTO}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.FIELDS.PRODUCT} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid="project-create-product"
                  maxLength={PROJECT_RULES.NAME_MAX}
                  placeholder={UI.PLACEHOLDERS.PRODUCT}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.FIELDS.DESCRIPTION}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  data-testid="project-create-description"
                  maxLength={PROJECT_RULES.DESCRIPTION_MAX}
                  placeholder={UI.PLACEHOLDERS.DESCRIPTION}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="copyFromProjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.FIELDS.COPY_FROM}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={sourcesLoading}
              >
                <FormControl>
                  <SelectTrigger data-testid="project-create-copy-from">
                    <SelectValue placeholder={UI.PLACEHOLDERS.COPY_FROM} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* L'option vide par défaut : partir de la configuration
                      d'usine est le cas normal, copier l'exception. */}
                  <SelectItem value={UI.NO_SOURCE}>
                    {UI.PLACEHOLDERS.COPY_FROM}
                  </SelectItem>
                  {sources.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Ce qui est copié, et surtout ce qui ne l'est pas : on ne
                  choisit pas une source sans savoir qu'elle n'emporte ni
                  membre ni organisme. */}
              <FormDescription>{UI.HINTS.COPY_FROM}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
