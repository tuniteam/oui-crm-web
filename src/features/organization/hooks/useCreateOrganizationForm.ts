import { useCallback, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  CREATE_MODES,
  CREATE_ORGANIZATION_FIELD_ERRORS,
  CREATE_ORGANIZATION_UI,
  type CreateMode,
} from '../constants/organizationCreate.constants';
import {
  emptyOrganizationCreateValues,
  getOrganizationCreateSchema,
  type OrganizationCreateSchemaType,
} from '../forms/organization-create-schema';
import type {
  CreateOrganizationPayload,
  DuplicateCandidate,
  RegistryMatch,
} from '../types/organizationCreate';
import { useCreateOrganization } from './useCreateOrganization';
import { useRegistrySearch } from './useRegistrySearch';

/** Champ vide = champ non transmis. Le serveur applique alors ses defauts ;
 *  envoyer `''` lui ferait enregistrer une chaine vide. */
const text = (v: string) => (v.trim() === '' ? undefined : v.trim());

function toPayload(
  values: OrganizationCreateSchemaType,
  force: boolean,
): CreateOrganizationPayload {
  return {
    name: values.name.trim(),
    type: values.type,
    department: values.department.trim().toUpperCase(),

    siret: text(values.siret.replace(/\s/g, '')),
    inseeCode: text(values.inseeCode),
    address: text(values.address),
    postalCode: text(values.postalCode),
    city: text(values.city),
    epci: text(values.epci),
    phone: text(values.phone),
    email: text(values.email),
    population:
      values.population.trim() === '' ? undefined : Number(values.population),
    solution: text(values.solution),
    priority: values.priority,

    ...(force ? { force: true } : {}),
  };
}

export type CreateOrganizationHooks = ReturnType<
  typeof useCreateOrganizationForm
>;

export function useCreateOrganizationForm() {
  const [mode, setMode] = useState<CreateMode>(CREATE_MODES.REGISTRY);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[] | null>(
    null,
  );
  const [createdId, setCreatedId] = useState<string | null>(null);

  const registry = useRegistrySearch();
  const { create, loading } = useCreateOrganization();

  const form = useForm<OrganizationCreateSchemaType>({
    resolver: zodResolver(getOrganizationCreateSchema()),
    defaultValues: emptyOrganizationCreateValues(),
    mode: 'onSubmit',
  });

  /** Reprend une fiche du registre et bascule sur la saisie, pour relecture.
   *  On ne cree jamais directement depuis un resultat : le type de structure
   *  est obligatoire et le registre ne le donne pas. */
  const applyMatch = useCallback(
    (match: RegistryMatch) => {
      form.reset(
        emptyOrganizationCreateValues({
          name: match.name ?? '',
          siret: match.siret ?? '',
          inseeCode: match.inseeCode ?? '',
          address: match.address ?? '',
          postalCode: match.postalCode ?? '',
          city: match.city ?? '',
          department: match.department ?? '',
        }),
      );
      setMode(CREATE_MODES.MANUAL);
    },
    [form],
  );

  const submit = useCallback(
    async (force = false) => {
      const values = form.getValues();
      const outcome = await create(toPayload(values, force));

      switch (outcome.status) {
        case 'created':
          toast.success(CREATE_ORGANIZATION_UI.TOAST_CREATED);
          setCreatedId(outcome.organization.id);
          return true;

        case 'duplicate':
          // Question posee a l'utilisateur, pas echec : la fenetre reste
          // ouverte et la saisie intacte, le temps qu'il tranche.
          setDuplicates(outcome.candidates);
          return false;

        case 'field-error': {
          const target =
            CREATE_ORGANIZATION_FIELD_ERRORS[
              outcome.code as keyof typeof CREATE_ORGANIZATION_FIELD_ERRORS
            ];
          if (target) {
            form.setError(
              target.field as keyof OrganizationCreateSchemaType,
              { message: target.message },
              { shouldFocus: true },
            );
          }
          return false;
        }

        default:
          toast.error(outcome.message);
          return false;
      }
    },
    [create, form],
  );

  const reset = useCallback(() => {
    form.reset(emptyOrganizationCreateValues());
    setMode(CREATE_MODES.REGISTRY);
    setDuplicates(null);
    setCreatedId(null);
    registry.reset();
  }, [form, registry]);

  return {
    form,
    mode,
    setMode,
    registry,
    applyMatch,
    duplicates,
    dismissDuplicates: () => setDuplicates(null),
    createdId,
    submit,
    reset,
    loading,
  };
}
