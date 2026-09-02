# Recette BDD front — par US

> Scénarios décrivant le comportement **visible par l'utilisateur**. Pendant front
> de `oui-crm-api/docs/features/*.feature`, qui couvre le contrat d'API : on ne
> redocumente pas les appels HTTP, on décrit ce que voit l'utilisateur.
>
> Mis à jour **à chaque feature livrée**. Une feature n'est pas terminée tant que
> ses scénarios ne figurent pas ici.
>
> Les chaînes d'interface citées restent en français : ce sont celles que
> l'utilisateur lit réellement, tirées des fichiers `constants/`.
>
> **Aucun runner n'est câblé** — voir §Outillage. Ces scénarios valent
> spécification et checklist de revue, pas build vert.

Les onze US livrées côté API figurent ici. Celles dont l'écran front n'existe
pas encore portent les scénarios **à couvrir** : elles servent de plan de
travail, et la colonne Statut dit où on en est.

| US | Domaine | Statut front |
|---|---|---|
| US-00-01 | Connexion, session, déconnexion | ✅ livré |
| US-00-02 | Activation, mot de passe oublié, changement d'e-mail | ✅ livré |
| US-00-03 | Profil | 🟡 livré ; volet légal écarté |
| US-00-04 | Projets, mode projet | ✅ livré |
| US-00-05 | Utilisateurs du projet | 🟡 tout est là sauf les surcharges de permissions |
| US-00-06 | Rôles et droits | ❌ à développer |
| US-00-07 | Périmètres | ❌ à développer |
| US-00-08 | Paramètres du projet | 🟡 livré hors grille tarifaire |
| US-00-09 | Référentiels | ❌ à développer |
| US-00-10 | Journal d'activité | ❌ à développer |
| US-00-11 | Comptes back-office | ✅ livré |
| **US-01-01** | **Organismes — liste et recherche** | ✅ livré |
| **US-01-03** | **Organismes — fiche et modification** | 🟡 Synthèse livrée ; onglet Contacts à développer |

---

## US-00-01 · Connexion, session, déconnexion

### Validation du formulaire

| # | Scénario | Attendu |
|---|---|---|
| 1 | Formulaire vide | « Champ requis » sous les deux champs, aucun appel |
| 2 | E-mail malformé | « Adresse email invalide », aucun appel |
| 3 | Révéler le mot de passe | le champ passe en clair |

### Nominal

| # | Scénario | Attendu |
|---|---|---|
| 4 | Connexion réussie | les deux jetons sont stockés, `/me` est appelé avant toute redirection |
| 5 | Aucune entrée de menu autorisée | atterrissage sur `/no-permissions` |

### Identifiants

| # | Scénario | Attendu |
|---|---|---|
| 6 | Mot de passe faux | « Email ou mot de passe incorrect. », aucun jeton stocké |
| 7 | E-mail inconnu | **le même message**, jamais d'indication sur l'existence du compte |
| 8 | Compte non actif | message dédié, sans mention de blocage temporaire |

### Verrouillage (423)

| # | Scénario | Attendu |
|---|---|---|
| 9 | Compte verrouillé | compte à rebours affiché, bouton désactivé |
| 10 | Fin du décompte | le bouton se réactive seul |
| 11 | `text` contredit `meta.lockedUntil` | **le décompte suit `meta`**, `text` n'est jamais analysé |
| 12 | Verrouillage sans date exploitable | message générique, aucun décompte, bouton actif |

### Session

| # | Scénario | Attendu |
|---|---|---|
| 13 | Jeton expiré | rafraîchi de façon transparente, appel rejoué |
| 14 | Trois 401 simultanés | **un seul** `/auth/refresh` |
| 15-18 | Échec du refresh (4 codes) | jetons effacés, retour au login |
| 19 | Échec du refresh, appels concurrents | **une seule** redirection |
| 20 | Compte désactivé en cours de session | déconnexion, bandeau explicite |

### Déconnexion et gardes

| # | Scénario | Attendu |
|---|---|---|
| 21 | Déconnexion sur session déjà morte | traitée comme un succès |
| 22 | Page protégée sans jeton | redirection vers le login |

