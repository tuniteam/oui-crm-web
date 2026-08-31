# Front-side counterpart of oui-crm-api docs/features/auth.feature.
# The API feature covers the contract; this one covers what the user sees.
# No runner is wired yet — see features/README.md.
@auth @front @l0
Feature: Sign in, session and lock feedback (US-00-01)

  Background:
    Given the application is served on "http://localhost:5174"
    And the API base URL is "http://localhost:3001/api/v1"
    And I am on the "/auth/login" page

  # ---------------------------------------------------------------- form validation
  @validation
  Scenario: Submitting an empty form
    When I submit the form without filling anything
    Then I see "Champ requis" under the e-mail field
    And I see "Champ requis" under the password field
    And no request is sent to "/auth/login"

  @validation
  Scenario: Malformed e-mail
    When I fill the e-mail with "not-an-email"
    And I fill the password with "whatever"
    And I submit the form
    Then I see "Adresse email invalide" under the e-mail field
    And no request is sent to "/auth/login"

  @validation
  Scenario: Revealing the password
    When I fill the password with "S3cret!"
    Then the password field is masked
    When I click the reveal button
    Then the password field shows "S3cret!"

  # ---------------------------------------------------------------- nominal
  @nominal
  Scenario: Sign in successfully
    Given the API answers 200 to "/auth/login" with "accessToken", "refreshToken" and "expiresIn"
    And the API answers 200 to "/profile/me" with a user holding the "users:read" permission
    When I sign in with valid credentials
    Then both tokens are stored
    And "/profile/me" is called before any redirect
    And I land on "/users"

  @nominal
  Scenario: Signing in without any readable menu entry
    Given the API answers 200 to "/auth/login"
    And the API answers 200 to "/profile/me" with a user holding no permission
    When I sign in with valid credentials
    Then I land on "/no-permissions"

  # ---------------------------------------------------------------- credentials
  @error
  Scenario: Wrong password
    Given the API answers 401 to "/auth/login" with the code "AUTH_INVALID_CREDENTIALS"
    When I sign in
    Then I see the alert "Email ou mot de passe incorrect."
    And no token is stored
    And I stay on "/auth/login"

  @error
  Scenario Outline: Unknown e-mail is indistinguishable from a wrong password
    Given the API answers 401 to "/auth/login" with the code "AUTH_INVALID_CREDENTIALS"
    When I sign in with "<email>"
    Then I see the alert "Email ou mot de passe incorrect."
    And the alert never states whether the account exists

    Examples:
      | email                  |
      | nobody@example.com     |
      | known.user@example.com |

  @error
  Scenario: Account not activated or deactivated
    Given the API answers 403 to "/auth/login" with the code "AUTH_ACCOUNT_NOT_ACTIVE"
    When I sign in
    Then I see the alert "Votre compte n'est pas actif. Contactez votre administrateur."
    And the alert does not mention a temporary lock

  # ---------------------------------------------------------------- lockout (423)
  @error @lock
  Scenario: Locked account shows a live countdown
    Given the API answers 423 to "/auth/login" with the body:
      """
      {
        "messages": {
          "statusCode": "423",
          "code": "AUTH_ACCOUNT_LOCKED",
          "text": "Account locked until 2026-08-31T17:19:03.892Z",
          "level": "error",
          "meta": { "lockedUntil": "2026-08-31T17:19:03.892Z" }
        }
      }
      """
    And the lock ends in 90 seconds
    When I sign in
    Then I see the alert "Trop de tentatives. Réessayez dans 1 min 30 s."
    And the submit button is disabled
    When 30 seconds pass
    Then the alert reads "Trop de tentatives. Réessayez dans 1 min 0 s."

  @error @lock
  Scenario: The form unlocks itself when the countdown reaches zero
    Given I am locked out for 3 seconds
    Then the submit button is disabled
    When the countdown reaches zero
    Then the submit button is enabled
    And I can submit the form again

  @error @lock
  Scenario: The countdown reads meta.lockedUntil, never the text
    Given the API answers 423 with "meta.lockedUntil" set to 60 seconds from now
    And "messages.text" mentions a different, contradictory date
    When I sign in
    Then the countdown is derived from "meta.lockedUntil"
    And "messages.text" is never parsed

  @error @lock
  Scenario: Lock without an exploitable date degrades gracefully
    Given the API answers 423 to "/auth/login" with no "meta.lockedUntil"
    When I sign in
    Then I see the alert "Trop de tentatives. Votre compte est temporairement bloqué."
    And no countdown is displayed
    And the submit button stays enabled

  # ---------------------------------------------------------------- session
  @session
  Scenario: An expired access token is refreshed transparently
    Given I am signed in
    And the API answers 401 once to a protected call
    And the API answers 200 to "/auth/refresh" with a new token pair
    When the protected call is retried
    Then the new pair replaces the old one
    And the call succeeds without me seeing the login page

  @session @rotation
  Scenario: Concurrent 401s trigger a single refresh
    Given I am signed in
    And three protected calls fail with 401 at the same time
    When the interceptor handles them
    Then exactly one POST "/auth/refresh" is sent
    And the two other calls wait for that same refresh
    # Rotation is single-use server-side: a second refresh would consume an
    # already dead token and sign everybody out.

  @session @error
  Scenario Outline: Any refresh failure sends me back to the login page
    Given I am signed in
    And the API answers 401 to "/auth/refresh" with the code "<code>"
    When a protected call fails with 401
    Then the tokens are cleared
    And I am redirected to "/auth/login"

    Examples:
      | code                             |
      | REFRESH_TOKEN_INVALID_OR_EXPIRED |
      | REFRESH_TOKEN_INVALID_OR_USED    |
      | SESSION_NOT_FOUND                |
      | AUTH_ACCOUNT_NOT_ACTIVE          |

  @session @error
  Scenario: A failing refresh redirects only once
    Given I am signed in
    And three protected calls fail with 401 at the same time
    And "/auth/refresh" answers 401
    When the interceptor handles them
    Then exactly one redirect to "/auth/login" happens
    # Guards against the login -> 429 -> IP ban loop.

  @session
  Scenario: A deactivated account is signed out mid-session
    Given I am signed in
    And a protected call answers 403 with the code "AUTH_ACCOUNT_NOT_ACTIVE"
    Then the tokens are cleared
    And I land on "/auth/login?reason=account_disabled"
    And I see the banner "Votre compte a été désactivé. Contactez votre administrateur."

  # ---------------------------------------------------------------- sign out
  @nominal
  Scenario: Sign out
    Given I am signed in
    When I sign out
    Then a POST "/auth/logout" is sent with the access token
    And the tokens are cleared
    And I land on "/auth/login"

  @error
  Scenario: Signing out from an already dead session
    Given I am signed in
    And "/auth/logout" answers 401 with the code "SESSION_NOT_FOUND"
    When I sign out
    Then no error is shown
    And the tokens are cleared
    And I land on "/auth/login"

  # ---------------------------------------------------------------- guards
  @guard
  Scenario: A protected page is unreachable without a token
    Given I have no token
    When I open "/users"
    Then I am redirected to "/auth/login"

  @guard
  Scenario: The login page is unreachable while signed in
    Given I am signed in
    When I open "/auth/login"
    Then I am redirected away from the login page

  @guard
  Scenario: A page I lack the permission for redirects me
    Given I am signed in without the "users:read" permission
    When I open "/users"
    Then I do not see the user list
    And I land on "/no-permissions"
