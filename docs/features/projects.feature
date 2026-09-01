# Front-side counterpart of oui-crm-api US-00-04 (/projects).
# The API feature covers the contract; this one covers what the user sees.
# No runner is wired yet — see docs/features/README.md.
@projects @front @backoffice @l0
Feature: Project administration and project workspace (US-00-04)

  Background:
    Given I am signed in as a backoffice user holding "projects:read"

  # ---------------------------------------------------------------- landing
  @nominal
  Scenario: A backoffice lands on the project list
    When I sign in
    Then I land on "/projects"
    # Resolved by permission, not by contact type: getAfterLoginRedirect keeps
    # the first menu entry the user is allowed to open.

  @guard
  Scenario: A project user never sees the entry
    Given I am signed in without "projects:read"
    Then the "Projets" entry is absent from the menu
    When I open "/projects"
    Then I am redirected away

  # ---------------------------------------------------------------- list
  @nominal
  Scenario: List projects
    Then each row shows the name, its slug, the product, the status and the user count
    And enabled features are listed as badges
    And the columns can be sorted, hidden, resized and reordered

  @nominal
  Scenario Outline: Status is colour-coded
    Given a project in status "<status>"
    Then its badge reads "<label>"

    Examples:
      | status   | label     |
      | DRAFT    | Brouillon |
      | ACTIVE   | Actif     |
      | ARCHIVED | Archivé   |

  @nominal
  Scenario: Filter and search
    When I filter on "Brouillon"
    Then only draft projects remain
    When I search for a slug
    Then the query carries "search"

  @nominal
  Scenario: Empty list
    Given no project matches
    Then I see "Aucun projet" with its illustration

  # ---------------------------------------------------------------- details
  @nominal
  Scenario: Open a project record
    When I click the view action on a row
    Then I land on that project's details
    And I see its identity, activity and features

  @nominal
  Scenario: The details list every feature, enabled or not
    Given the project has SALES enabled and BILLING disabled
    Then both are displayed, distinguished by colour and icon
    # The list only returns enabled codes; the details return all of them with
    # their flag — this screen is the only place a disabled feature is visible.

  @error
  Scenario: Unknown project
    Given the API answers 404
    Then I see "Projet introuvable" and a link back to the list
    # Not a blank page.

  # ---------------------------------------------------------------- workspace
  @nominal @workspace
  Scenario: Open a project in a dedicated tab
    When I click the open action on a row
    Then a new browser tab opens on that project
    And the administration stays available in the current tab

  @nominal @workspace
  Scenario: The menu switches to the project
    Given I opened a project
    Then the sidebar shows the project name and a way back to the list
    And it lists Pilotage, Prospection, Commercial, Clients and Administration
    And each group can be collapsed

  @nominal @workspace
  Scenario: Every scoped call carries the project
    Given I opened a project
    When any project-scoped request is sent
    Then it carries the "x-project-id" header with that project's id
    # The project never travels in the API path — only this header.

  @nominal @workspace
  Scenario: Leaving the project clears the scope
    Given I opened a project
    When I navigate back to the project list
    Then later requests carry no "x-project-id"
    # Otherwise the following calls would target the wrong project.

  @nominal @workspace
  Scenario: A screen that does not exist yet
    When I open "Opportunités"
    Then I see the waiting screen with its illustration
    And the entry is neither disabled nor hidden
    # Showing the target and explaining beats a greyed-out entry with no reason.

  @guard @workspace
  Scenario: Waiting screens still enforce permissions
    Given I am signed in without "quotes:read"
    When I open the project's quotes path
    Then I am redirected away