---

## US-00-02 · Activation, mot de passe oublié, changement d'e-mail

### Activation d'un compte

| # | Scénario | Attendu |
|---|---|---|
| 1 | Lien valide | le formulaire de création de mot de passe s'affiche |
| 2 | Lien expiré | écran dédié « Lien expiré », distinct du lien invalide |
| 3 | Lien invalide | écran dédié, sans laisser croire à une expiration |
| 4 | Consentements | CGU et RGPD obligatoires, l'envoi est bloqué sans eux |
| 5 | Critères du mot de passe | 10 caractères, 1 lettre, 1 chiffre — **exactement** la règle serveur, ni plus ni moins |
| 6 | Mot de passe trop faible | refusé avant envoi, aucun appel |
| 7 | Activation réussie | la session est ouverte, aucun re-login demandé |

### Mot de passe oublié

| # | Scénario | Attendu |
|---|---|---|
| 8 | Demande | écran de confirmation, **sans** révéler si l'adresse existe |
| 9 | Lien de réinitialisation expiré | écran dédié |
| 10 | Réinitialisation réussie | confirmation, retour au login |
| 11 | Nouveau mot de passe trop faible | refusé avant envoi |

### Changement d'e-mail

| # | Scénario | Attendu |
|---|---|---|
| 12 | Demande | mot de passe courant exigé |
| 13 | Mot de passe re-saisi faux | message d'erreur, **aucune déconnexion** — le 401 est ici une réponse métier |
| 14 | Confirmation depuis le lien | fonctionne quel que soit l'état de connexion, y compris sur un autre appareil |
| 15 | Jeton de confirmation expiré | écran dédié |

---

## US-00-03 · Profil

| # | Scénario | Attendu |
|---|---|---|
| 1 | Affichage | identité, e-mail, rôles et projets rattachés |
| 2 | Champs absents du contrat | ni statut ni date de modification technique — le premier est constant, la seconde changeait à chaque connexion |
| 3 | Modifier son profil | prénom, nom, téléphone |
| 4 | Changer son mot de passe | ancien exigé, nouveau soumis à la politique serveur |
| 5 | Ancien mot de passe erroné | message, **aucune déconnexion** |
| 6 | Changement réussi | toutes les sessions sont fermées, retour au login |
| 7 | Avatar | recadrage puis envoi, suppression possible |

**Écarté sur consigne :** ré-acceptation légale (`POST /legal/accept`,
`legalReacceptanceRequired`). À reprendre ici le jour où le sujet est réouvert.

---

## US-00-04 · Projets et mode projet

### Atterrissage et accès

| # | Scénario | Attendu |
|---|---|---|
| 1 | Un back-office se connecte | atterrit sur `/projects`, résolu par permission et non par type de contact |
| 2 | Utilisateur sans `projects:read` | entrée absente du menu, accès direct redirigé |

### Liste

| # | Scénario | Attendu |
|---|---|---|
| 3 | Affichage | nom, identifiant, produit, statut, nombre d'utilisateurs, fonctionnalités |
| 4-6 | Statuts | Brouillon / Actif / Archivé, différenciés par la couleur |
| 7 | Filtre et recherche | `status` et `search` transmis |
| 8 | Liste vide | « Aucun projet » avec illustration |

### Détail

| # | Scénario | Attendu |
|---|---|---|
| 9 | Ouvrir une fiche | identité, activité, fonctionnalités |
| 10 | Fonctionnalités | **toutes** listées, activées ou non — seul écran où une fonctionnalité désactivée est visible |
| 11 | Projet inconnu | « Projet introuvable » et retour à la liste, **jamais une page blanche** |

### Mode projet

| # | Scénario | Attendu |
|---|---|---|
| 12 | Ouvrir dans un onglet | nouvel onglet, l'administration reste dans l'onglet courant |
| 13 | Bascule du menu | nom du projet en tête, cinq groupes repliables de la V8 |
| 14 | Appels scopés | chaque requête porte `x-project-id` ; le projet ne transite jamais par le chemin d'API |
| 15 | Quitter le projet | le scope est vidé, les appels suivants ne portent plus l'en-tête |
| 16 | Écran non livré | écran d'attente, entrée ni grisée ni masquée |
| 17 | Écran d'attente et permission | l'accès reste refusé sans la permission |

