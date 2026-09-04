# Écart — l'agenda livré face à la maquette V8

> Relevé le 03/09/2026 sur `RENDER.agenda`, `agendaCalendrier`, `agendaListe`
> et la table `NATURES` de `docs/OuiCRM_V8.html`, confronté à l'écran livré
> (L1 · US-01-09) et au contrat `GET /agenda`.
>
> La **faisabilité** est jugée sur ce que la route accepte réellement :
> `from`, `to`, `userId`, `kinds`, `page`, `limit` — et rien d'autre.

---

## 1. Ce qui est conforme

| Élément V8 | État |
|---|---|
| Titre et bouton « + Enregistrer une action », masqué sans le droit de créer | livré |
| Navigation de période, flèches et « Aujourd'hui » | livré |
| Filtre collaborateur | livré, **et amélioré** : masqué en portée `OWN`, où le serveur refuserait un collègue par `403` |
| Filtre par type d'action | livré |
| Segment « À faire / En retard / Historique / Tout » | livré |
| Clic sur un événement → fiche de l'organisme, onglet Actions | livré, **et amélioré** : la fiche s'ouvre sur l'agenda, sans quitter l'écran |
| Vue Mois, vue Liste | livrées |

---

## 2. Les écarts, par ordre de valeur

### A. La vue Liste est bornée au mois — la V8 liste tout

**L'écart le plus structurant, et je ne l'avais pas vu.**

La V8 groupe sa liste par **horizon** — En retard, Aujourd'hui, Cette semaine,
Ce mois-ci, Plus tard, Historique — chacun avec son compteur, le premier en
rouge. Elle part de **toutes** les actions, sans fenêtre de dates.

Notre liste groupe par **jour**, sur le seul mois affiché. « Cette semaine » et
« Plus tard » n'y auraient d'ailleurs pas de sens : ce qui vient après le 30
n'est pas chargé.

Conséquence concrète : un commercial qui ouvre l'agenda le 28 du mois ne voit
rien de la semaine suivante, alors que c'est précisément ce qu'il prépare.

**Faisabilité : bonne, mais elle demande une décision.** `from` et `to` sont
libres : la vue Liste pourrait demander une fenêtre glissante — disons trente
jours en arrière et quatre-vingt-dix en avant — indépendante du curseur de
mois. Deux réserves. La pagination est à 100 par page et nous chargeons toutes
les pages : une fenêtre de cent vingt jours peut faire trois ou quatre
requêtes. Et le curseur de période perd son sens en vue Liste, ce que la V8
assume puisqu'elle n'en affiche pas.

### B. Les vues Semaine et Jour manquent

Écartées d'un commun accord au moment du découpage, mais elles font partie de
l'écran de la maquette.

**Faisabilité : bonne, sans dépendance.** Il suffit de calculer d'autres bornes
`from`/`to` et de rendre sept colonnes ou une colonne. La vue Jour est aussi ce
qui manque au point suivant.

### C. Une cellule du mois n'est pas cliquable

Dans la V8, cliquer une cellule bascule en vue **Jour** sur ce jour. Chez nous
seul le « +N » réagit, et il bascule en Liste.

**Faisabilité : dépend de B.** Sans vue Jour, la bascule n'a pas de
destination naturelle.

### D. Les cases à cocher par source ne sont pas interactives

La V8 propose quatre cases à cocher avec une pastille colorée — un calque par
nature — visibles **hors** de la vue Liste. Nous affichons les quatre sources
avec leur compte, mais sans pouvoir en éteindre une.

**Faisabilité : bonne, la route accepte `kinds`.** Mais **sans intérêt avant le
lot L2** : au L1, éteindre « Actions » vide l'écran et les trois autres sont à
zéro. À faire quand une deuxième source répond.

### E. Le code couleur par nature est absent

`NATURES` associe une couleur à chaque source, portée par la bordure gauche de
chaque pastille.

**Faisabilité : bonne, mais sans objet au L1** — une seule source répond, et un
code couleur à une entrée n'informe de rien. Les couleurs de la V8 sont par
ailleurs celles de sa charte violette, à retraduire en azur.

### F. Le segment d'état est toujours visible

Dans la V8 il n'apparaît **qu'en vue Liste** ; les cases à cocher, elles,
n'apparaissent **qu'en vue calendrier**.

**Faisabilité : triviale.** Mais je propose de **garder notre choix** :
filtrer « En retard » sur la grille du mois est utile, et faire disparaître un
contrôle en changeant de vue oblige l'utilisateur à comprendre pourquoi.

### G. Trois événements par cellule au lieu de quatre

**Faisabilité : triviale**, une constante. Sans conséquence.

### H. Le bouton Outlook

**Faisabilité : bloquée par le contrat.** `AgendaItemDto` porte le *libellé* du
type, pas sa clé, et l'export est réservé aux types `metadata.ics: true`.
Rapprocher par libellé casserait dès qu'un projet renomme ses valeurs. En
attente de `type: { key, label }` sur le créneau.

### I. Le sous-titre

La V8 annonce « Actions, formations, échéances de contrat et fins de validité
des devis dans une seule vue ». Le nôtre décrit ce que l'écran fait
aujourd'hui.

**Écart assumé** : promettre trois sources qui ne répondent pas serait faux.
Le sous-titre de la V8 redeviendra juste au lot L4.

---

## 3. Ce que je recommande

**A d'abord** — la vue Liste sur une fenêtre glissante, groupée par horizon
avec ses compteurs. C'est le seul écart qui prive l'utilisateur d'une
information qu'il attend, et il touche l'usage quotidien.

**B ensuite**, qui débloque C.

**D et E quand une deuxième source répondra**, pas avant.

**F, G** : à laisser tels quels, ou à trancher.

**H** : rien à faire tant que le contrat ne bouge pas.
