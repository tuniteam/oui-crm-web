# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@profile
Feature: Profil, accès aux projets et acceptation légale (L0 · US-00-03)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── L0 · US-00-03 · Profil

  @a-couvrir
  Scenario: Affichage
    Then identité, e-mail, rôles et projets rattachés

  @a-couvrir
  Scenario: Champs absents du contrat
    Then ni statut ni date de modification technique — le premier est constant, la seconde changeait à chaque connexion

  @a-couvrir
  Scenario: Modifier son profil
    Then prénom, nom, téléphone

  @a-couvrir
  Scenario: Changer son mot de passe
    Then ancien exigé, nouveau soumis à la politique serveur

  @a-couvrir
  Scenario: Ancien mot de passe erroné
    Then message, aucune déconnexion

  @a-couvrir
  Scenario: Changement réussi
    Then toutes les sessions sont fermées, retour au login

  @a-couvrir
  Scenario: Avatar
    Then recadrage puis envoi, suppression possible
