# Paramètres › Grille tarifaire — L2 · US-02-01

> Établi le 06/09/2026 depuis `HANDOFF-L2.md` §US-02-01, `SPEC-04-MOTEUR-TARIFAIRE.md`
> et la maquette V8 (`SETPANE.tarifs`, l. 594 650). **Contrat éprouvé en direct** sur
> l'API en marche. Aucun code n'a été modifié pour écrire ce document.
>
> **Deuxième version de l'étude.** La première décrivait un écran unique et modifiable,
> repris de la V8. Elle est remplacée par le parcours **liste de versions → tiroir**
> décrit au §3, qui épouse le contrat au lieu de le contourner.
>
> **Mise à jour du 06/09, après relecture du handoff.** L'API a livré ce que la
> demande de filiation réclamait — `basedOnVersion` et le refus d'activer une
> version dérivée d'une grille périmée — et a ajouté une règle que l'étude
> ignorait : `fromVersion` doit accompagner **aussi** un `content` modifié. Voir
> §3.3 et §3.4.

---

## 1. Ce que le contrat donne, vérifié en direct

Cinq routes, toutes livrées :

| Route | Ce qu'elle rend |
|---|---|
| `GET /pricing-grids` | les versions, **sans `content`** |
| `GET /pricing-grids/active` | la version qui chiffre aujourd'hui, `content` compris |
| `GET /pricing-grids/:id` | une version précise, archive ou brouillon |
| `POST /pricing-grids` | prépare une version, **inactive** |
| `POST /pricing-grids/:id/activate` | bascule le projet, en transaction, idempotent |

Réponse réelle du projet Périscolia :

```
v1  active=true  effet=2026-08-31  devis=0  créée par=null (seed)
content : 6 strates · 3 formules (ESSENTIEL/CONFORT/PREMIUM) · 6 options
          · 3 postes de frais (training, deployment, configuration) · 3 extras
```

Le handoff n'en montrait que deux : **le poste `configuration` existe** en plus de
`deployment` et `training`. L'écran ne doit pas figer la liste des postes.

**Il n'existe ni `PATCH` ni `DELETE`.** C'est la contrainte structurante de cette US, et
c'est elle qui dicte le parcours du §3.

Permissions : `pricing:read` pour lire — **les commerciaux l'ont** — et `pricing:update`
pour préparer et activer, réservé à l'administrateur de projet.

---

## 2. Une grille n'est pas un réglage, c'est un document daté

La V8 traite la grille comme un réglage : on tape dans une case, c'est enregistré. L'API en
fait un document daté — une version est une photo complète et figée, une seule est active,
et les devis déjà chiffrés y restent attachés.

Si l'écran ne porte pas cette idée, l'utilisateur modifie un prix, voit « enregistré », et
ne comprend pas pourquoi ses devis gardent l'ancien tarif. C'est le seul risque sérieux de
cette US.

---

## 3. Le parcours : une liste de versions, un tiroir par version

### 3.1 L'écran — la liste

Le panneau *Paramètres › Grille tarifaire* affiche **les versions**, pas les prix. Une
ligne par version, alimentée par `GET /pricing-grids` :

| Version | Date d'effet | État | Devis chiffrés | Créée par | Créée le |
|---|---|---|---|---|---|
| **v2** · dérivée de la v1 | 01/01/2027 | En préparation | 0 | Abdoulaye S. | 03/09/2026 |
| **v1** | 31/08/2026 | **Active** | 12 | — | 31/08/2026 |

L'écran dit d'emblée ce qu'il est : un historique, pas un formulaire. La colonne « Devis
chiffrés » porte l'essentiel — au-delà de zéro, la version est un document d'archive
auquel des devis restent attachés.

`createdBy` vaut `null` pour la version du seed : afficher un tiret, pas « null ».

### 3.2 Le tiroir — tous les champs de la version

Choisir une ligne ouvre un tiroir alimenté par `GET /pricing-grids/:id`. Les cinq tableaux
de la V8 y sont repris tels quels, mais **repliés en accordéon**, un groupe par section :

