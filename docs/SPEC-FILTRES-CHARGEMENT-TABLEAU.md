# Spec — filtres, chargement et compteurs d'un tableau

> Spécification réutilisable, écrite pour être appliquée à un autre projet.
> Le corps est indépendant de toute bibliothèque ; les annexes traitent le cas
> React / TanStack Query / Radix.
>
> Tirée de défauts réellement rencontrés sur oui-crm — l'étude d'origine est
> dans `docs/ETUDE-RECHARGEMENT-FILTRES.md`. Chaque règle nomme le symptôme
> qu'elle empêche, parce qu'une règle sans son symptôme se fait contourner.

---

## 1. Objet

Un écran de liste filtrable comporte quatre zones, et la façon dont elles se
mettent à jour décide de la qualité perçue de tout l'écran :

| Zone | Contenu | Source |
|---|---|---|
| **Barre de critères** | champs, sélecteurs, panneau de filtres | état local |
| **Badge** | nombre de critères actifs | état local |
| **Bande de critères** | un jeton retirable par critère posé | état local |
| **Tableau** | lignes, compteur de résultats, pagination | serveur |

Cette spec dit comment les faire coexister quand l'utilisateur pose, change ou
retire un critère.

**Hors périmètre** : le choix des critères, la pagination côté serveur, le
tri, la sélection multiple.

---

## 2. Le principe, en une phrase

> **Un critère est une intention locale ; les lignes sont une réponse du
> serveur. L'intention s'affiche immédiatement, la réponse arrive après, et
> rien d'autre à l'écran ne bouge entre les deux.**

Tout ce qui suit en découle.

---

## 3. Règles

### R1 — Deux sources de vérité, jamais mélangées

Les critères vivent dans l'état local. Le badge, les jetons et les champs s'en
déduisent **sans attendre le serveur**.

Le tableau, son compteur et sa pagination viennent de la réponse. Ils sont les
seuls à dépendre du réseau.

*Symptôme évité* : l'utilisateur clique un critère et rien ne change pendant
300 ms, alors que l'information « votre critère est pris en compte » était
disponible immédiatement.

### R2 — Le chargement ne remplace que la zone dont les données changent

L'indicateur d'attente vit **au niveau des lignes**. Jamais au-dessus.

Corollaire opérationnel, et c'est le point le plus souvent violé :

> **Interdiction d'un retour anticipé qui remplace le conteneur.**
> `if (loading) return <Squelette/>` placé au-dessus de la barre d'outils est
> un défaut, pas un raccourci.

*Symptôme évité* : l'écran entier clignote à chaque critère. Et surtout, voir
R3.

### R3 — Aucun élément interactif ne vit dans une zone que le chargement démonte

Un panneau ouvert, un menu déroulé, un champ en cours de saisie, une case
cochée : tout cela disparaît avec le sous-arbre qui le porte.

*Symptôme évité* : « le panneau de filtres se ferme quand je choisis un
critère ». Il ne se ferme pas — **il cesse d'exister**. Ce symptôme se
diagnostique presque toujours à tort comme un problème de gestion du clic ou
du focus. Avant de chercher là, vérifier que le composant est encore monté.

### R4 — Un compteur serveur ne retombe jamais à zéro

Pendant l'attente, un compteur affiche sa valeur précédente, ou un état
d'attente explicite. Jamais `0`.

*Symptôme évité* : « 0 résultat » clignote avant « 900 sur 36 224 », et
l'utilisateur croit que son filtre a tout vidé.

### R5 — Le débounce porte sur la requête, pas sur l'affichage

Retarder l'appel réseau est légitime. Retarder l'affichage du critère saisi ne
l'est jamais.

*Symptôme évité* : on tape dans un champ et le jeton correspondant apparaît
une demi-seconde plus tard, ce qui se lit comme une lenteur générale.

### R6 — Un contrôle ne disparaît pas sous le curseur

Un bouton dont l'action supprime sa propre condition d'affichage — typiquement
« Réinitialiser », qui se démonte en retirant le dernier critère — est démonté
au milieu de son propre clic.

