# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@audit-log
Feature: Journal d’activité d’un projet (L0 · US-00-10)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-00-10 · Journal d'activité

  @a-couvrir
  Scenario: Affichage
    Then horodatage, utilisateur, action, objet, référence, détail

  @a-couvrir
  Scenario: Filtres
    Then par période, par utilisateur, par type d'action

  @a-couvrir
  Scenario: Portée
    Then entrées du projet courant seulement

  @a-couvrir
  Scenario: Entrées plateforme
    Then les actions back-office n'y figurent pas

  @a-couvrir
  Scenario: Export CSV
    Then prévu au L5, absent pour l'instant