| Section | Forme |
|---|---|
| **Tranches de population** | libellé, de, à — une ligne par strate |
| **Abonnement HT/mois** | une ligne par formule × une colonne par strate |
| **Options mensuelles HT** | même matrice, plus le nombre inclus |
| **Frais de mise en place HT** | une ligne par poste × formule, une colonne par strate |
| **Matériel et prestations libres** | prix unique, hors formule et hors strate |

Avec, en tête, ce que la version est : « **Version 1** — active depuis le 31/08/2026 ·
12 devis y restent attachés ».

**Pourquoi l'accordéon.** Les cinq tableaux dépliés, c'est une soixantaine de cases sur
plusieurs écrans de haut : on corrige un prix d'option en ayant perdu de vue ce qu'on
modifie. Replié, chaque section annonce son contenu d'une ligne — « 6 strates », « 3
formules », « 6 options » — et l'utilisateur ouvre la seule qui l'intéresse. C'est aussi ce
qui rend le tiroir lisible sur un écran d'ordinateur portable.

Deux règles pour que le repli ne cache rien d'important :

- **Une section qui porte une erreur s'ouvre d'office** et le reste. Un `400` sur une case
  invisible serait pire qu'un message global.
- **Une section modifiée le dit sur son en-tête**, repliée ou non : « Abonnement — *2
  modifications* ». Sinon on enregistre sans savoir ce qu'on enregistre.

`accordion.tsx` existe déjà dans le projet et n'est utilisé nulle part.

### 3.3 L'édition est locale, l'enregistrement crée la version

Le tiroir se modifie librement **en mémoire**. Aucune saisie n'appelle le serveur.
« Enregistrer » demande la date d'effet, puis envoie **un seul**
`POST /pricing-grids { fromVersion, content, effectiveDate }` — et la version
suivante naît, inactive.

> ⚠️ **`fromVersion` accompagne le `content`, toujours.** Il porte deux rôles :
> d'où le contenu est copié, **et** de quelle version la nouvelle dérive. Omis,
> `basedOnVersion` vaut `null` et le garde-fou d'activation du §3.4 ne se
> déclenche jamais — la protection existerait sans protéger. Le serveur ne peut
> pas le deviner : il ne reçoit qu'un contenu, et le seul cas qu'il saurait
> détecter est la copie identique, justement celui qui ne pose pas problème.

> ⚠️ **Le piège que ce parcours évite.** Dans la V8, chaque case porte un `onchange` qui
> écrit immédiatement. Transposé tel quel, cela créerait **une version par case modifiée**
> — dix-huit versions pour les dix-huit cases des frais de mise en place — et il n'existe
> aucune route pour les retirer. Une version par **enregistrement**, jamais par frappe.

Le bouton doit annoncer ce qu'il fait : « **Enregistrer — créera la version 3** ». C'est la
seule façon de rendre le versionnement évident au moment où il compte.

**Ce que ce découpage simplifie.** La saisie ne vit que dans le tiroir : la garde contre la
perte de modifications se réduit à sa fermeture — le motif du panneau de fiche, où seuls la
croix et « Annuler » ferment, ni le clic à côté ni Échap. Un écran modifiable en pleine page
aurait exigé d'intercepter toute la navigation de l'application.

### 3.4 Le piège propre à ce parcours

**Modifier une ancienne version repart de son contenu, pas de l'actif.** Si v5 est active et
qu'on ouvre v1 pour corriger un prix, la version 6 naîtra du contenu de **v1** — et
effacera, en devenant active, tout ce qui a été fait entre-temps.

Le tiroir doit donc le dire lorsqu'on modifie une version qui n'est pas l'active :
« Cette version sera créée à partir de la **version 1**, non de la version active
(**version 5**). »

C'est le seul défaut que ce parcours introduit, et il est invisible sans cette phrase.

**Mais la phrase ne protège que celui qui enregistre.** L'activation est un geste séparé
dans le temps, souvent confié à une autre personne. **L'API le couvre depuis le 06/09**, à
la demande du front (`docs/DEMANDE-API-GRILLE-FILIATION.md`) :

