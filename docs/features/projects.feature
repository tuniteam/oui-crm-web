# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@projects
Feature: Administration des projets (L0 · US-00-04)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── L0 · US-00-04 · Projets et mode projet

  @ok
  Scenario: Un back-office se connecte
    Then atterrit sur /projects, résolu par permission et non par type de contact

  @a-couvrir
  Scenario: Utilisateur sans projects:read
    Then entrée absente du menu, accès direct redirigé

  @ok
  Scenario: Affichage
    Then nom, identifiant, produit, statut, nombre d'utilisateurs, fonctionnalités

  @a-couvrir
  Scenario: Statuts
    Then Brouillon / Actif / Archivé, différenciés par la couleur

  @a-couvrir
  Scenario: Statuts
    Then Brouillon / Actif / Archivé, différenciés par la couleur

  @a-couvrir
  Scenario: Statuts
    Then Brouillon / Actif / Archivé, différenciés par la couleur

  @a-couvrir
  Scenario: Filtre et recherche
    Then status et search transmis

  @a-couvrir
  Scenario: Liste vide
    Then « Aucun projet » avec illustration

  @a-couvrir
  Scenario: Ouvrir une fiche
    Then identité, activité, fonctionnalités

  @a-couvrir
  Scenario: Fonctionnalités
    Then toutes listées, activées ou non — seul écran où une fonctionnalité désactivée est visible

  @ok
  Scenario: Projet inconnu
    Then « Projet introuvable » et retour à la liste, jamais une page blanche

  @a-couvrir
  Scenario: Ouvrir dans un onglet
    Then nouvel onglet, l'administration reste dans l'onglet courant

  @ok
  Scenario: Bascule du menu
    Then nom du projet en tête, cinq groupes repliables de la V8

  @ok
  Scenario: Appels scopés
    Then chaque requête porte x-project-id ; le projet ne transite jamais par le chemin d'API

  @a-couvrir
  Scenario: Quitter le projet
    Then le scope est vidé, les appels suivants ne portent plus l'en-tête

  @ok
  Scenario: Écran non livré
    Then écran d'attente, entrée ni grisée ni masquée

  @a-couvrir
  Scenario: Écran d'attente et permission
    Then l'accès reste refusé sans la permission

  @ok
  Scenario: Menu plateforme
    Then Projets et Opérateurs seulement — les utilisateurs d'un projet ne s'y atteignent pas
