# Étude de couverture — L1 · US-01-08 et US-01-09 · Les actions commerciales

> **Deux sources, deux autorités.** Les **règles** viennent du handoff d'API
> (`oui-crm-api/docs/HANDOFF-L1.md`), des DTO, ou d'un appel en direct — jamais
> d'une déduction. L'**écran** vient de la maquette V8, qui fait foi pour les
> dispositions, les parcours et les vocabulaires. Quand les deux se
> contredisent, c'est le contrat qui gagne et l'écart est signalé ici.
>
> **Vérifié le 03/09/2026** contre l'API en marche : DTO lus, huit routes
> appelées, une action créée puis supprimée sur le jeu de démonstration. Les
> §3 bis et §6 ne viennent pas du handoff mais de ces appels.

---

## 1. Pourquoi maintenant

Les campagnes affichent quatre barres de progression. Une seule est alimentée
au L1 — `activities` — et elle reste à zéro tant qu'aucune action n'existe.
L'écran des campagnes promet donc une mesure que rien ne produit.

C'est aussi le « Planifier les relances » de la maquette, absent de l'écran des
campagnes faute de route : planifier relève de `/activities`, pas de
`/campaigns`.

Enfin l'onglet **Actions** de la fiche organisme est un des quatre onglets
laissés en attente à la livraison de l'US-01-03.

Trois écrans attendent donc cette US.

---

## 2. Les routes

| Route | Ce qu'elle fait | Où ça se voit |
|---|---|---|
| `GET /activities` | liste filtrée et paginée | Onglet Actions, tableau de bord |
| `POST /activities` | planifier | Fenêtre « Enregistrer une action » |
| `PATCH /activities/:id` | re-planifier | Bouton Modifier de la frise |
| `POST /activities/:id/complete` | réaliser | Bouton « Marquer réalisée » |
| `POST /activities/:id/cancel` | annuler | Action de la frise |
| `DELETE /activities/:id` | supprimer | Admin et directeur seulement |
| `GET /agenda` | l'agenda, toutes sources | Écran Agenda |
| `GET /activities/:id/ics` | export calendrier | Bouton « Outlook » |

Huit routes. Aucune dépendance non livrée.

---

## 3. Les règles — ce que le contrat impose

### Le commercial est en scope `OWN`, et c'est le serveur qui filtre

Un commercial ne voit et ne touche que **ses** actions. C'est appliqué en SQL :
l'action d'un collègue rend `404`, même en devinant son identifiant. Le
paramètre `userId` est **ignoré** pour un appelant `OWN`.

Conséquence directe : **ne jamais refiltrer côté front.** Ajouter un filtre
« mes actions » côté navigateur donnerait l'illusion d'un contrôle qui existe
déjà, et masquerait des lignes pour les rôles qui ont le droit de tout voir.

### Une action naît toujours `PLANNED`, et se réalise par une route dédiée

`POST /activities` crée en `PLANNED`, propriétaire = l'appelant. Il n'existe
pas de création « déjà réalisée ».

Réaliser passe par `POST /activities/:id/complete`, et **le compte rendu y est
obligatoire** — c'est lui qui rend l'action réelle. Un formulaire qui
enregistrerait une action réalisée sans compte rendu serait refusé par le
serveur.

### Trois automatismes invisibles depuis l'écran

| Quand | La fiche passe à | Journalisé |
|---|---|---|
| Planifier un **rendez-vous** (métadonnée `ics: true` du référentiel) | `MEETING_SCHEDULED` | `activity.planned` |
| Réaliser une action | `IN_PROGRESS` | `activity.completed` |
| Toute écriture | recalcule `lastActivityAt` et `nextActivityAt` | — |

Seules les fiches `NOT_CONTACTED`, `TO_CONTACT` et `IN_PROGRESS` basculent vers
`MEETING_SCHEDULED` ; seules `NOT_CONTACTED` et `TO_CONTACT` basculent vers
`IN_PROGRESS`.

Ces trois effets touchent la fiche organisme et la liste des organismes.
**Chaque écriture d'action doit donc invalider les deux**, sans quoi l'écran
affichera un statut commercial et une date de prochaine action périmés — le
même piège que sur la cible des campagnes.

Une nuance à ne pas rater sur `nextActivityAt` : **une action planifiée en
retard reste la « prochaine »**. Elle ne disparaît pas parce que sa date est
passée.

### Une action close est de l'histoire

`PATCH`, `complete` et `cancel` n'acceptent que `PLANNED`. Sur une action
réalisée ou annulée, le serveur rend `409 ACTIVITY_ALREADY_CLOSED`. L'écran ne
doit donc proposer ces trois actions que sur une ligne `PLANNED`, plutôt que de
les offrir partout et de traduire un refus.

