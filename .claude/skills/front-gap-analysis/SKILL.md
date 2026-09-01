---
name: front-gap-analysis
description: Identifier le développement front restant en confrontant le code aux deux références du projet — le contrat d'API SPEC-11-HANDOFF-FRONT.md (dans oui-crm-api/docs) et la maquette UI/UX docs/OuiCRM_V8.html (dans ce repo). À utiliser quand on demande « qu'est-ce qui reste à faire », « quoi ensuite », un écart front/API, ou avant d'implémenter ou concevoir un écran de oui-crm.
---

# Identifier le dev front à faire

Deux sources, complémentaires. **Toujours consulter les deux** : le handoff dit
ce que l'API accepte et renvoie, la maquette dit à quoi l'écran ressemble et
quel est le parcours. L'une sans l'autre produit soit un écran juste et
inutilisable, soit un écran crédible et faux.

```
../oui-crm-api/docs/SPEC-11-HANDOFF-FRONT.md   contrat d'API (repo API, lecture seule)
docs/OuiCRM_V8.html                            maquette UI/UX (dans ce repo)
```

**Le handoff** est mis à jour à chaque story livrée et donne, par route :
payloads, tableau exhaustif des erreurs, effets de session et limites. Chaque
section se termine par sa recette BDD (`docs/features/*.feature`).

**La maquette** (~660 Ko, versionnée dans ce repo) fait foi pour les écrans métier : dispositions,
parcours, et surtout les **vocabulaires métier complets** — statuts
d'opportunité, étapes de déploiement, types de structure, motifs de perte…
À reprendre tels quels en tableaux `as const` plutôt qu'à réinventer.

Deux pièges avec la maquette :

- Elle est **templatée en JS** : les écrans se génèrent à l'exécution, une
  lecture statique du HTML ne montre pas grand-chose. Extraire plutôt les
  tableaux de libellés et les blocs de rendu.
- Elle n'a **pas de `charset` déclaré** alors qu'elle est en UTF-8 : forcer
  l'encodage à la lecture, sinon les accents sont illisibles.
- Elle **ne couvre pas le back-office** (projets, utilisateurs backoffice).

`oui-crm-api` est en **lecture seule** : on y lit, on n'y écrit jamais. Un
changement côté API se transmet par un document de handoff dans `oui-crm-web`.

## Méthode

1. **Lire le §0 « Conventions »** en premier. Il régit *toutes* les routes et
   c'est là que se logent les écarts les plus coûteux, parce qu'ils sont
   silencieux et transverses.
2. **Relever les US livrées** (titres `## US-…`) et les comparer aux features
   présentes dans `src/features/`.
3. **Pour chaque route non couverte**, noter : payload, codes d'erreur à router,
   permission requise, et si la route est marquée `[P]`.
4. **Vérifier l'existant plutôt que le supposer.** Le front a dérivé de
   soft-m-web : des types redéclarés localement peuvent diverger du contrat sans
   qu'aucune erreur ne se produise. Comparer les types aux payloads réels.
5. **Confirmer en direct quand l'API tourne** (`http://localhost:3001/api/v1`,
   identifiants de seed dans `oui-crm-api/.env`, `SEED_PASSWORD`). Un `curl`
   tranche mieux qu'une lecture de DTO.

## Invariants à vérifier systématiquement

Ils viennent du §0 et sont les pièges récurrents :

- **Enveloppe d'erreur** : `messages.code` pour router, `messages.text` **jamais
  parsé** (humain, peut changer), `statusCode` est une **chaîne**. Les valeurs
  structurées arrivent dans `messages.meta` (registre : `lockedUntil`).
- **Intercepteur** : `401 TOKEN_EXPIRED` → refresh **single-flight** puis rejeu.
  Tout **autre** `401` → déconnexion. Un `403` n'est **jamais** une déconnexion.
  Exception : sur `POST /auth/email-change/request`, un
  `401 AUTH_INVALID_CREDENTIALS` est un mot de passe re-saisi faux.
- **Routes `[P]`** : en-tête `x-project-id`, jamais dans l'URL. Erreurs
  `PROJECT_IS_REQUIRED` (400), `PROJECT_MISMATCH`, `PROJECT_NOT_ACTIVE`,
  `USER_HAS_NO_PROJECT` (403) — aucune ne déconnecte.
- **Permissions** : le front **masque** d'après `/profile/me`, le serveur décide.
  Le scope `OWN` est filtré **côté serveur** — ne jamais refiltrer côté front.
- **Mot de passe** : ≥ 10 caractères, ≥ 1 lettre, ≥ 1 chiffre
  (`400 PASSWORD_TOO_WEAK`). Aligner les schémas Zod sur cette règle exacte.
- **Listes** : `?page=1&limit=20` (max 100), réponse `{ data, meta }`.
- **Identifiants** : id invalide → `400 INVALID_CUID`.

## Restituer le résultat

Un tableau route par route avec trois états : couvert, partiel, absent. Pour les
écarts, dire **ce qui casse concrètement** — pas « le type diverge » mais « tous
les contrôles de droits renverront false et le menu se videra ».

Distinguer toujours :

- ce qui est **cassé aujourd'hui** (à corriger) ;
- ce qui **cassera à la livraison** d'une story côté API ;
- ce qui n'est **pas encore implémentable** (route inexistante).

## Après avoir livré une feature

Écrire ses scénarios BDD dans `docs/features/<domaine>.feature`, en nommant
l'US couverte — même traçabilité que `oui-crm-api/docs/features/`.

- `Feature: … (US-00-XX)` dans l'en-tête, tags `@nominal` / `@error` /
  `@validation` / `@guard` comme côté API.
- Rédiger en anglais ; garder en français les chaînes d'interface citées, ce
  sont celles que l'utilisateur lit réellement.
- Décrire ce que voit l'utilisateur, pas les appels HTTP : le contrat est déjà
  couvert par la recette de l'API.
- Écrire un scénario pour chaque piège identifié pendant le développement — une
  règle serveur qu'on pourrait ré-implémenter côté front par erreur, une valeur
  figée, un cas qui dégrade en silence.
- Tenir à jour le tableau de `docs/features/README.md`.

## Quelle référence UI selon la zone

| Zone | Référence |
|---|---|
| Écrans **métier** (organismes, opportunités, devis, contrats, activités, tickets…) | maquette **V8** |
| Écrans **back-office** (projets, utilisateurs backoffice) | pattern **soft-m-web** |

Le back-office étant absent de la maquette, il suit la feature `client` de
`soft-m-web` : table + colonnes (`DataGridColumnHeader`, `size`, `meta`,
tri/masquage/redimensionnement), page de détail à onglets, sheets de
création/édition/suppression, skeletons en fichiers dédiés. `soft-m-web` est
lui aussi en **lecture seule**.

Ne jamais reprendre les **couleurs** de la maquette : elle est en violet
Periscolia (`#5a45d6`), la charte oui-crm est en azur (`#0369A1`). On en reprend
les dispositions, les parcours et les vocabulaires — pas la palette.

Les illustrations se piochent dans `docs/assets/` (unDraw, accent déjà en azur)
et se déplacent dans `public/media/illustrations/` sous un nom métier. Ne pas
ajouter de visuels Freepik/Storyset : leur licence gratuite impose un crédit
visible.
