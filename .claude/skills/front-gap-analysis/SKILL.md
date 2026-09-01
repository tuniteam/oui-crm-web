---
name: front-gap-analysis
description: Identifier le développement front restant en confrontant le code à SPEC-11-HANDOFF-FRONT.md, le contrat d'API de référence. À utiliser quand on demande « qu'est-ce qui reste à faire », « quoi ensuite », un écart front/API, ou avant d'implémenter un écran consommant l'API oui-crm.
---

# Identifier le dev front à faire

La source de vérité du contrat d'API est :

```
C:\back\oui-crm\oui-crm-api\docs\SPEC-11-HANDOFF-FRONT.md
```

Elle est mise à jour **à chaque story livrée** et donne, par route : payloads,
tableau exhaustif des erreurs, effets de session et limites. Chaque section se
termine par sa recette BDD (`docs/features/*.feature`).

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

## Références UI

Le handoff donne le contrat, pas l'apparence.

- Écrans **métier** → maquette `oui-crm-api/docs/Periscolia_OUICRM_V8.html`.
- Écrans **back-office** (projets, utilisateurs) → pattern de `soft-m-web`
  (feature `client` : table, colonnes, page de détail à onglets, sheets,
  skeletons). Le back-office est absent de la maquette V8.

Ne jamais reprendre les couleurs de la maquette : elle est en violet Periscolia,
la charte oui-crm est en azur `#0369A1`.
