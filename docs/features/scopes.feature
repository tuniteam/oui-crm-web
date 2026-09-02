# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@scopes
Feature: Périmètres géographiques d’un projet (L0 · US-00-07)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-00-07 · Périmètres

  @a-couvrir
  Scenario: Liste des périmètres
    Then nom, régions, départements, portefeuille

  @a-couvrir
  Scenario: Régions
    Then proposées depuis l'API, jamais codées en dur

  @a-couvrir
  Scenario: Créer un périmètre
    Then régions et départements sélectionnables

  @a-couvrir
  Scenario: Modifier
    Then les listes sont remplacées en bloc, pas fusionnées

  @a-couvrir
  Scenario: Supprimer un périmètre affecté
    Then refusé, en indiquant l'usage
