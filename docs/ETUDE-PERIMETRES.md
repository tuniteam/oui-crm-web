# Étude — Couvrir les périmètres côté front (US-00-07)

**Date :** 2026-09-03
**Règles :** `../oui-crm-api/docs/HANDOFF-L0.md` §US-00-07 et §US-00-05,
`../oui-crm-api/docs/HANDOFF-L1.md` §US-01-11, et la forme réelle des réponses
vérifiée contre l'API en direct.
**Écran :** `docs/OuiCRM_V8.html` (`SETPANE.perimetres`, `openPerimetreModal`).

> La maquette donne des dispositions, des libellés et des parcours — **jamais
> des règles**. Tout ce qu'elle calcule, elle le fait dans le navigateur sur des
> données factices. Les règles citées ici viennent du contrat.

Cinq routes livrées, **zéro couverte**. C'est le socle qui débloque trois autres
chantiers.

---

## 1. Pourquoi celui-ci d'abord

Un périmètre n'est pas un écran d'administration parmi d'autres : c'est **du
contrôle d'accès**. Il décide de ce que chaque utilisateur voit dans la base
d'organismes. Trois manques en dépendent directement :

| Ce qui est bloqué | Où | Ce qu'il manque |
|---|---|---|
| Affecter un périmètre à un utilisateur | US-00-05, fiche utilisateur | il faut une liste de périmètres à proposer |
| Supprimer une campagne citée par un périmètre | US-01-11, décision D7 | il faut pouvoir dissocier |
| Comprendre pourquoi une fiche est « hors de votre périmètre » | US-01-01, déjà livré | l'utilisateur voit la mention, sans jamais voir le périmètre |

Le troisième point est le plus parlant : l'écran des organismes affiche déjà
« hors de votre périmètre » sur des lignes en projection restreinte, et
**personne dans l'application ne peut consulter ce périmètre**.

---

## 2. Les cinq routes

| Route | Ce qu'elle sert | Permission |
|---|---|---|
| `GET /geo/regions` | les 14 régions et leurs départements — table **statique**, à mettre en cache | `scopes:read` |
| `GET /scopes` | la liste, avec `usersCount` et `resolvedDepartments` | `scopes:read` |
| `POST /scopes` | création | `scopes:update` |
| `PATCH /scopes/:id` | modification, **listes remplacées en bloc** | `scopes:update` |
| `DELETE /scopes/:id` | suppression, refusée si le périmètre est utilisé | `scopes:update` |

Forme réelle d'un périmètre, relevée sur l'API :

```
id, name, description, regions[], departments[], portfolioOnly, nature,
campaignIds[], usersCount, resolvedDepartments[]
```

---

## 3. Ce qui décide du travail

### Un périmètre est une intersection de trois axes

- **Géographie** — des régions et/ou des départements explicites.
- **Portefeuille personnel** (`portfolioOnly`) — seulement les fiches dont
  l'utilisateur est commercial, consultant ou formateur affecté.
- **Nature** (`nature`) — `ALL`, `PROSPECTS` ou `CUSTOMERS`.

Les trois se **combinent par intersection**, pas par addition. L'écran doit le
dire, sinon un administrateur croira élargir un accès en cochant une case
supplémentaire alors qu'il le restreint.

### `resolvedDepartments` est calculé, et le vide veut dire « tout »

Le serveur déplie les régions, ajoute les départements explicites, dédoublonne
et trie. **Une liste vide signifie tout le territoire**, pas « aucun
département ». C'est le piège le plus coûteux de cette US : afficher « 0
département » sur un périmètre national serait un contresens exact.

À afficher comme la strate d'un organisme — **rendu par l'API, jamais
recalculé**. La V8, elle, le recalcule dans le navigateur.

### Les listes sont remplacées en bloc

`PATCH` ne fusionne pas : `regions` et `departments` envoyés remplacent
l'existant. Envoyer `{ regions: ['Bretagne'] }` sur un périmètre qui portait
aussi des départements explicites **efface ces départements**. Le formulaire
doit donc toujours poster l'état complet des deux listes.

### Cocher une région coche ses départements, chacun restant décochable

Le contrat sépare `regions[]` et `departments[]`, et le serveur déplie les
régions lui-même : `{ regions: ['Corse'], departments: ['06'] }` rend
`resolvedDepartments: ['06', '2A', '2B']` — vérifié dans la recette de l'API.

Il n'existe donc **aucun moyen d'exprimer « la Normandie sauf l'Orne » par une
région** : une région amputée doit partir en départements explicites. La
conversion est à faire côté front, à l'enregistrement. C'est une conséquence du
contrat, pas un choix d'interface — la maquette ne fait qu'en proposer le
geste, cocher une région pour cocher ses départements.

### La suppression est refusée si le périmètre sert

