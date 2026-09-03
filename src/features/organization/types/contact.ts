/**
 * Contacts d'un organisme — US-01-04.
 *
 * Les contacts sont les **details** d'une fiche : ils exigent partout un acces
 * geographique complet. Une fiche hors perimetre rend `403` avec un role
 * restreint, et `404` avec un role sans lecture — l'existence de la fiche
 * n'est jamais revelee.
 */
export type Contact = {
  id: string;
  civility: string | null;
  firstName: string;
  lastName: string;
  /** Fonction dans la structure : maire, DGS, responsable periscolaire… */
  role: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  /** Au plus un par organisme, garanti par la base. Le signataire du contrat. */
  isPrimary: boolean;
  /** Refuse le demarchage : exclu des campagnes (US-01-11). */
  optOut: boolean;
  notes: string | null;
  /** Contact extrait d'une note a l'import : a faire verifier par un humain. */
  extractedFromNote: boolean;
  updatedAt: string;
};

export type ContactsResponse = { data: Contact[] };

/** Corps de creation. Seul `lastName` est exige par le serveur. */
export type CreateContactPayload = {
  civility?: string;
  firstName?: string;
  lastName: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary?: boolean;
  optOut?: boolean;
  notes?: string;
};

/**
 * Corps de modification : tous les champs optionnels.
 *
 * Les champs libres acceptent `null` pour etre effaces ; `firstName` et
 * `lastName` jamais. Un corps vide est refuse (`400 EMPTY_UPDATE_PAYLOAD`) :
 * il ne faut donc rien envoyer quand rien n'a change.
 */
export type UpdateContactPayload = {
  civility?: string | null;
  firstName?: string;
  lastName?: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  isPrimary?: boolean;
  optOut?: boolean;
  notes?: string | null;
};
