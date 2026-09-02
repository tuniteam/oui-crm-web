# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@organizations
Feature: Base des organismes (L1 · US-01-01)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-01-01 · Organismes, liste et recherche

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
    Then demande la liste des membres du projet

  @a-couvrir
  Scenario: Ouvrir une fiche
    Then panneau latéral, onglet Synthèse (US-01-03)

  @a-couvrir
  Scenario: Sélection multiple
    Then actions groupées (US-01-05), non livrée côté API