---

## US-00-05 · Utilisateurs du projet — 🟡 création et modification remises au contrat

Les payloads d'écriture étaient hérités de soft-m et **échouaient à 100 %** :
`roleId` au lieu de `roleCode`, `initials` et `isExternal` absents, `status`
envoyé alors que l'API le refuse. Remis au contrat, vérifiés contre l'API.
Restent à développer les surcharges de permissions et la correction d'e-mail.

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Liste sans projet actif | erreur « Aucun projet sélectionné » tant qu'aucun projet n'est ouvert | couvert |
| 2 | Liste dans un projet | les utilisateurs du projet, filtrables par statut et rôle | couvert |
| 3 | Créer un utilisateur | prénom, nom, e-mail, initiales et rôle demandés ; e-mail d'activation envoyé | couvert |
| 4 | Initiales hors format | « Deux ou trois majuscules ou chiffres » sous le champ, aucun appel | couvert |
| 5 | Initiales déjà prises | message dédié après réponse du serveur, le formulaire reste rempli | couvert |
| 6 | E-mail déjà rattaché au projet | « Cet utilisateur est déjà rattaché à ce projet » | couvert |
| 7 | E-mail d'un compte back-office | message expliquant que les deux types de comptes sont distincts | couvert |
| 8 | Accès externe sans date | la date de fin devient obligatoire dès que l'interrupteur est activé | couvert |
| 9 | Modifier un utilisateur | prénom, nom, initiales, rôle et date de fin ; le statut n'y figure pas | couvert |
| 10 | Modifier son propre compte | rôle et accès désactivés, avec l'explication sous le champ | couvert |
| 11 | Retirer le dernier administrateur | refus expliqué, l'utilisateur reste en place | couvert |
| 12 | Surcharges de permissions | ajouts et retraits par rapport au rôle, remplacement en bloc | à développer |
| 16 | Filtrer par rôle | la liste se restreint au rôle choisi, rôles chargés depuis l'API | couvert |
| 17 | Ouvrir une fiche depuis la liste | l'icône de la colonne Actions mène à la fiche du projet | couvert |
| 18 | Retour après un retrait | on revient à la liste **du projet**, jamais à la liste plateforme | couvert |
| 13 | Renvoyer l'activation | proposé sur un compte en attente seulement | à développer |
| 14 | Retirer un utilisateur | affectation suspendue, réversible — jamais présentée comme une suppression | couvert |
| 15 | Corriger l'e-mail | **route inexistante côté API** : l'écran appelle `PATCH /users/:id/email`, qui répond 404 | à retirer ou à faire ouvrir côté API |

### Pièges relevés pendant le développement

- **Le rôle se choisit par son `code`, jamais par son `id`.** L'API répond
  explicitement « property roleId should not exist ». `GET /roles` rend les deux,
  la tentation de prendre l'`id` est réelle.
- **Le statut ne se modifie pas par `PATCH /users/:id`.** Suspendre passe par
  `DELETE`, réactiver par un nouveau `POST`. Un sélecteur de statut dans le
  formulaire d'édition fait échouer tout l'enregistrement.
- **La date de fin est un jour calendaire `YYYY-MM-DD`.** Un `Date` sérialisé en
  ISO est refusé. D'où le `<input type="date">`, qui ne peut produire que ce
  format — ne pas le remplacer par un sélecteur qui rend un `Date`.
- **Sur son propre compte**, le serveur refuse le rôle
  (`CANNOT_UPDATE_OWN_ROLE`) *et* le périmètre ou la date
  (`CANNOT_UPDATE_OWN_ACCESS`) : anti-escalade de privilèges. Le front n'envoie
  donc aucun des trois, et désactive les champs plutôt que de laisser découvrir
  le refus à l'enregistrement.
- **Le retrait ne supprime rien.** `DELETE /users/:id` suspend l'affectation ;
  un nouveau `POST` la réactive. Les libellés promettaient une « suppression
  définitive des données associées » — faux, et sur des données personnelles
  c'est une promesse qu'on ne tient pas.
