# Tableau de bord — ce qu'on peut construire, et ce qu'il faut demander

> Établi le 04/09/2026. Sources confrontées : `SPEC-07-USER-STORIES.md`
> (US-05-01), `SPEC-11-HANDOFF-FRONT.md`, `HANDOFF-L1.md`, `HANDOFF-L2.md`, le
> code de `oui-crm-api/src/`, et la maquette `docs/OuiCRM_V8.html`
> (`RENDER.dashboard`, `dashData`).

---

## Le verdict, d'abord

**Le tableau de bord tel qu'il est spécifié n'est pas développable aujourd'hui.**

US-05-01 appartient au **lot L5**, le dernier. Ses deux routes —
`GET /dashboard` et `GET /dashboard/kpis` — n'existent nulle part : ni dans les
handoffs L0, L1 ou L2, ni dans le code de l'API, qui n'a **aucun module
`dashboard` ni `stats`** (`ls oui-crm-api/src/` : 30 modules, pas ceux-là).

Côté front, l'écran est déjà routé vers l'écran d'attente
(`project-workspace-routes.tsx:26`), protégé par `dashboard:read`.

La vraie question n'est donc pas « comment le développer » mais **« qu'est-ce
qu'on peut en montrer avec ce qui est livré, et à quel prix »**.

---

## Ce que la maquette demande

`RENDER.dashboard` produit quatre blocs :

1. **Six cartes de KPI** sur la période choisie (mois, trimestre, année, 12 mois
   glissants) : appels, démonstrations, devis réalisés, RDV et démos planifiés,
   devis signés, actions en retard.
2. **Des séries mensuelles sur 12 mois** : appels, emails et relances,
   démonstrations, devis créés et leur montant, devis signés et le CA, nouveaux
   organismes travaillés, opportunités créées.
3. **Un entonnoir** à cinq étages : appels passés → contacts aboutis →
   démonstrations → devis envoyés → devis signés.
4. **Des ratios** : taux de transformation, délai moyen de signature, valeur
   pondérée du pipeline, objectif de CA.

Le tout filtrable par **portée** — moi, mon équipe, un collaborateur — la portée
élargie étant réservée au scope `PROJECT`.

---

## Ce que les routes livrées permettent

| Indicateur | Source disponible | État |
|---|---|---|
| Actions réalisées, par type et période | `GET /activities?status&type&from&to` → `meta.total` | **faisable** |
| Actions en retard | `GET /agenda` → `isLate`, déjà consommé par le bandeau | **faisable** |
| RDV et démos planifiés | `GET /activities?status=PLANNED` filtré par type | **faisable** |
| Pipeline par étape, montants et valeur pondérée | `GET /opportunities/board` → `count`, `total`, `weightedTotal` par colonne **et** au global | **faisable, déjà agrégé** |
| Opportunités gagnées / perdues | `GET /opportunities?stage=WON\|LOST&from&to` → `meta.total` | **faisable** |
| Devis créés, envoyés, signés | `GET /quotes?status&from&to` → `meta.total` | **faisable** |
| Montants et CA signé | lignes de `GET /quotes` (`firstYearHt`, `mrrNet`… en cache) | **faisable, mais à sommer côté front** |
| Devis en attente de validation | `GET /quotes?status=PENDING_VALIDATION` | **faisable** |
| Démonstrations comptées au franchissement d'étape | historique des étapes exposé **uniquement** sur `GET /opportunities/:id` | **coûteux — voir plus bas** |
| Séries mensuelles sur 12 mois | aucune route n'agrège par mois | **coûteux — voir plus bas** |
| Objectif de CA | aucune route, aucun champ | **absent** |
| Portée équipe / collaborateur | `ownerId` sur opportunités et devis, `userId` sur l'agenda ; pas de notion d'équipe | **partiel** |

---

## Les deux murs

### 1. Les séries mensuelles n'existent pas côté serveur

Aucune route ne rend d'agrégat par mois. Pour dessiner douze points, il faut
soit **douze appels par série** (`from`/`to` mois par mois, en ne lisant que
`meta.total`), soit **rapatrier toutes les lignes** de la période et les grouper
côté front.

