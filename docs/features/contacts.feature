# Généré par `npm run bdd:features` — ne pas éditer à la main.
# Source : docs/RECETTE-BDD-FRONT.md. Découpage aligné sur oui-crm-api/docs/features/.

@contacts
Feature: Contacts d’un organisme (L1 · US-01-04)
  Vue Gherkin de la recette front : ce que voit l’utilisateur, là où la
  recette de l’API décrit le contrat HTTP.

  # @ok / @ko  : scénario exécuté par `npm run bdd`
  # @a-couvrir : décrit, pas encore automatisé

  # ── US-01-04 · Les contacts d'un organisme

  @a-couvrir
  Scenario: Onglet
    Then second onglet du panneau, masqué sans contacts:read

  @ok
  Scenario: Liste
    Given j'ouvre la fiche d'un organisme qui a des contacts
    When j'ouvre l'onglet « Contacts »
    Then le contact principal est la première ligne, et porte son badge
    And chaque ligne montre fonction, e-mail et téléphone
    And une coordonnée absente est dite, jamais laissée vide

  @a-couvrir
  Scenario: Ligne
    Then initiales, civilité + nom, fonction · e-mail · téléphone

  @a-couvrir
  Scenario: Badges
    Then « Contact principal », « Ne pas démarcher », « Extrait d'une note »

  @a-couvrir
  Scenario: Coordonnée absente
    Then « email inconnu », « téléphone inconnu » — jamais un blanc

  @a-couvrir
  Scenario: Aucun contact
    Then message expliquant que le représentant légal est requis pour un contrat

  @ok
  Scenario: Fiche hors périmètre
    Given une fiche hors de mon périmètre
    When j'ouvre son onglet « Contacts »
    Then l'écran explique que les coordonnées ne sont visibles que dans mon périmètre
    And aucune erreur technique n'est affichée

  @a-couvrir
  Scenario: Fiche invisible
    Then 404 : l'existence de la fiche n'est jamais révélée

  @ok
  Scenario: Créer
    Given l'onglet « Contacts » d'un organisme
    When je valide sans prénom ni nom
    Then les deux champs sont signalés et aucune requête ne part
    When je ne renseigne que le nom
    Then le prénom reste signalé — l'API l'exige aussi

  @a-couvrir
  Scenario: Champ vide à la création
    Then non transmis, jamais null : le serveur applique ses défauts

  @a-couvrir
  Scenario: Champ vidé en modification
    Then envoyé à null pour être effacé ; nom et prénom jamais

  @a-couvrir
  Scenario: Nouveau principal
    Then le précédent est rétrogradé par le serveur, la liste entière se rafraîchit

  @a-couvrir
  Scenario: Complétude
    Then le bandeau de l'onglet Synthèse se recalcule après une écriture

  @a-couvrir
  Scenario: Supprimer
    Then confirmation, puis retrait de la liste

  @ok
  Scenario: Suppression refusée
    Given un contact référencé par des actions
    When je demande sa suppression et confirme
    Then le serveur la refuse, et l'écran propose de l'exclure des campagnes
    And le message ne présente pas le refus comme un échec

  @a-couvrir
  Scenario: Sans contacts:delete
    Then l'action disparaît — un commercial ne l'a pas

  @a-couvrir
  Scenario: Sans contacts:update
    Then « Modifier » disparaît

  @ok
  Scenario: Fiche disparue à l'écriture
    Given l'onglet « Contacts » d'une fiche supprimée entre-temps
    When je crée un contact
    Then un message dit que la fiche n'existe plus
    And la fenêtre reste ouverte, la saisie intacte

  @ok
  Scenario: Longueurs maximales
    Given le formulaire d'un contact
    When je dépasse la longueur admise sur la civilité ou le téléphone
    Then la saisie est refusée avant envoi
    And le serveur aurait refusé la même chose
