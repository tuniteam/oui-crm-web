# Signalement API — L1 · US-01-08 · `MEETING_SCHEDULED` ne redescend jamais

> Émis par le front le 03/09/2026, avant le développement de l'onglet Actions.
> Constaté en direct sur l'API en marche (jeu de démonstration Périscolia),
> puis confirmé dans `src/activities/activities.service.ts`.

---

## Le défaut

Planifier un rendez-vous fait monter le statut commercial de la fiche à
`MEETING_SCHEDULED`. **Rien ne le fait jamais redescendre** — ni l'annulation
du rendez-vous, ni sa suppression, ni le changement de son type.

La fiche affiche donc « RDV planifié » alors qu'aucun rendez-vous n'existe, et
l'état ne peut plus être corrigé par aucun geste de l'utilisateur.

## Reproduction

Trois chemins, tous vérifiés ou lus dans le service.

### 1 — Suppression (constaté en direct)

```
Fiche « CC du Pays de Château-Gontier », statut TO_CONTACT, nextActivityAt null.

POST /activities { organizationId, type: "MEETING", date: "2026-10-15",
                   time: "14:30", durationMin: 90 }
  → 201
  → fiche : MEETING_SCHEDULED, nextActivityAt 2026-10-15T00:00:00.000Z

DELETE /activities/:id
  → 204
  → fiche : MEETING_SCHEDULED, nextActivityAt null        ← attendu : IN_PROGRESS
```

### 2 — Annulation

`POST /activities/:id/cancel` — même mécanique. `cancel` recalcule les marques
(`activities.service.ts:201`) sans toucher au statut.

### 3 — Changement de type (chemin non couvert par la discussion initiale)

`PATCH /activities/:id` re-déclenche la bascule quand le nouveau type porte
`ics` (`activities.service.ts:134`), mais **ne la défait pas** quand le type
cesse d'être un rendez-vous. Faire passer une action `MEETING` en `CALL` laisse
donc la fiche en `MEETING_SCHEDULED`, sans qu'aucun rendez-vous n'ait jamais
été honoré ni annulé.

## Où c'est

| Endroit | Ce qu'il fait |
|---|---|
| `activities.service.ts:95` | `create` — `if (type.ics) bumpSalesStatus(… MEETING_SCHEDULED …)` |
| `activities.service.ts:134` | `update` — même bascule, jamais l'inverse |
| `activities.service.ts:201` | `cancel` — `recomputeActivityMarks` seul |
| `activities.service.ts:218` | `remove` — `recomputeActivityMarks` seul |

## La correction proposée

**Ne pas revenir à l'état antérieur.** Redescendre à `TO_CONTACT` effacerait
l'information qu'il y a eu des échanges entre-temps — le remède serait pire que
le mal.

La règle sûre : à l'annulation, à la suppression, ou au changement de type
d'une action de rendez-vous, si la fiche est en `MEETING_SCHEDULED` et qu'il ne
reste **aucun rendez-vous planifié**, la faire redescendre à `IN_PROGRESS` —
pas plus bas, puisqu'il y a bien eu contact.

### Deux précisions

**« Aucun rendez-vous planifié », pas « à venir ».** Un rendez-vous planifié à
une date passée est en retard, pas annulé : il reste à honorer, et la fiche
doit rester `MEETING_SCHEDULED`. C'est cohérent avec `nextActivityAt`, qui
garde une action en retard comme « prochaine ».

**`recomputeActivityMarks` ne répond pas à la question telle quelle.** Il
cherche le `_min(date)` des `PLANNED`, **tous types confondus**
(`activities.utils.ts:145-147`). Un appel planifié suffirait donc à le
satisfaire alors qu'aucun rendez-vous n'existe. La condition demande une
requête distincte : `PLANNED` **et** type portant `ics: true`.

## La cause de fond

`MEETING_SCHEDULED` est **stocké** alors qu'il est **déductible** — à la
différence de `nextActivityAt`, qui est recalculé à chaque écriture. C'est
cette asymétrie qui produit l'incohérence : un champ dérivé qu'on met à jour
dans un sens seulement finit toujours par mentir.

## Ce que le front fait en attendant

Rien qui masque le défaut. L'écran affichera le statut rendu par l'API, et la
confirmation de suppression **avertira que le statut commercial ne reviendra
pas en arrière** — plutôt que de laisser croire à une annulation propre.

Si la correction arrive, cet avertissement saute et un scénario de recette
prend sa place.

---

## Point lié — `next` optionnel sur `complete`

Arbitré le 03/09/2026, à traiter dans la même transaction que ce défaut.

`POST /activities/:id/complete` accepte un `next` optionnel qui crée la relance
dans la même transaction :

```json
{ "report": "…", "result": "MEETING_BOOKED",
  "next": { "type": "CALL", "date": "2026-10-22", "time": "09:30",
            "contactId": "cmtj…", "campaignId": "cmtj…" } }
```

`type` et `date` obligatoires ; `time`, `contactId` et `campaignId`
facultatifs, pour que la relance hérite du contexte de l'action qu'elle
prolonge. `next` absent = comportement actuel, donc additif.

**Pourquoi côté serveur plutôt que deux appels côté front.** Les deux écritures
ne sont pas de même gravité. Un compte rendu enregistré est irréversible pour
l'utilisateur — il ne le ressaisira pas. Une relance manquante est invisible
tant qu'il ne rouvre pas la fiche. Laisser le front recoller les morceaux, c'est
lui faire gérer un état que l'API peut rendre impossible.

Le rejet du type par le référentiel se produirait avant l'écriture, donc en
`400` propre, sans rien avoir enregistré.