Huit séries × douze mois = **96 requêtes** pour un seul écran. Et la seconde
option se heurte à `limit` (max 100) : au-delà, il faut paginer.

### 2. Compter les démonstrations demande un appel par opportunité

La maquette compte une démonstration **au franchissement de l'étape**, pas à la
date de l'action. C'est la bonne définition métier — elle survit à une action
requalifiée. Mais l'historique des étapes n'est rendu que par
`GET /opportunities/:id` ; la liste et le tableau ne le portent pas.

Compter les démonstrations d'un projet suppose donc de lire **le détail de
chaque opportunité**, une par une.

---

## Trois routes possibles

### A. Attendre `GET /dashboard`

L'écran d'attente reste, on développe autre chose du L1/L2 encore absent du
front, et on prend US-05-01 quand l'API la livre.

**Pour** : rien à jeter, un seul appel à la livraison, les séries et l'entonnoir
calculés en SQL là où c'est leur place.
**Contre** : l'écran d'accueil du projet reste vide alors qu'il est la première
chose que voit un utilisateur.

### B. Un tableau de bord réduit, honnête, avec ce qui existe

Ne montrer que ce qui se lit sans agrégat serveur :

- les **six cartes de KPI** de la période courante (une requête chacune, en ne
  lisant que `meta.total`) ;
- l'**entonnoir**, dont quatre étages sur cinq sont déjà comptés, et le
  cinquième — les démonstrations — remplacé par le compte des **actions** de
  type démonstration réalisées, en le disant ;
- le **pipeline pondéré**, gratuit : `GET /opportunities/board` le rend déjà.

Pas de séries mensuelles, pas d'objectif, pas de portée équipe.
**Six à huit requêtes**, aucune boucle.

**Pour** : un écran utile en un lot court, sans dette — chaque bloc se branchera
sur `GET /dashboard` le jour venu, en changeant la source, pas la présentation.
**Contre** : la moitié de la maquette manque, et il faut assumer de le dire à
l'écran plutôt que de laisser croire à un chargement.

### C. Tout construire côté front

**À écarter.** Les 96 requêtes et la boucle sur les opportunités ne sont pas un
détail de performance : c'est une logique d'agrégation métier réimplémentée dans
le navigateur, qui divergera de celle du serveur dès que `GET /dashboard`
arrivera. On aurait alors deux chiffres différents pour le même indicateur.

---

## Recommandation

**B**, à une condition : que chaque bloc absent soit **nommé** à l'écran plutôt
que masqué — comme le fait déjà l'agenda pour ses trois sources à venir
(« Formations — à partir d'un prochain lot »). Ce motif existe, il est compris,
et il évite de promettre un écran complet.

Et **une question à poser à l'API dès maintenant**, parce qu'elle conditionne la
suite : `GET /dashboard` est prévu au L5, mais l'écran est la page d'accueil du
projet. Peut-on avancer **la partie séries et entonnoir** — celle qu'un front ne
peut pas calculer honnêtement — sans attendre le reste du lot ?

---

## Ce qu'il faudra vérifier avant de coder

- **`x-project-id`** : toutes les routes concernées sont `[P]`. Quatre erreurs à
  router, aucune ne déconnecte.
- **Le scope `OWN` est filtré côté serveur.** Ne jamais refiltrer côté front :
  un commercial ne verra que ses lignes, c'est déjà vrai dans `meta.total`.
- **Les montants sont en cache dans les lignes de devis** (`mrrNet`,
  `firstYearHt`…). La liste ne recalcule rien — le front non plus.
- **`GET /opportunities/board` plafonne `items` à 200** par colonne, mais
  `count`, `total` et `weightedTotal` sont les valeurs **réelles**. Pour des
  totaux, ne pas compter `items.length`.
- **ApexCharts** est la bibliothèque prévue par le handoff pour cet écran. À
  confronter à ce que le projet embarque déjà (`src/components/ui/chart.tsx`)
  avant d'ajouter une dépendance.