- **`basedOnVersion`** est rendu par les trois routes de lecture. La liste peut donc
  afficher « **v6 · dérivée de la v1** » — le signal qui manquait à celui qui active.
- **`409 PRICING_GRID_BASE_OUTDATED`** refuse d'activer une version dérivée d'une grille
  qui n'est plus active, avec `activeVersion` et `basedOnVersion` dans `messages.meta` :
  de quoi écrire « la version 6 a été préparée à partir de la version 1, alors que la
  version 5 est active » sans analyser une phrase. `{ "force": true }` passe outre —
  revenir volontairement à une grille antérieure est légitime, et c'est journalisé.

Les deux se complètent : l'avertissement protège celui qui enregistre, le refus protège
celui qui active trois semaines plus tard.

### 3.5 L'activation est un second geste

`effectiveDate` est **déclarative** : aucun automatisme ne bascule la grille à la date dite.
Seul `POST /pricing-grids/:id/activate` applique. On peut donc préparer la grille 2027 en
novembre, la faire relire, et ne l'activer que le 1er janvier — c'est tout l'intérêt du
découpage, et l'écran doit l'énoncer.

La confirmation dit ce qui change, en langage clair : « Les nouveaux devis seront chiffrés
avec la version 2. Les 12 devis déjà émis conservent leur chiffrage. »

Avant d'activer, **rafraîchir la liste** : deux administrateurs peuvent avoir préparé chacun
la leur. Le serveur garantit la numérotation, personne n'écrase personne, mais chacun doit
voir ce que l'autre a préparé avant de basculer.

---

## 4. Ce que la V8 apporte, et où elle induit en erreur

Les cinq tableaux se reprennent tels quels, avec leurs modales d'ajout, de renommage et de
retrait. **Le vocabulaire change** entre la maquette et le contrat :

| V8 | API |
|---|---|
| `strates[{label,min,max}]` | `brackets[{label,min,max}]`, `max: null` pour la strate ouverte |
| `formules[]` | `plans[]` |
| `abonnement{formule: []}` | `subscription{plan: []}` |
| `options[{id,nom,pu,inclus}]` | `options[{id,name,unitPrice,included}]` |
| `oneShot{clé:{lib, formule:[]}}` | `setupFees{clé:{label, plan:[]}}` |
| `extras[{id,nom,pu}]` | `extras[{id,name,unitPrice}]` |

**Quatre endroits où la maquette ment.**

1. **`normaliserStrates` cale silencieusement** un tableau de prix trop court sur sa
   dernière valeur. Le serveur refuse et dit **où**. Ajouter une strate impose d'étendre
   tous les tableaux ; le front peut pré-remplir la nouvelle colonne, mais l'utilisateur
   doit la voir et la valider.
2. **Le mot « version » n'apparaît nulle part** dans la maquette : elle recopie la grille
   entière dans chaque devis. La liste, le tiroir et le bandeau d'état sont **à concevoir**.
3. **La colonne « Organismes concernés »** se calcule sur la base locale de la V8.
   `GET /organizations` n'offre **ni filtre de population, ni filtre de strate** — vérifié.
   Non alimentable ; voir §7.
4. **Renommer un poste de frais change son `label`, jamais sa clé.** La clé `training` est
   reconnue par le serveur pour ventiler le une-fois sur le devis. Si le front régénère la
   clé depuis le libellé (`training` → `formation`), la ventilation formation **retombe
   silencieusement à zéro**. C'est le défaut le plus coûteux de cette US.

Et une interdiction : **ne jamais recalculer un prix côté front**. Le moteur tarifaire est
la seule implémentation du calcul.

---

## 5. Les erreurs se posent sur les cellules

`400 PRICING_GRID_INVALID` renvoie dans `messages.details[]` des constats portant le
**chemin** fautif. Le tiroir doit les résoudre en cellules :

