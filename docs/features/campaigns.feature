# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@campaigns
Feature: Campagnes (L1 · US-01-11)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── L1 · US-01-11 · Campagnes

  @ok
  Scenario: Liste
    Given des campagnes existent dans le projet
    When j'ouvre l'écran « Campagnes »
    Then chaque carte porte son responsable, sa période et son statut
    And les critères de ciblage sont présentés comme une note
    And les quatre mesures viennent du serveur

  @ok
  Scenario: Sans campagne
    Given aucune campagne dans le projet
    When j'ouvre l'écran
    Then un message explique ce qu’une campagne apporte

  @a-couvrir
  Scenario: Critères de ciblage
    Then affichés comme une note, jamais comme un filtre actif — la cible est figée

  @a-couvrir
  Scenario: Quatre mesures
    Then rendues par l'API (results), jamais recalculées ; les trois du L2 restent à zéro et l'écran le dit

  @a-couvrir
  Scenario: Filtrer par statut
    Then status transmis au serveur

  @ok
  Scenario: Créer
    Given la fenêtre « Nouvelle campagne »
    When je valide sans nom
    Then le champ est signalé et aucune création n'est envoyée
    When je renseigne le nom seul
    Then la création part, sans période ni objectif

  @ok
  Scenario: Période inversée
    Given la fenêtre « Nouvelle campagne »
    When je saisis une fin antérieure au début
    Then le message apparaît sous le champ de fin
    And aucune création n'est envoyée

  @ok
  Scenario: Nom déjà pris
    Given une campagne portant déjà ce nom
    When je crée une campagne du même nom
    Then le message apparaît sous le champ « Nom »
    And la fenêtre reste ouverte, la saisie intacte

  @ok
  Scenario: Transitions de statut
    Given une campagne en brouillon, une en cours et une close
    When je regarde leurs actions
    Then le brouillon ne propose que « Lancer »
    And celle en cours ne propose que « Clore »
    And la close propose de la rouvrir

  @a-couvrir
  Scenario: Transition refusée
    Then 409 INVALID_STATUS_TRANSITION : la liste est rechargée, l'écran ayant divergé

  @a-couvrir
  Scenario: Modifier
    Then champs effaçables par null ; le nom jamais

  @a-couvrir
  Scenario: Sans campaigns:create
    Then pas de bouton de création

  @a-couvrir
  Scenario: La cible
    Then panneau « Voir les N organismes », ajout et retrait

  @a-couvrir
  Scenario: Ajout à la cible
    Then added / alreadyIn / skipped rendus tous les trois

  @a-couvrir
  Scenario: Effet sur le statut commercial
    Then une fiche NOT_CONTACTED ciblée passe TO_CONTACT : la liste des organismes doit être invalidée

  @a-couvrir
  Scenario: Supprimer
    Then refusée si un périmètre cite la campagne, avec les périmètres nommés
