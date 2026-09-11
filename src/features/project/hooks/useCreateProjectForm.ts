import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { slugify } from '@/shared/utils/string-utils';
import { CREATE_PROJECT_UI, PROJECT_RULES } from '../constants/constants';
import {
  createProjectSchema,
  type CreateProjectSchema,
} from '../forms/create-project-schema';
import { useCreateProject } from './useCreateProject';
import { useProjects } from './useProjects';

/**
 * Les projets proposés comme source de configuration.
 *
 * Le plafond de la route de liste, et il suffit : la plateforme compte ses
 * projets à l'unité, pas à la centaine.
 */
const SOURCE_LIST = { page: 1, limit: 100 } as const;

/** Le slug proposé depuis le nom, coupé au plafond sans laisser de tiret pendant. */
const suggestSlug = (name: string) =>
  slugify(name).slice(0, PROJECT_RULES.SLUG_MAX).replace(/-+$/, '');

export function useCreateProjectForm() {
  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      slug: '',
      productName: '',
      description: '',
      copyFromProjectId: CREATE_PROJECT_UI.NO_SOURCE,
    },
    mode: 'onSubmit',
  });

  /*
   * L'identifiant suit le nom **tant qu'on ne l'a pas touché**.
   *
   * Dès que l'utilisateur écrit dans le champ, sa saisie fait foi : la
   * recalculer à chaque lettre du nom effacerait ce qu'il vient de choisir.
   * Vider le champ rend la main à la suggestion.
   */
  const slugEdited = useRef(false);
  const name = form.watch('name');
  useEffect(() => {
    if (slugEdited.current) return;
    form.setValue('slug', suggestSlug(name), { shouldValidate: false });
  }, [name, form]);

  const onSlugInput = (value: string) => {
    slugEdited.current = value.trim() !== '';
  };

  const { projects: sources, loading: sourcesLoading } = useProjects(SOURCE_LIST);
  const { create, loading } = useCreateProject();

  const submit = async () => {
    const ok = await form.trigger();
    if (!ok) return null;

    const v = form.getValues();
    const result = await create({
      slug: v.slug.trim(),
      name: v.name.trim(),
      productName: v.productName.trim(),
      /* Un champ facultatif vide ne part pas : la chaîne vide n'est pas
         « pas de description ». */
      description: v.description.trim() || undefined,
      copyFromProjectId:
        v.copyFromProjectId === CREATE_PROJECT_UI.NO_SOURCE
          ? undefined
          : v.copyFromProjectId,
    });

    if (result.ok) return result.created;
    if (result.fieldError) {
      form.setError(result.fieldError.field, {
        type: 'server',
        message: result.fieldError.message,
      });
    }
    return null;
  };

  /** Rouvrir la fenêtre repart d'un formulaire vierge, suggestion comprise. */
  const reset = () => {
    slugEdited.current = false;
    form.reset();
  };

  return { form, submit, reset, loading, sources, sourcesLoading, onSlugInput };
}

export type CreateProjectHooks = ReturnType<typeof useCreateProjectForm>;
