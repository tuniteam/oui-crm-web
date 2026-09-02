# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@reference-items
Feature: Valeurs de référentiel d’un projet (L0 · US-00-09)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-00-09 · Référentiels

  @ok
  Scenario: Affichage
    Then une catégorie à la fois, choisie dans un sélecteur qui donne le nombre de valeurs

  @a-couvrir
  Scenario: Lecture pour tous
    Then tout rôle du projet peut consulter

  @a-couvrir
  Scenario: Modification
    Then réservée à l'administrateur de projet

  @ok
  Scenario: Ajouter une valeur
    Then apparaît dans les listes déroulantes qui s'en servent

  @ok
  Scenario: Désactiver une valeur
    Then reste sur les enregistrements existants, disparaît des nouveaux choix

  @ok
  Scenario: Réordonner
    Then glisser une ligne enregistre le nouvel ordre et le conserve après rechargement

  @ok
  Scenario: Renommer
    Then le libellé se modifie sur place, sans ouvrir de fenêtre

  @ok
  Scenario: Rechercher
    Then filtre la catégorie ; le réordonnancement est désactivé tant que le filtre est actif
