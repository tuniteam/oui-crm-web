import { z } from 'zod';
import { SCOPE_NATURES } from '../types/scopes';
import type { GeoRegion, Scope } from '../types/scopes';

const ZOD = {
  REQUIRED: 'Champ requis',
  MAX: 'Longueur maximale dépassée',
};

/**
 * Saisie d'un périmètre — US-00-07.
 *
 * La géographie ne vit pas dans le schéma en deux listes, mais en **un seul
 * ensemble de départements cochés**. Les deux listes du contrat — `regions` et
 * `departments` — s'en déduisent à l'enregistrement : une source unique évite
 * qu'elles divergent, ce qui produirait un périmètre dont l'écran et le serveur
 * n'auraient pas la même idée.
 */
export const getScopeSchema = () =>
  z.object({
    name: z.string().trim().min(1, ZOD.REQUIRED).max(120, ZOD.MAX),
    description: z.string().trim().max(500, ZOD.MAX),
    nature: z.enum(SCOPE_NATURES),
    portfolioOnly: z.boolean(),
    /** Codes de département cochés. Vide = tout le territoire. */
    departments: z.array(z.string()),
  });

export type ScopeSchemaType = z.infer<ReturnType<typeof getScopeSchema>>;

export const emptyScopeValues = (): ScopeSchemaType => ({
  name: '',
  description: '',
  nature: 'ALL',
  portfolioOnly: false,
  departments: [],
});

/**
 * État du formulaire à partir d'un périmètre existant.
 *
 * Les régions enregistrées sont dépliées en départements : c'est la forme sur
 * laquelle l'écran travaille, et le serveur fait le même dépliage de son côté
 * pour calculer `resolvedDepartments`.
 */
export function toScopeFormValues(
  scope: Scope,
  regions: GeoRegion[],
): ScopeSchemaType {
  const byName = new Map(regions.map((r) => [r.name, r.departments]));
  const checked = new Set<string>(scope.departments);
  for (const regionName of scope.regions) {
    for (const dept of byName.get(regionName) ?? []) checked.add(dept);
  }

  return {
    name: scope.name,
    description: scope.description ?? '',
    nature: scope.nature,
    portfolioOnly: scope.portfolioOnly,
    departments: [...checked].sort(),
  };
}

/**
 * Découpe les départements cochés en `regions` + `departments`.
 *
 * Une région **entièrement** cochée part sous son nom ; amputée d'un seul
 * département, elle part en départements explicites. Le contrat ne permet pas
 * d'exprimer « la Normandie sauf l'Orne » autrement — le serveur déplie les
 * noms de région tels quels.
 *
 * Les deux listes sont toujours renvoyées, même vides : le `PATCH` les
 * **remplace en bloc**, il ne les fusionne pas.
 */
export function toScopeGeography(
  checkedDepartments: string[],
  regions: GeoRegion[],
): { regions: string[]; departments: string[] } {
  const checked = new Set(checkedDepartments);
  const wholeRegions: string[] = [];
  const covered = new Set<string>();

  for (const region of regions) {
    const isWhole =
      region.departments.length > 0 &&
      region.departments.every((d) => checked.has(d));
    if (!isWhole) continue;
    wholeRegions.push(region.name);
    for (const d of region.departments) covered.add(d);
  }

  return {
    regions: wholeRegions,
    departments: [...checked].filter((d) => !covered.has(d)).sort(),
  };
}
