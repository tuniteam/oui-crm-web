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

Toutes les US livrées côté API figurent ici. Celles dont l'écran front n'existe
pas encore portent les scénarios **à couvrir** : elles servent de plan de
travail, et la colonne Statut dit où on en est.

Le **lot** précède chaque référence d'US, ici comme dans les titres de section
et dans les fichiers `.feature` : les numéros se répètent d'un lot à l'autre, et
« US-04 » seul ne dit pas duquel il s'agit.

| Lot | US | Domaine | Statut front |
|---|---|---|---|
| L0 | US-00-01 | Connexion, session, déconnexion | ✅ livré |
| L0 | US-00-02 | Activation, mot de passe oublié, changement d'e-mail | ✅ livré ; **aucun scénario exécuté** |
| L0 | US-00-03 | Profil | 🟡 livré, volet légal écarté ; **aucun scénario exécuté** |
| L0 | US-00-04 | Projets, mode projet | ✅ livré |
| L0 | US-00-05 | Utilisateurs du projet | 🟡 tout est là sauf les surcharges de permissions |
| L0 | US-00-06 | Rôles et droits | ❌ à développer |
| L0 | US-00-07 | Périmètres | ✅ livré |
| L0 | US-00-08 | Paramètres du projet | 🟡 livré hors grille tarifaire |
| L0 | US-00-09 | Référentiels | ✅ livré |
| L0 | US-00-10 | Journal d'activité | ❌ à développer |
| L0 | US-00-11 | Comptes back-office | ✅ livré |
| **L1** | **US-01-01** | **Organismes — liste et recherche** | ✅ livré |
| **L1** | **US-01-02** | **Organismes — création** | ✅ livré |
| **L1** | **US-01-03** | **Organismes — fiche et modification** | 🟡 Synthèse livrée ; onglets L2/L4 à venir |
| **L1** | **US-01-04** | **Organismes — contacts** | ✅ livré |
| **L1** | **US-01-13** | **Organismes — suppression** | ✅ livré |
| **L1** | **US-01-05** | **Actions groupées** | ❌ à développer — `POST /organizations/bulk` est livrée côté API |
| **L1** | **US-01-08** | **Actions commerciales** | ❌ à développer |
| **L1** | **US-01-11** | **Campagnes** | 🟡 lecture et création livrées ; la cible reste à faire |

---

## L0 · US-00-01 · Connexion, session, déconnexion

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

## L0 · US-00-02 · Activation, mot de passe oublié, changement d'e-mail

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

## L0 · US-00-03 · Profil

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

## L0 · US-00-04 · Projets et mode projet

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
| 18 | Menu plateforme | Projets et Opérateurs seulement — les utilisateurs d'un projet ne s'y atteignent pas |

### Pièges relevés pendant le développement

- **Les utilisateurs ne sont pas un écran de plateforme.** Le menu de
  l'opérateur back-office portait une entrée « Utilisateurs » vers `/users`.
  Or `GET /users` est une route de projet : sans projet sélectionné elle répond
  `400`, et l'écran affichait « Aucun utilisateur trouvé pour ce projet » —
  alors qu'aucun projet n'était sélectionné — avec un bouton de création qui
  aurait échoué de même. L'entrée est retirée du menu plateforme ; elle reste
  dans le menu du projet, sous Administration.

---

## L0 · US-00-05 · Utilisateurs du projet — 🟡 création et modification remises au contrat

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
| 15 | Corriger l'e-mail | **retiré de l'écran** : `PATCH /users/:id/email` n'existe pas côté API (confirmé par l'inventaire des routes) | retiré |

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

## L0 · US-00-06 · Rôles et droits — ❌ à développer

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

## L0 · US-00-07 · Périmètres — 🟢 livré

Panneau de Paramètres, comme les Référentiels. Un périmètre est du **contrôle
d'accès** : il décide de ce qu'un utilisateur voit dans la base d'organismes.

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Liste des périmètres | nom, description, nombre d'utilisateurs, et les trois axes | couvert |
| 2 | Départements résolus | rendus par l'API, jamais recalculés côté front | couvert |
| 3 | Territoire entier | une liste résolue vide affiche « France entière », **jamais « 0 département »** | couvert |
| 4 | Un seul chemin | « Périmètres » ne figure **pas** dans le menu du projet : il vit dans Paramètres, et deux chemins vers le même écran feraient douter qu'ils mènent au même endroit | couvert |
| 5 | Sans `scopes:read` | ni l'entrée de navigation, ni le panneau — un commercial ne l'a pas | à couvrir |
| 6 | Aucun périmètre | message expliquant que sans périmètre chaque utilisateur voit toute la base | à couvrir |
| 7 | Régions | les 14, proposées depuis `GET /geo/regions`, jamais codées en dur | couvert |
| 8 | Région entière | part sous son nom dans `regions`, `departments` vide | couvert |
| 9 | Région amputée | case en état indéterminé, et les départements restants partent explicitement — le contrat ne permet pas « la Normandie sauf l'Orne » sous un nom de région | couvert |
| 13 | Nom déjà pris | `409 SCOPE_NAME_EXISTS` : message **sous le champ**, fenêtre maintenue | couvert |
| 14 | Modifier un périmètre mixte | région entière et départements isolés rechargés puis repliés à l'identique ; les deux listes repartent au complet | couvert |
| 15 | Supprimer un périmètre libre | la requête part et la fenêtre se ferme | couvert |
| 10 | Supprimer un périmètre affecté | `409 SCOPE_IN_USE` : refus expliqué, **comptes suspendus compris**, et l'action retirée — il n'y a rien à réessayer | couvert |
| 11 | Affecter à un utilisateur | sélecteur sur la fiche utilisateur, « Toute la base » pour n'en affecter aucun ; masqué sans `scopes:read` | couvert |
| 12 | Affecter dès la création | même sélecteur ; sans choix, `scopeId` **n'est pas transmis** — le serveur applique son défaut | couvert |

