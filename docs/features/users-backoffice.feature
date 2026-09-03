# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@users-backoffice
Feature: Comptes back-office (plateforme) (L0 · US-00-11)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── L0 · US-00-11 · Comptes back-office

  @ok
  Scenario: Sans projet sélectionné
    Then l'écran fonctionne, aucun x-project-id envoyé

  @a-couvrir
  Scenario: Sans userBackoffice:read
    Then entrée absente du menu

  @a-couvrir
  Scenario: Affichage
    Then nom, e-mail, rôle, statut, dernière connexion ; jamais d'utilisateur projet

  @a-couvrir
  Scenario: Statut composite
    Then En attente / Actif / Inactif / Suspendu

  @a-couvrir
  Scenario: Statut composite
    Then En attente / Actif / Inactif / Suspendu

  @a-couvrir
  Scenario: Statut composite
    Then En attente / Actif / Inactif / Suspendu

  @a-couvrir
  Scenario: Statut composite
    Then En attente / Actif / Inactif / Suspendu

  @a-couvrir
  Scenario: Recherche et filtre
    Then search et status transmis

  @ok
  Scenario: Liste des rôles
    Then vient de /backoffice/roles, aucun code en dur

  @a-couvrir
  Scenario: Création
    Then compte en attente, e-mail d'activation annoncé

  @ok
  Scenario: E-mail déjà pris
    Then message affiché, fenêtre maintenue, aucun rejet non capturé

  @a-couvrir
  Scenario: Recréer un compte suspendu
    Then réactivation, et non doublon

  @a-couvrir
  Scenario: E-mail invalide, prénom vide
    Then refusés avant envoi

  @a-couvrir
  Scenario: E-mail invalide, prénom vide
    Then refusés avant envoi

  @a-couvrir
  Scenario: Édition
    Then e-mail absent du formulaire (non modifiable par l'API)

  @a-couvrir
  Scenario: Modification annulée
    Then ne survit pas à la réouverture

  @a-couvrir
  Scenario: Renvoi d'activation
    Then proposé sur un compte en attente seulement

  @a-couvrir
  Scenario: Suspension
    Then le libellé annonce la réversibilité, jamais une suppression

  @a-couvrir
  Scenario: Son propre compte
    Then action de suspension absente

  @a-couvrir
  Scenario: Identifiant d'un utilisateur projet
    Then « Opérateur introuvable », sans laisser entendre qu'il existe ailleurs
