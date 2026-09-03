# Question API — L1 · `GET /campaigns/:id/results` · que compte `totals.activities` ?

> Émise par le front le 03/09/2026, pendant l'étude de l'onglet Actions.
> Protocole exécuté en direct sur l'API en marche (jeu de démonstration
> Périscolia), en tant que Wiem (`SALES_REP`, périmètre Normandie).

---

## Pourquoi la question se pose

Le contrat décrit précisément la pagination de `/campaigns/:id/results`, son
filtrage par périmètre, `access` par ligne et l'absence de `lastActivityAt` en
projection restreinte (`HANDOFF-L1.md`, § `GET /campaigns/:id/results`).
Il précise aussi que `totals` porte sur toute la campagne et non sur la page.

**Il ne dit nulle part ce que `activities` dénombre.** Le protocole ci-dessous
montre que le compteur suit le lien `campaignId` porté par l'action, et non le
travail réalisé sur une fiche ciblée. Les deux lectures sont défendables ; le
front ne veut pas trancher à votre place.

## Protocole exécuté

Organisme : « Commune de Caen », dans le périmètre de l'opérateur.
Utilisateur : `email.ouicrm+wiem@gmail.com`. En-tête `x-project-id` du projet
Périscolia.

| # | Action | Appel | Observé |
|---|---|---|---|
| 1 | Créer une campagne | `POST /campaigns { name }` | `201` |
| 2 | Cibler l'organisme | `POST /campaigns/:id/organizations { ids: [orgId] }` | `{ added: 1, alreadyIn: 0, skipped: 0 }` |
| 3 | Créer une action depuis la fiche, **sans `campaignId`** | `POST /activities { organizationId, type: "CALL", date }` | `201` |
| 4 | La marquer réalisée | `POST /activities/:id/complete { report }` | `200` |
| 5 | Lire les statistiques | `GET /campaigns/:id/results` | `totals.activities = 0` |
| 6 | Rattacher l'action après coup | `PATCH /activities/:id { campaignId }` | `409 ACTIVITY_ALREADY_CLOSED` |
| 7 | Relire les statistiques | `GET /campaigns/:id/results` | `totals.activities = 0` — définitif |
| 8 | Créer une action **avec `campaignId`**, laissée `PLANNED` | `POST /activities { …, campaignId }` | `201` |
| 9 | Relire les statistiques | `GET /campaigns/:id/results` | `totals.activities = 1` |

L'étape 6 est conforme au contrat — `PATCH /activities/:id` ne vaut que pour une
action `PLANNED`, « une action réalisée ou annulée est de l'histoire ». Elle
n'est pas contestée ici ; elle est rappelée parce qu'elle rend le rattachement
après coup **définitivement impossible**, ce qui pèse sur la réponse attendue.

## Ce que le protocole établit

1. Le compteur suit **le lien `campaignId`**, pas la fiche ciblée : une action
   réalisée sur un organisme de la cible ne compte pas si elle n'a pas été
   créée avec `campaignId`.
2. Il compte une action **encore planifiée** (étape 9) : il mesure l'intention,
   pas le travail fait.
3. Combiné à l'étape 6, l'oubli du `campaignId` **à la création** est
   irrattrapable.

## Les deux lectures

**A — le compteur mesure les actions rattachées à la campagne.**
C'est le comportement observé. Il suppose que l'utilisateur désigne la campagne
au moment où il crée l'action.

**B — le compteur mesure l'activité sur les organismes ciblés.**
La présence de `data[].activities` par organisme, à côté de `salesStatus` et
`lastActivityAt`, va plutôt dans ce sens : la ligne décrit ce qui s'est passé
sur la fiche, pas ce qui a été rattaché à la campagne.

## Ce que cela change pour nous

Le formulaire d'action du front — `src/features/activity/components/ActivityWindow.tsx` —
expose type, date, heure, durée, lieu, contact et compte rendu. **Il n'a pas de
champ campagne.** `campaignId` existe dans nos types mais n'est alimenté par
aucun écran.

Conséquence dans l'état actuel : **toute action saisie dans l'interface part
sans `campaignId`**, donc `totals.activities` affiche `0` en permanence sur
l'écran de campagne (`CampaignResultsPanel`, barre « Actions » de la maquette).
Le protocole ne décrit donc pas un cas limite, mais le comportement nominal du
produit tel qu'il est livré.

- Si la réponse est **A**, le développement est de notre côté : ajouter un
  champ « Campagne » au formulaire d'action, alimenté par les campagnes qui
  ciblent l'organisme, pré-rempli quand on part d'une campagne — et rendre
  visible que l'oubli est irrattrapable.
- Si la réponse est **B**, le changement est de votre côté et le front n'a rien
  à faire.

## Questions

1. **Quelle lecture fait foi, A ou B ?**
2. Si c'est **A** : le compteur doit-il rester sur toutes les actions liées, ou
   se limiter aux actions **réalisées** ? Compter une action seulement planifiée
   dans un tableau de résultats nous paraît discutable — l'étape 9 le fait
   aujourd'hui.
3. Si c'est **A** toujours : y a-t-il un moyen prévu de rattacher une action
   déjà réalisée, ou faut-il assumer l'irrattrapable et le dire à l'utilisateur
   au moment de la saisie ?
4. Quelle que soit la réponse : peut-elle être **écrite dans la section
   `GET /campaigns/:id/results`** du handoff ? C'est la seule ligne du contrat
   dont le sens ne se déduit pas de la charge utile.
