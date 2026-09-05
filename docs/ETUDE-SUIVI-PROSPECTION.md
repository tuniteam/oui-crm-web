# Étude de faisabilité — L1 · US-01-10 · Suivi prospection

> **Trois sources, trois autorités.** Les **règles** viennent du handoff d'API
> (`oui-crm-api/docs/HANDOFF-L1.md` §US-01-10), de la story
> (`SPEC-07-USER-STORIES.md` §US-01-10) et du code du contrôleur, lu pour
> lever les doutes. L'**écran** vient de la maquette V8
> (`RENDER.prospection`). Quand les deux se contredisent, c'est le contrat qui
> gagne et l'écart est signalé ici.
>
> **Vérifié en direct le 04/09/2026**, et c'est ce qui a permis de corriger
> cette étude : le contrat a changé pendant sa rédaction, et le handoff n'est
> à jour qu'à moitié — son encadré annonce la nouvelle forme, son exemple JSON
> montre encore l'ancienne. Les §1 et §2 décrivent **ce que l'API rend**, pas
> ce que le handoff écrit.

---

## 1. Ce que l'API livre

Deux routes, livrées le 02/09/2026, recette d'API 24/24.

| Route | Ce qu'elle fait |
|---|---|
| `GET /organizations/board` | les cinq colonnes du pipeline, cartes comprises |
| `POST /organizations/:id/sales-status` | déplacer une fiche d'un statut à l'autre |

### La réponse réelle

```json
{ "columns": [{
    "salesStatus": "TO_CONTACT",
    "meta": { "total": 3, "page": 1, "limit": 50, "totalPages": 1 },
    "items": [{
      "id": "cmtlx7bub000v5qck1cam6jw1", "name": "Commune de Joigny",
      "salesRep": null, "access": "FULL",
      "priority": "NORMAL", "tags": ["WATCH"],
      "nextActivityAt": "2026-09-15T00:00:00.000Z",
      "nextActivity": { "id": "cmtj…", "type": "MEETING", "title": "RDV physique",
                        "date": "2026-09-15", "time": "14:30" },
      "lastActivityAt": null }]
  }] }
```

**Chaque colonne porte un `meta` standard**, pas `count` et `hasMore` — le
handoff montre encore l'ancienne forme dans son exemple, corrigée dans son
encadré :

| Le handoff écrit | L'API rend |
|---|---|
| `column.count` | `column.meta.total` |
| `column.hasMore` | `column.meta.page < column.meta.totalPages` |
| 200 cartes maximum | `limit` par défaut **50**, maximum 100 |

`salesRep` peut être **nul** : une fiche non affectée existe.

**`nextActivity` a été ajouté le 04/09/2026**, à la demande de cette étude. Il
porte l'action **qui donne `nextActivityAt` et qui trie la colonne** — la plus
proche par date puis par heure — et vaut `null` quand rien n'est planifié.

Trois choix de conception du dev API, tous vérifiés dans le code :

- `title` est le **libellé résolu depuis le référentiel du projet**, pas la clé
  brute : un éditeur qui renomme ses types voit ses propres mots sur les
  cartes. `type` reste la clé, pour le code.
- **Rien n'est dénormalisé** sur l'organisme : pas de `nextActivityType` à
  maintenir à chaque écriture d'action. Le tableau fait une requête de plus
  pour l'ensemble des cartes affichées — pas une par colonne, encore moins une
  par carte.
- Le champ **suit la projection restreinte**. `toBoardItem` construit la carte
  réduite et retourne **avant** d'ajouter `nextActivity`, exactement comme pour
  `priority`, `tags` et les dates : une carte grisée ne renseigne pas sur
  l'activité d'un confrère par la bande.

`time` est **nullable** : une tâche sans heure existe.

### Les règles du contrat

