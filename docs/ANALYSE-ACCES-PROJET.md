# Accéder à un projet dans un onglet dédié — analyse préalable

**Objet** : préparer le terrain pour qu'un back-office ouvre un projet et travaille
dedans, sur le modèle du « mode gestion client » de `soft-m-web`.

**Statut** : analyse. Aucun développement engagé.

Prérequis : le back-office prépare une évolution sur les utilisateurs backoffice.
Ce document décrit la mécanique cible côté front, pas son calendrier.

---

## 1. Comment `soft-m-web` procède

Un super-admin ouvre un client depuis la liste et bascule dans un mode où
l'application entière est cadrée sur ce client. Cinq pièces.

### 1.1 L'ouverture, dans un nouvel onglet

Dans `clientColumns.tsx`, l'action « Gérer » est un simple lien :

```tsx
<Link to={CLIENT_ROUTES.CLIENT_CONFIGURE_SCHOOL_YEARS(row.original.id)}
      target="_blank" rel="noopener noreferrer">
```

où la route vaut `` `/${id}/dashboard` ``. C'est **tout** ce qui déclenche le mode :
un lien vers une URL préfixée par l'identifiant, ouvert dans un onglet séparé.

Le choix de l'onglet est structurant : l'administration reste ouverte dans le
premier onglet, la gestion du client vit dans le second. Les deux contextes
coexistent sans que l'un écrase l'autre.

### 1.2 Les routes préfixées

`app-routing-setup.tsx` déclare une famille de routes `/:clientId/...` :

```
/:clientId/dashboard
/:clientId/profile
/:clientId/configure/school-years
/:clientId/configure/treasury
…
```

Chacune enveloppe son élément dans un `ClientScopeBinder`.

### 1.3 `ClientScopeBinder` — le liant

`src/tenant/ClientScopeBinder.tsx` lit `clientId` dans l'URL et le pousse dans
deux stores, puis **nettoie au démontage** :

```tsx
useEffect(() => {
  setClientId(resolved);
  if (enableClientManage) enable();
  return () => {
    clearClientId();
    if (enableClientManage) disable();
  };
}, [...]);
```

Le drapeau `enableClientManage` distingue deux usages :

- **avec** : on gère le client, l'application entière change de menu ;
- **sans** : on configure le client depuis l'administration
  (`/administration/clients/:clientId/services`), le menu d'administration reste.

### 1.4 Deux stores séparés

| Store | Rôle |
|---|---|
| `useClientScopeStore` | porte le `clientId` courant, lu par l'intercepteur pour l'en-tête `x-client-id` |
| `useClientManageStore` | booléen `isClientManage` : sommes-nous en mode gestion ? |

La séparation est délibérée : on peut être *cadré* sur un client sans être en
*mode gestion*.

### 1.5 Le menu bascule

`sidebar-menu.tsx` et `breadcrumb.tsx` choisissent leur configuration :

```
isClientManage && clientId && clientName && permissions
  ? buildClientManageMenu(clientId, clientName, permissions, roleCode, modules, flags)
  : isBackOffice ? MENU_SIDEBAR : []
```

`buildClientManageMenu` construit un menu **entièrement préfixé** par le
`clientId`, filtré par permission *et* par module, et dont la première entrée est
un marqueur `activeClient` portant le nom du client et un lien de retour vers
`/administration/clients`. Cette entrée est exclue du menu défilant et rendue à
part, en en-tête.

### 1.6 L'en-tête HTTP, avec repli

L'intercepteur lit le store, et retombe sur l'URL quand il est momentanément
vide :

```ts
const clientId = useClientScopeStore.getState().clientId ?? clientIdFromPath();
```

Le commentaire d'origine explique pourquoi : au remontage en `StrictMode`, le
nettoyage du binder vide le store juste avant qu'une requête reparte. Sans repli,
l'appel partirait sans en-tête et recevrait un 400.

---

## 2. Ce qui change pour oui-crm

La mécanique se transpose, avec **une différence de fond**.

### 2.1 Le projet ne transite pas par l'URL

`SPEC-11 §0` est explicite : l'en-tête `x-project-id` est la **seule** voie, et
l'API ne lit aucun identifiant de projet dans le chemin. Le handoff précise que
le front reste libre de mettre un slug dans ses propres routes, pour des liens
partageables.

Conséquence : le repli « store vide → lire l'URL » de soft-m n'est pas
transposable tel quel si les routes ne portent pas l'identifiant. Deux options :

| Option | Routes front | Repli possible | Lien partageable |
|---|---|---|---|
| **A** — routes préfixées | `/:projectId/users` | oui | technique |
| **B** — projet implicite | `/users` + store persisté | non | non |

**Décision : option A, avec le CUID du projet dans l'URL.**

L'ouverture en onglet dédié impose A : un nouvel onglet ne partage pas la mémoire
du premier, seule l'URL peut lui dire sur quel projet il travaille. Avec B, deux
onglets partageraient un même `localStorage` et se marcheraient dessus — le
scénario que le mode onglet cherche justement à éviter.

**Pourquoi le CUID et non le slug**, alors que le DTO de création décrit ce
dernier comme « immutable identifier used in URLs » :

1. **La résolution est asymétrique, au détriment de celui qui en a besoin.** Un
   utilisateur projet a le couple `projectId` + `projectSlug` dans son
   `/profile/me` : résoudre lui coûte zéro appel. Un **back-office ne l'a pas** —
   ses relations n'ont pas de projet. Or c'est lui qui ouvre des projets.
