# Demande API — la filiation d'une version tarifaire n'est pas conservée

> Émise par le front le 06/09/2026, avant le développement de
> *Paramètres › Grille tarifaire* (L2 · US-02-01). Contrat lu dans `HANDOFF-L2.md`
> et **éprouvé en direct** sur l'API en marche. Aucun code n'a été modifié.

---

## Le défaut

`POST /pricing-grids` accepte `fromVersion`, mais **rien n'en garde la trace**. Les clés
d'une version, relevées sur la réponse réelle :

```
id, version, effectiveDate, active, createdBy, createdAt, quotesCount, content
```

Aucune ne dit **de quoi cette version dérive**. Une fois créée, une version paraît sortie de
nulle part.

## Ce que ça produit, concrètement

Le parcours retenu côté front est une liste de versions, chacune ouvrable pour relecture et
correction. C'est le parcours que le contrat impose de fait : sans `PATCH`, corriger une
grille, c'est en créer une.

Or une correction repart du contenu de la version **ouverte**, pas de la version active :

```
v5  active        ← trois mois de mises à jour tarifaires
v1  remplacée     ← un administrateur l'ouvre pour corriger une coquille de libellé
                    et enregistre : v6 naît du contenu de v1
v6  en préparation ← contient les prix de v1
```

Le jour où quelqu'un active v6 — et rien ne l'en dissuade, elle est la plus récente et porte
la date d'effet la plus proche — **les trois mois de travail entre v1 et v5 disparaissent**
des nouveaux devis. Silencieusement : aucun écran, aucun journal ne dit que v6 était une
photo de v1.

Le front peut prévenir au moment de l'enregistrement, et il le fera. Mais il ne peut rien
au moment de l'**activation**, qui est le geste dangereux et qui se produit souvent des
semaines plus tard, parfois par une autre personne, depuis une liste où v6 ne se distingue
en rien d'une version à jour.

## Ce que nous demandons

### 1. Conserver et rendre la filiation

Un champ `basedOnVersion` sur chaque version, rendu par `GET /pricing-grids`,
`/pricing-grids/:id` et `/pricing-grids/active` :

```json
{ "version": 6, "basedOnVersion": 1, "effectiveDate": "2027-01-01", "active": false }
```

- `basedOnVersion` = la version dont le contenu est issu — celle passée en `fromVersion`,
  ou celle que le front déclare avoir chargée quand il envoie un `content` modifié.
- `null` pour une grille écrite de zéro et pour la version du seed.

Cela suffit à ce que la liste puisse afficher « **v6** · dérivée de la **v1** », ce qui rend
le problème visible plutôt que de le laisser en embuscade.

### 2. Refuser d'activer une version dérivée d'une grille périmée

À l'activation, si `basedOnVersion` n'est ni la version active ni `null` :

```
409  PRICING_GRID_BASE_OUTDATED
messages.meta: { "activeVersion": 5, "basedOnVersion": 1 }
```

Franchissable par un `force: true` explicite dans le corps, pour le cas légitime — revenir
volontairement à une grille antérieure.

`messages.meta` plutôt que le texte : le front doit pouvoir écrire « la version 6 a été
préparée à partir de la version 1, alors que la version 5 est active » sans analyser une
phrase.

## Pourquoi côté serveur

Le front préviendra à l'enregistrement, mais l'activation est un geste **séparé dans le
temps** et souvent confié à une autre personne. Un garde-fou qui ne tient qu'à l'écran qui a
créé la version ne protège pas celui qui l'active trois semaines plus tard.

C'est par ailleurs le même endroit qui revalide déjà le contenu à l'activation — « une
version enregistrée avant un durcissement des règles ne peut pas devenir active en douce ».
La filiation périmée relève exactement de la même préoccupation.

## Ce que le front fait en attendant

Le tiroir annoncera, à l'enregistrement d'une version qui n'est pas l'active :

> Cette version sera créée à partir de la **version 1**, non de la version active
> (**version 5**).

C'est une atténuation, pas une correction : elle protège celui qui enregistre, pas celui qui
active. Aucun autre contournement n'est possible côté front, puisque rien dans la réponse ne
permet de savoir de quoi une version existante dérive.

## Portée

Deux champs et un code d'erreur, tous **additifs** : un client qui ignore `basedOnVersion`
ne voit aucune différence, et le `409` ne se déclenche que sur un cas aujourd'hui silencieux
et destructeur.