**Toujours les cinq colonnes**, dans l'ordre du pipeline — `NOT_CONTACTED →
TO_CONTACT → IN_PROGRESS → MEETING_SCHEDULED → CLOSED` — même vides.

**Même visibilité que la liste des organismes.** Un rôle `NONE` ne voit pas les
fiches hors périmètre ; un rôle `RESTRICTED` voit une carte **à champs
réduits** — `id`, `name`, `salesRep`, `access` seulement, ni `priority`, ni
`tags`, ni dates — et son déplacement doit être désactivé.

**Tri prochaine action d'abord, puis nom.** `meta.total` est le total réel de
la colonne ; cinquante cartes par page, cent au maximum.

**Transitions libres** entre les cinq statuts, réveil manuel d'une fiche close
compris. Le **seul** déplacement invalide est le dépôt sur sa propre colonne —
`409 ORGANIZATION_INVALID_TRANSITION`, et le front replace la carte.

**`reason` (≤ 500 caractères) part au journal.** Le writer est unique :
cette route et les automatismes d'actions (US-01-08) écrivent par la même
fonction, et le journal distingue `trigger: "manual" | "activity.planned" |
"activity.completed"`.

**`PATCH /organizations/:id` refuse toujours `salesStatus`.** Cette route est
le seul chemin manuel.

---

## 2. Ce que la route accepte, et ce qu'elle refuse

Trois paramètres, éprouvés un par un contre l'API :

| Paramètre | Réponse |
|---|---|
| *(aucun)* | les 5 colonnes, première page de 50 cartes chacune |
| `?limit=1` | `200`, une carte par colonne, `meta.total` inchangé |
| `?page=2&limit=1` | `200`, la page suivante — la pagination fonctionne |
| `?salesStatus=TO_CONTACT` | `200`, **une seule colonne** répond |
| `?search=` `?priority=` `?department=` `?salesRepId=` | **`400 INVALID_DATA`** — « property should not exist » |

**Le tableau se déroule colonne par colonne.** `?salesStatus=X&page=2` rend la
page suivante d'une seule colonne, sans recharger les quatre autres. C'est
exactement ce qu'il faut pour un « Charger la suite » en pied de colonne.

**Aucun filtre métier n'est accepté**, et la validation est stricte : un
paramètre inconnu ne passe pas en silence, il rend `400`. Les quatre filtres de
la maquette ne peuvent donc être que **locaux**.

C'est acceptable sur une colonne entièrement chargée — on ne masque rien que le
serveur ait filtré pour des raisons de droits — mais **faux dès qu'une colonne
est paginée** : filtrer localement chercherait alors dans les cinquante
premières cartes sans le dire. Voir §5.

**Le type de la prochaine action est rendu depuis le 04/09/2026** — voir §1.
La lacune que cette étude avait relevée est levée : « RDV physique · 15/09 à
14:30 » est affichable sans requête supplémentaire.

Reste la même lacune **sur les créneaux d'agenda**, qui portent le libellé du
type et non sa clé, et bloquent encore l'export ICS.

**Le réveil automatique `CLOSED → TO_CONTACT` après six mois n'existe pas.** La
story le prévoit, le handoff l'écarte explicitement du L1 : il demande un
horodatage du statut et un socle de tâches planifiées, tous deux au L2. Le
réveil reste manuel. **L'écran ne doit donc rien promettre à ce sujet.**

---

## 3. Ce que la maquette montre

Écran **Suivi prospection**, deux vues.

**Vue Kanban** — les colonnes de statut, chacune avec son titre, son compte et
une phrase de définition. Chaque carte porte le nom, le département et la
strate, la priorité et la solution en place en pastilles, la prochaine action
avec son signalement de retard, et le commercial affecté. La carte se glisse
d'une colonne à l'autre ; un clic ouvre la fiche.

**Vue Liste** — un tableau : Organisme, Statut, Priorité, Dernière action,
Prochaine action, Commercial.

**Quatre filtres** : recherche, département, priorité, commercial.

### Trois écarts avec le contrat

| La maquette | Le contrat | Faisabilité |
|---|---|---|
| **Exclut « Non contacté »** du tableau (`STAT_COM.filter(s => s !== 'Non contacté')`) et ne montre que les fiches complètes | Rend **toujours les cinq colonnes**, fiches incomplètes comprises | Trancher : masquer la colonne côté front, ou la garder. Voir §5 |
| La carte affiche la **strate** et la **solution en place** | Absentes de la charge utile du tableau | Impossible sans une requête par fiche. À abandonner ou à demander à l'API |
| La carte affiche le **type de la prochaine action** | Rendu depuis le 04/09 par `nextActivity` | Faisable, sans coût |
| Les filtres semblent serveur | La route n'accepte que `salesStatus`, `page` et `limit` | Filtres locaux, partiels tant qu'une colonne n'est pas entièrement chargée |

---

## 4. Ce que le front a déjà

C'est le point le plus favorable de cette étude.

**`src/components/ui/kanban.tsx` existe** — 642 lignes, construit sur
`@dnd-kit`, avec `Kanban`, `KanbanBoard`, `KanbanColumn`, `KanbanItem`,
`KanbanOverlay` et un événement de déplacement typé :

```ts
export interface KanbanMoveEvent {
  event: DragEndEvent;
  activeContainer: string; activeIndex: number;
  overContainer: string;   overIndex: number;
}
```

**Il n'est utilisé nulle part.** `@dnd-kit/core`, `/sortable`, `/modifiers` et
`/utilities` sont déjà des dépendances — c'est aussi ce que la story recommande
côté front. Aucune bibliothèque à ajouter.

Sont également disponibles et éprouvés : `SALES_STATUS_LABELS` et
`PRIORITY_LABELS` (feature organisation), le panneau de fiche piloté par l'URL,
`OrganizationPicker`, et le motif d'invalidation croisée déjà posé sur les
actions et les campagnes.

**L'entrée de menu existe** — `PROSPECTION › Suivi prospection`, routée vers
l'écran d'attente, protégée par `organizations:read`.

---

## 5. Les quatre décisions à prendre

### A. La colonne « Non contacté »

La maquette l'exclut : son tableau ne montre que les fiches **engagées**. Le
contrat la rend toujours.

Sur une base importée, cette colonne peut contenir des milliers de fiches —
donc être plafonnée à deux cents avec `hasMore: true`, et écraser visuellement
les quatre autres.

**Je propose de suivre la maquette** : quatre colonnes affichées, « Non
contacté » masquée, avec une mention du nombre de fiches qui y dorment et un
lien vers la liste des organismes filtrée. Le tableau sert à faire avancer ce
qui est engagé ; entrer dans le pipeline se fait depuis la liste.

### B. Les colonnes longues

La pagination par colonne existe : `meta` dit combien il en reste, et
`?salesStatus=X&page=2` va les chercher.

**Je propose un « Charger la suite » en pied de colonne**, avec le compte —
« 50 sur 1 240 ». C'est mieux que la troncature muette que j'imaginais avant de
vérifier, et cela ne coûte qu'un appel ciblé.

Reste le point délicat : **tant qu'une colonne n'est pas entièrement chargée,
les filtres locaux ne portent que sur ce qui l'est**. Je propose de le dire à
l'écran plutôt que de laisser croire à une recherche complète — filtrer un
échantillon en silence est le défaut qu'on vient de corriger sur le sélecteur
d'organismes, et il serait pire ici : un tableau donne l'illusion de
l'exhaustivité.

### C. Le déplacement optimiste

`@dnd-kit` déplace la carte à l'écran avant que le serveur réponde. Trois cas :
succès, `409` sur la propre colonne — le contrat dit explicitement « replacer
la carte » — et `403` hors périmètre, qui ne devrait pas arriver puisque le
drag est désactivé en amont.

**Je propose l'optimisme avec retour en arrière** : la carte bouge tout de
suite, revient si le serveur refuse, et un message dit pourquoi. Attendre la
réponse rendrait le glisser-déposer poussif.

### D. Le motif du déplacement

`reason` est facultatif et part au journal. Demander un motif à chaque
déplacement alourdirait le geste ; ne jamais le proposer priverait le journal
de ce qui explique un `CLOSED`.

**Je propose de le demander sur le seul passage à `CLOSED`**, où il a une
valeur — pourquoi on abandonne — et de le laisser de côté ailleurs.

---

## 6. Découpage proposé

### Tranche A — Le tableau et le déplacement

Les colonnes, les cartes, le glisser-déposer avec retour en arrière, les cartes
restreintes non déplaçables, le clic vers la fiche, et le motif au passage à
`CLOSED`.

C'est l'US complète du point de vue du contrat : deux routes, rien d'autre.

### Tranche B — Filtres et vue Liste

Les quatre filtres locaux, la vue Liste, et l'honnêteté sur la troncature.

---

## 7. Faisabilité, en un mot

**Élevée.** Deux routes livrées et recettées, un composant kanban déjà écrit et
jamais utilisé, les dépendances en place, les vocabulaires déjà traduits, et un
motif d'invalidation éprouvé sur trois écrans.

Le travail est moins d'écrire un tableau que de trancher les quatre questions
du §5 — dont deux, la colonne « Non contacté » et les deux cents cartes,
touchent à ce que l'écran promet.

**Les deux limites qui restent viennent du contrat** : aucun filtre métier sur
la route, et pas de type d'action sur la carte. Ni l'une ni l'autre n'empêche
de livrer ; la première demande de dire à l'écran ce que les filtres couvrent
réellement.

**À signaler au dev API** : le handoff décrit encore `count` / `hasMore` /
200 cartes dans son exemple et ses puces, alors que son propre encadré annonce
la forme `meta`. Un front qui lirait l'exemple coderait contre un contrat qui
n'existe plus — je l'ai évité en appelant la route.
