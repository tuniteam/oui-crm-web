import { z } from 'zod';
import { OPENING_DAYS } from '../types/organizationDetail';
import { PRIORITY_VALUES } from '../types/organizationList';

export const ZOD = {
  REQUIRED: 'Champ requis',
  MAX: 'Longueur maximale dépassée',
  EMAIL: 'Email invalide',
  SIRET: 'Le SIRET comporte 14 chiffres',
  DEPARTMENT: 'Département invalide (2 ou 3 caractères)',
  POSITIVE: 'Valeur invalide',
  LATITUDE: 'Latitude attendue entre -90 et 90',
  LONGITUDE: 'Longitude attendue entre -180 et 180',
};

/**
 * Le format d'un creneau, tel que l'API le valide.
 *
 * Copie du motif du contrat — verifie en direct : `9h-12h` est refuse par un
 * `400`. Le front s'aligne dessus plutot que de laisser partir une saisie que
 * le serveur rejettera.
 */
export const SLOT_PATTERN = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

/** Champs texte facultatifs : la chaine vide vaut « efface ». */
export const optionalText = (max = 200) =>
  z.string().trim().max(max, ZOD.MAX).or(z.literal(''));

/** Nombre facultatif saisi en texte : `<input type="number">` rend '' quand
 *  le champ est vide, et une chaine sinon. */
export const optionalNumber = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 0), ZOD.POSITIVE);

/**
 * Un decimal saisi au clavier, pret a devenir un nombre.
 *
 * Un clavier francais donne la virgule, et refuser la saisie qu'il produit
 * serait absurde. La regle vit ici, en un seul endroit : le schema la lit pour
 * valider et le formulaire pour construire le corps — ecrite deux fois, elle
 * finirait par accepter a la saisie ce que l'envoi ne sait plus convertir.
 */
export const toDecimal = (raw: string) => raw.trim().replace(',', '.');

/**
 * Une coordonnee facultative, saisie en texte.
 *
 * Bornes reprises du serveur, **eprouvees en direct** : `latitude: 91` et
 * `longitude: -181` sont refuses par un `400`. Les redire ici evite un
 * aller-retour, et surtout evite qu'un seul champ hors bornes fasse echouer
 * l'enregistrement de toute la fiche.
 */
const optionalCoordinate = (bound: number, message: string) =>
  z
    .string()
    .trim()
    .refine((v) => {
      if (v === '') return true;
      const n = Number(toDecimal(v));
      return Number.isFinite(n) && Math.abs(n) <= bound;
    }, message);

export const getOrganizationSummarySchema = () =>
  z.object({
    name: z.string().trim().min(1, ZOD.REQUIRED).max(200, ZOD.MAX),
    type: z.string().trim().min(1, ZOD.REQUIRED),
    // 2 a 3 caracteres : `89`, `2A`, `974`.
    department: z
      .string()
      .trim()
      .regex(/^[0-9AB]{2,3}$/i, ZOD.DEPARTMENT),

    siret: z
      .string()
      .trim()
      .refine((v) => v === '' || /^\d{14}$/.test(v.replace(/\s/g, '')), ZOD.SIRET),
    inseeCode: optionalText(10),
    address: optionalText(),
    postalCode: optionalText(10),
    city: optionalText(120),
    epci: optionalText(),
    phone: optionalText(40),
    email: z.string().trim().email(ZOD.EMAIL).or(z.literal('')),
    website: optionalText(),

    latitude: optionalCoordinate(90, ZOD.LATITUDE),
    longitude: optionalCoordinate(180, ZOD.LONGITUDE),

    population: optionalNumber,
    schoolCount: optionalNumber,
    childCount: optionalNumber,

    solution: z.string(),
    services: z.array(z.string()),
    tags: z.array(z.string()),

    priority: z.enum(PRIORITY_VALUES),
    notes: z.string().max(5000, ZOD.MAX),

    /*
     * Les horaires ne se saisissent pas au clavier : la fenetre d'edition n'en
     * produit que des valeurs deja formees. Le schema redit malgre tout les
     * bornes du contrat — deux creneaux, sept jours, 500 caracteres — parce
     * qu'un 400 sur ce champ ferait echouer l'enregistrement de TOUTE la
     * fiche, y compris des champs corrects saisis a cote.
     */
    openingHours: z
      .object({
        days: z
          .array(
            z.object({
              day: z.enum(OPENING_DAYS),
              slots: z.array(z.string().regex(SLOT_PATTERN)).min(1).max(2),
            }),
          )
          .max(7),
        comment: z.string().max(500, ZOD.MAX).nullable().optional(),
      })
      .nullable(),
  });

export type OrganizationSummarySchemaType = z.infer<
  ReturnType<typeof getOrganizationSummarySchema>
>;