### Pièges relevés pendant le développement

- **Une liste de départements résolus vide signifie tout le territoire**, pas
  aucun département. Afficher « 0 département » sur un périmètre national serait
  un contresens exact. La valeur vient du serveur, qui déplie les régions,
  dédoublonne et trie — elle ne se recalcule pas côté front, comme la strate d'un
  organisme.
- **Les trois axes se combinent par intersection**, pas par addition. Cocher
  « portefeuille personnel » en plus d'une géographie *restreint* l'accès. Le
  sous-titre du panneau le dit, sans quoi un administrateur croirait élargir.
- **`usersCount` et le garde-fou de suppression ne comptent pas la même
  population** — vérifié dans la source de l'API : le compteur ne retient que
  les affectations actives, le garde-fou les compte toutes. Un périmètre affiché
  à « 0 utilisateur » peut donc voir sa suppression refusée. L'écran ne
  promettra pas qu'une suppression aboutira. Écart signalé dans
  `docs/ETUDE-PERIMETRES.md`.
- **`409 SCOPE_IN_USE` ne porte pas de `meta`**, contrairement aux campagnes où
  `meta.scopes` nomme les gêneurs. L'écran ne pourra pas guider la
  dissociation.

---

## L0 · US-00-08 · Paramètres du projet

### Navigation

| # | Scénario | Attendu |
|---|---|---|
| 1 | Navigation | **uniquement les panneaux réels** — Société, Règles commerciales, Documents, Référentiels, Périmètres ; « Société » ouvert par défaut |
| 2 | Panneau interdit | l'entrée disparaît de la navigation |
| 3 | Chargement paresseux | `/settings` n'est appelé que si un panneau en dépend |
| 4 | Panneau dans l'URL | `?panneau=references` ouvre les Référentiels ; le rafraîchissement le conserve |

### Société

<!-- La numerotation d'une US est continue d'un sous-tableau a l'autre : le
     rapport rapproche les executions par US + numero, et « Societe » repartait
     a 4, deja pris par « Navigation ». Un seul resultat couvrait alors deux
     lignes, et le compte des scenarios couverts etait surevalue d'une unite. -->

