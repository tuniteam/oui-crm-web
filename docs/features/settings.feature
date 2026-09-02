# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@settings
Feature: Réglages du projet, gabarits et cachet (L0 · US-00-08)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-00-08 · Paramètres du projet

  @ok
  Scenario: Navigation
    Then uniquement les panneaux réels — Société, Règles commerciales, Documents, Référentiels ; « Société » ouvert par défaut

  @a-couvrir
  Scenario: Panneau interdit
    Then l'entrée disparaît de la navigation

  @a-couvrir
  Scenario: Chargement paresseux
    Then /settings n'est appelé que si un panneau en dépend

  @ok
  Scenario: Panneau dans l'URL
    Then ?panneau=references ouvre les Référentiels ; le rafraîchissement le conserve

  @a-couvrir
  Scenario: Modifier un champ
    Then le PATCH ne porte que ce champ — le serveur fusionne clé par clé, un envoi complet écraserait la modification d'un autre administrateur

  @a-couvrir
  Scenario: Enregistrer sans changement
    Then aucune requête (corps vide refusé par l'API)

  @a-couvrir
  Scenario: Vider un champ
    Then chaîne vide envoyée, jamais null

  @ok
  Scenario: SIREN, SIRET, e-mail invalides
    Then message sous le champ, aucun appel

  @a-couvrir
  Scenario: SIREN, SIRET, e-mail invalides
    Then message sous le champ, aucun appel

  @a-couvrir
  Scenario: SIREN, SIRET, e-mail invalides
    Then message sous le champ, aucun appel

  @a-couvrir
  Scenario: Lecture seule
    Then champs désactivés, pas de bouton d'enregistrement

  @a-couvrir
  Scenario: Étapes
    Then les sept, dans l'ordre du contrat

  @ok
  Scenario: Gagnée et Perdue
    Then désactivées, mention « Valeur figée par le serveur »

  @a-couvrir
  Scenario: Modifier une étape
    Then seule celle-ci est envoyée, jamais WON ni LOST

  @a-couvrir
  Scenario: Probabilité hors 0–100
    Then refusée avant envoi

  @ok
  Scenario: Numérotation
    Then trois exemples, en lecture seule — les formats sont fixes côté serveur

  @a-couvrir
  Scenario: Type sans gabarit
    Then « Aucun gabarit téléversé », bouton « Téléverser »

  @a-couvrir
  Scenario: Téléverser un gabarit
    Then version, nom, date et lien de téléchargement

  @a-couvrir
  Scenario: Gabarit refusé
    Then les balises manquantes de messages.details restent affichées pendant la correction, pas dans un toast

  @a-couvrir
  Scenario: Fichier trop lourd ou de mauvais type
    Then message, gabarit actif inchangé

  @a-couvrir
  Scenario: Re-téléverser le même nom de fichier
    Then l'envoi se déclenche — le champ est réinitialisé après chaque choix

  @a-couvrir
  Scenario: Cachet en place
    Then aperçu affiché, bouton « Remplacer »