Trois sorties acceptables, dans cet ordre de préférence :
1. le garder monté en permanence, l'action étant sans effet quand il n'y a
   rien à défaire ;
2. le garder monté et le désactiver, **à condition** que la désactivation ne
   déplace pas le focus ;
3. le démonter, en ayant vérifié qu'aucun comportement ne dépend du focus.

*Symptôme évité* : des effets de bord au relâchement du clic — perte de focus,
fermeture du conteneur — dont la cause est invisible à la lecture.

### R7 — Les paramètres appartiennent à la clé de cache

La clé qui identifie une requête doit décrire la requête **entièrement**. Ne
jamais en retirer un paramètre pour éviter un rechargement : c'est traiter un
défaut d'affichage en corrompant les données.

*Symptôme évité* : la liste d'un filtre servie pour un autre, et un
diagnostic impossible parce que l'écran est cohérent avec lui-même.

### R8 — Un critère actif se voit sans ouvrir le panneau, et se retire sans l'ouvrir

Le badge dit **combien**, la bande dit **lesquels**, et chaque jeton porte son
retrait.

Conséquence à ne pas négliger : l'option « tous / aucun filtre » d'un sélecteur
devient invisible dès qu'une valeur est choisie, la liste défilant vers la
valeur sélectionnée. Le jeton est alors le seul chemin découvrable pour défaire
— il n'est donc pas facultatif.

*Symptôme évité* : une liste tronquée lue pour une liste complète, parce qu'un
critère oublié agissait sans se voir.

### R9 — Un identifiant de test désigne un seul élément, en toute circonstance

Deux éléments portant le même identifiant — par exemple une même action
proposée dans un panneau **et** dans une bande — font échouer tout sélecteur
strict dès que les deux sont montés simultanément.

*Symptôme évité* : une recette qui passe ou échoue selon qu'un panneau est
ouvert.

### R10 — Si l'URL porte les critères, un changement de critère est une navigation

Mettre les critères dans l'URL est souhaitable : l'écran devient partageable et
rechargeable. Mais la navigation qui en résulte doit être **inerte
visuellement** : ni remontage de l'écran, ni réinitialisation d'un état
d'interface.

C'est la combinaison R10 + R2 qui est piégeuse : la navigation change les
paramètres, les paramètres changent la clé, la clé vide les données, et un
squelette mal placé démonte alors tout l'écran. Les trois maillons sont
corrects isolément.

---

## 4. Critères d'acceptation

Testables, et à formuler ainsi dans une recette. Chacun tombe si une règle est
violée.

| # | Critère |
|---|---|
| 1 | Poser trois critères d'affilée : le panneau de filtres reste ouvert du début à la fin. |
| 2 | Le badge affiche le bon nombre **avant** toute réponse du serveur. |
| 3 | Pendant le chargement, seules les lignes changent d'aspect ; barre d'outils, badge, jetons et pagination restent en place. |
| 4 | Le compteur de résultats n'affiche jamais `0` transitoirement. |
| 5 | Retirer le dernier critère ne referme et ne réinitialise rien. |
| 6 | Ouvrir un sélecteur à l'intérieur du panneau ne referme pas le panneau. |
| 7 | Au premier chargement, la barre de recherche est présente et utilisable. |
| 8 | Recharger la page avec des critères dans l'URL restitue le même écran. |
| 9 | Chaque identifiant de test ne désigne qu'un élément, panneau ouvert comme fermé. |

Le critère **1** est le plus rentable : il tombe dès que R2 ou R3 est violée, et
il se vérifie en trois clics.

---

## 5. Ce que cette spec n'impose pas

- **La forme de l'indicateur d'attente** — lignes grises, atténuation,
  barre de progression. Seule sa *portée* est prescrite.
- **Garder les lignes précédentes plutôt que de les griser.** Les deux se
  défendent : les anciennes lignes gardent le contexte, les lignes grises
  disent où l'attente a lieu. Choisir une fois, pour tout le projet, et s'y
  tenir — c'est de la cohérence, pas de la technique.
