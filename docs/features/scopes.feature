# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@scopes
Feature: Périmètres géographiques d’un projet (L0 · US-00-07)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-00-07 · Périmètres

  @ok
  Scenario: Liste des périmètres
    Given je suis administrateur du projet
    When j'ouvre le panneau « Périmètres » des Paramètres
    Then chaque périmètre montre son nom, son nombre d’utilisateurs et ses trois axes
    And les départements résolus sont ceux rendus par l’API

  @a-couvrir
  Scenario: Départements résolus
    Then rendus par l'API, jamais recalculés côté front

  @ok
  Scenario: Territoire entier
    Given un périmètre dont les départements résolus sont vides
    When je consulte le panneau
    Then il affiche « France entière »
    And jamais « 0 département »

  @ok
  Scenario: Un seul chemin
    Given le menu du projet
    Then « Périmètres » n'y figure pas — ils vivent dans Paramètres
    When j'ouvre Paramètres
    Then « Périmètres » est un de ses panneaux, et il ouvre la liste

  @a-couvrir
  Scenario: Sans scopes:read
    Then ni l'entrée de navigation, ni le panneau — un commercial ne l'a pas

  @a-couvrir
  Scenario: Aucun périmètre
    Then message expliquant que sans périmètre chaque utilisateur voit toute la base

  @a-couvrir
  Scenario: Régions
    Then proposées depuis GET /geo/regions, jamais codées en dur

  @a-couvrir
  Scenario: Créer un périmètre
    Then régions et départements sélectionnables

  @a-couvrir
  Scenario: Modifier
    Then les listes sont remplacées en bloc, pas fusionnées

  @a-couvrir
  Scenario: Supprimer un périmètre affecté
    Then refusé, en indiquant l'usage

  @ok
  Scenario: Affecter à un utilisateur
    Given la fiche d'un utilisateur du projet
    When je modifie son périmètre
    Then la liste des périmètres du projet est proposée
    And « Toute la base » est proposé pour n’en affecter aucun
    And la modification transmet scopeId au serveur

  @ok
  Scenario: Affecter dès la création
    Given la fenêtre « Nouvel utilisateur »
    When je choisis un périmètre et je crée le compte
    Then scopeId part avec la création
    And sans périmètre choisi, le champ n'est pas transmis du tout