- **La création a trois issues, le serveur n'en distingue que deux.** `PENDING`
  = compte créé et invitation envoyée ; `ACTIVE` = rattachement **ou**
  réactivation d'une affectation suspendue, sans moyen de trancher côté front.
  Ne pas inventer un troisième message.
- **Une fiche revient à sa liste en relatif, jamais en absolu.**
  `USER_ROUTES.USERS_LIST()` rend `/users` : depuis
  `/:projectId/users/:id/informations`, cela sortait de l'espace projet et
  atterrissait sur la liste plateforme, qui appelle une route scopée sans
  `x-project-id` — « Aucun projet sélectionné » juste après un retrait.
  `navigate('../..', { relative: 'path' })` : `relative: 'path'` est
  indispensable, React Router remonte d'une *route* par défaut, pas d'un
  segment d'URL.
- **`UserDetailsLink` rendait `null` sans prop `getPath`**, ce qui vidait la
  colonne Actions de la liste projet : plus aucun moyen d'ouvrir une fiche, donc
  ni modification ni retrait. Il utilise désormais un chemin relatif par défaut.
- **`scopeId` n'est pas encore proposé** : il dépend de la feature « périmètres »
  (US-00-07), non commencée. Le contrat le rend optionnel, la création
  fonctionne sans.

---

## US-00-06 · Rôles et droits — ❌ à développer

| # | Scénario | Attendu |
|---|---|---|
| 1 | Liste des rôles | rôles système et rôles du projet, avec le nombre d'utilisateurs |
| 2 | Rôle système | structure verrouillée, seule la duplication est offerte |
| 3 | Dupliquer un rôle | nouveau code et libellé demandés |
| 4 | Matrice des droits | permissions groupées par module, comme la maquette V8 |
| 5 | Portée d'une permission | projet ou données propres, choisie par permission |
| 6 | Visibilité hors périmètre | aucune, restreinte ou complète |
| 7 | Enregistrer | remplacement complet de la liste des permissions |
| 8 | Supprimer un rôle système | refusé, message explicite |
| 9 | Supprimer un rôle utilisé | refusé, en indiquant qu'il est affecté |

---

## US-00-07 · Périmètres — ❌ à développer

| # | Scénario | Attendu |
|---|---|---|
| 1 | Liste des périmètres | nom, régions, départements, portefeuille |
| 2 | Régions | proposées depuis l'API, jamais codées en dur |
| 3 | Créer un périmètre | régions et départements sélectionnables |
| 4 | Modifier | les listes sont remplacées en bloc, pas fusionnées |
| 5 | Supprimer un périmètre affecté | refusé, en indiquant l'usage |

---

## US-00-08 · Paramètres du projet

### Navigation

| # | Scénario | Attendu |
|---|---|---|
| 1 | Navigation | **uniquement les panneaux réels** — Société, Règles commerciales, Documents, Référentiels ; « Société » ouvert par défaut |
| 2 | Panneau interdit | l'entrée disparaît de la navigation |
| 3 | Chargement paresseux | `/settings` n'est appelé que si un panneau en dépend |
| 4 | Panneau dans l'URL | `?panneau=references` ouvre les Référentiels ; le rafraîchissement le conserve |

### Société

