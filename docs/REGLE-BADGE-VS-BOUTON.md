# Règle de projet — isoler ce qui s'affiche de ce qui se clique

> Établie le 04/09/2026, à partir de la maquette `docs/maquette-theme.html`
> (onglet Actions d'une fiche d'organisme). S'applique à **tout écran de
> OUI CRM**, existant ou à venir.

---

## Le problème que la règle traite

Sur la fiche d'organisme, le bouton « Supprimer » était dessiné comme une
pastille `danger` : même fond rouge pâle, même bordure rouge, même libellé
rouge, même hauteur. Posé à vingt pixels d'une pastille « Réalisée », rien
dans sa forme ne disait qu'il se clique. **Tant qu'il faut passer la souris
pour savoir si un élément est une information ou une action, l'écran est
mal dessiné.**

La couleur ne suffit pas à faire la distinction : elle porte déjà un autre
sens (le vocabulaire métier → une couleur, voir `docs/REVUE-THEME-COULEUR.md`).
C'est donc **la forme** qui doit séparer les deux familles.

---

## La règle

### 1. La forme, et elle seule, dit la nature de l'élément

| | **Pastille** (information) | **Bouton** (action) |
|---|---|---|
| Silhouette | pilule, arrondi complet | rectangle arrondi (`--btn-radius`, 10 px) |
| Ombre | aucune | ombre posée |
| Curseur | `default` | `pointer` |
| Marqueur | point de couleur pleine en tête | icône optionnelle, jamais un point |
| Libellé | un état, un nom (`Réalisée`, `Haute`) | un verbe à l'infinitif (`Modifier`) |
| Typo | 11 px, gras | 13 px, demi-gras |

Une pilule ne se clique jamais. Un rectangle arrondi n'affiche jamais un
simple état. Aucune exception : c'est ce qui rend la règle lisible sans
apprentissage.

**Une pilule posée dans une ligne cliquable reste une pilule.** Une ligne
d'agenda, une carte kanban, une entrée de liste peuvent être cliquables dans
leur entier ; les pastilles qu'elles portent n'en deviennent pas des actions,
parce que rien ne les distingue du reste de la ligne. Ce qui est interdit,
c'est de donner à une pastille **sa propre** cible de clic — un `onClick` sur
un `Badge`, ou un geste qui n'existe que sur elle.

### 2. Un bouton ne porte pas de fond pastel au repos

Le pastel (`*-soft`) est la signature exclusive des pastilles. Un bouton est
donc :

- **blanc** avec bordure grise, quel que soit le danger qu'il porte ;
- ou **plein et saturé** (dégradé de marque du bouton primaire, aplat rouge
  d'une confirmation destructive) — un aplat saturé ne peut pas être confondu
  avec une pastille.

Conséquence directe : une action destructive **secondaire** (le « Supprimer »
d'une ligne) se signale par son **libellé rouge** sur fond blanc. Le fond
rouge pâle n'apparaît qu'au **survol**. L'aplat rouge plein reste réservé au
bouton de confirmation dans la boîte de dialogue, là où l'action est vraiment
sur le point d'être exécutée.

### 2 bis. L'aplat rouge plein : deux emplois, pas trois

- **Confirmation dans une boîte de dialogue** : aplat rouge plein
  (`variant="destructive"`). C'est là que l'action s'exécute.
- **Encart « zone dangereuse »** : un bloc isolé, dont l'aplat rouge est le
  sujet même. Autorisé — il ne côtoie aucune pastille et ne se répète pas.
  Concerne `OrganizationSummaryTab`, `UserDeleteCard` et la suspension
  d'un utilisateur back-office.
- **Partout ailleurs**, une action destructive est secondaire :
  `variant="destructiveOutline"` (blanc, libellé rouge, pastel au survol).
  Un aplat rouge répété sur chaque ligne d'une liste crie plus fort que le
  contenu qu'il accompagne.

### 3. Les actions forment un bloc, détaché du contenu

Dans une carte, une ligne de frise, une entrée de liste : les boutons vivent
dans leur propre conteneur, séparé du texte par un filet et un écart vertical
qui vaut au moins le double de l'interligne. On ne pose pas un bouton sur la
même ligne qu'une pastille.

---

## Ce que la règle ne vise pas

Trois formes rondes existent dans l'application sans être des pastilles. Elles
sont **hors périmètre**, et ce n'est pas une entorse :

1. **Le bouton-icône circulaire** — un rond portant une seule icône, sans
   libellé (`UserAvatar.tsx`). Une pilule est allongée et porte du texte ;
   un rond d'icône ne peut pas être lu comme une étiquette.
2. **Les ronds décoratifs** — avatars, pastille du jour dans l'agenda, barre
   de progression d'une campagne.
3. **Les compteurs** — total d'une colonne kanban, nombre d'éléments d'un
   filtre. Ils ne portent ni état ni action, et ne prennent pas de point.

## Comment l'appliquer dans le code

Les composants existent déjà, il s'agit de choisir la bonne variante.

**Une information → `Badge`** (`src/components/ui/badge.tsx`)

```tsx
<Badge variant="success" appearance="outline" size="sm">
  <BadgeDot /> Réalisée
</Badge>
```

La pilule est le rendu **par défaut** de toutes les tailles : il n'y a rien à
passer pour l'obtenir. `appearance="outline"` donne le triplet
texte / fond pastel / bordure de la charte. `BadgeDot` ajoute le point, à
poser sur toute pastille métier (état, priorité, étiquette) et sur aucun
compteur. Ne jamais mettre de `onClick` sur un `Badge`.

**La couleur d'un fond, d'un filet ou d'un rail n'est pas concernée.** La
règle porte sur des objets — pastilles et boutons. Un filet de couleur au bord
d'une ligne, un rail de frise, une teinte de fond ne sont ni l'un ni l'autre :
ils colorent sans ajouter d'objet à distinguer, et restent donc libres.

**Le point, oui — sauf dans une colonne de tableau.** Une colonne de liste ne
contient que des pastilles : il n'y a rien dont les distinguer, et le point y
coûte 10 px de large. Sur la liste des organismes, ces 10 px suffisaient à
faire passer « En cours de prospection » sous la colonne « Actions », qui est
`sticky right: 0`. Le point est donc réservé aux endroits où une pastille
côtoie un bouton : en-tête de fiche, carte, frise.

Une pastille d'état de cycle de vie passe par `StatusBadge`
(`src/components/shared/StatusBadge.tsx`), qui applique déjà la règle.

**Une action → `Button`** (`src/components/ui/button.tsx`)

```tsx
<Button variant="outline" size="sm">Modifier</Button>
<Button variant="destructiveOutline" size="sm">Supprimer</Button>
```

`variant="destructive"` (aplat rouge plein) est réservé au bouton de
confirmation d'une `AlertDialog` et aux encarts « zone dangereuse », jamais à
une action de ligne.

**Un filtre cliquable qui ressemble à une pastille ?** Ça n'existe pas non
plus : c'est un `Button variant="outline"` ou un `ToggleGroup`. Si un élément
est cliquable, il prend la forme d'un bouton.

---

## Contrôle avant de livrer un écran

Sur chaque capture de `npm run probe`, **sans passer la souris** :

1. Chaque élément coloré est-il classable en un coup d'œil — pilule ou
   rectangle ?
2. Un bouton porte-t-il un fond pastel au repos ? Si oui, c'est un défaut.
3. Une pastille et un bouton partagent-ils une même ligne ? Si oui, séparer.

Une réponse fausse à l'une des trois se corrige avant la relecture.
