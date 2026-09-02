import api from '@/config/axiosInstance';
import { CONTACT_ROUTES } from '../constants/contact.constants';
import { ORGANIZATION_ROUTES } from '../constants/organization.routes';
import type {
  Contact,
  ContactsResponse,
  CreateContactPayload,
  UpdateContactPayload,
} from '../types/contact';

/**
 * Aucun appel n'enveloppe son erreur dans un `Error` nu.
 *
 * L'appelant a besoin du code brut pour distinguer ce que le contrat
 * distingue : `ACCESS_DENIED` sur une fiche hors périmètre,
 * `CONTACT_HAS_ACTIVITIES` sur une suppression refusée,
 * `ORGANIZATION_NOT_FOUND` sur une fiche disparue. Envelopper perdrait le code
 * et ferait passer chacune de ces règles pour une panne.
 */
export const contactService = {
  /**
   * Volontairement non enveloppé, comme la suppression : l'appelant doit lire
   * `ACCESS_DENIED` sur une fiche hors périmètre pour l'expliquer plutôt que
   * de l'afficher en erreur. Enveloppé dans un `Error` nu, le code serait
   * perdu et le refus passerait pour une panne.
   */
  getAll: async (organizationId: string): Promise<ContactsResponse> => {
    const res = await api.get<ContactsResponse>(
      ORGANIZATION_ROUTES.ORGANIZATION_CONTACTS_API(organizationId),
    );
    return res.data;
  },

  create: async (
    organizationId: string,
    payload: CreateContactPayload,
  ): Promise<Contact> => {
    const res = await api.post<Contact>(
      ORGANIZATION_ROUTES.ORGANIZATION_CONTACTS_API(organizationId),
      payload,
    );
    return res.data;
  },

  update: async (
    contactId: string,
    payload: UpdateContactPayload,
  ): Promise<Contact> => {
    const res = await api.patch<Contact>(
      CONTACT_ROUTES.CONTACT_API(contactId),
      payload,
    );
    return res.data;
  },

  /**
   * Volontairement non enveloppé : l'appelant a besoin du code brut pour
   * distinguer `409 CONTACT_HAS_ACTIVITIES`, qui n'est pas un échec mais une
   * bifurcation — le contrat demande de proposer « ne pas démarcher ».
   */
  remove: async (contactId: string): Promise<void> => {
    await api.delete(CONTACT_ROUTES.CONTACT_API(contactId));
  },
};
