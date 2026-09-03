# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@auth
Feature: Authentification, session et cycle de vie du compte (L0 · US-00-01, US-00-02)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── L0 · US-00-01 · Connexion, session, déconnexion

  @ok
  Scenario: Formulaire vide
    Then « Champ requis » sous les deux champs, aucun appel

  @ok
  Scenario: E-mail malformé
    Then « Adresse email invalide », aucun appel

  @a-couvrir
  Scenario: Révéler le mot de passe
    Then le champ passe en clair

  @a-couvrir
  Scenario: Connexion réussie
    Then les deux jetons sont stockés, /me est appelé avant toute redirection

  @a-couvrir
  Scenario: Aucune entrée de menu autorisée
    Then atterrissage sur /no-permissions

  @ok
  Scenario: Mot de passe faux
    Then « Email ou mot de passe incorrect. », aucun jeton stocké

  @a-couvrir
  Scenario: E-mail inconnu
    Then le même message, jamais d'indication sur l'existence du compte

  @ok
  Scenario: Compte non actif
    Then message dédié, sans mention de blocage temporaire

  @ok
  Scenario: Compte verrouillé
    Then compte à rebours affiché, bouton désactivé

  @a-couvrir
  Scenario: Fin du décompte
    Then le bouton se réactive seul

  @ok
  Scenario: text contredit meta.lockedUntil
    Then le décompte suit meta, text n'est jamais analysé

  @a-couvrir
  Scenario: Verrouillage sans date exploitable
    Then message générique, aucun décompte, bouton actif

  @a-couvrir
  Scenario: Jeton expiré
    Then rafraîchi de façon transparente, appel rejoué

  @a-couvrir
  Scenario: Trois 401 simultanés
    Then un seul /auth/refresh

  @a-couvrir
  Scenario: Échec du refresh (4 codes)
    Then jetons effacés, retour au login

  @a-couvrir
  Scenario: Échec du refresh (4 codes)
    Then jetons effacés, retour au login

  @a-couvrir
  Scenario: Échec du refresh (4 codes)
    Then jetons effacés, retour au login

  @a-couvrir
  Scenario: Échec du refresh (4 codes)
    Then jetons effacés, retour au login

  @a-couvrir
  Scenario: Échec du refresh, appels concurrents
    Then une seule redirection

  @a-couvrir
  Scenario: Compte désactivé en cours de session
    Then déconnexion, bandeau explicite

  @a-couvrir
  Scenario: Déconnexion sur session déjà morte
    Then traitée comme un succès

  @ok
  Scenario: Page protégée sans jeton
    Then redirection vers le login

  # ── L0 · US-00-02 · Activation, mot de passe oublié, changement d'e-mail

  @a-couvrir
  Scenario: Lien valide
    Then le formulaire de création de mot de passe s'affiche

  @a-couvrir
  Scenario: Lien expiré
    Then écran dédié « Lien expiré », distinct du lien invalide

  @a-couvrir
  Scenario: Lien invalide
    Then écran dédié, sans laisser croire à une expiration

  @a-couvrir
  Scenario: Consentements
    Then CGU et RGPD obligatoires, l'envoi est bloqué sans eux

  @a-couvrir
  Scenario: Critères du mot de passe
    Then 10 caractères, 1 lettre, 1 chiffre — exactement la règle serveur, ni plus ni moins

  @a-couvrir
  Scenario: Mot de passe trop faible
    Then refusé avant envoi, aucun appel

  @a-couvrir
  Scenario: Activation réussie
    Then la session est ouverte, aucun re-login demandé

  @a-couvrir
  Scenario: Demande
    Then écran de confirmation, sans révéler si l'adresse existe

  @a-couvrir
  Scenario: Lien de réinitialisation expiré
    Then écran dédié

  @a-couvrir
  Scenario: Réinitialisation réussie
    Then confirmation, retour au login

  @a-couvrir
  Scenario: Nouveau mot de passe trop faible
    Then refusé avant envoi

  @a-couvrir
  Scenario: Demande
    Then mot de passe courant exigé

  @a-couvrir
  Scenario: Mot de passe re-saisi faux
    Then message d'erreur, aucune déconnexion — le 401 est ici une réponse métier

  @a-couvrir
  Scenario: Confirmation depuis le lien
    Then fonctionne quel que soit l'état de connexion, y compris sur un autre appareil

  @a-couvrir
  Scenario: Jeton de confirmation expiré
    Then écran dédié
