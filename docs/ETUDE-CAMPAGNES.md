# Étude — Couvrir les campagnes côté front (L1 · US-01-11)

**Date :** 2026-09-03
**Règles :** `../oui-crm-api/docs/HANDOFF-L1.md` §L1 · US-01-11 et §L1 · US-01-05.
**Écran :** `docs/OuiCRM_V8.html` (`RENDER.campagnes`, `openCampaignModal`).

> La maquette donne des dispositions, des libellés et des parcours — **jamais
> des règles**. Tout ce qu'elle calcule, elle le fait dans le navigateur sur des
> données factices. Les règles citées ici viennent du contrat.

Neuf routes livrées côté API, **zéro couverte** par le front. Ce document dit ce
qu'il faut construire, dans quel ordre, et ce qui bloque.

---

## 1. Ce qu'est une campagne

> « A frozen target list, worked and measured. The results are computed on
> demand, never stored. » — recette de l'API, `campaigns.feature`

La maquette dit la même chose en français — « un ciblage nommé, daté et mesuré »
— mais c'est la définition du back qui fait foi.

Trois idées portent tout le reste, et aucune ne se devine depuis la maquette :

- **La cible est figée.** `criteria` (« département 89 ») est **documentaire** :
  il dit comment la liste a été construite, il ne la reconstruit pas. Modifier
  les critères ne change pas la cible. L'écran doit donc présenter les critères
  comme une note, jamais comme un filtre actif — sans quoi l'utilisateur croira
  que sa campagne se met à jour toute seule.
- **Les résultats sont calculés à la demande**, jamais stockés. Au L1, seul
  `activities` est alimenté : `opportunities`, `quotes` et `signed` restent à
  zéro, **sans changement de contrat à venir**. Les afficher à zéro est correct ;
  les masquer priverait l'écran de sa promesse.
- **Une campagne citée par un périmètre est du contrôle d'accès.** Sa
  suppression est refusée tant qu'un périmètre la référence.

---

## 2. Les neuf routes

| Route | Ce qu'elle sert | Écran |
|---|---|---|
| `GET /campaigns` | la liste, avec `organizationsCount` et `results` | Liste des campagnes |
| `POST /campaigns` | création | Fenêtre « Nouvelle campagne » |
| `PATCH /campaigns/:id` | modification | Même fenêtre, en édition |
| `POST /campaigns/:id/status` | `DRAFT → ACTIVE → CLOSED`, et réouverture | Action sur la carte |
| `GET /campaigns/:id/organizations` | la cible figée, paginée | Panneau « Voir les N organismes » |
| `POST /campaigns/:id/organizations` | ajouter à la cible | Sélecteur d'organismes |
| `DELETE /campaigns/:id/organizations/:orgId` | retirer de la cible | Ligne du panneau |
| `GET /campaigns/:id/results` | le détail par organisme | Onglet « Résultats » |
| `DELETE /campaigns/:id` | suppression | Action sur la carte |

---

## 3. Les pièges du contrat

Ce qui coûtera du temps si on ne le lit pas d'abord.

### L'ajout à la cible ne échoue jamais globalement

`POST /campaigns/:id/organizations` répond `200 { added, alreadyIn, skipped }`.
Il est **idempotent** : re-poster les mêmes identifiants les compte dans
`alreadyIn`, ce n'est pas une erreur. `skipped` regroupe les fiches inconnues,
supprimées, ou **hors du périmètre géographique de l'appelant**.

L'écran doit donc rendre compte des trois nombres — « 38 ajoutés, 4 déjà
présents, 2 ignorés » — au lieu d'un « enregistré » qui masquerait que six
fiches n'ont pas suivi. Limite dure : **500 identifiants par appel**.

### Cibler une fiche change son statut commercial

Une fiche `NOT_CONTACTED` ajoutée à une campagne passe **`TO_CONTACT`**,
journalisé avec `trigger: "campaign.targeted"`. C'est un effet de bord invisible
depuis l'écran des campagnes, et il se produit aussi via les actions groupées.
La liste des organismes doit donc être invalidée après un ajout, sinon elle
affichera un statut périmé.

### Les transitions de statut sont contraintes

`DRAFT → ACTIVE → CLOSED`, et une campagne close **se rouvre** (`CLOSED →
ACTIVE`). Tout autre mouvement, **le statut identique compris**, rend
`409 INVALID_STATUS_TRANSITION`. L'écran ne doit proposer que les transitions
légales, plutôt que d'offrir les trois statuts et de traduire un refus.

### La suppression peut être bloquée par un périmètre

`409 CAMPAIGN_IN_USE_BY_SCOPE`, avec les périmètres fautifs dans
**`messages.meta.scopes`** `[{ id, name }]`. Le contrat demande au front de
guider la dissociation — `PATCH /scopes/:id { campaignIds: [...] }` — puis de
rejouer la suppression. **Aucun nettoyage automatique** : un périmètre est du
contrôle d'accès, il ne se modifie pas dans le dos de son administrateur.

C'est le seul point qui dépend d'un écran absent. Voir §5.

### Les permissions ne sont pas uniformes

`campaigns:read|create|update|delete`. **Le commercial n'a pas `delete`** ; le
formateur n'a **rien** du tout, pas même la lecture. L'entrée de menu doit
disparaître pour lui, et pas seulement l'écran être refusé.

