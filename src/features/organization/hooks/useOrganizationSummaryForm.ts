import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import {
  getOrganizationSummarySchema,
  type OrganizationSummarySchemaType,
} from '../forms/organization-summary-schema';
import type {
  OrganizationDetail,
  UpdateOrganizationPayload,
} from '../types/organizationDetail';
import { refKey, refKeys } from '../types/organizationDetail';
import { useUpdateOrganization } from './useUpdateOrganization';

/** Champ texte : la chaine vide vaut « efface », que l'API accepte en `null`. */
const text = (v: string) => (v.trim() === '' ? null : v.trim());
const number = (v: string) => (v.trim() === '' ? null : Number(v));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Etat du formulaire tel qu'il decoule de la fiche lue. */
function toFormValues(o: OrganizationDetail): OrganizationSummarySchemaType {
  return {
    name: o.name ?? '',
    type: o.type ?? '',
    department: o.department ?? '',
    siret: o.siret ?? '',
    inseeCode: o.inseeCode ?? '',
    address: o.address ?? '',
    postalCode: o.postalCode ?? '',
    city: o.city ?? '',
    epci: o.epci ?? '',
    phone: o.phone ?? '',
    email: o.email ?? '',
    website: o.website ?? '',
    population: o.population != null ? String(o.population) : '',
    schoolCount: o.schoolCount != null ? String(o.schoolCount) : '',
    childCount: o.childCount != null ? String(o.childCount) : '',
    // Les referentiels sont lus en objets et ecrits en cles : le formulaire
    // travaille en cles, la conversion se fait ici une fois pour toutes.
    solution: refKey(o.solution) ?? '',
    services: refKeys(o.services),
    tags: o.tags ?? [],
    priority: o.priority ?? 'NORMAL',
    notes: o.notes ?? '',
  };
}

/**
 * Formulaire de l'onglet Synthese.
 *
 * N'envoie que les champs reellement modifies : le contrat refuse un corps
 * vide (`400 EMPTY_UPDATE_PAYLOAD`), et envoyer la fiche entiere ecraserait au
 * passage ce qu'un autre utilisateur vient de changer.
 */
export function useOrganizationSummaryForm(organization: OrganizationDetail) {
  const schema = useMemo(() => getOrganizationSummarySchema(), []);
  const update = useUpdateOrganization(organization.id);

  /*
   * Les valeurs initiales sont celles de la fiche, des le premier rendu.
   *
   * Le formulaire etait auparavant cree dans le panneau, avant le chargement,
   * puis corrige par un `reset`. Les champs texte suivaient, mais le selecteur
   * de type passait de non-controle a controle : Radix conservait son etat
   * vide et le renvoyait dans le formulaire, qui affichait « Champ requis »
   * sur une fiche pourtant typee. Creer le formulaire une fois la fiche
   * chargee supprime la transition.
   */
  const form = useForm<OrganizationSummarySchemaType>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(organization),
    mode: 'onChange',
  });

  const buildPayload = (): UpdateOrganizationPayload | null => {
    const v = form.getValues();
    const initial = toFormValues(organization);
    const payload: UpdateOrganizationPayload = {};

    if (v.name.trim() !== initial.name) payload.name = v.name.trim();
    if (v.type !== initial.type) payload.type = v.type;
    if (v.department.trim() !== initial.department)
      payload.department = v.department.trim().toUpperCase();

    const texts = [
      ['siret', 'siret'],
      ['inseeCode', 'inseeCode'],
      ['address', 'address'],
      ['postalCode', 'postalCode'],
      ['city', 'city'],
      ['epci', 'epci'],
      ['phone', 'phone'],
      ['email', 'email'],
      ['website', 'website'],
      ['notes', 'notes'],
    ] as const;
    for (const [field] of texts) {
      if (v[field] !== initial[field]) {
        // Le SIRET se saisit volontiers avec des espaces ; l'API veut 14
        // chiffres nus.
        const raw = field === 'siret' ? v[field].replace(/\s/g, '') : v[field];
        payload[field] = text(raw);
      }
    }

    const numbers = ['population', 'schoolCount', 'childCount'] as const;
    for (const field of numbers) {
      if (v[field] !== initial[field]) payload[field] = number(v[field]);
    }

    if (v.solution !== initial.solution) payload.solution = text(v.solution);
    if (!same(v.services, initial.services)) payload.services = v.services;
    if (!same(v.tags, initial.tags)) payload.tags = v.tags;
    if (v.priority !== initial.priority) payload.priority = v.priority;

    return Object.keys(payload).length > 0 ? payload : null;
  };

  const submit = async () => {
    const ok = await form.trigger();
    if (!ok) return null;

    const payload = buildPayload();
    if (!payload) {
      // On l'attrape avant l'aller-retour : le serveur repondrait
      // EMPTY_UPDATE_PAYLOAD, ce qui s'afficherait comme une erreur alors que
      // l'utilisateur n'a simplement rien change.
      toast.info(ORGANIZATION_DETAIL_UI.TOASTS.NO_CHANGE);
      return null;
    }

    return update.update(payload);
  };

  return {
    form,
    update,
    submit,
    reset: () => form.reset(toFormValues(organization)),
  };
}

export type OrganizationSummaryHooks = ReturnType<
  typeof useOrganizationSummaryForm
>;