2. **L'API ne sait pas résoudre un slug.** `GET /projects/:id` est gardé par un
   `ParseCuidPipe` : un slug y est rejeté en `400 INVALID_CUID`. Il n'existe
   aucune route de résolution ; seul `GET /projects?search=` existe, et sa
   recherche est **floue** (slug, nom et nom de produit), donc inapte à un
   lookup exact.
3. **Un aller-retour au lieu de deux.** Le menu a de toute façon besoin de
   `GET /projects/:id` pour le nom et les fonctionnalités. Avec un CUID, cet
   appel sert aussi de validation. Avec un slug, il faudrait résoudre d'abord,
   appeler ensuite.
4. **Le nouvel onglet démarre immédiatement** : la valeur de l'URL *est* celle de
   l'en-tête `x-project-id`, sans attente ni gestion d'échec de résolution.

C'est aussi le choix de soft-m, dont les routes portent un cuid
(`/:clientId/dashboard`) et non un nom.

**Ce qui ferait changer d'avis** : que l'API accepte le slug sur le détail
(`GET /projects/:idOrSlug`, en assouplissant le `ParseCuidPipe` — le
`findUnique({ where: { slug } })` existe déjà dans le service). On gagnerait des
URL lisibles et dictables. À demander si le besoin de partager des liens
apparaît ; inutile tant que les projets s'ouvrent depuis la liste.

### 2.2 Correspondance des pièces

| soft-m-web | oui-crm | État |
|---|---|---|
| `useClientScopeStore` | `useMeStore.activeProjectId` | ✅ existe |
| `useClientManageStore` | à créer | ❌ |
| `ClientScopeBinder` | `ProjectScopeBinder` | ❌ |
| en-tête `x-client-id` | en-tête `x-project-id` | ✅ posé |
| `MENU_SIDEBAR` back-office | idem (Projets) | ✅ existe |
| `buildClientManageMenu` | `buildProjectMenu` | ❌ |
| marqueur `activeClient` | `activeProject` | ✅ renommé, non utilisé |
| filtre `requiredModule` | idem | ✅ branché |
| `RequireModule` | idem | ✅ existe |

Le socle est en place ; il manque le mode, le binder et le menu projet.

### 2.3 Permissions et modules : deux origines différentes

Vérifié dans `soft-m-web` — et la réponse est asymétrique, à raison.

**Les permissions ne sont jamais rechargées.** Il n'existe aucun endpoint
`clients/:id/permissions`. Le menu de gestion client lit :

```ts
const permissions = meStore.getActiveClientPermissions() ?? [];
```

qui résout `getActiveRoleRelationship()?.permissions`. Or pour un back-office,
ce getter renvoie **sa propre première relation** (triée par `displayOrder`).
Un back-office navigue donc chez un client avec **ses permissions de
back-office**, inchangées. C'est cohérent avec le handoff oui-crm : il est
accepté « dès lors que son rôle porte la permission de la route en scope `ALL` ».

**Les modules, eux, sont rechargés par client** :

```ts
const modules = isBackOffice
  ? fetchedModules.filter((m) => m.enabled).map((m) => m.code)  // GET /clients/:id/modules
  : storeModules;                                               // /me
```

**Pourquoi cette asymétrie** : une permission décrit ce que *l'utilisateur* a le
droit de faire — elle le suit partout. Un module décrit ce que *le client* a
activé — il appartient au client, pas à l'utilisateur. Les deux ne peuvent donc
pas venir de la même source.

**Transposition oui-crm** : le menu projet se filtre sur les permissions du
back-office issues de `/profile/me`, et sur les fonctionnalités du projet issues
de `GET /projects/:id` (`features: [{code, enabled}]`, déjà typé). Aucun appel
supplémentaire à demander à l'API — l'équivalent de `/clients/:id/modules`
existe déjà sous la forme du détail projet.

---

## 3. Points d'attention

1. **Nettoyage au démontage.** Le binder de soft-m efface le scope en sortant.
   Sans cela, quitter un projet laisse l'en-tête actif et les appels suivants
   partent sur le mauvais projet.
2. **`StrictMode`.** Le double montage en développement provoque un
   `clear` suivi d'un `set`. C'est ce qui a imposé le repli sur l'URL chez
   soft-m ; à anticiper.
3. **Projet `DRAFT` ou `ARCHIVED`.** Un back-office peut l'ouvrir — c'est même le
   cas d'usage de la configuration. Un utilisateur projet reçoit
   `403 PROJECT_NOT_ACTIVE`. Le mode doit distinguer les deux.
4. **Isolation entre onglets.** Ne pas stocker le projet actif dans un
   `localStorage` partagé si l'on veut deux onglets sur deux projets : c'est
   contradictoire.
5. **Retour à l'administration.** L'entrée `activeProject` doit porter le nom du
   projet et un lien vers `/projects`, comme le fait `activeClient`.

---

## 4. Décisions à prendre avant de coder

1. Le mode gestion et le mode configuration sont-ils distincts, comme le
   `enableClientManage` de soft-m ?

Tranché : **routes préfixées par le CUID du projet** (§2.1), et **permissions du
back-office inchangées, fonctionnalités rechargées par projet** (§2.3).

La question des permissions du back-office est **tranchée** (§2.3) : ses propres
permissions le suivent, seules les fonctionnalités du projet sont rechargées.

---

## 5. Fichiers de référence

Dans `soft-m-web`, en **lecture seule** :

```
src/tenant/ClientScopeBinder.tsx
src/contexts/useClientScopeStore.ts
src/contexts/useClientManageStore.ts
src/config/menu-client-manage.ts
src/components/layouts/layout-1/components/sidebar-menu.tsx
src/components/layouts/layout-1/components/breadcrumb.tsx
src/guards/RequireModule.tsx
src/features/client/components/clientColumns.tsx
src/routing/app-routing-setup.tsx
```
