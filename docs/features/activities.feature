# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@activities
Feature: Actions et agenda (L1 · US-01-08)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── L1 · US-01-08 · Actions commerciales

  @a-couvrir
  Scenario: L'onglet apparaît
    Then troisième onglet de la fiche, absent sans activities:read

  @ok
  Scenario: Sans action
    Given une fiche sans aucune action
    When j’ouvre son onglet Actions
    Then un message explique ce qu’une action apporte
    And le bandeau dit qu’aucune action n’est planifiée

  @a-couvrir
  Scenario: La frise
    Then type, statut, résultat, compte rendu, date, auteur

  @ok
  Scenario: Bandeau de prochaine action
    Given une fiche avec une action planifiée à une date passée
    When j’ouvre son onglet Actions
    Then le bandeau annonce cette action comme la prochaine
    And il dit de combien de jours elle est en retard

  @a-couvrir
  Scenario: Retard signalé
    Then nombre de jours, sans que l'action cesse d'être « la prochaine »

  @a-couvrir
  Scenario: Types du référentiel
    Then jamais une liste en dur ; la V8 code ACTION_TYPES en dur

  @a-couvrir
  Scenario: Aucun type par défaut
    Then le choix est explicite : un défaut invisible ferait enregistrer le mauvais type

  @a-couvrir
  Scenario: Durée suggérée
    Then defaultDurationMin du référentiel, indépendant de ics

  @ok
  Scenario: Planifier
    Given le formulaire d’enregistrement d’une action
    Then aucun type n’est présélectionné
    And l’écran annonce que l’action sera planifiée, non réalisée
    When je choisis un type de rendez-vous
    Then il annonce la bascule de la fiche en « RDV planifié »

  @a-couvrir
  Scenario: Avertissement rendez-vous
    Then un type ics annonce la bascule en « RDV planifié »

  @ok
  Scenario: L'heure ne se convertit pas
    Given une action planifiée le 15/10/2026 à 14:30
    When je regarde la frise
    Then elle affiche 14:30, quel que soit le fuseau du navigateur
    And elle affiche le 15/10/2026, jamais la veille

  @ok
  Scenario: Compte rendu obligatoire
    Given une action planifiée
    When je la marque réalisée sans saisir de compte rendu
    Then le formulaire refuse, sans appeler le serveur
    And il dit que le compte rendu est obligatoire

  @a-couvrir
  Scenario: Réaliser
    Then la ligne passe « Réalisée », son compte rendu s'affiche

  @ok
  Scenario: Effet sur le statut commercial
    Given une action planifiée sur une fiche
    When je la marque réalisée avec son compte rendu
    Then la liste des organismes est rechargée
    And son statut commercial n’est plus celui affiché avant

  @ok
  Scenario: Gestes réservés aux planifiées
    Given une action déjà réalisée et une action planifiée
    When je regarde la frise
    Then seule la planifiée propose de la modifier, réaliser ou annuler

  @ok
  Scenario: Action close entre-temps
    Given une action planifiée à l’écran, close ailleurs entre-temps
    When je la modifie
    Then l’écran dit qu’elle n’est plus modifiable
    And il recharge la frise plutôt que de rester sur un état faux

  @ok
  Scenario: Avertissement de suppression
    Given une action de type rendez-vous
    When je demande sa suppression
    Then l’écran avertit que le statut commercial ne reviendra pas en arrière

  @a-couvrir
  Scenario: Sans activities:delete
    Then pas de bouton Supprimer — le commercial ne l'a pas

  @a-couvrir
  Scenario: Sans activities:create
    Then pas de bouton d'enregistrement

  @a-couvrir
  Scenario: Scope OWN
    Then jamais de refiltrage côté front : le serveur filtre en SQL

  @a-couvrir
  Scenario: Fiche hors périmètre
    Then l'onglet n'existe pas : la fiche restreinte n'a pas d'onglets

  @a-couvrir
  Scenario: Modifier une action
    Then re-planification, champs effaçables par null
