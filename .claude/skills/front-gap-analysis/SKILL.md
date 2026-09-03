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

## Étapes de chaque développement

À dérouler dans cet ordre, sans en sauter.

1. **Lire les deux références** avant de coder : le contrat de l'US dans le
   handoff, la disposition dans la maquette (ou le pattern soft-m pour le
   back-office).
2. **Développer** en suivant le pattern feature-based du projet.
3. **`npm run build`** — il type réellement depuis le passage à `tsc -b` ; un
   `tsc` nu ne suivrait pas les références du tsconfig et ne vérifierait rien.
4. **`npm run lint`** — zéro erreur.
5. **Vérifier dans le navigateur** avec la sonde. C'est l'étape qui distingue
   « ça compile » de « ça marche ».

   ```bash
   npm run probe                                   # parcours par défaut
   node scripts/ui-probe.mjs --routes=/projects    # écrans touchés
   ```

   Elle se connecte, parcourt les écrans et produit pour chacun une capture,
   les erreurs de console, les appels d'API en échec et un détecteur de page
   quasi vide. **Lire les captures** : une page blanche ne casse jamais le
   build, et c'est le symptôme le plus fréquent.

   Prérequis : front sur 5174 et API sur 3001. Sous Git Bash, préfixer par
   `MSYS_NO_PATHCONV=1`, sinon `/projects` est converti en chemin Windows.
6. **Vérifier le contrat en direct** quand un doute subsiste : un `curl` ou un
   court script Node contre l'API tranche mieux qu'une lecture de DTO.
7. **Mettre à jour la recette BDD** (section suivante), puis **l'exécuter** :

   ```bash
   npm run bdd -- --us=01-11    # l'US en cours — le lancement par défaut
   npm run bdd -- --id=01.9     # un scénario
   npm run bdd                  # tout : SUR DEMANDE EXPLICITE SEULEMENT
   ```

   **N'exécuter que les scénarios de l'US en cours de développement.** La suite
   complète ne se lance que si elle est demandée : elle prend plusieurs
   minutes, et pendant ce temps on ne peut ni éditer le code ni lancer un autre
   run. Le rapport `docs/rapport-bdd.html` conserve de toute façon le dernier
   résultat de chaque scénario, exécuté ou non — la couverture reste donc
   lisible sans tout relancer.

   Les scénarios exécutables vivent dans `scripts/bdd/scenarios.mjs`, chacun
   portant le `id` de sa ligne dans la recette. Le lancement réinjecte le
   résultat et la capture dans `docs/RECETTE-BDD-FRONT.md`. Ajouter un
   scénario pour ce qui vient d'être développé, en priorité pour les pièges
   identifiés. Les cas d'erreur se simulent en interceptant la réponse de
   l'API : c'est ce qui rend testables un compte verrouillé ou un 409.

   L'exécution produit aussi `docs/rapport-bdd.html` : **tous** les scénarios
   de la recette, exécutés ou non, groupés par US, avec un filtre et le taux
   de couverture. C'est ce rapport qui dit ce qui n'est pas couvert — un
   tableau qui n'afficherait que le vert donnerait une fausse assurance.
8. **Committer**, en disant ce qui a été vérifié et ce qui ne l'a pas été.

## Après chaque développement

Mettre à jour **`docs/RECETTE-BDD-FRONT.md`**, le document unique de recette
front. Il couvre les **onze US** livrées côté API, pas seulement celles qui sont
développées : les autres y portent les scénarios à couvrir et servent de plan de
travail.

- Une section par US (`## US-00-XX · Domaine`), tableaux `# | Scénario |
  Attendu`.
- Mettre à jour la colonne Statut du tableau de tête : livré, partiel, à
  développer.
- Décrire ce que voit l'utilisateur, pas les appels HTTP : le contrat est déjà
  couvert par la recette de l'API.
- Écrire une ligne pour chaque piège identifié pendant le développement — une
  règle serveur qu'on pourrait ré-implémenter côté front par erreur, une valeur
  figée, un cas qui dégrade en silence. C'est là que ce document gagne sa valeur.
- Les chaînes d'interface citées restent en français.

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
