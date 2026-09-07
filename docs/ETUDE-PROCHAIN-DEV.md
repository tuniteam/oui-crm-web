# Que développer ensuite — état au 04/09/2026

> Établi depuis `docs/INVENTAIRE-API-FRONT.html`, régénéré ce jour, **et
> vérifié** : l'inventaire sous-estime la couverture, voir §1. Les routes
> marquées « à faire » côté API ne sont pas développables ; seules comptent
> celles qui sont **livrées et absentes du front**.

---

## 1. L'inventaire ment un peu, et il faut le savoir

Il annonce **64 routes consommées sur 169 (38 %)**. Le vrai chiffre est plus
proche de **74 sur 169 (44 %)**, pour deux raisons vérifiées.

**Sept lignes du back-office sont fausses.** `/backoffice/users` et
`/backoffice/roles` sont marquées « absente du front » alors que l'écran
Opérateurs les appelle. La cause est dans le générateur : il ne lit que les
constantes déclarées en **objet** — `XXX_ROUTES = { … }` — et la feature
back-office les déclare en **chaîne simple** :

```ts
export const BACKOFFICE_USERS_API = '/backoffice/users';
```

Dix-sept constantes du front sont des objets, deux sont des chaînes. Ce sont
exactement ces deux-là qui échappent au décompte.

**Trois appels du front ne trouvent pas leur ligne** — le générateur les
signale lui-même : `/agenda`, `/campaigns/:id/results`, `/users/:id/email`.
Consommés, mais non comptés.

**À corriger dans le générateur**, pas dans l'inventaire de l'API : reconnaître
les constantes déclarées en chaîne, et rapprocher les trois routes orphelines.
Une demi-heure, et le tableau redevient une source fiable.

---

## 2. Ce qui est livré côté API et absent du front

### Lot L1 — celui qu'on termine

| US | Routes | Ce que ça donne |
|---|---|---|
| **US-01-05** · Actions groupées | `POST /organizations/bulk` | affecter, changer un statut, ajouter à une campagne ou supprimer depuis une sélection |
| **US-01-09** · Export ICS | `GET /activities/:id/ics` | le bouton Outlook d'une action |
| **US-01-06/07** · Import et export | `/import`, `/import/template`, `/import/errors-pdf`, `DELETE /import/batches/:id`, `POST /organizations/import-territory`, `POST /exports/organizations-list` | reprise de l'existant, gabarits, import de territoire |
| — | `GET /search` | recherche transverse |

### Lot L0 — des écrans d'administration jamais faits

`GET /permissions` et `PATCH`/`DELETE`/`duplicate` sur `/roles` — l'écran
**Rôles et droits**, aujourd'hui en attente. `GET /audit-log` — le **journal
d'activité**. Puis `/projects/:id/features`, `/status`, `/config-export`, et
`POST /legal/accept`.

### Lot L2 — livré côté API, entièrement absent du front

**Vingt-six routes** : `/opportunities` (8, dont un tableau kanban),
`/quotes` (13), `/pricing-grids` (5). C'est une chaîne commerciale complète —
opportunité, devis, tarification — et c'est le plus gros morceau disponible.

---

## 3. Une correction à mon compte

J'ai écrit dans `ETUDE-SUIVI-PROSPECTION.md` et dans la recette que **l'export
ICS était bloqué par le contrat**. C'est vrai **depuis l'agenda** seulement :
`AgendaItemDto` porte le libellé du type, pas sa clé, donc on ne peut pas
savoir si un créneau est exportable.

**Ce n'est pas vrai depuis l'onglet Actions d'une fiche.** `GET /activities`
rend `type: { key, label }`, et `useActivityReference` donne déjà
`metadata.ics` par clé. Le bouton Outlook y est donc faisable **sans rien
demander à l'API**.

J'avais généralisé un blocage local. C'est le genre d'erreur qui coûte une
fonctionnalité promise.

---

## 4. Ce que je recommande, dans l'ordre

### 1. L'export ICS depuis l'onglet Actions — une heure

Le plus petit rapport effort/valeur du lot. La route est livrée, la clé du type
est disponible, `getBlobApiError` existe et n'est utilisé nulle part — il a été
écrit pour ça. Deux pièges connus : n'afficher le bouton que sur les types
`metadata.ics === true`, et lire l'erreur `400 ICS_NOT_AVAILABLE` dans un Blob
JSON et non dans un objet.

### 2. US-01-05 · Les actions groupées — une demi-journée

C'est le chaînon manquant entre deux écrans déjà livrés : on peut cibler une
campagne depuis la campagne, mais pas depuis une sélection dans la liste des
organismes. La barre de sélection de la V8 existe (`drawBulk`, `bulkSet`,
`bulkCampaign`, `bulkDelete`), et le contrat prévoit `selectAll: true` avec les
filtres courants dans le corps.

Point d'attention : l'appel est **partiel par conception** — seules les fiches
en accès `FULL` sont traitées, les autres reviennent dans `skipped` avec leur
motif. Il faudra rendre les deux nombres, comme sur la cible des campagnes.

### 3. L0 · US-00-02 et US-00-03 — la dette qui grossit

**Toujours 0 scénario sur 22.** Activation de compte, réinitialisation de mot
de passe, changement d'e-mail, profil. Ces écrans sont traversés à chaque
connexion et rien ne les couvre, alors que le reste du produit compte 123
scénarios verts. C'est le seul endroit où le risque n'est pas proportionné à
l'effort qu'il faudrait pour le couvrir.

Je le place en troisième position parce qu'il ne produit rien de visible — mais
je le signale pour la cinquième fois.

### 4. Le lot L2 — à ouvrir par une étude

Vingt-six routes livrées, aucun écran. C'est un lot entier, pas une US : il
mérite la même méthode que les campagnes et les périmètres — lire le handoff,
appeler les routes, confronter à la maquette, découper en tranches.

**Ne pas commencer par le code.** Les deux dernières US ont montré que le
handoff peut être en retard sur l'API : `nextActivity` est arrivé pendant
l'étude du kanban, et la forme des colonnes avait changé la veille.

---

## 5. Ce qui reste ouvert sur ce qui est livré

- **US-01-10** : filtres et vue Liste à développer ; deux scénarios ont montré
  une instabilité à confirmer.
- **US-01-09** : vues Semaine et Jour, cases à cocher par source — sans intérêt
  avant qu'une deuxième source réponde.
- **US-01-08** : modification d'une action, gardes de permission, scope `OWN`.
- **Défaut signalé à l'API** : `MEETING_SCHEDULED` ne redescend jamais
  (`SIGNALEMENT-API-ACTIVITES.md`).
