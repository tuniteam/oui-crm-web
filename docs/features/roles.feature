# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@roles
Feature: Matrice des rôles d’un projet (L0 · US-00-06)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-00-06 · Rôles et droits

  @a-couvrir
  Scenario: Liste des rôles
    Then rôles système et rôles du projet, avec le nombre d'utilisateurs

  @a-couvrir
  Scenario: Rôle système
    Then structure verrouillée, seule la duplication est offerte

  @a-couvrir
  Scenario: Dupliquer un rôle
    Then nouveau code et libellé demandés

  @a-couvrir
  Scenario: Matrice des droits
    Then permissions groupées par module, comme la maquette V8

  @a-couvrir
  Scenario: Portée d'une permission
    Then projet ou données propres, choisie par permission

  @a-couvrir
  Scenario: Visibilité hors périmètre
    Then aucune, restreinte ou complète

  @a-couvrir
  Scenario: Enregistrer
    Then remplacement complet de la liste des permissions

  @a-couvrir
  Scenario: Supprimer un rôle système
    Then refusé, message explicite

  @a-couvrir
  Scenario: Supprimer un rôle utilisé
    Then refusé, en indiquant qu'il est affecté