### `time` est une heure locale, affichée telle quelle

`HH:MM`, **jamais convertie**. C'est le piège le plus coûteux de cette US : un
`new Date()` sur une date et une heure séparées, puis un `toLocaleTimeString`,
décalerait tous les rendez-vous d'un fuseau. La chaîne se transporte et
s'affiche telle quelle.

Même règle à l'export : l'ICS porte une heure **flottante** sans fuseau, 14:30
reste 14:30 dans Outlook.

### La création exige un accès géographique `FULL`

Une fiche hors périmètre est visible en projection restreinte, mais on ne peut
pas y planifier d'action — `403 ACCESS_DENIED`. Le bouton doit donc être absent
sur une fiche `RESTRICTED`, pas seulement refusé après le clic.

### L'export ICS ne vaut que pour les rendez-vous

Réservé aux types portant `ics: true` dans le référentiel — RDV physique,
démonstration. Sinon `400 ICS_NOT_AVAILABLE`. Le bouton ne s'affiche donc que
sur ces types, et la réponse étant un `blob`, l'erreur se lit avec
`getBlobApiError` : le corps 4xx arrive en Blob JSON, pas en objet.

Durée de l'événement : `durationMin`, sinon `defaultDurationMin` du
référentiel, sinon 60. Sans heure, événement journée entière.

### Les limites de champs, lues dans les DTO

Le handoff ne les donne pas ; elles viennent des validateurs.

| Champ | Limite |
|---|---|
| `type`, `result` | 60 caractères, clé du référentiel |
| `location` | 255 |
| `report` | 4000 |
| `durationMin` | entier de 1 à 1440 |
| `time` | `HH:MM` strict, `00:00` à `23:59` |
| `completedAt` | ISO 8601, vaut « maintenant » si absent |

`status` est une énumération de **trois** valeurs : `PLANNED`, `DONE`,
`CANCELLED`. « Réalisée » et « annulée » sont donc deux états distincts, pas un
seul état terminal.

### Les vocabulaires viennent du référentiel, jamais du code

Types dans `ACTIVITY_TYPE`, résultats dans `ACTIVITY_RESULT`, tous deux déjà
servis par `/reference-items` et déjà chargés par `useReferenceItems`. Un type
inconnu rend `400 INVALID_REFERENCE_VALUE`.

C'est aussi là que vivent `ics` et `defaultDurationMin`, dans la `metadata` de
chaque entrée.

---

## 3 bis. Ce que seuls les appels en direct ont montré

Quatre points que ni le handoff ni les DTO ne disent, et dont trois sont des
pièges d'affichage.

### `nextActivityAt` est un horodatage, pas un jour

L'action porte `date: "2026-10-15"`, une chaîne de jour. La marque recalculée
sur la fiche, elle, vaut `"2026-10-15T00:00:00.000Z"` — **minuit UTC**.

Un `toLocaleDateString` dessus affichera le **14 octobre** pour tout
utilisateur à l'ouest de Greenwich. C'est le même piège de fuseau que `time`,
à un endroit où on ne l'attend pas : il faut lire la partie jour de la chaîne,
pas construire une date.

### Supprimer une action ne rétablit pas le statut commercial

Constaté : une fiche `TO_CONTACT` passée `MEETING_SCHEDULED` par la
planification d'un rendez-vous **reste `MEETING_SCHEDULED`** après la
suppression de cette action. Seul `nextActivityAt` retombe à `null`.

Le handoff dit « marques recalculées » : ce sont bien les **marques**, pas le
statut. L'écran ne doit donc pas laisser croire que supprimer annule la
bascule — la fiche restera « RDV planifié » sans rendez-vous.

### `initials` peut être nul

L'exemple du handoff montre `"initials": "WB"`. En base, le compte utilisé rend
`"initials": null`. Toute pastille d'avatar doit donc prévoir le cas, plutôt
que de découper une chaîne absente.

### `defaultDurationMin` ne suit pas `ics`

Le référentiel du projet donne :

| Type | `ics` | `defaultDurationMin` |
|---|---|---|
| RDV physique, Démonstration | `true` | 90 |
| **Visioconférence** | `false` | 30 |
| Appel, Email, Relance, Courrier | `false` | — |

La visioconférence a une durée par défaut **sans** être exportable. Le bouton
d'export se conditionne donc à `metadata.ics === true`, jamais à la présence
d'une durée.

L'export lui-même est conforme : `DTSTART:20261015T143000`, sans `Z` — heure
flottante, comme annoncé.

---

## 3 ter. L'agenda

`from` et `to` sont **obligatoires** — une requête par mois affiché. Les
annulées n'apparaissent pas. `isLate` vient du serveur : une action planifiée à
une date passée.