- **Où vivent les critères** — état local, URL, ou les deux. R10 ne s'applique
  que si l'URL les porte.
- **Le nombre de critères et leur disposition.**

---

## Annexe A — React, TanStack Query, Radix

Ce que les règles deviennent concrètement sur cette pile.

### Le chargement (R2)

La plupart des grilles de données portent déjà un état de chargement qui rend
des lignes-squelettes **dans le corps du tableau**. Le réflexe fautif est de
l'ignorer et de substituer son propre squelette de carte entière au-dessus.

**À vérifier avant d'écrire quoi que ce soit** : la grille utilisée expose-t-elle
déjà un `isLoading` ? Sur oui-crm, la réponse était oui, avec le bon mode par
défaut, et personne ne le lui passait. La correction a coûté deux lignes là où
j'avais chiffré un remaniement.

**Piège qui suit immédiatement** : ces grilles délèguent souvent le contenu de
la cellule-squelette à la définition de colonne (`meta.skeleton`). Si aucune
colonne ne la fournit, les lignes de chargement sont **vides** au lieu d'être
grises. Poser un repli **au point d'appel** plutôt qu'une description par
colonne : une ligne, et tous les tableaux du projet sont servis.

### Sémantique de l'état de requête (R4)

Avec une clé qui contient les paramètres, un changement de critère produit une
clé inédite : les données sont `undefined` et l'état est « en attente », pas
« en rafraîchissement ». Il faut donc choisir explicitement :

- **lignes grises** — ne rien faire de plus, l'état d'attente suffit ;
- **lignes précédentes conservées** — `placeholderData: keepPreviousData` en
  v5. Attention : cela **supprime** l'état d'attente, donc si c'est cette
  option, prévoir un autre indicateur, sans quoi l'écran semble ne pas réagir.

Ne pas combiner les deux à l'aveugle : la seconde annule la première.

### Menus en portail (R3)

Un menu de sélecteur, une info-bulle, une fenêtre — tout ce qui est rendu dans
un portail est **hors du conteneur dans le DOM**, même s'il apparaît par-dessus
à l'écran. Un conteneur qui se ferme « au clic extérieur » voit donc un clic
dans son propre menu comme extérieur.

Deux points pratiques :

1. **Ne neutraliser que ce qu'il faut.** Bloquer tout clic extérieur enferme
   l'utilisateur ; reconnaître les clics venant d'un menu suffit, par l'attribut
   que le composant de menu pose déjà sur son contenu.
2. **Lire la bonne cible.** Ces bibliothèques émettent un événement
   personnalisé **sur le conteneur**. La cible réelle est dans
   `detail.originalEvent.target` — un test sur `event.target` compare le
   conteneur à lui-même et ne protège rien, silencieusement.

### Ouverture contrôlée (R3)

L'ouverture d'un panneau qui survit à un rechargement de données doit être tenue
par l'état de l'écran, au-dessus de la zone volatile, et non par la mémoire
interne du composant.

Si ce panneau est rendu par un `useMemo`, **l'état d'ouverture doit figurer dans
les dépendances**, sinon il y est figé — un défaut que la compilation ne voit
pas et qui ne se manifeste qu'au clic.

---

## Annexe B — l'ordre de diagnostic

Face à « mon panneau se ferme tout seul » ou « tout l'écran clignote », suivre
cet ordre. Il est écrit dans l'ordre inverse de l'intuition, et c'est
volontaire : sur oui-crm, deux hypothèses plausibles et fausses ont précédé la
bonne.

1. **Le composant est-il encore monté ?** Chercher tout retour anticipé qui
   remplace un conteneur pendant un chargement. C'est la cause la plus
   fréquente et la moins suspectée.
2. **La clé de requête a-t-elle changé ?** Si oui, les données sont vides, donc
   l'état est « en attente », donc le point 1 se déclenche.
3. **Un élément a-t-il été démonté au milieu d'un geste ?** Voir R6.
4. **Seulement ensuite** : gestion du clic extérieur, portails, focus.