| `details[]` | Où le montrer |
|---|---|
| `brackets[2].label: required` | en-tête de la 3ᵉ colonne de strate |
| `brackets[3]: overlaps the previous bracket` | en-tête de la 4ᵉ colonne |
| `subscription.CONFORT: 5 prices for 6 brackets` | ligne CONFORT de l'abonnement |
| `setupFees.training.PREMIUM: prices must be numbers ≥ 0` | poste Formation, ligne PREMIUM |
| `options[1].unitPrice: missing price table` | ligne de la 2ᵉ option |
| `extras: duplicate id` | tableau des prestations libres |

Un message global renverrait l'utilisateur chercher lui-même parmi soixante cases.

---

## 6. Ce qui existe déjà côté front

**L'écran Paramètres accueille un panneau en une ligne.** `SETTINGS_TABS` porte cinq
entrées, la navigation est pilotée par le paramètre d'URL `panneau`, et chaque panneau est
un composant autonome sous `components/panes/`.

**`PERMISSIONS.PRICING = { READ, UPDATE }` est déjà déclaré**, et aucun écran ne s'en sert.

**`ReusableTable` et `ReusableSheet` couvrent la liste et le tiroir**, tous deux éprouvés
sur les organismes — y compris la règle « seules la croix et Annuler ferment ».

**Rien d'autre n'existe** : ni type, ni service, ni hook. `pricing` n'apparaît dans le front
que dans les permissions et dans le `bracketLabel` en lecture seule de la fiche organisme.

---

## 7. Ce qui demande une décision

**La largeur du tiroir — tranché : large, avec défilement par tableau.** L'accordéon règle
la hauteur, pas la largeur : les frais de mise en place restent une matrice de 3 postes × 3
formules × 6 strates, dix-huit lignes et huit colonnes, quand le tiroir de fiche organisme
est taillé pour deux colonnes de champs. Le tiroir sera donc large, et chaque tableau
défilera horizontalement **dans son propre conteneur** — la règle du projet veut qu'un
contenu large ne fasse jamais partir la page de travers.

Reste une conséquence à surveiller au développement : une grille à douze strates rendrait le
tableau des frais illisible même ainsi. Le contrat ne plafonne pas le nombre de strates ;
six est ce qu'on observe aujourd'hui.

**La colonne « Organismes concernés ».** Informative dans la V8, non alimentable ici. Je la
supprimerais : demander une route à l'API pour un chiffre décoratif ne se justifie pas avant
que quelqu'un le réclame.

**Une version préparée par erreur reste dans la liste pour toujours.** Ni `PATCH` ni
`DELETE`. Le handoff le donne comme une limite assumée ; à confirmer, sinon c'est une US à
ouvrir côté API. Attention si elle l'est : `Quote.pricingGrid` est en `onDelete: Cascade`,
une route `DELETE` devra refuser `quotesCount > 0`.

---

## 8. Découpage proposé

**Tranche A — la liste et le tiroir en lecture · une demi-journée.** Types, service, hooks,
panneau, tableau des versions, tiroir avec les cinq tableaux. Livrable utile seul : un
commercial avec `pricing:read` peut consulter la grille, ce qu'il ne peut pas faire
aujourd'hui.

**Tranche B — l'édition et l'enregistrement · une journée.** Copie locale, modales de
tranche, formule, option, poste et prestation, garde à la fermeture, fenêtre de date d'effet,
`POST` unique, et l'avertissement du §3.4 quand on repart d'une version non active. C'est la
tranche qui porte le risque.

**Tranche C — l'activation · une demi-journée.** Confirmation en langage clair,
rafraîchissement de la liste avant bascule, résolution des `details[]` en erreurs de cellule.

**Deux jours.** La tranche A est sans risque, la B concentre l'essentiel.

---

## 9. Ce qui n'est pas dans cette US

Le configurateur de devis, la simulation (`POST /quotes/simulate`) et l'affichage du
chiffrage relèvent de US-02-02 et suivantes. Cette US s'arrête à la grille : la lire, la
préparer, l'activer.
