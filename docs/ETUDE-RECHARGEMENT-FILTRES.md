# Étude — pourquoi toute la liste se recharge à chaque filtre

> Relevé le 12/09/2026 dans le code, sur `/organizations`. Aucun changement
> appliqué : ce document précède la décision.

**La demande** : ne recharger que les lignes du tableau, en laissant en place la
barre d'outils, le compteur, le badge du bouton « Filtres » et la bande des
critères actifs — aujourd'hui l'écran entier clignote à chaque critère posé,
changé ou retiré.

---

## Le constat

Ce n'est pas une lenteur, c'est un **démontage**. À chaque changement de
critère, l'écran ne se rafraîchit pas : il disparaît et se reconstruit.

La chaîne est courte et sans ambiguïté.

### 1. Chaque critère produit une nouvelle clé de cache

```ts
// useOrganizations.ts:18
queryKey: ['organizations', 'list', projectId, params],
```

`params` porte les onze filtres. Changer un seul crée donc une clé que le cache
n'a jamais vue.

### 2. Rien ne comble le vide pendant le chargement

`placeholderData` / `keepPreviousData` n'apparaissent **nulle part** dans
`src/` — vérifié, zéro occurrence. Sur une clé neuve, `query.data` vaut donc
`undefined`, et par conséquent :

| Ce que le hook expose | Valeur pendant le chargement |
|---|---|
| `organizations` | `[]` (repli `query.data?.data ?? []`) |
| `loading` (`isLoading`) | `true` |

### 3. Le squelette remplace **toute la carte**, pas les lignes

```tsx
// reusable-table.tsx:302
if (loading && data.length === 0) {
  return <ReusableTableSkeleton … />;
}
```

Ce `return` sort **avant** le `<Card>`. Or la carte contient bien plus que les
lignes :

- le champ de recherche et la saisie du département ;
- le bouton « Filtres » **et son badge de comptage** ;
- le compteur « 900 sur 36 224 » ;
- le bouton « Nouvel organisme » ;
- la bande des critères actifs.

Tout cela est donc démonté puis remonté à chaque critère. C'est exactement le
clignotement décrit.

---

## La conséquence qu'on cherchait ailleurs

**C'est aussi la vraie cause de la fermeture du panneau de filtres.**

Le `Popover` vit dans `headerFilters`, rendu **dans la carte**
(`reusable-table.tsx:361`). Quand le squelette remplace la carte, le déclencheur
du panneau et son contenu sont démontés : le panneau ne se « ferme » pas, il
**cesse d'exister**.

Nous avons cherché du côté du portail des `Select`, puis du focus perdu par le
bouton « Réinitialiser » qui se démonte. Les deux pistes étaient plausibles et
fausses. La correction de la cible du clic
(`e.detail.originalEvent.target` au lieu de `e.target`) reste juste et
nécessaire — Radix émet un `CustomEvent` sur le panneau, donc l'ancien test
comparait le panneau à lui-même — mais elle ne pouvait pas suffire : aucun
garde-fou ne survit à un démontage.

Ce qui explique aussi pourquoi « Réinitialiser » referme le panneau : remettre
les filtres à zéro change `params`, donc la clé, donc le squelette, donc le
démontage. Le bouton n'y est pour rien.

---

## Ce qui marche déjà, et qu'il n'y a pas à construire

Le badge « Filtres 4 » et la bande des critères actifs se calculent depuis
l'**état local** (`activeChips`, `filterFields`) : ils n'attendent pas le
serveur et sont déjà à jour instantanément. Seul le démontage les fait
clignoter.

Le compteur « 900 sur 36 224 », lui, vient de `meta` : il ne peut être juste
qu'après la réponse. C'est normal et sans remède.

---

## La correction — deux lignes, et le kit fait le reste

**Le composant de tableau sait déjà afficher un chargement confiné aux lignes.
`ReusableTable` ne le lui demande jamais.**

`DataGrid` accepte `isLoading` et `loadingMode`, ce dernier valant
`'skeleton'` par défaut — `data-grid.tsx:60-61` et `:131`. Et `DataGridTable`
rend alors des lignes-squelettes **dans le corps du tableau**
(`data-grid-table.tsx:526-542`), en conservant l'en-tête des colonnes, la barre
d'outils, la bande des critères et la pagination.

C'est exactement le comportement demandé, et il est déjà écrit. `ReusableTable`
le contourne en substituant son propre squelette de carte entière.

### Ce qu'il y a à faire

**1. `reusable-table.tsx`** — passer l'état au `DataGrid` et supprimer le
`return` précoce des lignes 302-311 :

```tsx
<DataGrid
  table={table}
  recordCount={meta?.total ?? 0}
  isLoading={loading}
  …
```

**2. `data-grid-table.tsx:538`** — un repli pour la cellule-squelette :

```tsx
{column.columnDef.meta?.skeleton ?? <Skeleton className="h-4 w-full" />}
```

Ce second point n'est pas cosmétique. Aucune colonne du projet ne définit
`meta.skeleton` — vérifié, zéro occurrence sur tous les tableaux. Sans repli,
les lignes de chargement seraient **vides** au lieu d'être grises : le kit
rendrait des cellules sans contenu. Un repli unique au point d'appel évite de
décrire un squelette colonne par colonne sur les cinq tableaux.

### Ce que ça donne

