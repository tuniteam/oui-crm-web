# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@users
Feature: Administration des utilisateurs du projet (L0 · US-00-05)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-00-05 · Utilisateurs du projet

  @a-couvrir
  Scenario: Liste sans projet actif
    Then erreur « Aucun projet sélectionné » tant qu'aucun projet n'est ouvert

  @ok
  Scenario: Liste dans un projet
    Given je suis sur la liste des utilisateurs d'un projet
    When je choisis un rôle dans le filtre
    Then la requête envoyée porte roleCode

  @a-couvrir
  Scenario: Créer un utilisateur
    Then prénom, nom, e-mail, initiales et rôle demandés ; e-mail d'activation envoyé

  @ok
  Scenario: Initiales hors format
    Given j'ouvre la fenêtre « Créer un utilisateur »
    When je saisis une seule lettre dans « Initiales »
    Then le message « Deux ou trois majuscules ou chiffres » s'affiche
    And aucun appel de création n'est parti

  @a-couvrir
  Scenario: Initiales déjà prises
    Then message dédié après réponse du serveur, le formulaire reste rempli

  @a-couvrir
  Scenario: E-mail déjà rattaché au projet
    Then « Cet utilisateur est déjà rattaché à ce projet »

  @a-couvrir
  Scenario: E-mail d'un compte back-office
    Then message expliquant que les deux types de comptes sont distincts

  @ok
  Scenario: Accès externe sans date
    Given j'ouvre la fenêtre « Créer un utilisateur »
    When j'active « Accès externe »
    Then le champ « Fin d'accès » reste visible et atteignable

  @a-couvrir
  Scenario: Modifier un utilisateur
    Then prénom, nom, initiales, rôle et date de fin ; le statut n'y figure pas

  @a-couvrir
  Scenario: Modifier son propre compte
    Then rôle et accès désactivés, avec l'explication sous le champ

  @a-couvrir
  Scenario: Retirer le dernier administrateur
    Then refus expliqué, l'utilisateur reste en place

  @a-couvrir
  Scenario: Surcharges de permissions
    Then ajouts et retraits par rapport au rôle, remplacement en bloc

  @a-couvrir
  Scenario: Filtrer par rôle
    Then la liste se restreint au rôle choisi, rôles chargés depuis l'API

  @a-couvrir
  Scenario: Ouvrir une fiche depuis la liste
    Then l'icône de la colonne Actions mène à la fiche du projet

  @a-couvrir
  Scenario: Retour après un retrait
    Then on revient à la liste du projet, jamais à la liste plateforme

  @a-couvrir
  Scenario: Renvoyer l'activation
    Then proposé sur un compte en attente seulement

  @ok
  Scenario: Retirer un utilisateur
    Given j'ouvre la fiche d'un utilisateur du projet
    When je regarde le bloc de retrait
    Then il ne parle jamais de suppression définitive

  @ok
  Scenario: Corriger l'e-mail
    Given j'ouvre la fiche d'un utilisateur du projet
    When je confirme son retrait du projet
    Then je reviens à la liste du projet
    And jamais à la liste plateforme, qui n'a pas de projet actif
