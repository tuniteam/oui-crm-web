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

  @ok
  Scenario: La cible
    Given une campagne avec des organismes ciblés
    When j’ouvre sa cible
    Then les organismes ciblés sont listés
    And l’écran dit que la liste ne se recalcule pas depuis les critères
    And il annonce l’effet du ciblage sur le statut commercial

  @ok
  Scenario: Ajout à la cible
    Given la cible d’une campagne
    When j’ajoute des organismes dont certains sont déjà ciblés ou hors périmètre
    Then le compte rendu annonce les ajoutés, les déjà présents et les ignorés

  @ok
  Scenario: Effet sur le statut commercial
    Given une fiche encore « Non contacté »
    When elle entre dans la cible d’une campagne
    Then la liste des organismes est rechargée
    And son statut commercial n’est plus celui affiché avant

  @a-couvrir
  Scenario: Retirer de la cible
    Then la fiche sort de la cible, la fiche elle-même n'est pas touchée

  @a-couvrir
  Scenario: Limite de 500
    Then l'ajout ne peut pas dépasser 500 identifiants par appel

  @ok
  Scenario: Résultats détaillés
    Given une campagne dont deux organismes ont produit des actions
    When j’ouvre le détail de ses résultats
    Then les totaux affichés sont ceux du serveur
    And chaque organisme ciblé porte son propre compteur

  @ok
  Scenario: Une fiche ciblée sans action
    Given une fiche ciblée qui n’a produit aucune action
    When j’ouvre le détail des résultats
    Then elle figure dans la liste avec zéro action
    And sa dernière action est dite « aucune »

  @ok
  Scenario: Supprimer
    Given une campagne citée par deux périmètres
    When je demande sa suppression
    Then l’écran nomme les périmètres qui l’empêchent
    And il propose de détacher plutôt que de le faire d’office

  @ok
  Scenario: Détacher puis rejouer
    Given une suppression refusée par un périmètre nommé
    When je détache la campagne de ce périmètre
    Then le périmètre est réécrit avec ses autres campagnes seulement
    And le périmètre disparaît des bloquants

  @ok
  Scenario: Refus non nommé
    Given une campagne dont la cible dépasse une page de résultats
    When je passe à la page suivante
    Then le serveur est interrogé pour cette page
    Et les totaux affichés restent ceux de toute la campagne

  @ok
  Scenario: Sans campaigns:delete
    Given une fiche ciblée hors de mon périmètre
    When j’ouvre le détail des résultats
    Then elle est signalée comme hors de mon périmètre
    Et sa dernière action est dite non communiquée, pas absente

  @a-couvrir
  Scenario: Résultats paginés
    Then la page suivante est demandée au serveur, et les totaux ne suivent pas la page

  @a-couvrir
  Scenario: Cible paginée
    Then même pagination sur la cible : un import de territoire dépasse une page

  @a-couvrir
  Scenario: Hors périmètre dans les résultats
    Then fiche signalée, et dernière action « non communiqué » — le champ est absent, pas nul
