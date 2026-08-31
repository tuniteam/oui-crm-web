# Specifications BDD — front

Gherkin specifications describing the **user-visible** behaviour of the front.
They are the counterpart of `oui-crm-api/docs/features/*.feature`, which cover
the API contract instead.

Written in English, like the API ones. UI strings quoted in the scenarios stay
in French — they are the actual strings the user reads, taken from the
`constants/` files, and asserting on a translated copy would defeat the purpose.

| File | Scope | API counterpart |
|---|---|---|
| `auth.feature` | Sign in, session, lockout, guards (US-00-01) | `docs/features/auth.feature` |

## No runner yet

**These files are not executed today.** The project has no test framework at
all — no runner, no config, no `test` script. The scenarios are currently a
specification and a review checklist, not a green build.

Adding a runner is a decision that has not been taken. When it is, the natural
split is:

- **Component and hook level** — Vitest + Testing Library, with MSW to serve
  the API responses the scenarios describe. Covers validation, the countdown,
  the interceptor.
- **Browser level** — Playwright, for the guard and redirect scenarios which
  depend on real navigation.

Executing the Gherkin verbatim additionally requires a Cucumber layer
(`@cucumber/cucumber`, or `playwright-bdd`). That buys traceability with the
API feature files, at the cost of a step-definition layer to maintain. Worth it
if the API team keeps its own `.feature` files as the shared reference;
overkill if the front tests are read only by front developers.

## Conventions

Mirrors the API convention so both sides read alike.

- `@nominal` — the happy path
- `@error` — an error the user must understand
- `@validation` — client-side form validation, no request sent
- `@session` — token lifecycle, interceptor
- `@rotation` — refresh single-flight, tied to the single-use rotation
- `@guard` — route access
- `@lock` — the 423 lockout and its countdown
- `@l0` — level-0 scope

## Points the scenarios deliberately pin down

Three behaviours are easy to break without noticing, so they have their own
scenarios:

1. **Account enumeration** — an unknown e-mail and a wrong password must
   produce the exact same message. A future "e-mail not found" refinement would
   be a security regression.
2. **The countdown reads `meta.lockedUntil`, never `messages.text`** — one
   scenario feeds a contradictory date in `text` to make sure it is ignored.
   `text` is human-facing and may change without notice.
3. **One refresh, one redirect** — rotation is single-use server-side, so
   concurrent 401s must share a single refresh, and a failing refresh must
   redirect once. Getting this wrong signs everybody out, or loops on the login
   page until the IP is banned.