| # | Scénario | Attendu |
|---|---|---|
| 4 | Modifier un champ | le PATCH ne porte **que** ce champ — le serveur fusionne clé par clé, un envoi complet écraserait la modification d'un autre administrateur |
| 5 | Enregistrer sans changement | aucune requête (corps vide refusé par l'API) |
| 6 | Vider un champ | chaîne vide envoyée, jamais `null` |
| 7-9 | SIREN, SIRET, e-mail invalides | message sous le champ, aucun appel |
| 10 | Lecture seule | champs désactivés, pas de bouton d'enregistrement |

### Règles commerciales

| # | Scénario | Attendu |
|---|---|---|
| 11 | Étapes | les sept, dans l'ordre du contrat |
| 12 | Gagnée et Perdue | **désactivées**, mention « Valeur figée par le serveur » |
| 13 | Modifier une étape | seule celle-ci est envoyée, jamais `WON` ni `LOST` |
| 14 | Probabilité hors 0–100 | refusée avant envoi |

### Documents et numérotation

| # | Scénario | Attendu |
|---|---|---|
| 15 | Numérotation | trois exemples, **en lecture seule** — les formats sont fixes côté serveur |
| 16 | Type sans gabarit | « Aucun gabarit téléversé », bouton « Téléverser » |
| 17 | Téléverser un gabarit | version, nom, date et lien de téléchargement |
| 18 | Gabarit refusé | les balises manquantes de `messages.details` **restent affichées** pendant la correction, pas dans un toast |
| 19 | Fichier trop lourd ou de mauvais type | message, gabarit actif inchangé |
| 20 | Re-téléverser le même nom de fichier | l'envoi se déclenche — le champ est réinitialisé après chaque choix |
| 21 | Cachet en place | aperçu affiché, bouton « Remplacer » |

---

## US-00-09 · Référentiels — ❌ à développer

| # | Scénario | Attendu |
|---|---|---|
| 1 | Affichage | une catégorie à la fois, choisie dans un sélecteur qui donne le nombre de valeurs |
| 2 | Lecture pour tous | tout rôle du projet peut consulter |
| 3 | Modification | réservée à l'administrateur de projet |
| 4 | Ajouter une valeur | apparaît dans les listes déroulantes qui s'en servent |
| 5 | Désactiver une valeur | reste sur les enregistrements existants, disparaît des nouveaux choix |
| 6 | Réordonner | glisser une ligne enregistre le nouvel ordre et le conserve après rechargement |
| 7 | Renommer | le libellé se modifie sur place, sans ouvrir de fenêtre |
| 8 | Rechercher | filtre la catégorie ; le réordonnancement est désactivé tant que le filtre est actif |

---

## US-00-10 · Journal d'activité — ❌ à développer

| # | Scénario | Attendu |
|---|---|---|
| 1 | Affichage | horodatage, utilisateur, action, objet, référence, détail |
| 2 | Filtres | par période, par utilisateur, par type d'action |
| 3 | Portée | entrées du projet courant seulement |
| 4 | Entrées plateforme | les actions back-office n'y figurent pas |
| 5 | Export CSV | prévu au L5, absent pour l'instant |

---

## US-00-11 · Comptes back-office

### Accès

| # | Scénario | Attendu |
|---|---|---|
| 1 | Sans projet sélectionné | l'écran fonctionne, **aucun** `x-project-id` envoyé |
| 2 | Sans `userBackoffice:read` | entrée absente du menu |

### Liste

| # | Scénario | Attendu |
|---|---|---|
| 3 | Affichage | nom, e-mail, rôle, statut, dernière connexion ; jamais d'utilisateur projet |
| 4-7 | Statut composite | En attente / Actif / Inactif / Suspendu |
| 8 | Recherche et filtre | `search` et `status` transmis |

### Création

| # | Scénario | Attendu |
|---|---|---|
| 9 | Liste des rôles | vient de `/backoffice/roles`, **aucun code en dur** |
| 10 | Création | compte en attente, e-mail d'activation annoncé |
| 11 | E-mail déjà pris | message affiché, fenêtre maintenue, **aucun rejet non capturé** |
| 12 | Recréer un compte suspendu | réactivation, et non doublon |
| 13-14 | E-mail invalide, prénom vide | refusés avant envoi |

### Détail

| # | Scénario | Attendu |
|---|---|---|
| 15 | Édition | e-mail absent du formulaire (non modifiable par l'API) |
| 16 | Modification annulée | ne survit pas à la réouverture |
| 17 | Renvoi d'activation | proposé sur un compte en attente seulement |
| 18 | Suspension | le libellé annonce la réversibilité, **jamais une suppression** |
| 19 | Son propre compte | action de suspension absente |
| 20 | Identifiant d'un utilisateur projet | « Opérateur introuvable », sans laisser entendre qu'il existe ailleurs |

---

## US-01-01 · Organismes, liste et recherche — 🟡 liste livrée

Première story du lot L1. La liste reprend les onze colonnes de l'écran
Organismes de la V8 et ses filtres, dans la limite de ce que l'API sert.

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Liste dans un projet | les organismes du projet, paginés, tri par nom par défaut | couvert |
| 2 | Types, solutions et étiquettes | affichés en libellés, jamais en clés de référentiel | couvert |
| 3 | Strate | valeur rendue par l'API, jamais recalculée côté front | couvert |
| 4 | Statuts | libellés français de la V8, dans son ordre | couvert |
| 5 | Filtre « fiches incomplètes » | envoie `completenessMax=99`, pas 100 | couvert |
| 6 | Recherche | nom, ville, et début du SIRET si la saisie est numérique | couvert |
| 7 | Fiche hors périmètre | ligne en retrait, « hors de votre périmètre », colonnes vidées | couvert |
| 8 | Tri sur une colonne non triable | Type et Solution ne sont pas cliquables — l'API ne les trie pas | couvert |
| 9 | Filtre par strate | **impossible** : l'API n'expose pas ce filtre | hors périmètre API |
| 10 | Filtre par commercial | demande la liste des membres du projet | à développer |
| 11 | Ouvrir une fiche | panneau latéral, onglet Synthèse (US-01-03) | à développer |
| 12 | Sélection multiple | actions groupées (US-01-05), non livrée côté API | à développer |

### Pièges relevés pendant le développement

- **La recherche ne fait pas ce que promet la V8.** Son placeholder annonce
  « Nom, ville, code postal, SIRET, contact… ». Vérifié contre l'API : `14000`
  et `Lemarchand` ne rendent **rien**. Le placeholder dit désormais la vérité —
  ne pas le « rétablir » sur la maquette.
- **La strate vient de l'API.** Les grilles tarifaires sont par projet et
  versionnées : Caen (105 512) et Paris (2 145 906) partagent « Plus de 10 000
  hab. » parce que c'est la tranche haute de *cette* grille. La V8 ne code pas
  les tranches en dur non plus (`STRATES = PRICING.strates.map(...)`). Ne jamais
  recalculer `bracketLabel`.
- **`completenessMax` est inclusif** : le compteur « fiches incomplètes » vaut
  99, pas 100 — 100 ramènerait toute la base.
- **`type`, `solution` et les étiquettes sont des clés de référentiel.**
  Affichées brutes, l'utilisateur lit « HOT · PUBLIC_TENDER ». Elles passent
  toutes par `useReferenceLabels`, y compris les étiquettes du sous-titre.
- **Une clé inconnue s'affiche telle quelle**, jamais masquée : une fiche peut
  porter une valeur devenue inactive, l'effacer donnerait une colonne vide sans
  explication.
- **`access: "RESTRICTED"` ne rend que neuf champs.** Tout le reste est
  optionnel dans le type — ne jamais le lire sans vérifier l'accès. Le cas
  `NONE` n'existe pas côté front : ces fiches n'apparaissent pas en liste et
  répondent 404 en détail.
- **Type et Solution ne sont pas triables** côté API, alors que la V8 rend leurs
  en-têtes cliquables. Ils ne le sont pas ici, plutôt que d'offrir un tri qui
  échouerait.

---

## US-01-03 · Organismes, fiche et modification — 🟡 Synthèse livrée

Panneau latéral, onglet Synthèse — le `openDrawer` de la V8. Les onglets
Actions, Commercial, Client et Support attendent l'US-01-08 et les lots L2/L4.

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Ouvrir une fiche | valeurs renseignées, référentiels résolus, aucun champ en erreur | couvert |
| 2 | Bandeau de complétude | critères manquants nommés en français, blocage du devis signalé | à couvrir |
| 3 | Enregistrer sans rien changer | aucun appel, message neutre | couvert |
| 4 | Modifier un champ | seul ce champ part dans la requête | à couvrir |
| 5 | Champs dérivés | région et strate affichées, non modifiables | à couvrir |
| 6 | Statuts commercial et client | en lecture seule, avec l'endroit où les modifier | couvert |
| 7 | Fiche hors périmètre | panneau restreint, ni formulaire ni coordonnées | à couvrir |
| 8 | Sans permission de modification | formulaire en lecture seule, pas de bouton d'enregistrement | à couvrir |
| 9 | Onglet Contacts | liste, ajout, contact principal unique (US-01-04) | à développer |

### Pièges relevés pendant le développement

- **Lecture et écriture n'ont pas la même forme.** `GET` rend
  `solution: { key }` et `services: [{ key }]` ; `PATCH` exige des chaînes.
  Recopier la lecture dans le corps donne « solution must be a string ». La
  conversion est faite une fois, dans le formulaire.
- **`salesStatus` et `customerStatus` sont refusés par `PATCH`** — vérifié :
  « property salesStatus should not exist, property customerStatus should not
  exist ». Ils sont donc en lecture seule. Un sélecteur ferait échouer
  **tout** l'enregistrement, pas seulement le champ.
- **On n'envoie que les champs modifiés.** Le contrat refuse un corps vide, et
  envoyer la fiche entière écraserait ce qu'un autre vient de changer.
- **Créer le formulaire avant la fiche vide le sélecteur de type.** Le
  formulaire naissait dans le panneau puis était corrigé par un `reset` : les
  champs texte suivaient, mais le sélecteur passait de non contrôlé à
  contrôlé, gardait son état vide et le renvoyait dans le formulaire — « Champ
  requis » sur une fiche pourtant typée. Le formulaire se crée là où la fiche
  est chargée, et le panneau le remonte par `key` en changeant de fiche.
- **Ne jamais déclarer un composant dans le corps d'un autre.** `TextField` et
  les groupes de cases l'étaient : React voit un nouveau type à chaque rendu et
  démonte le sous-arbre, ce qui fait perdre le focus à chaque frappe.
- **`blocks.quote` peut valoir `null`**, pas seulement `true`/`false` : à lire
  comme « inconnu ou bloqué », jamais avec une égalité stricte.

---

## Conventions

Reprises de la recette de l'API pour que les deux se lisent pareil.

- **nominal** — le chemin normal
- **error** — une erreur que l'utilisateur doit comprendre
- **validation** — contrôle côté client, aucune requête émise
- **guard** — accès à une route ou visibilité d'une entrée
- **session** — cycle de vie des jetons, intercepteur

Chaque piège rencontré pendant le développement a son scénario : ce sont les
régressions qu'on réintroduit sans s'en apercevoir.

---

## Outillage

**Aucun runner n'est câblé.** Le projet n'a pas de framework de test. Quand la
décision sera prise, le découpage naturel est :

- **composant et hook** — Vitest + Testing Library, avec MSW pour servir les
  réponses d'API décrites ici. Couvre la validation, le décompte, l'intercepteur.
- **navigateur** — Playwright, pour les scénarios de garde et de redirection qui
  dépendent d'une navigation réelle.

---

## Scénarios exécutés

<!-- bdd:auto:start -->
_Généré par `npm run bdd` — 2026-09-02 13:10. 38/38 OK._
_Les captures sont locales et non versionnées : relancer `npm run bdd` pour les produire._

| US | # | Scénario | Résultat | Capture |
|---|---|---|---|---|
| US-01-01 | 01-01.2 | Types, solutions et étiquettes affichés en libellés | OK | `screenshots/01-01-2.png` |
| US-01-01 | 01-01.5 | Le filtre « fiches incomplètes » envoie completenessMax=99 | OK | `screenshots/01-01-5.png` |
| US-01-01 | 01-01.7 | Une fiche hors périmètre est signalée et ses colonnes vidées | OK | `screenshots/01-01-7.png` |
| US-01-03 | 01-03.1 | La fiche s’ouvre avec ses valeurs, référentiels résolus | OK | `screenshots/01-03-1.png` |
| US-01-03 | 01-03.3 | Enregistrer sans modification n’appelle pas l’API | OK | `screenshots/01-03-3.png` |
| US-01-03 | 01-03.6 | Les deux statuts sont en lecture seule, avec leur raison | OK | `screenshots/01-03-6.png` |
| US-00-01 | 01.1 | Formulaire vide : deux messages, aucun appel | OK | `screenshots/01-1.png` |
| US-00-01 | 01.2 | E-mail malformé refusé avant envoi | OK | `screenshots/01-2.png` |
| US-00-01 | 01.6 | Mot de passe faux : message unique, aucun jeton | OK | `screenshots/01-6.png` |
| US-00-01 | 01.8 | Compte non actif : message dédié, sans mention de blocage | OK | `screenshots/01-8.png` |
| US-00-01 | 01.9 | Compte verrouillé : compte à rebours, bouton désactivé | OK | `screenshots/01-9.png` |
| US-00-01 | 01.11 | Le décompte suit meta.lockedUntil, jamais le texte | OK | `screenshots/01-11.png` |
| US-00-01 | 01.22 | Page protégée sans jeton : redirection vers le login | OK | `screenshots/01-22.png` |
| US-00-04 | 04.1 | Un back-office atterrit sur la liste des projets | OK | `screenshots/04-1.png` |
| US-00-04 | 04.3 | La liste affiche projet, produit, statut et fonctionnalités | OK | `screenshots/04-3.png` |
| US-00-04 | 04.11 | Projet inconnu : écran dédié, jamais de page blanche | OK | `screenshots/04-11.png` |
| US-00-04 | 04.13 | Le menu bascule sur les cinq groupes de la V8 | OK | `screenshots/04-13.png` |
| US-00-04 | 04.14 | Chaque appel scopé porte x-project-id | OK | `screenshots/04-14.png` |
| US-00-04 | 04.16 | Un écran non livré affiche l’attente, sans être grisé | OK | `screenshots/04-16.png` |
| US-00-05 | 05.2 | Le filtre par rôle part bien dans la requête | OK | `screenshots/05-2.png` |
| US-00-05 | 05.4 | Initiales hors format refusées avant envoi | OK | `screenshots/05-4.png` |
| US-00-05 | 05.8 | Accès externe : la date de fin reste visible et atteignable | OK | `screenshots/05-8.png` |
| US-00-05 | 05.14 | Le retrait n'est jamais présenté comme une suppression | OK | `screenshots/05-14.png` |
| US-00-05 | 05.15 | Après un retrait, on revient à la liste du projet | OK | `screenshots/05-15.png` |
| US-00-08 | 08.1 | La navigation ne liste que les panneaux réels | OK | `screenshots/08-1.png` |
| US-00-08 | 08.4 | Le panneau ouvert est porte par l'URL | OK | `screenshots/08-4.png` |
| US-00-08 | 08.7 | SIREN invalide refusé avant envoi | OK | `screenshots/08-7.png` |
| US-00-08 | 08.12 | Gagnée et Perdue sont figées et désactivées | OK | `screenshots/08-12.png` |
| US-00-08 | 08.15 | Numérotation affichée en lecture seule | OK | `screenshots/08-15.png` |
| US-00-09 | 09.1 | Une catégorie à la fois, choisie dans un sélecteur chiffré | OK | `screenshots/09-1.png` |
| US-00-09 | 09.4 | La clé est normalisée en majuscules à la saisie | OK | `screenshots/09-4.png` |
| US-00-09 | 09.5 | Une valeur inactive reste affichée, en retrait | OK | `screenshots/09-5.png` |
| US-00-09 | 09.6 | Un glisser-déposer enregistre le nouvel ordre | OK | `screenshots/09-6.png` |
| US-00-09 | 09.7 | Le libellé se renomme sur place | OK | `screenshots/09-7.png` |
| US-00-09 | 09.8 | La recherche filtre et suspend le réordonnancement | OK | `screenshots/09-8.png` |
| US-00-11 | 11.1 | Les opérateurs s’affichent sans projet sélectionné | OK | `screenshots/11-1.png` |
| US-00-11 | 11.9 | Les rôles viennent de l’API, aucun code en dur | OK | `screenshots/11-9.png` |
| US-00-11 | 11.11 | E-mail déjà pris : message, fenêtre maintenue | OK | `screenshots/11-11.png` |
<!-- bdd:auto:end -->