`409 SCOPE_IN_USE`. Le contrat ne documente pas de `meta` détaillant les
utilisateurs concernés — contrairement aux campagnes, où `meta.scopes` nomme les
gêneurs. **`usersCount` est donc la seule information exploitable**, et elle est
déjà dans la liste : l'écran peut prévenir avant même la tentative.

> **À confirmer avec l'équipe API** : `409 SCOPE_IN_USE` porte-t-il un
> `messages.meta` nommant les utilisateurs ou les campagnes ? Si oui, l'écran
> peut guider la dissociation comme pour les campagnes. Sinon, il se contente de
> dire combien d'utilisateurs sont affectés.

### `campaignIds` est arrivé au L1

Le champ n'est pas dans le contrat L0 d'origine ; il a été ajouté avec les
campagnes, et il est bien présent dans la réponse — vérifié. C'est lui qui
permettra de dissocier une campagne d'un périmètre, via `PATCH /scopes/:id
{ campaignIds }`.

Tant que l'écran des campagnes n'existe pas, ce champ n'a rien à afficher
d'utile. **Le prévoir dans le type, ne pas l'exposer dans le formulaire.**

---

## 4. Ce que la maquette montre

Une **liste de cartes**, chacune portant le nom, la description, le nombre
d'utilisateurs et le nombre de fiches couvertes, plus les actions Modifier et
Supprimer. Puis une **fenêtre** : nom, nature, description, la case
« Limiter au portefeuille personnel » avec son explication, et enfin les
**14 régions dépliables** avec leurs départements en cases à cocher, surmontées
d'un compteur vivant.

Deux écarts à assumer :

- La V8 affiche **le nombre de fiches couvertes** par périmètre, calculé dans le
  navigateur en parcourant les organismes. L'API ne rend pas ce compte, et la
  liste est paginée : le calculer côté front donnerait un nombre faux. À
  remplacer par `usersCount`, que l'API rend — ou à demander à l'API.
- Le compteur vivant de la fenêtre (« N départements sélectionnés ») se calcule
  localement à partir des cases : c'est une aide à la saisie, pas une donnée
  serveur. Légitime, à condition de ne pas le confondre avec
  `resolvedDepartments`, qui vient du serveur après enregistrement.

---

## 5. Où placer l'écran

La V8 en fait un **panneau de Paramètres** (`SETPANE.perimetres`). Notre menu
projet porte une entrée **Périmètres** distincte, aujourd'hui routée vers
l'écran d'attente.

C'est exactement la situation des **Référentiels**, tranchée en US-00-08 :
l'entrée de menu redirige vers le panneau de Paramètres. Reprendre ce traitement
donne une application cohérente et évite un cinquième écran de premier niveau.

**Recommandation :** un cinquième panneau de Paramètres, l'entrée de menu
« Périmètres » redirigeant dessus, comme les Référentiels.

---

## 6. Découpage proposé

### Tranche A — Lire

Le panneau, la liste des périmètres, `usersCount`, et les départements résolus
rendus par l'API. Cache de `GET /geo/regions`, table statique.

Routes : `GET /geo/regions`, `GET /scopes`.

Elle règle à elle seule le manque le plus visible : un utilisateur qui voit
« hors de votre périmètre » peut enfin savoir de quoi il s'agit.

### Tranche B — Écrire

La fenêtre : les trois axes, les régions dépliables, la conversion
région-entière / départements-explicites à l'enregistrement, et le remplacement
en bloc des listes.

Routes : `POST /scopes`, `PATCH /scopes/:id`.

### Tranche C — Supprimer, et affecter

La suppression avec son refus, **et** le sélecteur de périmètre sur la fiche
utilisateur — c'est le déblocage attendu d'US-00-05, et il ne coûte qu'un
`<Select>` une fois la liste disponible.

Routes : `DELETE /scopes/:id`, plus `scopeId` dans `PATCH /users/:id`.

---

## 7. Ce que je recommande

**Les trois tranches d'affilée.** L'US est petite — cinq routes, un formulaire,
pas de contrat retors — et elle débloque trois chantiers. La couper serait plus
coûteux que la faire.

**Avant de commencer**, deux questions à poser à l'équipe API :

1. `409 SCOPE_IN_USE` porte-t-il un `messages.meta` nommant ce qui bloque ?
2. Le nombre de fiches couvertes par un périmètre est-il obtenable, ou faut-il
   s'en tenir à `usersCount` ?

Aucune des deux n'empêche de démarrer : la tranche A ne dépend ni de l'une ni de
l'autre.

**Ensuite seulement, les campagnes.** Avec les périmètres en place, la
suppression d'une campagne bloquée par un périmètre devient guidable, et
l'arbitrage laissé ouvert dans `ETUDE-CAMPAGNES.md` disparaît de lui-même.
