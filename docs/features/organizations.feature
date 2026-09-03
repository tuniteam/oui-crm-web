# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@organizations
Feature: Base des organismes (L1 · US-01-01, US-01-02, US-01-03, US-01-13)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── L1 · US-01-01 · Organismes, liste et recherche

  @a-couvrir
  Scenario: Liste dans un projet
    Then les organismes du projet, paginés, tri par nom par défaut

  @ok
  Scenario: Types, solutions et étiquettes
    Given je suis connecté comme administrateur du projet
    When j'ouvre l'écran « Organismes »
    Then aucune clé de référentiel n'est visible à l'écran
    And je vois l'étiquette « Chaud » à la place de « HOT »

  @a-couvrir
  Scenario: Strate
    Then valeur rendue par l'API, jamais recalculée côté front

  @a-couvrir
  Scenario: Statuts
    Then libellés français de la V8, dans son ordre

  @ok
  Scenario: Filtre « fiches incomplètes »
    Given je suis sur l'écran « Organismes »
    When j'active le filtre « Fiches incomplètes »
    Then la requête envoyée porte completenessMax=99
    And jamais 100, qui ramènerait toute la base

  @a-couvrir
  Scenario: Recherche
    Then nom, ville, et début du SIRET si la saisie est numérique

  @ok
  Scenario: Fiche hors périmètre
    Given une fiche hors de mon périmètre, rendue en projection restreinte
    When j'ouvre l'écran « Organismes »
    Then la ligne porte la mention « hors de votre périmètre »
    And les champs que le serveur ne renvoie pas restent vides

  @a-couvrir
  Scenario: Tri sur une colonne non triable
    Then Type et Solution ne sont pas cliquables — l'API ne les trie pas

  @a-couvrir
  Scenario: Filtre par strate
    Then impossible : l'API n'expose pas ce filtre

  @a-couvrir
  Scenario: Filtre par commercial
    Then le paramètre salesRepId existe, mais peupler le sélecteur demande GET /users et la permission users:read, qu'un commercial n'a pas

  @a-couvrir
  Scenario: Ouvrir une fiche
    Then panneau latéral, onglet Synthèse (US-01-03)

  @a-couvrir
  Scenario: Sélection multiple
    Then actions groupées (US-01-05) — POST /organizations/bulk est livrée côté API, l'écran reste à faire

  @ok
  Scenario: Action d'ouverture atteignable
    Given l'écran « Organismes », dont les colonnes dépassent la largeur de l'écran
    When j'affiche la liste sans faire défiler horizontalement
    Then l'action d'ouverture de la première ligne est visible
    And elle ne laisse pas transparaître le contenu qu'elle recouvre

  @ok
  Scenario: Filtre par département
    Given je suis sur l'écran « Organismes »
    When je filtre par département
    Then la requête porte ce département et la liste se restreint
    When je clique sur « Réinitialiser »
    Then tous les filtres sont effacés et la liste revient entière

  @ok
  Scenario: Filtre par solution
    Given je suis sur l'écran « Organismes »
    Then les filtres solution et étiquette proposent les valeurs du projet
    And aucune clé de référentiel ne s’y affiche

  @a-couvrir
  Scenario: Filtre par étiquette
    Then idem, référentiel TAG

  @a-couvrir
  Scenario: Réinitialiser
    Then n'apparaît que si un filtre est actif, et les efface tous

  # ── L1 · US-01-02 · Créer un organisme

  @ok
  Scenario: Ouverture
    Given je suis sur l'écran « Organismes »
    When je clique sur « Nouvel organisme »
    Then la recherche au registre officiel est le mode actif
    And « Créer la fiche » est inactif, faute de saisie

  @ok
  Scenario: Recherche trop courte
    Given la fenêtre de création, mode registre
    When je saisis moins de trois caractères
    Then le bouton « Rechercher » reste inactif
    And aucun appel n'est fait au registre

  @ok
  Scenario: Résultat du registre
    Given la fenêtre de création, mode registre
    When je recherche une structure et retiens un résultat
    Then la saisie manuelle est pré-remplie avec ses valeurs
    And le département vient du code INSEE rendu par l'API

  @a-couvrir
  Scenario: Département dérivé
    Then pré-rempli depuis le code INSEE renvoyé par l'API, jamais recalculé côté front

  @a-couvrir
  Scenario: Établissement fermé
    Then isActive: false affiche un avertissement, sans bloquer la création

  @ok
  Scenario: Registre indisponible
    Given le registre officiel ne répond pas
    When je lance une recherche
    Then un message propose la saisie manuelle
    And ce n'est pas présenté comme un échec bloquant

  @a-couvrir
  Scenario: Aucun résultat
    Then 200 avec une liste vide : message distinct de l'indisponibilité

  @ok
  Scenario: Champs obligatoires
    Given la fenêtre de création, en saisie manuelle
    When je valide sans rien renseigner
    Then nom, type et département sont signalés
    And aucun appel de création n'est fait

  @ok
  Scenario: Ville non obligatoire
    Given la fenêtre de création, en saisie manuelle
    When je renseigne nom, type et département, sans ville
    Then la création part
    And le champ vide n'est pas transmis

  @a-couvrir
  Scenario: Champ vide non transmis
    Then une chaîne vide n'est pas envoyée : le serveur appliquerait sa valeur par défaut

  @a-couvrir
  Scenario: SIRET déjà pris
    Then 409 ORGANIZATION_SIRET_EXISTS : message sous le champ, fenêtre maintenue

  @a-couvrir
  Scenario: Code INSEE déjà pris
    Then idem sous son champ

  @ok
  Scenario: Doublon probable
    Given une fiche de même nom au même code postal
    When je crée l'organisme
    Then les candidats de messages.meta.duplicates sont listés
    And la saisie reste intacte

  @ok
  Scenario: Confirmation du doublon
    Given un doublon probable signalé
    When je confirme la création
    Then la même requête repart avec force à vrai

  @a-couvrir
  Scenario: Refus du doublon
    Then « Revenir à la saisie » ferme l'avertissement sans rien perdre de la saisie

  @a-couvrir
  Scenario: Après création
    Then la fiche créée s'ouvre, et la liste est rafraîchie

  @a-couvrir
  Scenario: Sans permission
    Then organizations:create absente : ni bouton, ni fenêtre

  # ── L1 · US-01-03 · Organismes, fiche et modification

  @ok
  Scenario: Ouvrir une fiche
    Given je suis sur l'écran « Organismes »
    When j'ouvre la fiche d'un organisme
    Then le type de structure est renseigné, pas vide
    And aucun champ obligatoire n'est signalé en erreur

  @a-couvrir
  Scenario: Bandeau de complétude
    Then critères manquants nommés en français, blocage du devis signalé

  @ok
  Scenario: Enregistrer sans rien changer
    Given j'ouvre la fiche d'un organisme
    When je clique sur « Enregistrer » sans rien changer
    Then aucune requête de modification n'est envoyée

  @a-couvrir
  Scenario: Modifier un champ
    Then seul ce champ part dans la requête

  @a-couvrir
  Scenario: Champs dérivés
    Then région et strate affichées, non modifiables

  @ok
  Scenario: Statuts commercial et client
    Given j'ouvre la fiche d'un organisme
    When je regarde la section « Suivi »
    Then le statut commercial et le statut client ne sont pas modifiables
    And la fiche explique où ils se modifient

  @a-couvrir
  Scenario: Fiche hors périmètre
    Then panneau restreint, ni formulaire ni coordonnées

  @a-couvrir
  Scenario: Sans permission de modification
    Then formulaire en lecture seule, pas de bouton d'enregistrement

  @a-couvrir
  Scenario: Onglet Contacts
    Then liste, ajout, contact principal unique (US-01-04)

  @ok
  Scenario: Fermeture du panneau
    Given j'ouvre la fiche d'un organisme
    When je clique à côté du panneau, puis appuie sur Échap
    Then le panneau reste ouvert
    When je clique sur « Annuler »
    Then le panneau se ferme
    And la croix le ferme aussi

  @ok
  Scenario: Éditeur de la solution
    Given j'ouvre la fiche d'un organisme équipé d'une solution éditée
    Then l'éditeur est affiché sous le sélecteur, en libellé
    And le pied porte les dates de création et de modification

  @ok
  Scenario: Dates de la fiche
    Given une adresse portant l'identifiant d'une fiche qui n'existe plus
    When j'ouvre l'écran
    Then le panneau affiche « Fiche introuvable »
    And il se referme de lui-même

  @a-couvrir
  Scenario: Fiche introuvable
    Then « Fiche introuvable », puis le panneau se referme — jamais un squelette qui attend

  # ── L1 · US-01-13 · Supprimer un organisme

  @a-couvrir
  Scenario: Emplacement de l'action
    Then carte dédiée en bas de la fiche, à l'écart des actions du formulaire

  @a-couvrir
  Scenario: Confirmation obligatoire
    Then une fenêtre s'interpose, aucune suppression au premier clic

  @ok
  Scenario: Ce que dit la fenêtre
    Given j'ouvre la fiche d'un organisme
    When je demande sa suppression
    Then une fenêtre s'interpose avant toute suppression
    And elle dit que les identifiants redeviennent disponibles
    And qu'il ne s'agit pas d'un effacement définitif

  @ok
  Scenario: Confirmer
    Given la fenêtre de confirmation ouverte
    When je confirme la suppression
    Then un DELETE part sur la fiche
    And le panneau se referme

  @ok
  Scenario: Renoncer
    Given la fenêtre de confirmation ouverte
    When je renonce
    Then aucune requête n'est envoyée
    And la fiche reste ouverte

  @a-couvrir
  Scenario: Sans la permission
    Then ni carte ni bouton — un commercial n'a pas organizations:delete

  @a-couvrir
  Scenario: Fiche déjà supprimée
    Then 404 ORGANIZATION_NOT_FOUND : message, pas de page blanche

  @a-couvrir
  Scenario: Fiche hors périmètre
    Then 403 ACCESS_DENIED avec un rôle restreint

  @a-couvrir
  Scenario: Identifiants libérés
    Then le SIRET d'une fiche supprimée peut resservir à la création

  @a-couvrir
  Scenario: Contrats rattachés
    Then 409 ORGANIZATION_HAS_CONTRACTS — arrive au lot L3, pas encore émis
