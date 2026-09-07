# Impact sur le code — L1 · US-01-05 · Actions groupées

> Contrat lu dans `HANDOFF-L1.md` §US-01-05 **et éprouvé en direct** le
> 04/09/2026 : `400 INVALID_DATA` sans sélection, `{ processed, skipped }`
> sinon, `selectAll` + `filters` accepté. Aucun code n'a été modifié pour
> écrire cette étude.

---

## 1. Ce qui existe déjà, et qu'on n'aura pas à écrire

**`ReusableTable` sait sélectionner des lignes.** Colonne de cases à cocher,
case d'en-tête à trois états, `getRowId` sur l'identifiant de la fiche, et un
rappel `onRowSelectionChange` vers le parent :

```ts
enableRowSelection?: boolean;
onRowSelectionChange?: (ids: string[]) => void;
```

**Personne ne s'en sert.** C'est la troisième capacité du projet dans ce cas,
après `kanban.tsx` et `getPermissionScope`.

**Les vocabulaires sont là** — `PRIORITY_LABELS`, `SALES_STATUS_LABELS` et
leurs tons, `useUsers` pour les commerciaux, `useCampaigns` pour les campagnes.

**Le motif de compte rendu partiel est éprouvé** : la cible des campagnes rend
déjà « 38 ajoutés, 4 déjà présents, 2 ignorés ». `skipped` s'y raccroche
directement.

---

## 2. Ce qu'il faut écrire

| Fichier | Rôle |
|---|---|
| `types/bulk.ts` | les cinq actions, la charge utile par action, `{ processed, skipped }` |
| `constants/bulk.constants.ts` | route, libellés, motifs de `skipped` traduits |
| `services/bulk.service.ts` | l'appel — **non enveloppé**, l'appelant a besoin des codes |
| `hooks/useBulkActions.ts` | la mutation et les invalidations |
| `components/OrganizationsBulkBar.tsx` | la barre qui apparaît à la sélection |
| `components/BulkActionWindow.tsx` | la fenêtre qui demande le champ de l'action |

**Trois fichiers existants à toucher** : `OrganizationsTable.tsx` pour activer
la sélection et poser la barre, `organizationList.constants.ts` pour les
libellés, et la recette.

---

## 3. Les quatre points qui demandent une décision

### A. « Tout sélectionner » ne veut pas dire ce qu'on croit

`toggleAllPageRowsSelected` de la table ne coche que **la page courante** —
vingt lignes. Le contrat, lui, offre `selectAll: true` + les filtres : « toutes
les fiches qui correspondent », sans les énumérer.

Ce sont deux choses différentes, et les confondre est le piège de cette US : un
utilisateur qui coche l'en-tête croit tout prendre, et n'agit que sur vingt
fiches sur quatre cent trente-sept.

**Ce que je propose**, et qui est le motif habituel : la case d'en-tête coche
la page, puis un bandeau apparaît — « Les 20 fiches de cette page sont
sélectionnées. **Sélectionner les 437 qui correspondent aux filtres.** » Le
second geste bascule en mode `selectAll`, et la barre le dit clairement.

### B. Les filtres à rejouer côté serveur

`selectAll` exige d'envoyer **les filtres courants de la liste**, mêmes champs
que `GET /organizations` moins `page`, `limit`, `sort`, `order`.

La table en porte dix-huit dans son état local. Il faut les extraire une seule
fois, dans une fonction partagée entre la requête de liste et l'appel groupé —
sinon les deux divergeront, et l'action portera sur un ensemble différent de
celui qu'on voit.

C'est le point le plus risqué de l'US : une divergence silencieuse y ferait
supprimer des fiches qu'on ne regardait pas.

### C. Ce que chaque action invalide

Les cinq actions ne touchent pas les mêmes écrans :

| Action | À invalider |
|---|---|
| `ASSIGN_SALES_REP` | organismes, fiche |
| `SET_SALES_STATUS` | organismes, fiche, **tableau de prospection** |
| `SET_PRIORITY` | organismes, fiche, tableau |
| `ADD_TO_CAMPAIGN` | organismes, fiche, **campagnes** (le compteur de cible) |
| `DELETE` | organismes, et fermer le panneau si la fiche ouverte a disparu |

`SET_SALES_STATUS` et `ADD_TO_CAMPAIGN` passent par l'écrivain unique du statut
— le même que le tableau et que les automatismes d'actions. Le tableau de
prospection doit donc se recharger, sinon il montrera des colonnes fausses.

### D. `DELETE` demande un droit de plus

`organizations:bulk` ne suffit pas : la suppression exige **aussi**
`organizations:delete`. Un commercial a le premier, pas le second. L'action
doit donc disparaître de la barre, pas échouer après le clic.

---

## 4. Ce que le compte rendu doit dire

L'appel **n'échoue jamais globalement**. Il rend `processed` et une liste
`skipped` avec, pour chaque fiche, `NOT_FOUND` ou `OUT_OF_SCOPE`.

Un « enregistré » masquerait le fait que dix fiches sur cinquante n'ont pas
suivi — c'est exactement l'erreur qu'on a évitée sur la cible des campagnes.
Deux motifs, deux phrases :

- `OUT_OF_SCOPE` — « hors de votre périmètre » : la fiche est visible, mais on
  ne peut pas l'écrire.
- `NOT_FOUND` — « introuvable ou supprimée ». Attention : ce motif couvre aussi
  les fiches **cachées** à un rôle `outOfScopeAccess: NONE`, qui ne doit pas
  apprendre qu'elles existent. Le libellé ne doit donc rien laisser deviner.

---

## 5. Coût

**Une demi-journée**, sélection comprise. Le gros du travail est dans les
points A et B — les décisions d'interface et le partage des filtres — pas dans
l'appel, qui tient en dix lignes.

Rien ne bloque : la route est livrée, éprouvée, et le front a déjà tout ce
qu'il faut.
