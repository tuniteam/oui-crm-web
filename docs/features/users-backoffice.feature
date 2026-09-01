# Front-side counterpart of oui-crm-api US-00-11 (/backoffice/users, /backoffice/roles).
# The API feature covers the contract; this one covers what the user sees.
# No runner is wired yet — see docs/features/README.md.
@users-backoffice @front @backoffice @l0
Feature: Backoffice account administration (US-00-11)

  Background:
    Given I am signed in as a backoffice user holding "userBackoffice:read"
    And no project is selected

  # ---------------------------------------------------------------- access
  @nominal
  Scenario: The screen works without a selected project
    When I open "Opérateurs"
    Then the list is displayed
    And no request carries the "x-project-id" header
    # Platform routes: a backoffice reaches them before picking any project.

  @guard
  Scenario: A project user never sees the entry
    Given I am signed in without "userBackoffice:read"
    Then the "Opérateurs" entry is absent from the menu

  # ---------------------------------------------------------------- list
  @nominal
  Scenario: List backoffice accounts
    Then each row shows the name, e-mail, role, status and last login
    And project users never appear

  @nominal
  Scenario Outline: Composite status
    Given an account in status "<status>"
    Then its badge reads "<label>"

    Examples:
      | status    | label      |
      | PENDING   | En attente |
      | ACTIVE    | Actif      |
      | INACTIVE  | Inactif    |
      | SUSPENDED | Suspendu   |

  @nominal
  Scenario: Search and filter
    When I search for an e-mail
    Then the query carries "search"
    When I filter on "En attente"
    Then only pending accounts remain

  # ---------------------------------------------------------------- creation
  @nominal
  Scenario: Roles come from the API
    When I open the creation window
    Then the role list is the one returned by "/backoffice/roles"
    And no role code is hard-coded in the front
    # A single role exists today; the contract expects the list to grow.

  @nominal
  Scenario: Create an operator
    When I submit a valid form
    Then the account is created as "PENDING"
    And an activation e-mail is announced to me

  @error
  Scenario: E-mail already taken
    Given the API answers 409 "EMAIL_ALREADY_TAKEN"
    When I submit the form
    Then I see the message and the window stays open
    And no unhandled rejection occurs

  @nominal
  Scenario: Re-creating a suspended account reactivates it
    Given an operator was suspended
    When I create an account with the same e-mail
    Then the API answers 201 and the access is restored
    # This is the way back from a suspension, not a duplicate.

  @validation
  Scenario Outline: Client-side checks
    When I submit "<field>" with "<value>"
    Then I see "<message>"
    And no request is sent

    Examples:
      | field  | value        | message                |
      | Email  | not-an-email | Adresse email invalide |
      | Prénom |              | Champ requis           |

  # ---------------------------------------------------------------- details
  @nominal
  Scenario: Edit an operator
    When I open an account and change its last name
    Then the change is saved
    And the e-mail field is absent from the form
    # PATCH only accepts firstName, lastName and roleCode.

  @nominal
  Scenario: Cancelled edits do not survive
    Given I typed a new name and closed the window without saving
    When I reopen it
    Then the original values are displayed

  @nominal
  Scenario: Resending activation is offered on pending accounts only
    Given the account is "PENDING"
    Then I can resend the activation link
    Given the account is "ACTIVE"
    Then the action is absent
    # The API answers 409 USER_ALREADY_ACTIVE otherwise.

  @nominal
  Scenario: Suspending an access
    When I suspend an operator
    Then I am told the access can be restored by recreating the account
    And the wording never says the account is deleted
    # DELETE suspends; it does not remove anything.

  @guard
  Scenario: One cannot suspend oneself
    Given I am looking at my own account
    Then the suspend action is absent
    # The API answers 400 CANNOT_DELETE_SELF; hiding it avoids a dead end.

  @error
  Scenario: An id that belongs to a project user
    Given the API answers 404 "USER_NOT_FOUND"
    Then I see "Opérateur introuvable" and a link back to the list
    And nothing suggests the account exists elsewhere
    # The 404 is deliberate: it must not reveal a project account.