`kinds` accepte déjà quatre sources, mais **seul `ACTIVITY` répond au L1** ;
formations, échéances de contrat et fins de devis arriveront aux lots L2 à L4
**sans changement de contrat**. Les filtres correspondants de la maquette
peuvent donc exister et ne rien rendre — comme les trois barres à zéro des
campagnes, on les affiche en le disant plutôt que de les masquer.

Paginé depuis le 02/09/2026, `limit` par défaut au maximum (100) : le front
peut ignorer `page` tant que `meta.totalPages` vaut 1, mais doit le gérer.

### Les permissions ne sont pas uniformes

`activities:read|create|update|delete`. **Le commercial n'a pas `delete`** ;
seuls l'administrateur et le directeur suppriment.

---

## 4. Ce que la maquette montre

**L'onglet Actions d'une fiche** est une **frise chronologique**, pas un
tableau : chaque action porte son type, son statut en pastille, son résultat,
son compte rendu, sa date et son auteur. Un bandeau au-dessus annonce la
prochaine action et signale le retard en jours. Les lignes réalisées et en
retard se distinguent visuellement.

**L'agenda** propose quatre vues (jour, semaine, mois, liste), un filtre par
collaborateur, un filtre par type, et des cases à cocher par source
d'événement. Chaque événement exportable porte un bouton « Outlook ».

**Cinq écarts à assumer.**

| La maquette | Le contrat | Ce qu'on fait |
|---|---|---|
| Un sélecteur **Statut** (Réalisée / Planifiée) dans le formulaire de création | Toute action naît `PLANNED` ; réaliser est une route dédiée qui exige un compte rendu | Pas de sélecteur. On planifie, puis on réalise depuis la frise |
| **Compte rendu et résultat** dans le même formulaire que la planification | Ils appartiennent à la complétion | Deux formulaires distincts |
| Un sélecteur **Collaborateur** | Le propriétaire est l'appelant, toujours | Champ absent |
| Un bloc **« Enchaîner »** — prochaine action et date | Aucune route ; ce serait deux `POST` successifs | Voir §6, question ouverte |
| `ACTION_TYPES` et `ACTION_RESULTS` **en dur** | Référentiel du projet | Chargés depuis `/reference-items` |

Le premier écart est le plus structurant : il fait passer d'un formulaire
unique à deux parcours, et c'est ce que le contrat impose.

---

## 5. Découpage proposé

### Tranche A — L'onglet Actions d'une fiche

La frise chronologique, le bandeau de prochaine action, la planification, la
complétion et l'annulation. C'est ce qui alimente les compteurs de campagne et
comble le premier des quatre onglets en attente.

Routes : `GET`, `POST`, `PATCH`, `complete`, `cancel`, `DELETE /activities`.

### Tranche B — L'agenda

Les quatre vues, les filtres, la pagination, et l'export ICS avec sa condition
de type et son erreur en Blob.

Routes : `GET /agenda`, `GET /activities/:id/ics`.

Une tranche A livrable seule et immédiatement utile ; une tranche B qui ne
dépend que d'elle.

---

## 6. Questions ouvertes

> **Les deux questions sont tranchées** (03/09/2026). Le bloc « Enchaîner » se
> fera par un `next` optionnel sur `complete`, côté serveur ; et le statut non
> rétabli est un défaut, signalé dans
> [SIGNALEMENT-API-ACTIVITES.md](SIGNALEMENT-API-ACTIVITES.md). Les deux
> touchent la même transaction et seront traités ensemble.

**Le bloc « Enchaîner » de la maquette.** Il propose de planifier la prochaine
action dans le formulaire de la précédente. Aucune route ne le fait en un
appel, mais deux `POST` successifs le feraient. Faut-il le porter, ou l'omettre
comme « Planifier les relances » l'a été sur les campagnes ? L'omettre est plus
sûr — un enchaînement à deux appels peut réussir à moitié — mais c'est une
commodité réelle pour un commercial qui sort d'un rendez-vous.

~~**La suppression définitive.**~~ **Tranchée.** Le service ne porte **aucun
garde-fou** : pas d'équivalent du `409` des campagnes, quel que soit le statut
de l'action. Elle supprime, recalcule les marques, et journalise. La question
qu'elle soulève est ailleurs, et elle est d'interface : puisque la suppression
ne rétablit pas le statut commercial (§3 bis), faut-il l'avertir dans la
confirmation ? Je propose oui.

---

## 7. Recommandation

**Tranche A d'abord.** Elle débloque l'onglet Actions, alimente le compteur des
campagnes, et livre les trois automatismes de statut commercial — qui sont la
vraie valeur de cette US, puisqu'ils font avancer la fiche toute seule.

L'agenda ensuite : plus visible, mais il ne produit rien qu'un écran de lecture
tant que les actions n'existent pas.
