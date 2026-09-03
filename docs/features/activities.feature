# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@activities
Feature: Actions et agenda (L1 · US-01-08, US-01-09)
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

  @ok
  Scenario: Réaliser
    Given une action réalisée portant un résultat
    When j’ouvre l’onglet Actions
    Then le résultat s’affiche par son libellé, et la frise ne casse pas

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

  # ── L1 · US-01-09 · Agenda

  @ok
  Scenario: La grille du mois
    Given un mois avec des actions planifiées
    When j’ouvre l’agenda
    Then le serveur est interrogé avec les bornes du mois affiché
    And chaque action figure dans la case de son jour

  @ok
  Scenario: Retard signalé
    Given une action que le serveur déclare en retard
    And une action à la même date qu’il ne déclare pas en retard
    When je regarde l’agenda
    Then seule la première est signalée

  @ok
  Scenario: Le bandeau ne montre que ce qui reste à faire
    Given une action du jour déjà réalisée
    And une action du jour encore planifiée
    When j’ouvre l’agenda
    Then seule la planifiée figure dans le bandeau d’alerte

  @ok
  Scenario: Changer de mois
    Given l’agenda du mois courant
    When je passe au mois suivant
    Then le serveur est interrogé avec les bornes de ce mois

  @ok
  Scenario: Mois chargé
    Given un mois dont les actions dépassent une page
    When j’ouvre l’agenda
    Then toutes les pages sont demandées
    And les actions de la seconde page figurent dans la grille

  @ok
  Scenario: Ouvrir un événement
    Given une action à l’agenda
    When je clique dessus
    Then la fiche de son organisme s’ouvre sur l’onglet Actions, sur l’agenda
    And l’action visée est mise en avant

  @ok
  Scenario: Vue liste
    Given un mois avec des actions à deux dates
    When je bascule en vue liste
    Then les actions sont groupées par jour

  @a-couvrir
  Scenario: Sans rien de planifié
    Then message expliquant d'où viennent les actions

  @a-couvrir
  Scenario: Portée OWN
    Then le filtre collaborateur n'existe pas : le serveur ignorerait userId

  @a-couvrir
  Scenario: Portée PROJECT
    Then le filtre s'affiche et le collaborateur choisi part au serveur

  @a-couvrir
  Scenario: Cellule qui déborde
    Then au-delà de trois actions, un « +N » qui bascule vers la liste

  @a-couvrir
  Scenario: Export ICS
    Then hors périmètre — voir les pièges

  @ok
  Scenario: Écrire depuis l'agenda
    Given une action planifiée, ouverte depuis l’agenda
    When je la marque réalisée puis referme la fiche
    Then l’agenda est rechargé
    And la grille ne montre plus l’état d’avant
