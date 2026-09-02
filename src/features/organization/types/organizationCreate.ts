/**
 * Creation d'un organisme — US-01-02.
 *
 * Deux chemins, comme la V8 : la recherche au registre officiel, qui
 * pre-remplit la saisie, et la saisie manuelle. Le second est toujours
 * disponible — une panne du registre n'est pas une erreur bloquante.
 */

/** Corps de `POST /organizations`. Seuls `name`, `type` et `department` sont
 *  obligatoires ; les champs vides ne sont pas envoyes. */
export type CreateOrganizationPayload = {
  name: string;
  type: string;
  department: string;

  siret?: string;
  inseeCode?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  population?: number;
  epci?: string;
  phone?: string;
  email?: string;
  solution?: string;
  priority?: string;

  /** Rejoue la creation malgre un doublon probable, apres confirmation. */
  force?: boolean;
};

export type CreateOrganizationResponse = {
  id: string;
  name: string;
  completenessScore: number;
};

/**
 * Fiche du registre officiel, renvoyee par `GET /organizations/search-registry`.
 *
 * Un seul contrat de sortie pour les deux sources interrogees par l'API — la
 * consultation Sirene par SIRET et la recherche plein texte. Le front n'a pas
 * a savoir laquelle a repondu.
 */
export type RegistryMatch = {
  name: string;
  siret: string;
  siren: string;
  address: string;
  postalCode: string;
  city: string;
  inseeCode: string;
  /** Derive du code INSEE par l'API : 2A/2B et l'outre-mer sont geres. */
  department: string;
  /** `false` = unite legale fermee. On avertit, on ne bloque pas. */
  isActive: boolean;
};

export type RegistrySearchResponse = { data: RegistryMatch[] };

/** Candidat au doublon, porte par `messages.meta.duplicates` sur un 409. */
export type DuplicateCandidate = {
  id: string;
  name: string;
  city: string | null;
};