Le chargement reste **dans** le tableau. La carte n'est plus jamais démontée,
donc le badge, les pastilles et le panneau de filtres tiennent en place — sur
les cinq tableaux de la plateforme d'un coup, sans toucher à un seul hook.

Bilan : deux lignes ajoutées, dix supprimées, et `ReusableTableSkeleton.tsx`
devient du code mort — il n'a pas d'autre appelant (vérifié) et se supprime.

### Une réserve à connaître

Pendant le chargement, la pagination lit `meta?.total ?? 0` et affiche donc
brièvement « 0 ». C'est visible mais mineur, et s'écarte de la demande : je ne
le corrige pas dans le même geste. Si ça gêne, garder le `meta` précédent le
temps de la réponse est un sujet à part.

---

## Ce que cette découverte rend inutile

Les propositions ci-dessous étaient celles de la première passe, **avant** de
constater que le kit gérait déjà le cas. Elles sont conservées pour mémoire :
aucune n'est nécessaire.

### ~~P1~~ — Servir les données précédentes pendant le chargement

```ts
import { keepPreviousData } from '@tanstack/react-query';
// …
placeholderData: keepPreviousData,
```

Une ligne dans `useOrganizations`. TanStack Query v5 est en place (`^5.85.5`),
c'est l'API prévue pour ce cas.

Effet en cascade : sur une clé neuve, `data` n'est plus vide → la condition
`loading && data.length === 0` devient fausse → **plus de squelette, donc plus
de démontage**. La barre d'outils, le badge, les pastilles et le panneau de
filtres restent en place ; seules les lignes se remplacent quand la réponse
arrive.

Cela réglerait le démontage, mais **au prix d'un contresens** : les anciennes
lignes resteraient affichées sans qu'aucun chargement ne se voie, alors que la
demande est justement d'avoir « le chargement du tableau ». Écarté.

### ~~P2~~ — Dire que ça se rafraîchit

P1 seul a un défaut : les anciennes lignes restent affichées sans que rien ne
signale l'attente. Sur un filtre qui réduit 36 000 fiches à 900, l'utilisateur
peut croire que son critère n'a pas été pris.

`useOrganizations` expose déjà `fetching` (`query.isFetching`) et **personne ne
le consomme** — vérifié. Il suffit de le faire descendre dans `ReusableTable` et
de le rendre discrètement : un `aria-busy` sur le corps du tableau et une légère
atténuation, ou un indicateur près du compteur.

Sans objet : les lignes-squelettes du kit **sont** cet indicateur, et elles
disent où l'attente a lieu. `fetching` reste inutilisé, et ce n'est pas grave.

### ~~P3~~ — Le squelette à la bonne profondeur

Même avec P1, le **premier** chargement remplace toute la carte. C'est légitime
— il n'y a encore rien à montrer — mais le défaut de structure reste : le
squelette sort avant la carte, donc n'importe quel état futur « chargement +
données vides » démontera encore la barre d'outils.

Déplacer le squelette **dans** la carte, en remplacement des seules lignes,
rendrait l'en-tête stable par construction plutôt que par effet de bord. Plus
lourd : cela touche `ReusableTable`, donc les cinq tableaux de la plateforme.

C'était la bonne idée, mais je la croyais coûteuse — « cela touche
`ReusableTable`, donc les cinq tableaux ». C'est en réalité **la correction
retenue**, et elle coûte deux lignes parce que le kit porte déjà le mécanisme.
Je l'avais chiffrée sans avoir lu `data-grid-table.tsx`.

### ~~P4~~ — Étendre P1 aux autres listes

Le même montage — les paramètres dans la clé, aucun `placeholderData` — existe
sur **huit** hooks de liste :

`useActivities`, `useAgenda`, `useBackofficeUsers`, `useCampaigns`,
`useOrganizations`, `usePricingGrids`, `useProjects`, `useUsers`.

Les activités, les campagnes et l'agenda ont des filtres, donc le même
clignotement. Sans objet également : la correction vivant dans le composant
partagé, les cinq tableaux qui passent par `ReusableTable` sont servis d'un
coup, sans toucher à un seul hook.

---

## Ce que je ne propose pas

- **Retirer `params` de la clé de cache.** La clé doit décrire la requête ;
  l'amputer ferait servir la liste d'un filtre pour un autre. C'est le défaut
  que le commentaire de `useOrganizations` prévient déjà pour `projectId`.
- **Allonger le débounce.** `FILTER_DEBOUNCE_MS` retarde déjà la requête, donc
  le clignotement ne se produit qu'une fois par changement stabilisé, pas par
  frappe. Le problème n'est pas la fréquence, c'est le démontage.
- **Mémoriser la carte pour éviter son remontage.** On traiterait le symptôme
  au-dessus de sa cause, et un `useMemo` de plus ne survit pas à un `return`
  précoce.

---

## Ce qu'il reste à vérifier

Les deux lignes se lisent dans le code, mais leur effet ne se voit qu'à
l'écran. À contrôler dans le navigateur, sur les cinq tableaux :

1. Poser trois critères d'affilée sur `/organizations` : le panneau doit rester
   ouvert, le badge se mettre à jour, et seules les lignes passer en gris.
2. Le **premier** chargement d'une liste : la carte s'affiche désormais tout de
   suite, avec la recherche utilisable et des lignes grises — au lieu d'une
   carte entièrement grise. C'est un changement d'apparence assumé, à regarder
   sur les cinq écrans.
3. La pagination affichant « 0 » le temps de la réponse (cf. la réserve
   ci-dessus).
