# Front-side counterpart of oui-crm-api US-00-08 (/settings).
# The API feature covers the contract; this one covers what the user sees.
# No runner is wired yet — see docs/features/README.md.
@settings @front @l0
Feature: Project settings — company, business rules, documents (US-00-08)

  Background:
    Given I am signed in on a project with the "settings:read" permission
    And I open "Paramètres" from the project menu

  # ---------------------------------------------------------------- navigation
  @nominal
  Scenario: The four groups of the V8 mockup are listed
    Then the navigation shows "Organisation", "Sécurité et accès", "Règles métier" and "Données"
    And "Société" is the pane opened by default

  @guard
  Scenario: A group whose entries are all forbidden disappears
    Given I hold none of "roles:read", "scopes:read" and "auditLog:read"
    Then the "Sécurité et accès" group is not displayed

  @nominal
  Scenario: Settings are read only once a pane needs them
    When I open the "Grille tarifaire" pane
    Then no request is sent to "/settings"
    When I open the "Société" pane
    Then "/settings" is called

  # ---------------------------------------------------------------- company
  @nominal
  Scenario: Update a single company field
    Given the company name is "PERISCOLIA SAS"
    When I change the phone number and save
    Then the PATCH body carries "company" with the phone only
    And it carries no other company field
    # The server merges key by key: sending the whole object would overwrite a
    # field changed meanwhile by another administrator.

  @nominal
  Scenario: Saving without any change sends nothing
    When I save without editing anything
    Then no request is sent
    # An empty body is refused with 400 EMPTY_UPDATE_PAYLOAD.

  @nominal
  Scenario: Clearing a company field
    When I empty the SIRET and save
    Then the PATCH body carries an empty string for "siret"
    # The empty string is how the contract erases a field — not null, which is refused.

  @validation
  Scenario Outline: Format checks before sending
    When I fill "<field>" with "<value>" and save
    Then I see "<message>" under the field
    And no request is sent to "/settings"

    Examples:
      | field | value        | message                             |
      | SIREN | 12345        | Le SIREN doit comporter 9 chiffres  |
      | SIRET | 123          | Le SIRET doit comporter 14 chiffres |
      | Email | not-an-email | Adresse email invalide              |

  @guard
  Scenario: Read-only access
    Given I hold "settings:read" but not "settings:update"
    Then every company field is disabled
    And no save button is displayed

  # ---------------------------------------------------------------- business rules
  @nominal
  Scenario: The seven stages are displayed in contract order
    When I open the "Règles commerciales" pane
    Then the probabilities list Qualification, Démonstration, Devis envoyé, Négociation, Accord oral, Gagnée and Perdue

  @error @fixed-stage
  Scenario: Won and lost probabilities cannot be edited
    Then the "Gagnée" and "Perdue" fields are disabled
    And each shows "Valeur figée par le serveur."
    # The server pins them and answers 400 STAGE_PROBABILITY_FIXED otherwise;
    # letting them be typed would surface an error the user cannot act on.

  @nominal
  Scenario: Only the modified stages are sent
    When I change the "Négociation" probability and save
    Then the PATCH body carries "stageProbabilities" with "NEGOTIATING" only
    And it carries neither "WON" nor "LOST"

  @validation
  Scenario: A probability outside 0–100 is refused before sending
    When I set "Négociation" to 150 and save
    Then I see "Valeur entre 0 et 100"
    And no request is sent to "/settings"

  # ---------------------------------------------------------------- documents
  @nominal
  Scenario: Numbering samples are read-only
    When I open the "Documents et numérotation" pane
    Then I see the quote, contract and invoice samples returned by the server
    And none of them is an editable field
    # Formats are fixed server-side; an input would suggest otherwise.

  @nominal
  Scenario: A type without a template
    Given no quote template has been uploaded
    Then the quote row reads "Aucun gabarit téléversé"
    And it offers "Téléverser" rather than "Remplacer"

  @nominal
  Scenario: Upload a template
    When I upload a valid HTML quote template
    Then the row shows its version, file name and upload date
    And a download link points at the stored file

  @error @template
  Scenario: A template missing required tags
    Given the API answers 400 "TEMPLATE_INVALID" with details "missing: ref_devis" and "missing: signature_image"
    When I upload the template
    Then both details are listed under the quote row
    And they stay displayed while I fix the file
    # They are the only actionable information: a toast would vanish before the
    # user can act on it.

  @error @template
  Scenario Outline: Files the server rejects
    Given the API answers 400 "<code>"
    When I upload the file
    Then I see the matching message
    And the previously active template is unchanged

    Examples:
      | code                      |
      | STORAGE_FILE_TOO_LARGE    |
      | STORAGE_INVALID_MIME_TYPE |

  @nominal
  Scenario: Re-uploading the same file after fixing it
    Given a template was refused
    When I pick the same file name again
    Then the upload is triggered
    # The file input is reset after each pick; without that, picking the same
    # file emits no change event and nothing happens.

  @nominal
  Scenario: Replace the signature image
    Given a signature image is in place
    Then I see its preview
    And the button reads "Remplacer"
    # One image per project: uploading replaces the previous one.