| # | Scénario | Attendu |
|---|---|---|
| 5 | Modifier un champ | le PATCH ne porte **que** ce champ — le serveur fusionne clé par clé, un envoi complet écraserait la modification d'un autre administrateur |
| 6 | Enregistrer sans changement | aucune requête (corps vide refusé par l'API) |
| 7 | Vider un champ | chaîne vide envoyée, jamais `null` |
| 8-10 | SIREN, SIRET, e-mail invalides | message sous le champ, aucun appel |
| 11 | Lecture seule | champs désactivés, pas de bouton d'enregistrement |

### Règles commerciales

| # | Scénario | Attendu |
|---|---|---|
| 12 | Étapes | les sept, dans l'ordre du contrat |
| 13 | Gagnée et Perdue | **désactivées**, mention « Valeur figée par le serveur » |
| 14 | Modifier une étape | seule celle-ci est envoyée, jamais `WON` ni `LOST` |
| 15 | Probabilité hors 0–100 | refusée avant envoi |

### Documents et numérotation

| # | Scénario | Attendu |
|---|---|---|
| 16 | Numérotation | trois exemples, **en lecture seule** — les formats sont fixes côté serveur |
| 17 | Type sans gabarit | « Aucun gabarit téléversé », bouton « Téléverser » |
| 18 | Téléverser un gabarit | version, nom, date et lien de téléchargement |
| 19 | Gabarit refusé | les balises manquantes de `messages.details` **restent affichées** pendant la correction, pas dans un toast |
| 20 | Fichier trop lourd ou de mauvais type | message, gabarit actif inchangé |
| 21 | Re-téléverser le même nom de fichier | l'envoi se déclenche — le champ est réinitialisé après chaque choix |
| 22 | Cachet en place | aperçu affiché, bouton « Remplacer » |

---

## L0 · US-00-09 · Référentiels — ❌ à développer

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

## L0 · US-00-10 · Journal d'activité — ❌ à développer

| # | Scénario | Attendu |
|---|---|---|
| 1 | Affichage | horodatage, utilisateur, action, objet, référence, détail |
| 2 | Filtres | par période, par utilisateur, par type d'action |
| 3 | Portée | entrées du projet courant seulement |
| 4 | Entrées plateforme | les actions back-office n'y figurent pas |
| 5 | Export CSV | prévu au L5, absent pour l'instant |

---

## L0 · US-00-11 · Comptes back-office

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

## L1 · US-01-01 · Organismes, liste et recherche — 🟢 livré

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
| 10 | Filtre par commercial | le paramètre `salesRepId` existe, mais peupler le sélecteur demande `GET /users` et la permission `users:read`, qu'un commercial n'a pas | à développer |
| 11 | Ouvrir une fiche | panneau latéral, onglet Synthèse (US-01-03) | couvert |
| 12 | Sélection multiple | actions groupées (US-01-05) — `POST /organizations/bulk` est **livrée** côté API, l'écran reste à faire | à développer |
| 13 | Action d'ouverture atteignable | colonne d'actions épinglée à droite et opaque, sans défilement | couvert |
| 14 | Filtre par département | saisie libre de 2 à 3 caractères, `2A` et l'outre-mer compris | couvert |
| 15 | Filtre par solution | valeurs du référentiel du projet, jamais une liste en dur | couvert |
| 16 | Filtre par étiquette | idem, référentiel `TAG` | couvert |
| 17 | Réinitialiser | n'apparaît que si un filtre est actif, et les efface tous | couvert |

### Pièges relevés pendant le développement

- **Trois filtres de la V8 avaient été écartés à tort.** J'avais conclu que
  seules la strate et le commercial manquaient. En réalité l'API filtre aussi
  par **département**, **solution** et **étiquette** — vérifié en direct :
  `department=89` ramène 2 fiches sur 7, `solution=JVS_ENFANCE` et `tag=WATCH`
  en ramènent 1 chacune. Les paramètres étaient déjà typés côté front ; il ne
  manquait que les sélecteurs. Lire un type ne dit pas ce que le serveur sait
  faire.
- **Le département se saisit, il ne se choisit pas.** La V8 construit sa liste
  depuis les fiches affichées. Ici la liste est paginée : les départements de
  la page courante ne sont pas ceux de la base, et un sélecteur construit ainsi
  masquerait des valeurs existantes.
- **Onze colonnes ne tiennent pas dans un écran.** Leurs largeurs déclarées
  totalisent 1770 px pour environ 1180 px utiles : la colonne d'actions sortait
  de l'écran, et l'unique action de la liste — ouvrir la fiche — devenait
  inatteignable. Le défilement horizontal existait, mais sa barre Radix ne se
  montre qu'au survol : rien n'indiquait qu'il fallait défiler. La colonne est
  désormais épinglée à droite par le tableau partagé, pour les quatre listes.
  Une colonne épinglée doit aussi être **opaque** : posée à 90 % d'opacité,
  elle laissait lire le texte des colonnes qu'elle recouvre.
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

## L1 · US-01-02 · Créer un organisme — 🟢 livré

Fenêtre `openCreateOrg` de la V8, ses deux chemins : la recherche au registre
officiel, qui pré-remplit la saisie, et la saisie manuelle.

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Ouverture | la fenêtre s'ouvre sur la recherche officielle ; « Créer la fiche » est inactif tant qu'aucune saisie n'existe | couvert |
| 2 | Recherche trop courte | moins de trois caractères : le bouton reste inactif, aucun appel — l'API refuserait par `400 INVALID_DATA` | couvert |
| 3 | Résultat du registre | nom, adresse, SIRET et code INSEE ; « Utiliser cette fiche » bascule sur la saisie pré-remplie | couvert |
| 4 | Département dérivé | pré-rempli depuis le code INSEE renvoyé par l'API, jamais recalculé côté front | couvert |
| 5 | Établissement fermé | `isActive: false` affiche un avertissement, **sans bloquer** la création | à couvrir |
| 6 | Registre indisponible | `503` ou `504` : message proposant la saisie manuelle, jamais un échec bloquant | couvert |
| 7 | Aucun résultat | `200` avec une liste vide : message distinct de l'indisponibilité | à couvrir |
| 8 | Champs obligatoires | nom, type et département seuls ; refusés avant envoi s'ils manquent | couvert |
| 9 | Ville non obligatoire | la V8 la marque requise, l'API non — un EPCI n'a pas de ville | couvert |
| 10 | Champ vide non transmis | une chaîne vide n'est pas envoyée : le serveur appliquerait sa valeur par défaut | à couvrir |
| 11 | SIRET déjà pris | `409 ORGANIZATION_SIRET_EXISTS` : message **sous le champ**, fenêtre maintenue | à couvrir |
| 12 | Code INSEE déjà pris | idem sous son champ | à couvrir |
| 13 | Doublon probable | `409 ORGANIZATION_POSSIBLE_DUPLICATE` : les candidats de `messages.meta.duplicates` sont listés, avec un lien pour les ouvrir | couvert |
| 14 | Confirmation du doublon | « Créer quand même » rejoue **la même requête** avec `force: true` | couvert |
| 15 | Refus du doublon | « Revenir à la saisie » ferme l'avertissement sans rien perdre de la saisie | à couvrir |
| 16 | Après création | la fiche créée s'ouvre, et la liste est rafraîchie | à couvrir |
| 17 | Sans permission | `organizations:create` absente : ni bouton, ni fenêtre | à couvrir |

### Pièges relevés pendant le développement

- **La strate n'a pas sa place ici.** La V8 la calcule dans le navigateur à
  partir de la population et l'affiche en lecture seule. Notre règle est
  qu'elle vient de l'API (`bracketLabel`) : avant création il n'y a pas de
  fiche, donc pas de strate. Elle apparaît sur la fiche, une fois créée.
- **Le contact principal de la V8 est retiré.** `POST /organizations` ne
  l'accepte pas : les contacts sont une route distincte (US-01-04), non
  développée. Le laisser aurait donné un champ dont la saisie serait perdue.
- **La « formule envisagée » attend la grille tarifaire.** `targetPlan` n'est
  pas une énumération figée : SPEC-04 le définit comme une **clé de
  `grid.plans`**, la grille du projet, qui est versionnée et activable. La V8
  écrit `ESSENTIEL / CONFORT / PREMIUM` en dur parce qu'elle n'a qu'une grille ;
  les reprendre ici les figerait dans le code d'un produit multi-tenant, et le
  premier projet doté d'une autre grille casserait en silence — l'API accepte
  n'importe quelle chaîne, et c'est le moteur tarifaire qui refuserait, plus
  tard, à la génération du devis.
  **Prérequis : `GET /pricing-grids/active`** (`pricing:read` `[P]`), qui
  donnera les formules du projet. La route est prévue côté API, marquée « à
  faire », et appartient au lot des devis (L2). Le champ sera ajouté à ce
  moment-là, sur la fiche comme à la création.
- **Un doublon probable n'est pas une erreur.** Le serveur pose une question :
  la fenêtre reste ouverte, la saisie intacte, et la même requête se rejoue
  avec `force`. La traiter comme un échec ferait ressaisir toute la fiche.
- **Les candidats se lisent dans `meta`, jamais dans le texte.**
  `messages.text` est écrit pour un humain et peut changer ; `meta.duplicates`
  est le contrat.
- **Le registre qui ne répond pas est un cas nominal.** `503` et `504` sont
  documentés comme tels : la saisie manuelle reste le chemin de secours, et
  chaque source dégrade indépendamment. Le scénario 6 a révélé que
  l'intercepteur envoyait **tout** 5xx sur l'écran « Erreur interne du
  serveur » : une panne d'une API publique tierce emmenait donc toute
  l'application hors du formulaire, saisie perdue. Une requête peut désormais
  déclarer que son 5xx est prévu par le contrat (`expectedServerError`), et
  seules celles-là y échappent.
- **La fiche ouverte est passée dans l'URL** (`?fiche=`) pour ce
  développement : sans adresse, un doublon signalé ne pouvait pas être proposé
  à l'ouverture.

---

## L1 · US-01-04 · Les contacts d'un organisme — 🟢 livré

Onglet Contacts du panneau, deuxième onglet de la fiche. Les contacts sont les
**détails** d'une fiche : ils exigent partout un accès géographique complet.

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Onglet | second onglet du panneau, masqué sans `contacts:read` | couvert |
| 2 | Liste | le contact principal en tête, puis nom et prénom | couvert |
| 3 | Ligne | initiales, civilité + nom, fonction · e-mail · téléphone | couvert |
| 4 | Badges | « Contact principal », « Ne pas démarcher », « Extrait d'une note » | couvert |
| 5 | Coordonnée absente | « email inconnu », « téléphone inconnu » — jamais un blanc | couvert |
| 6 | Aucun contact | message expliquant que le représentant légal est requis pour un contrat | à couvrir |
| 7 | Fiche hors périmètre | `403` : message d'accès, **pas** un échec technique | couvert |
| 8 | Fiche invisible | `404` : l'existence de la fiche n'est jamais révélée | à couvrir |
| 9 | Créer | **prénom et nom obligatoires**, refusés avant envoi s'ils manquent | couvert |
| 10 | Champ vide à la création | non transmis, jamais `null` : le serveur applique ses défauts | à couvrir |
| 11 | Champ vidé en modification | envoyé à `null` pour être effacé ; nom et prénom jamais | à couvrir |
| 12 | Nouveau principal | le précédent est rétrogradé par le serveur, la liste entière se rafraîchit | à couvrir |
| 13 | Complétude | le bandeau de l'onglet Synthèse se recalcule après une écriture | à couvrir |
| 14 | Supprimer | confirmation, puis retrait de la liste | couvert |
| 15 | Suppression refusée | `409 CONTACT_HAS_ACTIVITIES` : propose « Ne pas démarcher », pas un message d'échec | couvert |
| 16 | Sans `contacts:delete` | l'action disparaît — un commercial ne l'a pas | à couvrir |
| 17 | Sans `contacts:update` | « Modifier » disparaît | à couvrir |
| 19 | Fiche disparue à l'écriture | message nommé, fenêtre maintenue et saisie conservée | couvert |
| 18 | Longueurs maximales | civilité 10, prénom et nom 100, fonction 120, e-mail 255, téléphone et mobile 20, notes 2000 — celles des colonnes | couvert |

### Pièges relevés pendant le développement

- **Les contacts sont des détails, pas une sous-liste.** Une fiche hors
  périmètre se voit en liste mais pas ses contacts : `403` avec un rôle
  restreint, `404` avec un rôle sans lecture — l'existence n'est jamais
  révélée. L'onglet explique le refus au lieu d'afficher une erreur : traiter
  une règle d'accès comme une panne ferait croire à un dysfonctionnement.
- **Chaque écriture recalcule la complétude de l'organisme.** Le critère
  `PRIMARY_CONTACT` vaut un sixième du score. Ne rafraîchir que la liste des
  contacts laisserait le bandeau de l'onglet Synthèse mentir, et la colonne de
  complétude de la liste avec lui.
- **Promouvoir un principal en rétrograde un autre**, dans la même transaction
  côté serveur. C'est pourquoi la liste entière est rechargée après une
  écriture, et pas seulement la ligne touchée.
- **Un refus de suppression n'est pas une erreur.** `409
  CONTACT_HAS_ACTIVITIES` signifie que l'historique garde ses acteurs. Le
  contrat indique la sortie : proposer « ne pas démarcher », qui exclut le
  contact des campagnes sans toucher au passé. La fenêtre bascule sur cette
  action au lieu d'afficher un message sans suite.
- **Les règles de saisie ne se devinent pas.** La première version de cet
  écran les avait inventées : prénom rendu facultatif alors que l'API l'exige
  (`@IsNotEmpty`), civilité à 20 caractères au lieu de 10, téléphone à 40 au
  lieu de 20, e-mail sans limite au lieu de 255. Elles sont écrites — dans le
  handoff, où un champ **sans `?`** est obligatoire, et dans les DTO de l'API
  (`contacts/dto/`, seuils nommés dans `contacts.constants.ts`).
- **Un scénario qui simule la réponse du serveur ne valide pas le contrat.**
  Celui qui devait couvrir la création interceptait le `POST` : il passait au
  vert en affirmant l'inverse de la règle. Au moins une vérification doit
  atteindre le vrai serveur quand ce sont les règles de saisie qui sont en
  jeu.

---

## L1 · US-01-13 · Supprimer un organisme — 🟢 livré

Suppression **logique** : la fiche disparaît des lectures, la ligne demeure en
base. La purge définitive relève du RGPD (US-06-01).

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Emplacement de l'action | carte dédiée en bas de la fiche, à l'écart des actions du formulaire | couvert |
| 2 | Confirmation obligatoire | une fenêtre s'interpose, aucune suppression au premier clic | couvert |
| 3 | Ce que dit la fenêtre | disparition des lectures, identifiants libérés, pas d'effacement définitif, journalisation | couvert |
| 4 | Confirmer | `DELETE` envoyé, panneau fermé, liste rafraîchie | couvert |
| 5 | Renoncer | aucune requête, la fiche reste ouverte | couvert |
| 6 | Sans la permission | ni carte ni bouton — un commercial n'a pas `organizations:delete` | à couvrir |
| 7 | Fiche déjà supprimée | `404 ORGANIZATION_NOT_FOUND` : message, pas de page blanche | à couvrir |
| 8 | Fiche hors périmètre | `403 ACCESS_DENIED` avec un rôle restreint | à couvrir |
| 9 | Identifiants libérés | le SIRET d'une fiche supprimée peut resservir à la création | à couvrir |
| 10 | Contrats rattachés | `409 ORGANIZATION_HAS_CONTRACTS` — arrive au lot L3, pas encore émis | à développer |

### Pièges relevés pendant le développement

- **La maquette décrit une autre suppression.** La V8 n'offre qu'une
  suppression groupée (US-01-05, livrée côté API mais sans écran) et annonce que « les
  contacts et actions rattachés » partent avec la fiche. L'API, elle, fait une
  suppression **logique** et ne dit rien d'une cascade. Reprendre la
  formulation de la maquette aurait fait croire à un effacement définitif qui
  n'a pas lieu — même erreur que celle déjà corrigée sur le retrait d'un
  utilisateur.
- **Les identifiants redeviennent disponibles.** Les index d'unicité sont
  partiels sur `deleted_at IS NULL` : recréer une commune supprimée par erreur
  fonctionne. C'est une information utile à l'utilisateur, elle est dans la
  fenêtre.

---

## L1 · US-01-11 · Campagnes — 🟡 lecture et création livrées

Écran `RENDER.campagnes` de la maquette : des cartes, deux par ligne, chacune
portant son ciblage et ses quatre mesures.

| # | Scénario | Attendu | État |
|---|---|---|---|
| 1 | Liste | des cartes, avec responsable, période et statut | couvert |
| 2 | Sans campagne | message expliquant à quoi sert une campagne | couvert |
| 3 | Critères de ciblage | affichés comme une **note**, jamais comme un filtre actif — la cible est figée | couvert |
| 4 | Quatre mesures | rendues par l'API (`results`), jamais recalculées ; les trois du L2 restent à zéro et l'écran le dit | couvert |
| 5 | Filtrer par statut | `status` transmis au serveur | à couvrir |
| 6 | Créer | nom obligatoire, période facultative | couvert |
| 7 | Période inversée | refusée **avant envoi** — le serveur rendrait `400 INVALID_DATA` | couvert |
| 8 | Nom déjà pris | `409 CAMPAIGN_NAME_EXISTS` : message sous le champ, fenêtre maintenue | couvert |
| 9 | Transitions de statut | seules les transitions légales sont proposées : `DRAFT → ACTIVE → CLOSED`, et une close se rouvre | couvert |
| 10 | Transition refusée | `409 INVALID_STATUS_TRANSITION` : la liste est rechargée, l'écran ayant divergé | à couvrir |
| 11 | Modifier | champs effaçables par `null` ; le nom jamais | à couvrir |
| 12 | Sans `campaigns:create` | pas de bouton de création | à couvrir |
| 13 | La cible | panneau « Voir les N organismes », ajout et retrait | à développer |
| 14 | Ajout à la cible | `added` / `alreadyIn` / `skipped` rendus **tous les trois** | à développer |
| 15 | Effet sur le statut commercial | une fiche `NOT_CONTACTED` ciblée passe `TO_CONTACT` : la liste des organismes doit être invalidée | à développer |
| 16 | Supprimer | refusée si un périmètre cite la campagne, avec les périmètres nommés | à développer |

### Pièges relevés pendant le développement

- **La cible est figée, les critères sont documentaires.** La maquette met six
  filtres de ciblage dans la fenêtre de création, ce qui promettrait une cible
  qui se recalcule. Elle ne se recalcule pas : `criteria` dit seulement comment
  la liste a été construite. Le champ est donc absent du formulaire, et l'écran
  annonce que la cible se remplit après la création.
- **Les quatre mesures viennent du serveur.** La maquette les calcule dans le
  navigateur en parcourant les organismes ; ici elles sont dans `results`,
  calculées à la demande. Au L1 seul `activities` est alimenté — les trois
  autres restent à zéro **sans changement de contrat à venir**, donc on les
  affiche en le disant plutôt que de les masquer.
- **Seules les transitions légales sont proposées.** `DRAFT → ACTIVE →
  CLOSED`, et une campagne close se rouvre. Tout autre mouvement, **le statut
  identique compris**, rend `409`. Offrir les trois statuts et traduire le
  refus aurait fait cliquer pour rien.
- **« Planifier les relances » de la maquette n'a pas de route.** Planifier
  relève de `/activities` (L1 · US-01-08), livrée côté API mais sans écran. Le
  bouton est absent tant que cet écran n'existe pas.

---

## L1 · US-01-03 · Organismes, fiche et modification — 🟡 Synthèse livrée

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
| 10 | Fermeture du panneau | seuls la croix et « Annuler » ferment ; un clic à côté ou Échap ne ferment pas | couvert |
| 11 | Éditeur de la solution | affiché sous le sélecteur, résolu depuis `metadata.vendor` ; rien quand l'éditeur est `NONE` | couvert |
| 12 | Dates de la fiche | « Créée le … · modifiée le … » au pied, seulement si le serveur les envoie | couvert |
| 13 | Fiche introuvable | « Fiche introuvable », puis le panneau se referme — jamais un squelette qui attend | couvert |

### Pièges relevés pendant le développement

- **L'éditeur d'une solution est une clé, pas un texte.** Il vit dans le
  `metadata` du référentiel `SOLUTION` (`metadata.vendor`) et pointe une valeur
  de la catégorie `VENDOR` : il se résout comme n'importe quel référentiel.
  L'afficher tel quel montrerait `JVS_MAIRISTEM` au lieu de « JVS-Mairistem ».
  La valeur `NONE` — « sans éditeur » — n'affiche rien : « Éditeur : Sans
  éditeur » n'apprendrait rien.
- **« Annuler » ferme le panneau.** Il se contentait auparavant de restaurer
  les valeurs enregistrées, panneau ouvert : le câblage était correct, mais
  rien ne bougeait à l'écran et le bouton passait pour cassé — le même mot
  ferme la fenêtre dans l'écran de création. Un seul mot, un seul comportement.
- **Le panneau ne se ferme pas tout seul.** Un clic à côté ou la touche Échap
  ne le ferment plus : il porte un formulaire, et une fermeture accidentelle
  perdrait la saisie sans le dire. Deux sorties explicites, la croix et
  « Annuler ».

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
_Généré par `npm run bdd` — 2026-09-03 12:21. 80/80 OK._
_Les captures sont locales et non versionnées : relancer `npm run bdd` pour les produire._

| US | # | Scénario | Résultat | Capture |
|---|---|---|---|---|
| US-01-01 | 01-01.2 | Types, solutions et étiquettes affichés en libellés | OK | `screenshots/L1-01-01-2.png` |
| US-01-01 | 01-01.5 | Le filtre « fiches incomplètes » envoie completenessMax=99 | OK | `screenshots/L1-01-01-5.png` |
| US-01-01 | 01-01.7 | Une fiche hors périmètre est signalée et ses colonnes vidées | OK | `screenshots/L1-01-01-7.png` |
| US-01-01 | 01-01.13 | L'action d'ouverture reste atteignable sans defilement | OK | `screenshots/L1-01-01-13.png` |
| US-01-01 | 01-01.14 | Les filtres de la V8 partent au serveur, et se réinitialisent | OK | `screenshots/L1-01-01-14.png` |
| US-01-01 | 01-01.15 | Solution et étiquette se choisissent dans les référentiels | OK | `screenshots/L1-01-01-15.png` |
| US-01-02 | 01-02.1 | La fenêtre s'ouvre sur la recherche officielle | OK | `screenshots/L1-01-02-1.png` |
| US-01-02 | 01-02.2 | Une recherche trop courte ne part pas | OK | `screenshots/L1-01-02-2.png` |
| US-01-02 | 01-02.3 | Un résultat du registre pré-remplit la saisie | OK | `screenshots/L1-01-02-3.png` |
| US-01-02 | 01-02.6 | Registre indisponible : la saisie manuelle est proposée | OK | `screenshots/L1-01-02-6.png` |
| US-01-02 | 01-02.8 | Trois champs obligatoires, refusés avant envoi | OK | `screenshots/L1-01-02-8.png` |
| US-01-02 | 01-02.9 | La ville n'est pas obligatoire, contrairement à la V8 | OK | `screenshots/L1-01-02-9.png` |
| US-01-02 | 01-02.13 | Doublon probable : les candidats de meta sont proposés | OK | `screenshots/L1-01-02-13.png` |
| US-01-02 | 01-02.14 | Confirmer un doublon rejoue la requête avec force | OK | `screenshots/L1-01-02-14.png` |
| US-01-03 | 01-03.1 | La fiche s’ouvre avec ses valeurs, référentiels résolus | OK | `screenshots/L1-01-03-1.png` |
| US-01-03 | 01-03.3 | Enregistrer sans modification n’appelle pas l’API | OK | `screenshots/L1-01-03-3.png` |
| US-01-03 | 01-03.6 | Les deux statuts sont en lecture seule, avec leur raison | OK | `screenshots/L1-01-03-6.png` |
| US-01-03 | 01-03.10 | Le panneau ne se ferme que par la croix ou par « Annuler » | OK | `screenshots/L1-01-03-10.png` |
| US-01-03 | 01-03.11 | La fiche montre l’éditeur de la solution et ses dates | OK | `screenshots/L1-01-03-11.png` |
| US-01-03 | 01-03.12 | Fiche introuvable : le panneau le dit et se referme | OK | `screenshots/L1-01-03-12.png` |
| US-01-04 | 01-04.2 | Les contacts s’affichent, le principal en tête | OK | `screenshots/L1-01-04-2.png` |
| US-01-04 | 01-04.7 | Fiche hors périmètre : le refus est expliqué, pas subi | OK | `screenshots/L1-01-04-7.png` |
| US-01-04 | 01-04.9 | Prénom et nom sont exigés, et le serveur le confirme | OK | `screenshots/L1-01-04-9.png` |
| US-01-04 | 01-04.15 | Suppression refusée : « Ne pas démarcher » est proposé | OK | `screenshots/L1-01-04-15.png` |
| US-01-04 | 01-04.18 | Les longueurs maximales sont celles des colonnes | OK | `screenshots/L1-01-04-18.png` |
| US-01-04 | 01-04.19 | Fiche disparue à l’écriture : message nommé, saisie conservée | OK | `screenshots/L1-01-04-19.png` |
| US-01-11 | 01-11.1 | Les campagnes s’affichent en cartes, avec leurs mesures | OK | `screenshots/L1-01-11-1.png` |
| US-01-11 | 01-11.2 | Sans campagne, l’écran explique à quoi elles servent | OK | `screenshots/L1-01-11-2.png` |
| US-01-11 | 01-11.6 | Créer : le nom suffit, la période est facultative | OK | `screenshots/L1-01-11-6.png` |
| US-01-11 | 01-11.7 | Une période inversée est refusée avant envoi | OK | `screenshots/L1-01-11-7.png` |
| US-01-11 | 01-11.8 | Un nom déjà pris se corrige dans le champ | OK | `screenshots/L1-01-11-8.png` |
| US-01-11 | 01-11.9 | Seules les transitions de statut légales sont proposées | OK | `screenshots/L1-01-11-9.png` |
| US-01-13 | 01-13.3 | La fenêtre annonce une suppression logique, pas un effacement | OK | `screenshots/L1-01-13-3.png` |
| US-01-13 | 01-13.4 | Confirmer supprime et referme le panneau | OK | `screenshots/L1-01-13-4.png` |
| US-01-13 | 01-13.5 | Renoncer ne supprime rien | OK | `screenshots/L1-01-13-5.png` |
| US-00-01 | 01.1 | Formulaire vide : deux messages, aucun appel | OK | `screenshots/L0-01-1.png` |
| US-00-01 | 01.2 | E-mail malformé refusé avant envoi | OK | `screenshots/L0-01-2.png` |
| US-00-01 | 01.6 | Mot de passe faux : message unique, aucun jeton | OK | `screenshots/L0-01-6.png` |
| US-00-01 | 01.8 | Compte non actif : message dédié, sans mention de blocage | OK | `screenshots/L0-01-8.png` |
| US-00-01 | 01.9 | Compte verrouillé : compte à rebours, bouton désactivé | OK | `screenshots/L0-01-9.png` |
| US-00-01 | 01.11 | Le décompte suit meta.lockedUntil, jamais le texte | OK | `screenshots/L0-01-11.png` |
| US-00-01 | 01.22 | Page protégée sans jeton : redirection vers le login | OK | `screenshots/L0-01-22.png` |
| US-00-04 | 04.1 | Un back-office atterrit sur la liste des projets | OK | `screenshots/L0-04-1.png` |
| US-00-04 | 04.3 | La liste affiche projet, produit, statut et fonctionnalités | OK | `screenshots/L0-04-3.png` |
| US-00-04 | 04.11 | Projet inconnu : écran dédié, jamais de page blanche | OK | `screenshots/L0-04-11.png` |
| US-00-04 | 04.13 | Le menu bascule sur les cinq groupes de la V8 | OK | `screenshots/L0-04-13.png` |
| US-00-04 | 04.14 | Chaque appel scopé porte x-project-id | OK | `screenshots/L0-04-14.png` |
| US-00-04 | 04.16 | Un écran non livré affiche l’attente, sans être grisé | OK | `screenshots/L0-04-16.png` |
| US-00-04 | 04.18 | Le menu plateforme ne propose pas les utilisateurs de projet | OK | `screenshots/L0-04-18.png` |
| US-00-05 | 05.2 | Le filtre par rôle part bien dans la requête | OK | `screenshots/L0-05-2.png` |
| US-00-05 | 05.4 | Initiales hors format refusées avant envoi | OK | `screenshots/L0-05-4.png` |
| US-00-05 | 05.8 | Accès externe : la date de fin reste visible et atteignable | OK | `screenshots/L0-05-8.png` |
| US-00-05 | 05.14 | Le retrait n'est jamais présenté comme une suppression | OK | `screenshots/L0-05-14.png` |
| US-00-05 | 05.15 | Après un retrait, on revient à la liste du projet | OK | `screenshots/L0-05-15.png` |
| US-00-07 | 07.1 | Les périmètres se lisent, avec leurs trois axes | OK | `screenshots/L0-07-1.png` |
| US-00-07 | 07.3 | Un périmètre sans restriction dit « France entière » | OK | `screenshots/L0-07-3.png` |
| US-00-07 | 07.4 | Un seul chemin vers les périmètres | OK | `screenshots/L0-07-4.png` |
| US-00-07 | 07.7 | Les régions viennent du serveur, jamais du code | OK | `screenshots/L0-07-7.png` |
| US-00-07 | 07.8 | Une région entière part sous son nom | OK | `screenshots/L0-07-8.png` |
| US-00-07 | 07.9 | Une région amputée part en départements explicites | OK | `screenshots/L0-07-9.png` |
| US-00-07 | 07.10 | Un périmètre affecté ne se supprime pas, et l’écran le dit | OK | `screenshots/L0-07-10.png` |
| US-00-07 | 07.11 | Le périmètre s’affecte depuis la fiche utilisateur | OK | `screenshots/L0-07-11.png` |
| US-00-07 | 07.12 | Le périmètre se choisit dès la création d’un utilisateur | OK | `screenshots/L0-07-12.png` |
| US-00-07 | 07.13 | Un nom déjà pris se corrige dans le champ | OK | `screenshots/L0-07-13.png` |
| US-00-07 | 07.14 | Un périmètre mixte se recharge et se réenregistre à l’identique | OK | `screenshots/L0-07-14.png` |
| US-00-07 | 07.15 | Un périmètre libre se supprime | OK | `screenshots/L0-07-15.png` |
| US-00-08 | 08.1 | La navigation ne liste que les panneaux réels | OK | `screenshots/L0-08-1.png` |
| US-00-08 | 08.4 | Le panneau ouvert est porte par l'URL | OK | `screenshots/L0-08-4.png` |
| US-00-08 | 08.8 | SIREN invalide refusé avant envoi | OK | `screenshots/L0-08-8.png` |
| US-00-08 | 08.13 | Gagnée et Perdue sont figées et désactivées | OK | `screenshots/L0-08-13.png` |
| US-00-08 | 08.16 | Numérotation affichée en lecture seule | OK | `screenshots/L0-08-16.png` |
| US-00-09 | 09.1 | Une catégorie à la fois, choisie dans un sélecteur chiffré | OK | `screenshots/L0-09-1.png` |
| US-00-09 | 09.4 | La clé est normalisée en majuscules à la saisie | OK | `screenshots/L0-09-4.png` |
| US-00-09 | 09.5 | Une valeur inactive reste affichée, en retrait | OK | `screenshots/L0-09-5.png` |
| US-00-09 | 09.6 | Un glisser-déposer enregistre le nouvel ordre | OK | `screenshots/L0-09-6.png` |
| US-00-09 | 09.7 | Le libellé se renomme sur place | OK | `screenshots/L0-09-7.png` |
| US-00-09 | 09.8 | La recherche filtre et suspend le réordonnancement | OK | `screenshots/L0-09-8.png` |
| US-00-11 | 11.1 | Les opérateurs s’affichent sans projet sélectionné | OK | `screenshots/L0-11-1.png` |
| US-00-11 | 11.9 | Les rôles viennent de l’API, aucun code en dur | OK | `screenshots/L0-11-9.png` |
| US-00-11 | 11.11 | E-mail déjà pris : message, fenêtre maintenue | OK | `screenshots/L0-11-11.png` |
<!-- bdd:auto:end -->