---

## 4. Ce que la maquette montre

Des **cartes**, deux par ligne, pas un tableau. Chaque carte porte :

- le nom, le responsable, la période, le statut en pastille ;
- l'objectif en texte libre ;
- le critère de ciblage dans un encart, en lecture seule ;
- **quatre barres de progression** — Contactées, RDV obtenus, Opportunités,
  Signées ;
- deux actions : « Voir les N organismes », « Planifier les relances ».

La V8 calcule ces barres dans le navigateur en parcourant les organismes. **Ici
elles viennent de l'API** (`results`), comme la strate : on affiche ce que le
serveur rend, on ne recalcule pas.

Deux écarts à assumer, dans la lignée de ce qui a été fait sur les organismes :

- **« Planifier les relances »** : le bouton n'a pas de route de campagne
  derrière lui. Planifier une action relève de `/activities` (L1 · US-01-08, livrée
  côté API, sans écran). Le bouton n'a donc pas sa place tant que cet écran
  n'existe pas.
- **Le ciblage de la fenêtre de création** propose six filtres pour construire
  la liste. Or `criteria` est documentaire et la cible se remplit par une route
  dédiée : la fenêtre doit donc saisir des critères **descriptifs**, et l'ajout
  d'organismes se faire séparément. Reprendre la maquette telle quelle
  suggérerait un ciblage automatique qui n'existe pas.

---

## 5. Dépendances — toutes livrées côté API

| Ce dont on a besoin | Route | État API | État front |
|---|---|---|---|
| Choisir le responsable | `GET /users` | livrée | **déjà utilisée** (écran Utilisateurs) |
| Alimenter la cible depuis la liste d'organismes | `POST /organizations/bulk`, action `ADD_TO_CAMPAIGN` | livrée | absente |
| Dissocier une campagne d'un périmètre | `PATCH /scopes/:id`, champ `campaignIds` | livrée | absente |

**Correction à une affirmation antérieure :** la recette du front dit que les
actions groupées « ne sont pas livrées côté API ». C'est faux — `POST
/organizations/bulk` est livrée, avec cinq actions dont `ADD_TO_CAMPAIGN`. La
ligne est à corriger.

`ownerId` étant facultatif (il vaut l'appelant par défaut), le sélecteur de
responsable n'est pas bloquant : un commercial qui n'a pas `users:read` crée
une campagne dont il est responsable, sans sélecteur.

---

## 6. Découpage proposé

Trois tranches, chacune livrable seule.

### Tranche A — Lire et créer

Liste en cartes, fenêtre de création et de modification, changement de statut.
La campagne existe, se nomme, se date, s'ouvre et se ferme. Sa cible est vide.

Routes : `GET`, `POST`, `PATCH /campaigns`, `POST /campaigns/:id/status`.

C'est la tranche qui rend l'écran utile le plus vite, et elle ne dépend de rien.

### Tranche B — La cible

Panneau « Voir les N organismes » : la liste figée, l'ajout par sélecteur, le
retrait ligne à ligne. Le compte rendu en trois nombres, et l'invalidation de la
liste des organismes à cause du passage `NOT_CONTACTED → TO_CONTACT`.

Routes : `GET`, `POST`, `DELETE /campaigns/:id/organizations`.

### Tranche C — Mesurer et supprimer

Les quatre barres alimentées par `results`, le détail par organisme, et la
suppression avec son cas bloqué.

Routes : `GET /campaigns/:id/results`, `DELETE /campaigns/:id`.

**Réserve sur la suppression bloquée.** Sans écran de périmètres, le front peut
nommer les périmètres fautifs — ils sont dans `meta.scopes` — mais pas offrir la
dissociation. Deux options :

1. **Nommer et s'arrêter** : « Cette campagne est utilisée par les périmètres X
   et Y. Détachez-la avant de la supprimer. » Honnête, mais l'utilisateur n'a
   nulle part où aller.
2. **Développer L0 · US-00-07 (périmètres) d'abord** : cinq routes livrées, aucun
   écran. La dissociation devient alors possible et la boucle se referme.

C'était le seul arbitrage produit de cette étude. **Il est tranché** : les
périmètres passent avant — voir `ETUDE-PERIMETRES.md`. L'option 1 devient
inutile.

---

## 7. Ce que je recommande

**Tranches A et B d'abord** : elles couvrent sept des neuf routes, ne dépendent
de rien, et donnent un écran complet — on crée une campagne, on la remplit, on
la suit.

**La tranche C ensuite**, avec l'option 1 pour la suppression bloquée : nommer
les périmètres et s'arrêter là. C'est un cas rare, et il vaut mieux un message
exact qu'un écran de périmètres bâclé pour l'occasion.

**`ADD_TO_CAMPAIGN` depuis la liste d'organismes** (L1 · US-01-05) est le complément
naturel de la tranche B, et il apporte avec lui les quatre autres actions
groupées. À traiter comme une US à part entière, pas comme un appendice.

---

## 8. À corriger avant de commencer

- La recette front affirme qu'L1 · US-01-05 n'est pas livrée côté API. Elle l'est.
- La ligne « Filtre par commercial » de L1 · US-01-01 reste bloquée sur le même
  besoin — la liste des membres du projet — que le sélecteur de responsable ici.
  Les deux se débloquent ensemble.
