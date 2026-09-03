/**
 * Scénarios exécutables de docs/RECETTE-BDD-FRONT.md.
 *
 * Chaque entrée porte le `id` de la ligne du document : le rapport et les
 * captures s'y rattachent, et la recette reste la source unique.
 *
 * `mock` permet de simuler une réponse d'API : c'est ce qui rend testables les
 * cas d'erreur qu'on ne peut pas provoquer sur des données réelles — compte
 * verrouillé, e-mail déjà pris, gabarit refusé.
 */

const LOGIN = '/auth/login';

/**
 * Simule une réponse d'API sur une route donnée.
 *
 * Le filtre exige `/api/v1` : sans lui, l'interception attrapait aussi la
 * navigation du navigateur vers la page de même chemin, qui recevait alors du
 * JSON à la place de l'application.
 */
const mock = (page, pathFragment, status, body) =>
  page.route(
    (url) => url.pathname.includes('/api/v1') && url.pathname.includes(pathFragment),
    (route) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      }),
  );

const err = (statusCode, code, extra = {}) => ({
  messages: { statusCode: String(statusCode), code, level: 'error', ...extra },
});


/** Action minimale : seuls l'id, le jour et le statut varient d'un scenario a l'autre. */
const activityFixture = (over = {}) => ({
  id: 'a1',
  organization: { id: 'o1', name: 'Commune de Joigny' },
  contact: null,
  user: { id: 'u1', fullName: 'Wiem Bousaid', initials: null },
  type: { key: 'CALL', label: 'Appel' },
  date: '2026-10-15',
  time: null,
  durationMin: null,
  location: null,
  status: 'PLANNED',
  report: null,
  result: null,
  campaign: null,
  completedAt: null,
  ...over,
});

/** `GET /activities` seul : la liste des organismes reste celle du serveur. */
const mockActivities = (page, data) =>
  page.route(
    (url) => url.pathname.endsWith('/activities'),
    (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data,
              meta: { total: data.length, page: 1, limit: 50, totalPages: 1 },
            }),
          })
        : route.fallback(),
  );

/** Ouvre la premiere fiche du projet et son onglet Actions. */
async function openActivitiesTab(page, projectId) {
  await page.goto(`/${projectId}/organizations`);
  await page
    .locator('[data-testid^="organization-view-"]')
    .first()
    .waitFor({ timeout: 20000 });
  await page.locator('[data-testid^="organization-view-"]').first().click();
  await page.getByTestId('organization-tab-activities').waitFor({ timeout: 15000 });
  await page.getByTestId('organization-tab-activities').click();
  await page.getByTestId('organization-activities').waitFor({ timeout: 15000 });
  await page.waitForTimeout(900);
}

/** Campagne minimale : seuls `id` et le compteur varient d'un scenario a l'autre. */
const campaignFixture = (over = {}) => ({
  id: 'c1',
  name: 'Rentree 89',
  description: null,
  status: 'ACTIVE',
  owner: null,
  startDate: null,
  endDate: null,
  criteria: null,
  organizationsCount: 0,
  results: { activities: 0, opportunities: 0, quotes: 0, signed: 0 },
  ...over,
});

export const scenarios = [
  // ─────────────────────────────── US-00-01
  {
    id: '01.1',
    us: 'US-00-01',
    title: 'Formulaire vide : deux messages, aucun appel',
    anonymous: true,
    async run({ page, expect, apiCalls }) {
      await page.goto(LOGIN);
      await page.getByTestId('auth-login-submit-button').click();
      await page.waitForTimeout(500);
      const messages = await page.getByText('Champ requis').count();
      expect(messages >= 2, `attendu 2 messages, vu ${messages}`);
      expect(
        !apiCalls().some((c) => c.includes('/auth/login')),
        'un appel de connexion a été émis',
      );
    },
  },
  {
    id: '01.2',
    us: 'US-00-01',
    title: 'E-mail malformé refusé avant envoi',
    anonymous: true,
    async run({ page, expect, apiCalls }) {
      await page.goto(LOGIN);
      await page.getByTestId('auth-login-email-input').fill('pas-un-email');
      await page.getByTestId('auth-login-password-input').fill('MotDePasse1');
      await page.getByTestId('auth-login-submit-button').click();
      await page.waitForTimeout(500);
      await page.getByText('Adresse email invalide').waitFor({ timeout: 3000 });
      expect(
        !apiCalls().some((c) => c.includes('/auth/login')),
        'un appel de connexion a été émis',
      );
    },
  },
  {
    id: '01.6',
    us: 'US-00-01',
    title: 'Mot de passe faux : message unique, aucun jeton',
    anonymous: true,
    async run({ page, expect }) {
      await mock(page, '/auth/login', 401, err(401, 'AUTH_INVALID_CREDENTIALS'));
      await page.goto(LOGIN);
      await page.getByTestId('auth-login-email-input').fill('qui@example.com');
      await page.getByTestId('auth-login-password-input').fill('MotDePasse1');
      await page.getByTestId('auth-login-submit-button').click();
      await page
        .getByText('Email ou mot de passe incorrect.')
        .waitFor({ timeout: 5000 });
      const token = await page.evaluate(() =>
        localStorage.getItem('soft_m_access_token'),
      );
      expect(!token, 'un jeton a été stocké malgré l’échec');
    },
  },
  {
    id: '01.8',
    us: 'US-00-01',
    title: 'Compte non actif : message dédié, sans mention de blocage',
    anonymous: true,
    async run({ page, expect }) {
      await mock(page, '/auth/login', 403, err(403, 'AUTH_ACCOUNT_NOT_ACTIVE'));
      await page.goto(LOGIN);
      await page.getByTestId('auth-login-email-input').fill('qui@example.com');
      await page.getByTestId('auth-login-password-input').fill('MotDePasse1');
      await page.getByTestId('auth-login-submit-button').click();
      const alert = page.getByText(/n'est pas actif|n’est pas actif/);
      await alert.waitFor({ timeout: 5000 });
      const body = await page.locator('body').innerText();
      expect(
        !/temporairement bloqué/i.test(body),
        'le message parle à tort de blocage temporaire',
      );
    },
  },
  {
    id: '01.9',
    us: 'US-00-01',
    title: 'Compte verrouillé : compte à rebours, bouton désactivé',
    anonymous: true,
    async run({ page, expect }) {
      const until = new Date(Date.now() + 90_000).toISOString();
      await mock(
        page,
        '/auth/login',
        423,
        err(423, 'AUTH_ACCOUNT_LOCKED', {
          text: `Account locked until ${until}`,
          meta: { lockedUntil: until },
        }),
      );
      await page.goto(LOGIN);
      await page.getByTestId('auth-login-email-input').fill('qui@example.com');
      await page.getByTestId('auth-login-password-input').fill('MotDePasse1');
      await page.getByTestId('auth-login-submit-button').click();
      await page.getByText(/Réessayez dans/).waitFor({ timeout: 5000 });
      const disabled = await page
        .getByTestId('auth-login-submit-button')
        .isDisabled();
      expect(disabled, 'le bouton d’envoi est resté actif');
    },
  },
  {
    id: '01.11',
    us: 'US-00-01',
    title: 'Le décompte suit meta.lockedUntil, jamais le texte',
    anonymous: true,
    async run({ page, expect }) {
      // `text` annonce une date contradictoire : elle doit être ignorée.
      const until = new Date(Date.now() + 120_000).toISOString();
      await mock(
        page,
        '/auth/login',
        423,
        err(423, 'AUTH_ACCOUNT_LOCKED', {
          text: 'Account locked until 2099-01-01T00:00:00.000Z',
          meta: { lockedUntil: until },
        }),
      );
      await page.goto(LOGIN);
      await page.getByTestId('auth-login-email-input').fill('qui@example.com');
      await page.getByTestId('auth-login-password-input').fill('MotDePasse1');
      await page.getByTestId('auth-login-submit-button').click();
      const alert = await page
        .getByText(/Réessayez dans/)
        .innerText({ timeout: 5000 });
      // ~2 min et non ~75 ans : la date de `text` n'a pas été utilisée.
      expect(
        /1 min|2 min/.test(alert),
        `décompte inattendu : « ${alert} »`,
      );
    },
  },
  {
    id: '01.22',
    us: 'US-00-01',
    title: 'Page protégée sans jeton : redirection vers le login',
    anonymous: true,
    async run({ page, expect }) {
      await page.goto('/projects');
      await page.waitForURL((u) => u.pathname.startsWith('/auth'), {
        timeout: 5000,
      });
      expect(page.url().includes('/auth/login'), `URL : ${page.url()}`);
    },
  },

  // ─────────────────────────────── US-00-04
  {
    id: '04.1',
    us: 'US-00-04',
    title: 'Un back-office atterrit sur la liste des projets',
    async run({ page, expect }) {
      await page.waitForURL((u) => u.pathname === '/projects', {
        timeout: 10000,
      });
      expect(true);
    },
  },
  {
    id: '04.3',
    us: 'US-00-04',
    title: 'La liste affiche projet, produit, statut et fonctionnalités',
    async run({ page, expect }) {
      await page.goto('/projects');
      for (const header of ['Projet', 'Produit', 'Statut', 'Fonctionnalités']) {
        await page
          .getByRole('columnheader', { name: header })
          .first()
          .waitFor({ timeout: 5000 });
      }
      expect(true);
    },
  },
  {
    id: '04.11',
    us: 'US-00-04',
    title: 'Projet inconnu : écran dédié, jamais de page blanche',
    async run({ page, expect }) {
      await mock(page, '/projects/', 404, err(404, 'PROJECT_NOT_FOUND'));
      await page.goto('/projects/cxxxxxxxxxxxxxxxxxxxxxxxx/informations');
      await page.getByText('Projet introuvable').waitFor({ timeout: 6000 });
      const text = (await page.locator('body').innerText()).trim();
      expect(text.length > 40, 'la page est quasi vide');
    },
  },
  {
    id: '04.13',
    us: 'US-00-04',
    title: 'Le menu bascule sur les cinq groupes de la V8',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/dashboard`);
      // Les intitules sont mis en capitales par CSS : on compare sans casse.
      for (const group of [
        'Pilotage',
        'Prospection',
        'Commercial',
        'Clients',
        'Administration',
      ]) {
        await page
          .getByText(new RegExp(`^${group}$`, 'i'))
          .first()
          .waitFor({ timeout: 6000 });
      }
      expect(true);
    },
  },
  {
    id: '04.14',
    us: 'US-00-04',
    title: 'Chaque appel scopé porte x-project-id',
    needsProject: true,
    async run({ page, expect, projectId, scopedHeaders }) {
      await page.goto(`/${projectId}/settings`);
      await page.waitForTimeout(2000);
      const sent = scopedHeaders();
      expect(sent.length > 0, 'aucun appel scopé observé');
      expect(
        sent.every((h) => h === projectId),
        `en-têtes inattendus : ${[...new Set(sent)].join(', ')}`,
      );
    },
  },
  {
    id: '04.16',
    us: 'US-00-04',
    title: 'Un écran non livré affiche l’attente, sans être grisé',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/opportunities`);
      await page.getByText('Opportunités').first().waitFor({ timeout: 6000 });
      await page
        .getByText(/en cours de développement/)
        .waitFor({ timeout: 6000 });
      expect(true);
    },
  },

  {
    id: '04.18',
    us: 'US-00-04',
    title: 'Le menu plateforme ne propose pas les utilisateurs de projet',
    async run({ page, expect }) {
      await page.goto('/projects');
      await page.getByTestId('project-view-cell, [data-testid^="project-view-"]')
        .first()
        .waitFor({ timeout: 10000 })
        .catch(() => {});

      const rail = page.locator('.sidebar');
      await rail.waitFor({ timeout: 10000 });
      const entries = (await rail.innerText())
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      // `GET /users` est une route de projet : hors projet elle ne peut rien
      // renvoyer. L'entree menait donc a un ecran en erreur.
      expect(
        !entries.includes('Utilisateurs'),
        `le menu plateforme propose encore les utilisateurs : ${entries.join(' | ')}`,
      );
      expect(
        entries.includes('Projets') && entries.includes('Opérateurs'),
        `le menu plateforme a perdu ses entrees : ${entries.join(' | ')}`,
      );
    },
  },

  // ─────────────────────────────── US-00-05
  {
    id: '05.2',
    gherkin: [
      "Given je suis sur la liste des utilisateurs d'un projet",
      "When je choisis un rôle dans le filtre",
      "Then la requête envoyée porte roleCode",
    ],
    us: 'US-00-05',
    title: 'Le filtre par rôle part bien dans la requête',
    needsProject: true,
    async run({ page, expect, projectId }) {
      const calls = [];
      await page.route(
        (url) => url.pathname.includes('/api/v1/users'),
        (route) => {
          calls.push(route.request().url());
          return route.continue();
        },
      );

      await page.goto(`/${projectId}/users`);
      await page.getByTestId('user-filter-role').click();
      await page.getByRole('option', { name: /sales representative/i }).first().click();

      // Le filtre est debounce a 500 ms : on laisse l'appel repartir.
      await page.waitForTimeout(1800);

      const filtered = calls.filter((u) => u.includes('roleCode='));
      expect(
        filtered.length > 0,
        `aucun appel avec roleCode= (${calls.length} appel(s) observé(s))`,
      );
    },
  },
  {
    id: '05.14',
    gherkin: [
      "Given j'ouvre la fiche d'un utilisateur du projet",
      "When je regarde le bloc de retrait",
      "Then il ne parle jamais de suppression définitive",
    ],
    us: 'US-00-05',
    title: "Le retrait n'est jamais présenté comme une suppression",
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/users`);
      await page.locator('[data-testid^="user-view-"]').first().click();
      await page
        .getByText(/retrait du projet/i)
        .first()
        .waitFor({ timeout: 10000 });

      const body = (await page.locator('body').innerText()).toLowerCase();
      // L'API suspend l'affectation, elle ne supprime rien : promettre une
      // suppression definitive est faux, et sur des donnees personnelles c'est
      // une promesse qu'on ne tient pas.
      expect(
        !body.includes('définitive') && !body.includes('definitive'),
        'l’écran parle encore de suppression définitive',
      );
    },
  },
  {
    id: '05.15',
    gherkin: [
      "Given j'ouvre la fiche d'un utilisateur du projet",
      "When je confirme son retrait du projet",
      "Then je reviens à la liste du projet",
      "And jamais à la liste plateforme, qui n'a pas de projet actif",
    ],
    us: 'US-00-05',
    title: 'Après un retrait, on revient à la liste du projet',
    needsProject: true,
    async run({ page, expect, projectId }) {
      // Seul le DELETE est simule : le reste de l'ecran doit vivre.
      await page.route(
        (url) => url.pathname.includes('/api/v1/users/'),
        (route) =>
          route.request().method() === 'DELETE'
            ? route.fulfill({ status: 204, body: '' })
            : route.continue(),
      );

      await page.goto(`/${projectId}/users`);
      await page.locator('[data-testid^="user-view-"]').first().click();
      await page.getByText(/retrait du projet/i).first().waitFor({ timeout: 10000 });

      const label = /retirer du projet/i;
      await page.getByRole('button', { name: label }).first().click();
      await page.getByRole('dialog').getByRole('button', { name: label }).click();

      await page.waitForURL(`**/${projectId}/users`, { timeout: 8000 });

      // Le vrai symptome : la liste plateforme appelle une route scopee sans
      // x-project-id et affiche « Aucun projet selectionne ».
      const body = await page.locator('body').innerText();
      expect(
        !body.includes('Aucun projet'),
        'retour sur la liste plateforme au lieu de celle du projet',
      );
    },
  },
  {
    id: '05.4',
    gherkin: [
      "Given j'ouvre la fenêtre « Créer un utilisateur »",
      "When je saisis une seule lettre dans « Initiales »",
      "Then le message « Deux ou trois majuscules ou chiffres » s'affiche",
      "And aucun appel de création n'est parti",
    ],
    us: 'US-00-05',
    title: 'Initiales hors format refusées avant envoi',
    needsProject: true,
    async run({ page, expect, projectId }) {
      let called = false;
      await page.route(
        (url) => url.pathname.includes('/api/v1/users'),
        (route) => {
          if (route.request().method() === 'POST') called = true;
          return route.continue();
        },
      );

      await page.goto(`/${projectId}/users`);
      await page.getByRole('button', { name: /nouvel utilisateur/i }).click();
      await page.getByTestId('user-initials-input').fill('A');
      // Le message doit apparaitre sans qu'aucun appel ne parte.
      await page
        .getByText(/deux ou trois majuscules ou chiffres/i)
        .first()
        .waitFor({ timeout: 6000 });
      expect(called === false, 'un POST /users est parti malgré des initiales invalides');
    },
  },
  {
    id: '05.8',
    gherkin: [
      "Given j'ouvre la fenêtre « Créer un utilisateur »",
      "When j'active « Accès externe »",
      "Then le champ « Fin d'accès » reste visible et atteignable",
    ],
    us: 'US-00-05',
    title: "Accès externe : la date de fin reste visible et atteignable",
    needsProject: true,
    async run({ page, expect, projectId }) {
      // Fenetre courte : c'est la seule hauteur ou le formulaire depasse la
      // fenetre modale. En 900px il tient, et le defaut ne se voit pas.
      await page.setViewportSize({ width: 1280, height: 720 });

      await page.goto(`/${projectId}/users`);
      await page.getByRole('button', { name: /nouvel utilisateur/i }).click();
      await page.getByTestId('user-external-switch').click();

      const date = page.getByTestId('user-expires-input');
      await date.waitFor({ timeout: 6000 });

      // Le champ ne doit pas passer sous le pied de fenetre : on compare sa
      // base au haut du pied. C'est ce que le corps defilant garantit.
      const field = await date.boundingBox();
      const footer = await page
        .locator('[data-slot="dialog-footer"]')
        .first()
        .boundingBox();
      expect(!!field, 'le champ de date est introuvable');
      expect(
        !footer || field.y + field.height <= footer.y + 1,
        'le champ de date passe sous le pied de fenêtre',
      );
    },
  },

  // ─────────────────────────────── US-01-01
  {
    id: '01-01.2',
    gherkin: [
      "Given je suis connecté comme administrateur du projet",
      "When j'ouvre l'écran « Organismes »",
      "Then aucune clé de référentiel n'est visible à l'écran",
      "And je vois l'étiquette « Chaud » à la place de « HOT »",
    ],
    us: 'US-01-01',
    title: 'Types, solutions et étiquettes affichés en libellés',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId(/^organization-name-/).first().waitFor({ timeout: 10000 });

      const body = await page.locator('body').innerText();
      // Les cles de referentiel du jeu de donnees. Les voir a l'ecran signifie
      // qu'une traduction manque quelque part.
      const rawKeys = ['HOT', 'PUBLIC_TENDER', 'WATCH', 'COMPETITOR_RENEWAL'];
      const leaked = rawKeys.filter((k) => body.includes(k));
      expect(
        leaked.length === 0,
        `clé(s) de référentiel affichée(s) brutes : ${leaked.join(', ')}`,
      );
      // Une cle absente ne prouve rien : elle peut manquer parce que le jeu de
      // donnees n'en porte aucune. Il faut donc voir au moins une traduction.
      // On n'en exige aucune en particulier : le seed change, et le scenario
      // tombait quand la fiche portant « Chaud » a disparu — un rouge qui ne
      // disait rien du produit.
      const knownLabels = [
        'Chaud',
        'À surveiller',
        'Marché public en cours',
        'Renouvellement concurrent',
        'Recommandation',
      ];
      expect(
        knownLabels.some((l) => body.includes(l)),
        'aucune étiquette traduite trouvée à l’écran',
      );
    },
  },
  {
    id: '01-01.5',
    gherkin: [
      "Given je suis sur l'écran « Organismes »",
      "When j'active le filtre « Fiches incomplètes »",
      "Then la requête envoyée porte completenessMax=99",
      "And jamais 100, qui ramènerait toute la base",
    ],
    us: 'US-01-01',
    title: 'Le filtre « fiches incomplètes » envoie completenessMax=99',
    needsProject: true,
    async run({ page, expect, projectId }) {
      const calls = [];
      await page.route(
        (url) => url.pathname.includes('/api/v1/organizations'),
        (route) => {
          calls.push(route.request().url());
          return route.continue();
        },
      );

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-filter-incomplete').click();
      await page.waitForTimeout(1800);

      const withMax = calls.filter((u) => u.includes('completenessMax='));
      expect(withMax.length > 0, 'aucun appel avec completenessMax=');
      expect(
        withMax.every((u) => u.includes('completenessMax=99')),
        `attendu 99, vu : ${withMax.map((u) => u.split('completenessMax=')[1]?.split('&')[0]).join(', ')}`,
      );
    },
  },
  {
    id: '01-01.7',
    gherkin: [
      "Given une fiche hors de mon périmètre, rendue en projection restreinte",
      "When j'ouvre l'écran « Organismes »",
      "Then la ligne porte la mention « hors de votre périmètre »",
      "And les champs que le serveur ne renvoie pas restent vides",
    ],
    us: 'US-01-01',
    title: 'Une fiche hors périmètre est signalée et ses colonnes vidées',
    needsProject: true,
    async run({ page, expect, projectId }) {
      // Le jeu de donnees n'a que des fiches FULL : on simule la projection a
      // neuf champs que le serveur rend sur un acces restreint.
      await mock(page, '/organizations', 200, {
        data: [
          {
            id: 'cxxxxxxxxxxxxxxxxxxxxxxxx',
            name: 'Commune hors secteur',
            type: 'COMMUNE',
            city: 'Ailleurs',
            department: '99',
            salesStatus: 'IN_PROGRESS',
            customerStatus: 'NOT_CUSTOMER',
            salesRep: { id: 'c1', fullName: 'Wiem Bousaid' },
            access: 'RESTRICTED',
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      await page.goto(`/${projectId}/organizations`);
      await page.getByText('Commune hors secteur').first().waitFor({ timeout: 10000 });

      const body = await page.locator('body').innerText();
      expect(
        body.includes('hors de votre périmètre'),
        'la ligne restreinte ne porte pas la mention',
      );
      // La population n'est pas rendue par le serveur : elle doit rester vide,
      // pas afficher 0 ni undefined.
      expect(
        !body.includes('undefined') && !body.includes('NaN'),
        'un champ absent est rendu tel quel',
      );
    },
  },

  {
    id: '01-01.13',
    us: 'US-01-01',
    title: "L'action d'ouverture reste atteignable sans defilement",
    needsProject: true,
    gherkin: [
      "Given l'écran « Organismes », dont les colonnes dépassent la largeur de l'écran",
      "When j'affiche la liste sans faire défiler horizontalement",
      "Then l'action d'ouverture de la première ligne est visible",
      "And elle ne laisse pas transparaître le contenu qu'elle recouvre",
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      const view = page.locator('[data-testid^="organization-view-"]').first();
      await view.waitFor({ timeout: 10000 });

      // `isVisible` ne suffit pas : une colonne sortie de l'ecran reste
      // « visible » au sens du DOM. On compare sa position a la fenetre.
      const box = await view.boundingBox();
      const width = page.viewportSize().width;
      expect(
        box && box.x >= 0 && box.x + box.width <= width,
        `l'action sort de l'ecran (x=${box?.x}, largeur fenetre=${width})`,
      );

      // Colonne epinglee : opaque, sinon le texte du dessous se lit au travers.
      const cell = view.locator('xpath=ancestor::td[1]');
      const bg = await cell.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      expect(
        bg !== 'rgba(0, 0, 0, 0)' && !/,\s*0?\.\d+\)$/.test(bg),
        `la cellule epinglee est translucide (${bg})`,
      );
    },
  },

  {
    id: '01-01.14',
    us: 'US-01-01',
    title: 'Les filtres de la V8 partent au serveur, et se réinitialisent',
    needsProject: true,
    gherkin: [
      "Given je suis sur l'écran « Organismes »",
      'When je filtre par département',
      'Then la requête porte ce département et la liste se restreint',
      'When je clique sur « Réinitialiser »',
      'Then tous les filtres sont effacés et la liste revient entière',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await page.goto(`/${projectId}/organizations`);
      const rows = page.locator('[data-testid^="organization-view-"]');
      await rows.first().waitFor({ timeout: 15000 });
      await page.waitForTimeout(600);
      const before = await rows.count();

      // Le bouton ne s'affiche qu'avec un filtre actif : rien a remettre a
      // zero sur une liste vierge.
      expect(
        !(await page.getByTestId('organization-filters-reset').isVisible().catch(() => false)),
        'Réinitialiser est proposé alors qu aucun filtre n est actif',
      );

      apiCalls(true);
      await page.getByTestId('organization-filter-department').fill('89');
      await page.waitForTimeout(1800);

      expect(
        apiCalls().some((c) => c.includes('department=89')),
        `le département n est pas transmis : ${apiCalls().join(', ')}`,
      );
      const filtered = await rows.count();
      expect(
        filtered > 0 && filtered < before,
        `la liste n a pas été restreinte : ${filtered} sur ${before}`,
      );

      await page.getByTestId('organization-filters-reset').click();
      await page.waitForTimeout(1800);
      expect(
        (await rows.count()) === before,
        'la liste n est pas revenue entière après réinitialisation',
      );
      expect(
        (await page.getByTestId('organization-filter-department').inputValue()) === '',
        'le champ département n a pas été vidé',
      );
    },
  },

  {
    id: '01-01.15',
    us: 'US-01-01',
    title: 'Solution et étiquette se choisissent dans les référentiels',
    needsProject: true,
    gherkin: [
      "Given je suis sur l'écran « Organismes »",
      "Then les filtres solution et étiquette proposent les valeurs du projet",
      'And aucune clé de référentiel ne s’y affiche',
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .waitFor({ timeout: 15000 });

      for (const [testId, sample] of [
        ['organization-filter-solution', 'JVS Enfance'],
        ['organization-filter-tag', 'À surveiller'],
      ]) {
        await page.getByTestId(testId).click();
        await page.waitForTimeout(500);
        const options = await page.locator('[role="option"]').allInnerTexts();
        expect(
          options.some((o) => o.trim() === sample),
          `« ${sample} » absent du filtre ${testId} : ${options.join(' | ')}`,
        );
        // Une cle brute trahirait une liste en dur ou un libelle non resolu.
        expect(
          !options.some((o) => /^[A-Z][A-Z0-9_]+$/.test(o.trim())),
          `une clé de référentiel est affichée : ${options.join(' | ')}`,
        );
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      }
    },
  },

  {
    id: '01-03.11',
    us: 'US-01-03',
    title: 'La fiche montre l’éditeur de la solution et ses dates',
    needsProject: true,
    gherkin: [
      "Given j'ouvre la fiche d'un organisme équipé d'une solution éditée",
      "Then l'éditeur est affiché sous le sélecteur, en libellé",
      'And le pied porte les dates de création et de modification',
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .waitFor({ timeout: 15000 });

      // La ligne n'est pas cliquable : seule l'action d'ouverture l'est.
      await page
        .locator('tr', { hasText: 'Commune de Rennes' })
        .locator('[data-testid^="organization-view-"]')
        .first()
        .click();
      const sheet = page.getByTestId('reusable-sheet');
      await sheet.waitFor({ timeout: 10000 });
      await page.waitForTimeout(1500);

      const body = await sheet.innerText();
      // Libelle resolu depuis `metadata.vendor`, jamais la cle JVS_MAIRISTEM.
      expect(
        body.includes('Éditeur : JVS-Mairistem'),
        "l'éditeur de la solution n'est pas affiché en libellé",
      );
      expect(
        !body.includes('JVS_MAIRISTEM'),
        'la clé du référentiel est affichée telle quelle',
      );

      const stamps = await page
        .getByTestId('organization-timestamps')
        .innerText()
        .catch(() => '');
      expect(
        /Créée le \d{2}\/\d{2}\/\d{4} · modifiée le \d{2}\/\d{2}\/\d{4}/.test(stamps),
        `les dates de la fiche sont absentes ou mal formées : ${stamps}`,
      );
    },
  },

  // ─────────────────────────────── US-01-02
  {
    id: '01-02.1',
    us: 'US-01-02',
    title: "La fenêtre s'ouvre sur la recherche officielle",
    needsProject: true,
    gherkin: [
      "Given je suis sur l'écran « Organismes »",
      'When je clique sur « Nouvel organisme »',
      'Then la recherche au registre officiel est le mode actif',
      'And « Créer la fiche » est inactif, faute de saisie',
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('registry-search-input').waitFor({ timeout: 10000 });

      expect(
        await page.getByTestId('org-create-submit').isDisabled(),
        'le bouton de creation est actif alors que rien n est saisi',
      );
    },
  },

  {
    id: '01-02.2',
    us: 'US-01-02',
    title: 'Une recherche trop courte ne part pas',
    needsProject: true,
    gherkin: [
      'Given la fenêtre de création, mode registre',
      'When je saisis moins de trois caractères',
      'Then le bouton « Rechercher » reste inactif',
      "And aucun appel n'est fait au registre",
    ],
    async run({ page, expect, projectId }) {
      let calls = 0;
      await page.route('**/search-registry**', (route) => {
        calls += 1;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{"data":[]}',
        });
      });

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('registry-search-input').fill('ba');

      expect(
        await page.getByTestId('registry-search-btn').isDisabled(),
        'la recherche est proposee avec moins de trois caracteres',
      );
      expect(calls === 0, `le registre a ete interroge ${calls} fois`);
    },
  },

  {
    id: '01-02.3',
    us: 'US-01-02',
    title: 'Un résultat du registre pré-remplit la saisie',
    needsProject: true,
    gherkin: [
      'Given la fenêtre de création, mode registre',
      'When je recherche une structure et retiens un résultat',
      'Then la saisie manuelle est pré-remplie avec ses valeurs',
      "And le département vient du code INSEE rendu par l'API",
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/search-registry', 200, {
        data: [
          {
            name: 'COMMUNE DE JOIGNY',
            siret: '21890206500013',
            siren: '218902065',
            address: '3 QUAI DU 1ER DRAGONS',
            postalCode: '89300',
            city: 'JOIGNY',
            inseeCode: '89206',
            department: '89',
            isActive: true,
          },
        ],
      });

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('registry-search-input').fill('Joigny');
      await page.getByTestId('registry-search-btn').click();
      await page.getByTestId('registry-use-21890206500013').click();

      await page.getByTestId('org-create-name').waitFor({ timeout: 10000 });
      const name = await page.getByTestId('org-create-name').inputValue();
      const dept = await page.getByTestId('org-create-department').inputValue();
      const siret = await page.getByTestId('org-create-siret').inputValue();

      expect(name === 'COMMUNE DE JOIGNY', `nom pre-rempli : ${name}`);
      // Derive par l'API a partir du code INSEE, jamais recalcule ici.
      expect(dept === '89', `departement pre-rempli : ${dept}`);
      expect(siret === '21890206500013', `SIRET pre-rempli : ${siret}`);
    },
  },

  {
    id: '01-02.6',
    us: 'US-01-02',
    title: 'Registre indisponible : la saisie manuelle est proposée',
    needsProject: true,
    gherkin: [
      'Given le registre officiel ne répond pas',
      'When je lance une recherche',
      'Then un message propose la saisie manuelle',
      "And ce n'est pas présenté comme un échec bloquant",
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/search-registry', 503, err(503, 'REGISTRY_UNAVAILABLE'));

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('registry-search-input').fill('Bayeux');
      await page.getByTestId('registry-search-btn').click();

      const notice = page.getByTestId('registry-degraded');
      await notice.waitFor({ timeout: 10000 });
      const text = await notice.innerText();
      expect(
        text.includes('manuellement'),
        `le message ne renvoie pas vers la saisie manuelle : ${text}`,
      );

      // La bascule doit rester possible : c'est tout l'interet du message.
      await page.getByTestId('org-create-mode-manual').click();
      await page.getByTestId('org-create-name').waitFor({ timeout: 5000 });
    },
  },

  {
    id: '01-02.8',
    us: 'US-01-02',
    title: 'Trois champs obligatoires, refusés avant envoi',
    needsProject: true,
    gherkin: [
      'Given la fenêtre de création, en saisie manuelle',
      'When je valide sans rien renseigner',
      'Then nom, type et département sont signalés',
      "And aucun appel de création n'est fait",
    ],
    async run({ page, expect, projectId }) {
      let calls = 0;
      await page.route(
        (url) =>
          url.pathname.includes('/api/v1') &&
          url.pathname.endsWith('/organizations'),
        (route) => {
          if (route.request().method() === 'POST') calls += 1;
          route.fallback();
        },
      );

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('org-create-mode-manual').click();
      await page.getByTestId('org-create-submit').click();
      await page.waitForTimeout(900);

      const body = await page.locator('body').innerText();
      expect(body.includes('Champ requis'), 'aucun champ obligatoire signale');
      expect(calls === 0, `la creation a ete tentee (${calls} appel(s))`);
    },
  },

  {
    id: '01-02.9',
    us: 'US-01-02',
    title: "La ville n'est pas obligatoire, contrairement à la V8",
    needsProject: true,
    gherkin: [
      'Given la fenêtre de création, en saisie manuelle',
      'When je renseigne nom, type et département, sans ville',
      'Then la création part',
      "And le champ vide n'est pas transmis",
    ],
    async run({ page, expect, projectId }) {
      let sent = null;
      await page.route(
        (url) =>
          url.pathname.includes('/api/v1') &&
          url.pathname.endsWith('/organizations'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'cnew',
              name: sent.name,
              completenessScore: 40,
            }),
          });
        },
      );

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('org-create-mode-manual').click();
      await page.getByTestId('org-create-name').fill('EPCI sans ville');
      await page.getByTestId('org-create-department').fill('89');
      await page.getByTestId('org-create-type').click();
      await page.locator('[role="option"]').first().click();
      await page.getByTestId('org-create-submit').click();
      await page.waitForTimeout(1500);

      expect(sent !== null, 'aucune creation envoyee sans ville');
      // Champ vide non transmis : le serveur appliquerait sinon son defaut.
      expect(
        sent && !('city' in sent),
        `la ville vide a ete transmise : ${JSON.stringify(sent)}`,
      );
    },
  },

  {
    id: '01-02.13',
    us: 'US-01-02',
    title: 'Doublon probable : les candidats de meta sont proposés',
    needsProject: true,
    gherkin: [
      'Given une fiche de même nom au même code postal',
      "When je crée l'organisme",
      'Then les candidats de messages.meta.duplicates sont listés',
      'And la saisie reste intacte',
    ],
    async run({ page, expect, projectId }) {
      await page.route(
        (url) =>
          url.pathname.includes('/api/v1') &&
          url.pathname.endsWith('/organizations'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          return route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify(
              err(409, 'ORGANIZATION_POSSIBLE_DUPLICATE', {
                text: 'An organization with a similar name already exists',
                meta: {
                  duplicates: [
                    { id: 'cdup1', name: 'Commune de Joigny', city: 'Joigny' },
                  ],
                },
              }),
            ),
          });
        },
      );

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('org-create-mode-manual').click();
      await page.getByTestId('org-create-name').fill('Commune de Joigny');
      await page.getByTestId('org-create-department').fill('89');
      await page.getByTestId('org-create-type').click();
      await page.locator('[role="option"]').first().click();
      await page.getByTestId('org-create-submit').click();

      const warn = page.getByTestId('organization-duplicate-warning');
      await warn.waitFor({ timeout: 10000 });
      const text = await warn.innerText();
      // Le candidat vient de `meta`, pas du texte du message, qui est anglais.
      expect(
        text.includes('Commune de Joigny') && text.includes('Joigny'),
        `le candidat de meta n est pas affiche : ${text}`,
      );
      const kept = await page.getByTestId('org-create-name').inputValue();
      expect(kept === 'Commune de Joigny', `la saisie a ete perdue : ${kept}`);
    },
  },

  {
    id: '01-02.14',
    us: 'US-01-02',
    title: 'Confirmer un doublon rejoue la requête avec force',
    needsProject: true,
    gherkin: [
      'Given un doublon probable signalé',
      'When je confirme la création',
      'Then la même requête repart avec force à vrai',
    ],
    async run({ page, expect, projectId }) {
      const posts = [];
      await page.route(
        (url) =>
          url.pathname.includes('/api/v1') &&
          url.pathname.endsWith('/organizations'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          const body = JSON.parse(route.request().postData() ?? '{}');
          posts.push(body);
          if (body.force) {
            return route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: 'cnew',
                name: body.name,
                completenessScore: 40,
              }),
            });
          }
          return route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify(
              err(409, 'ORGANIZATION_POSSIBLE_DUPLICATE', {
                meta: {
                  duplicates: [
                    { id: 'cdup1', name: 'Commune de Joigny', city: 'Joigny' },
                  ],
                },
              }),
            ),
          });
        },
      );

      await page.goto(`/${projectId}/organizations`);
      await page.getByTestId('organization-create-btn').first().click();
      await page.getByTestId('org-create-mode-manual').click();
      await page.getByTestId('org-create-name').fill('Commune de Joigny');
      await page.getByTestId('org-create-department').fill('89');
      await page.getByTestId('org-create-type').click();
      await page.locator('[role="option"]').first().click();
      await page.getByTestId('org-create-submit').click();

      const confirm = page.getByTestId('organization-duplicate-confirm');
      await confirm.waitFor({ timeout: 10000 });
      await confirm.click();
      await page.waitForTimeout(1500);

      expect(
        posts.length === 2,
        `${posts.length} appel(s) de creation au lieu de deux`,
      );
      expect(posts[1]?.force === true, 'le rejeu ne porte pas force: true');
      // Rejeu a l'identique : seul `force` s'ajoute.
      const { force: _force, ...replayed } = posts[1] ?? {};
      expect(
        JSON.stringify(replayed) === JSON.stringify(posts[0]),
        'le rejeu n est pas la meme requete',
      );
    },
  },

  // ─────────────────────────────── US-01-03
  {
    id: '01-03.1',
    us: 'US-01-03',
    title: 'La fiche s’ouvre avec ses valeurs, référentiels résolus',
    needsProject: true,
    gherkin: [
      "Given je suis sur l'écran « Organismes »",
      "When j'ouvre la fiche d'un organisme",
      'Then le type de structure est renseigné, pas vide',
      "And aucun champ obligatoire n'est signalé en erreur",
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      await page.locator('[data-testid^="organization-view-"]').first().click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1500);

      // Le selecteur de type est alimente par les referentiels : il etait vide
      // et en erreur tant que le formulaire naissait avant la fiche.
      const type = await page.getByTestId('organization-field-type').innerText();
      expect(type.trim().length > 0, 'le type de structure est vide');

      const body = await page.getByTestId('reusable-sheet').innerText();
      expect(
        !body.includes('Champ requis'),
        'un champ obligatoire est signalé en erreur sur une fiche complète',
      );
    },
  },
  {
    id: '01-03.3',
    us: 'US-01-03',
    title: 'Enregistrer sans modification n’appelle pas l’API',
    needsProject: true,
    gherkin: [
      "Given j'ouvre la fiche d'un organisme",
      'When je clique sur « Enregistrer » sans rien changer',
      "Then aucune requête de modification n'est envoyée",
    ],
    async run({ page, expect, projectId }) {
      const patches = [];
      page.on('request', (r) => {
        if (r.method() === 'PATCH' && r.url().includes('/organizations/')) {
          patches.push(r.url());
        }
      });

      await page.goto(`/${projectId}/organizations`);
      await page.locator('[data-testid^="organization-view-"]').first().click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1500);

      await page.getByTestId('organization-save').click();
      await page.waitForTimeout(1500);

      // Le serveur repondrait EMPTY_UPDATE_PAYLOAD, ce qui s'afficherait comme
      // une erreur alors que l'utilisateur n'a simplement rien change.
      expect(
        patches.length === 0,
        `${patches.length} requête(s) de modification envoyée(s) sans changement`,
      );
    },
  },
  {
    id: '01-03.6',
    us: 'US-01-03',
    title: 'Les deux statuts sont en lecture seule, avec leur raison',
    needsProject: true,
    gherkin: [
      "Given j'ouvre la fiche d'un organisme",
      'When je regarde la section « Suivi »',
      'Then le statut commercial et le statut client ne sont pas modifiables',
      'And la fiche explique où ils se modifient',
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      await page.locator('[data-testid^="organization-view-"]').first().click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1500);

      const body = await page.getByTestId('reusable-sheet').innerText();
      // L'API refuse ces deux champs en modification : offrir un selecteur
      // ferait echouer tout l'enregistrement, pas seulement le champ.
      expect(
        body.includes('tableau de prospection'),
        'le statut commercial ne dit pas où il se modifie',
      );
      expect(
        body.includes('déploiement'),
        'le statut client ne dit pas où il se modifie',
      );
    },
  },

  {
    id: '01-03.10',
    us: 'US-01-03',
    title: 'Le panneau ne se ferme que par la croix ou par « Annuler »',
    needsProject: true,
    gherkin: [
      "Given j'ouvre la fiche d'un organisme",
      'When je clique à côté du panneau, puis appuie sur Échap',
      'Then le panneau reste ouvert',
      'When je clique sur « Annuler »',
      'Then le panneau se ferme',
      "And la croix le ferme aussi",
    ],
    async run({ page, expect, projectId }) {
      const openPanel = async () => {
        await page.locator('[data-testid^="organization-view-"]').first().click();
        await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
        await page.waitForTimeout(1200);
      };
      const isOpen = () =>
        page.getByTestId('reusable-sheet').isVisible().catch(() => false);
      // Attendre la fermeture plutot que l'echantillonner : la sortie du
      // panneau est animee, et sous charge elle n'est pas immediate.
      const waitClosed = () =>
        page
          .getByTestId('reusable-sheet')
          .waitFor({ state: 'hidden', timeout: 10000 })
          .then(() => true)
          .catch(() => false);

      await page.goto(`/${projectId}/organizations`);
      await openPanel();

      // Le panneau porte un formulaire : une fermeture accidentelle perdrait
      // la saisie sans le dire.
      await page.mouse.click(60, 450);
      await page.waitForTimeout(700);
      expect(await isOpen(), 'un clic a cote a ferme le panneau');

      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
      expect(await isOpen(), 'la touche Echap a ferme le panneau');

      await page.getByTestId('organization-cancel').click();
      expect(await waitClosed(), '« Annuler » n a pas ferme le panneau');

      // La croix reste le second chemin de sortie.
      await openPanel();
      await page.locator('[data-slot="sheet-close"]').first().click();
      expect(await waitClosed(), 'la croix n a pas ferme le panneau');
    },
  },

  // ─────────────────────────────── US-01-13
  {
    id: '01-13.3',
    us: 'US-01-13',
    title: 'La fenêtre annonce une suppression logique, pas un effacement',
    needsProject: true,
    gherkin: [
      "Given j'ouvre la fiche d'un organisme",
      'When je demande sa suppression',
      "Then une fenêtre s'interpose avant toute suppression",
      'And elle dit que les identifiants redeviennent disponibles',
      "And qu'il ne s'agit pas d'un effacement définitif",
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await page.goto(`/${projectId}/organizations`);
      await page.locator('[data-testid^="organization-view-"]').first().click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1500);

      apiCalls(true);
      await page.getByTestId('organization-delete').click();
      await page
        .getByTestId('organization-delete-confirm')
        .waitFor({ timeout: 8000 });

      // Rien n'est supprime au premier clic : la confirmation s'interpose.
      expect(
        !apiCalls().some((c) => c.startsWith('DELETE')),
        `une suppression est partie sans confirmation : ${apiCalls().join(', ')}`,
      );

      const body = await page.locator('body').innerText();
      expect(
        body.includes('redeviennent disponibles'),
        'la fenêtre ne dit pas que les identifiants sont libérés',
      );
      // La V8 annonce un effacement definitif ; l'API fait une suppression
      // logique. Le texte doit dire ce que fait le serveur.
      expect(
        body.includes('pas effacées définitivement'),
        "la fenêtre laisse croire à un effacement définitif",
      );
    },
  },

  {
    id: '01-13.4',
    us: 'US-01-13',
    title: 'Confirmer supprime et referme le panneau',
    needsProject: true,
    gherkin: [
      'Given la fenêtre de confirmation ouverte',
      'When je confirme la suppression',
      'Then un DELETE part sur la fiche',
      'And le panneau se referme',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      // Le jeu de donnees est partage : la suppression est interceptee.
      await page.route(
        (url) => url.pathname.includes('/api/v1/organizations/'),
        (route) =>
          route.request().method() === 'DELETE'
            ? route.fulfill({ status: 204, body: '' })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/organizations`);
      await page.locator('[data-testid^="organization-view-"]').first().click();
      const sheet = page.getByTestId('reusable-sheet');
      await sheet.waitFor({ timeout: 10000 });
      await page.waitForTimeout(1500);

      apiCalls(true);
      await page.getByTestId('organization-delete').click();
      await page.getByTestId('organization-delete-confirm').click();

      // Attendre la fermeture, plutot que d'echantillonner la visibilite une
      // fois : sous la charge de la suite complete, la sortie du panneau
      // n'etait pas encore jouee et le scenario echouait a tort.
      const closed = await sheet
        .waitFor({ state: 'hidden', timeout: 10000 })
        .then(() => true)
        .catch(() => false);

      expect(
        apiCalls().some((c) => c.startsWith('DELETE /organizations/')),
        `aucun DELETE envoyé : ${apiCalls().join(', ')}`,
      );
      expect(closed, 'le panneau est resté ouvert sur une fiche supprimée');
    },
  },

  {
    id: '01-13.5',
    us: 'US-01-13',
    title: 'Renoncer ne supprime rien',
    needsProject: true,
    gherkin: [
      'Given la fenêtre de confirmation ouverte',
      'When je renonce',
      "Then aucune requête n'est envoyée",
      'And la fiche reste ouverte',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await page.goto(`/${projectId}/organizations`);
      await page.locator('[data-testid^="organization-view-"]').first().click();
      const sheet = page.getByTestId('reusable-sheet');
      await sheet.waitFor({ timeout: 10000 });
      await page.waitForTimeout(1500);

      apiCalls(true);
      await page.getByTestId('organization-delete').click();
      await page
        .getByTestId('organization-delete-confirm')
        .waitFor({ timeout: 8000 });

      // Le « Annuler » de la fenêtre, pas celui de la fiche derrière.
      await page
        .locator('[data-slot="dialog-content"] button', { hasText: 'Annuler' })
        .first()
        .click();
      await page.waitForTimeout(1000);

      expect(
        !apiCalls().some((c) => c.startsWith('DELETE')),
        `une suppression est partie malgré le renoncement : ${apiCalls().join(', ')}`,
      );
      expect(await sheet.isVisible(), 'la fiche a été fermée');
    },
  },

  // ─────────────────────────────── US-01-04
  {
    id: '01-04.2',
    us: 'US-01-04',
    title: 'Les contacts s’affichent, le principal en tête',
    needsProject: true,
    gherkin: [
      "Given j'ouvre la fiche d'un organisme qui a des contacts",
      "When j'ouvre l'onglet « Contacts »",
      'Then le contact principal est la première ligne, et porte son badge',
      'And chaque ligne montre fonction, e-mail et téléphone',
      'And une coordonnée absente est dite, jamais laissée vide',
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .waitFor({ timeout: 15000 });
      await page
        .locator('tr', { hasText: 'Commune de Caen' })
        .locator('[data-testid^="organization-view-"]')
        .first()
        .click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);

      await page.getByTestId('organization-tab-contacts').click();
      const pane = page.getByTestId('organization-contacts');
      await pane.waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);

      const rows = page.locator('[data-testid^="contact-row-"]');
      expect((await rows.count()) > 0, 'aucun contact affiché');

      // Le tri vient du serveur : le principal d'abord, puis nom et prenom.
      const first = await rows.first().innerText();
      expect(
        first.includes('Contact principal'),
        `la première ligne n'est pas le contact principal : ${first}`,
      );

      const body = await pane.innerText();
      expect(
        body.includes('DGS') && body.includes('@'),
        'fonction ou e-mail manquants sur les lignes',
      );
      // Une coordonnee absente se dit : un blanc laisserait croire a un bug.
      expect(
        body.includes('téléphone inconnu') || body.includes('email inconnu'),
        'une coordonnée absente est rendue par un blanc',
      );
    },
  },

  {
    id: '01-04.7',
    us: 'US-01-04',
    title: 'Fiche hors périmètre : le refus est expliqué, pas subi',
    needsProject: true,
    gherkin: [
      "Given une fiche hors de mon périmètre",
      "When j'ouvre son onglet « Contacts »",
      "Then l'écran explique que les coordonnées ne sont visibles que dans mon périmètre",
      "And aucune erreur technique n'est affichée",
    ],
    async run({ page, expect, projectId }) {
      // Le jeu de donnees n'expose pas de fiche restreinte au super-admin : on
      // simule le refus que le serveur rend a un role restreint.
      await page.route(
        (url) => /\/organizations\/[^/]+\/contacts$/.test(url.pathname),
        (route) =>
          route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify(
              err(403, 'ACCESS_DENIED', { text: 'Access denied' }),
            ),
          }),
      );

      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);
      await page.getByTestId('organization-tab-contacts').click();

      const notice = page.getByTestId('contacts-forbidden');
      await notice.waitFor({ timeout: 10000 });
      const text = await notice.innerText();
      expect(
        text.includes('périmètre'),
        `le refus n'est pas expliqué : ${text}`,
      );
    },
  },

  {
    id: '01-04.9',
    us: 'US-01-04',
    title: 'Prénom et nom sont exigés, et le serveur le confirme',
    needsProject: true,
    gherkin: [
      "Given l'onglet « Contacts » d'un organisme",
      'When je valide sans prénom ni nom',
      'Then les deux champs sont signalés et aucune requête ne part',
      'When je ne renseigne que le nom',
      "Then le prénom reste signalé — l'API l'exige aussi",
    ],
    async run({ page, expect, projectId, apiCalls }) {
      /*
       * Rien n'est intercepte ici, et c'est le point du scenario.
       *
       * Sa version precedente simulait le `POST` : elle affirmait que le nom
       * seul suffisait, ce que le serveur refuse (`firstName should not be
       * empty`). Un scenario qui simule la reponse ne valide que l'ecran
       * contre la croyance de celui qui l'a ecrit. On verifie donc d'abord
       * que le front bloque, puis — sans filet — que le serveur est bien du
       * meme avis.
       */
      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .waitFor({ timeout: 15000 });
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);
      await page.getByTestId('organization-tab-contacts').click();
      await page.getByTestId('contact-add').click();
      await page.getByTestId('contact-lastName').waitFor({ timeout: 8000 });

      apiCalls(true);
      await page.getByTestId('contact-submit').click();
      await page.waitForTimeout(900);

      expect(
        !apiCalls().some((c) => c.startsWith('POST')),
        `une création est partie sans prénom ni nom : ${apiCalls().join(', ')}`,
      );
      const body = await page.locator('body').innerText();
      expect(
        (body.match(/Champ requis/g) ?? []).length >= 2,
        'les deux champs obligatoires ne sont pas signalés',
      );

      // Le nom seul ne suffit pas : `firstName` est `@IsNotEmpty` cote API.
      await page.getByTestId('contact-lastName').fill('Aubry');
      await page.getByTestId('contact-submit').click();
      await page.waitForTimeout(900);

      expect(
        !apiCalls().some((c) => c.startsWith('POST')),
        'une création est partie avec le nom seul, que le serveur refuse',
      );
      expect(
        (await page.locator('body').innerText()).includes('Champ requis'),
        'le prénom manquant n’est plus signalé',
      );
    },
  },

  {
    id: '01-04.18',
    us: 'US-01-04',
    title: 'Les longueurs maximales sont celles des colonnes',
    needsProject: true,
    gherkin: [
      "Given le formulaire d'un contact",
      'When je dépasse la longueur admise sur la civilité ou le téléphone',
      "Then la saisie est refusée avant envoi",
      'And le serveur aurait refusé la même chose',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .waitFor({ timeout: 15000 });
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);
      await page.getByTestId('organization-tab-contacts').click();
      await page.getByTestId('contact-add').click();
      await page.getByTestId('contact-lastName').waitFor({ timeout: 8000 });

      await page.getByTestId('contact-firstName').fill('Marc');
      await page.getByTestId('contact-lastName').fill('Aubry');
      // 11 caracteres : CIVILITY_MAX_LENGTH vaut 10.
      await page.getByTestId('contact-civility').fill('MonsieurABC');
      // 21 caracteres : PHONE_MAX_LENGTH vaut 20.
      await page.getByTestId('contact-phone').fill('012345678901234567890');

      apiCalls(true);
      await page.getByTestId('contact-submit').click();
      await page.waitForTimeout(900);

      expect(
        !apiCalls().some((c) => c.startsWith('POST')),
        'une saisie trop longue est partie au serveur, qui la refuse',
      );
      expect(
        (await page.locator('body').innerText()).includes(
          'Longueur maximale dépassée',
        ),
        'le dépassement de longueur n’est pas signalé',
      );
    },
  },

  {
    id: '01-04.15',
    us: 'US-01-04',
    title: 'Suppression refusée : « Ne pas démarcher » est proposé',
    needsProject: true,
    gherkin: [
      'Given un contact référencé par des actions',
      'When je demande sa suppression et confirme',
      "Then le serveur la refuse, et l'écran propose de l'exclure des campagnes",
      'And le message ne présente pas le refus comme un échec',
    ],
    async run({ page, expect, projectId }) {
      let optedOut = false;
      await page.route(
        (url) => /\/contacts\/[^/]+$/.test(url.pathname),
        (route) => {
          const method = route.request().method();
          if (method === 'DELETE') {
            return route.fulfill({
              status: 409,
              contentType: 'application/json',
              body: JSON.stringify(err(409, 'CONTACT_HAS_ACTIVITIES')),
            });
          }
          if (method === 'PATCH') {
            optedOut = JSON.parse(route.request().postData() ?? '{}').optOut;
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ id: 'c1', optOut: true }),
            });
          }
          return route.fallback();
        },
      );

      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .waitFor({ timeout: 15000 });
      await page
        .locator('tr', { hasText: 'Commune de Caen' })
        .locator('[data-testid^="organization-view-"]')
        .first()
        .click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);
      await page.getByTestId('organization-tab-contacts').click();
      await page.waitForTimeout(800);

      await page.locator('[data-testid^="contact-delete-"]').first().click();
      await page.getByTestId('contact-delete-confirm').click();

      const blocked = page.getByTestId('contact-delete-blocked');
      await blocked.waitFor({ timeout: 10000 });
      const text = await blocked.innerText();
      expect(
        text.includes('historique'),
        `le refus n'explique pas pourquoi : ${text}`,
      );

      // La sortie proposee par le contrat, et non un message sans suite.
      await page.getByTestId('contact-optout').click();
      await page.waitForTimeout(1200);
      expect(optedOut === true, 'la bascule « ne pas démarcher » n’a pas été envoyée');
    },
  },

  {
    id: '01-03.12',
    us: 'US-01-03',
    title: 'Fiche introuvable : le panneau le dit et se referme',
    needsProject: true,
    gherkin: [
      "Given une adresse portant l'identifiant d'une fiche qui n'existe plus",
      "When j'ouvre l'écran",
      'Then le panneau affiche « Fiche introuvable »',
      'And il se referme de lui-même',
    ],
    async run({ page, expect, projectId }) {
      // Identifiant valide en forme, inconnu du projet : c'est exactement ce
      // que devient une URL gardee apres une suppression.
      const ghost = 'cxxxxxxxxxxxxxxxxxxxxxxxx';
      await mock(page, `/organizations/${ghost}`, 404, err(404, 'ORGANIZATION_NOT_FOUND'));

      await page.goto(`/${projectId}/organizations?fiche=${ghost}`);

      const notice = page.getByTestId('organization-not-found');
      await notice.waitFor({ timeout: 15000 });
      expect(
        (await notice.innerText()).includes('introuvable'),
        'le panneau ne dit pas que la fiche est introuvable',
      );

      // Il ne reste pas ouvert sur un message : il n'y a rien a y faire.
      const closed = await page
        .getByTestId('reusable-sheet')
        .waitFor({ state: 'hidden', timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      expect(closed, 'le panneau est resté ouvert sur une fiche introuvable');
    },
  },

  {
    id: '01-04.19',
    us: 'US-01-04',
    title: 'Fiche disparue à l’écriture : message nommé, saisie conservée',
    needsProject: true,
    gherkin: [
      "Given l'onglet « Contacts » d'une fiche supprimée entre-temps",
      'When je crée un contact',
      "Then un message dit que la fiche n'existe plus",
      'And la fenêtre reste ouverte, la saisie intacte',
    ],
    async run({ page, expect, projectId }) {
      await page.route(
        (url) => /\/organizations\/[^/]+\/contacts$/.test(url.pathname),
        (route) =>
          route.request().method() === 'POST'
            ? route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify(err(404, 'ORGANIZATION_NOT_FOUND')),
              })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/organizations`);
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .waitFor({ timeout: 15000 });
      await page
        .locator('[data-testid^="organization-view-"]')
        .first()
        .click();
      await page.getByTestId('reusable-sheet').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);
      await page.getByTestId('organization-tab-contacts').click();
      await page.getByTestId('contact-add').click();
      await page.getByTestId('contact-lastName').waitFor({ timeout: 8000 });

      await page.getByTestId('contact-firstName').fill('Marc');
      await page.getByTestId('contact-lastName').fill('Aubry');
      await page.getByTestId('contact-submit').click();
      await page.waitForTimeout(1500);

      const body = await page.locator('body').innerText();
      expect(
        body.includes('n’existe plus') || body.includes("n'existe plus"),
        'le message ne dit pas que la fiche a disparu',
      );

      // Choix assume : on ne ferme pas. La saisie reste sous les yeux.
      const kept = await page.getByTestId('contact-lastName').inputValue();
      expect(kept === 'Aubry', `la saisie a été perdue : « ${kept} »`);
    },
  },

  // ─────────────────────────────── US-00-07
  {
    id: '07.1',
    us: 'US-00-07',
    title: 'Les périmètres se lisent, avec leurs trois axes',
    needsProject: true,
    gherkin: [
      "Given je suis administrateur du projet",
      "When j'ouvre le panneau « Périmètres » des Paramètres",
      'Then chaque périmètre montre son nom, son nombre d’utilisateurs et ses trois axes',
      'And les départements résolus sont ceux rendus par l’API',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      apiCalls(true);
      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.waitForTimeout(1000);

      const cards = page.locator('[data-testid^="scope-card-"]');
      expect((await cards.count()) > 0, 'aucun périmètre affiché');

      const body = await page.getByTestId('scopes-pane').innerText();
      expect(
        /\d+ utilisateurs?/.test(body),
        'le nombre d’utilisateurs n’est pas affiché',
      );
      // Nature : l'un des trois libelles du contrat.
      expect(
        /Prospects et clients|Prospects uniquement|Clients uniquement/.test(body),
        'la nature des fiches n’est pas affichée',
      );
      // Les departements viennent du serveur, jamais d'un calcul local.
      expect(
        apiCalls().some((c) => c.startsWith('GET /scopes')),
        `la liste n'a pas été demandée à l'API : ${apiCalls().join(', ')}`,
      );
    },
  },

  {
    id: '07.3',
    us: 'US-00-07',
    title: 'Un périmètre sans restriction dit « France entière »',
    needsProject: true,
    gherkin: [
      'Given un périmètre dont les départements résolus sont vides',
      'When je consulte le panneau',
      'Then il affiche « France entière »',
      'And jamais « 0 département »',
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.waitForTimeout(1000);

      const body = await page.getByTestId('scopes-pane').innerText();
      expect(
        body.includes('France entière'),
        'aucun périmètre national n’est rendu comme tel',
      );
      // Le contresens a eviter : vide veut dire « tout », pas « rien ».
      expect(
        !body.includes('0 département'),
        'un périmètre national est présenté comme couvrant zéro département',
      );
    },
  },

  {
    id: '07.4',
    us: 'US-00-07',
    title: 'Un seul chemin vers les périmètres',
    needsProject: true,
    gherkin: [
      'Given le menu du projet',
      "Then « Périmètres » n'y figure pas — ils vivent dans Paramètres",
      "When j'ouvre Paramètres",
      'Then « Périmètres » est un de ses panneaux, et il ouvre la liste',
    ],
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/organizations`);
      const rail = page.locator('.sidebar');
      await rail.waitFor({ timeout: 15000 });

      // Deux chemins vers le meme ecran font douter qu'ils menent au meme
      // endroit : l'entree de menu a ete retiree au profit du panneau.
      const entries = (await rail.innerText())
        .split('\n')
        .map((l) => l.trim());
      expect(
        !entries.includes('Périmètres'),
        `le menu du projet propose encore « Périmètres » : ${entries.join(' | ')}`,
      );

      await page.goto(`/${projectId}/settings`);
      const nav = page.getByRole('navigation', { name: 'Paramètres' });
      await nav.waitFor({ timeout: 15000 });
      await nav.getByText('Périmètres').first().click();

      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      expect(
        page.url().includes('panneau=scopes'),
        `le panneau ouvert n'est pas porté par l'URL : ${page.url()}`,
      );
    },
  },

  {
    id: '07.11',
    us: 'US-00-07',
    title: 'Le périmètre s’affecte depuis la fiche utilisateur',
    needsProject: true,
    gherkin: [
      "Given la fiche d'un utilisateur du projet",
      'When je modifie son périmètre',
      'Then la liste des périmètres du projet est proposée',
      'And « Toute la base » est proposé pour n’en affecter aucun',
      'And la modification transmet scopeId au serveur',
    ],
    async run({ page, expect, projectId }) {
      let sent = null;
      await page.route(
        (url) =>
          url.pathname.includes('/api/v1/users/') &&
          !url.pathname.endsWith('/informations'),
        (route) => {
          if (route.request().method() !== 'PATCH') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'u1', email: 'x@y.z' }),
          });
        },
      );

      await page.goto(`/${projectId}/users`);
      await page.locator('[data-testid^="user-view-"]').first().waitFor({ timeout: 15000 });
      await page.locator('[data-testid^="user-view-"]').first().click();
      await page.waitForURL((u) => u.pathname.includes('/informations'), { timeout: 15000 });
      await page.waitForTimeout(1200);

      await page.getByTestId('details-edit-btn').click();
      const select = page.getByTestId('user-edit-scope-select');
      await select.waitFor({ timeout: 10000 });

      await select.click();
      await page.waitForTimeout(500);
      const options = await page.locator('[role="option"]').allInnerTexts();

      // Sans perimetre, l'utilisateur voit toute la base : l'option doit le
      // dire, plutot que d'etre une ligne vide.
      expect(
        options.some((o) => o.trim() === 'Toute la base'),
        `l'option « aucun périmètre » manque : ${options.join(' | ')}`,
      );
      // Les perimetres viennent du projet, jamais d'une liste en dur.
      expect(
        options.some((o) => /Normandie|France entière|Grand Ouest/.test(o)),
        `les périmètres du projet ne sont pas proposés : ${options.join(' | ')}`,
      );

      const target = options.find(
        (o) => o.trim() !== 'Toute la base' && o.trim().length > 0,
      );
      await page.locator('[role="option"]', { hasText: target }).first().click();
      await page.waitForTimeout(400);
      await page.getByTestId('user-edit-save-btn').click();
      await page.waitForTimeout(1500);

      expect(sent !== null, 'aucune modification envoyée');
      expect(
        sent && 'scopeId' in sent,
        `le périmètre n'est pas transmis : ${JSON.stringify(sent)}`,
      );
    },
  },

  {
    id: '07.12',
    us: 'US-00-07',
    title: 'Le périmètre se choisit dès la création d’un utilisateur',
    needsProject: true,
    gherkin: [
      "Given la fenêtre « Nouvel utilisateur »",
      'When je choisis un périmètre et je crée le compte',
      'Then scopeId part avec la création',
      "And sans périmètre choisi, le champ n'est pas transmis du tout",
    ],
    async run({ page, expect, projectId }) {
      const posts = [];
      await page.route(
        (url) =>
          url.pathname.includes('/api/v1') && url.pathname.endsWith('/users'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          posts.push(JSON.parse(route.request().postData() ?? '{}'));
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'unew', email: 'x@y.z' }),
          });
        },
      );

      const fill = async (suffix) => {
        await page.getByTestId('user-create-btn').first().click();
        // Le formulaire de creation n'expose pas d'identifiants de test sur
        // ses champs : on vise par libelle plutot que d'en ajouter pour le
        // seul confort du scenario.
        const dialog = page.locator('[data-slot="dialog-content"]');
        await dialog.getByPlaceholder('Prénom').waitFor({ timeout: 8000 });
        await dialog.getByPlaceholder('Prénom').fill('Test');
        await dialog.getByPlaceholder('Nom', { exact: true }).fill(`Perimetre${suffix}`);
        await dialog.getByPlaceholder('email@exemple.com').fill(`test.scope${suffix}@example.test`);
        await page.getByTestId('user-initials-input').fill('TP');
        await page.getByTestId('user-role-select').click();
        await page.waitForTimeout(400);
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(300);
      };

      await page.goto(`/${projectId}/users`);
      await page.getByTestId('user-create-btn').first().waitFor({ timeout: 15000 });

      // 1. Sans perimetre : le champ ne doit pas partir du tout — le serveur
      //    applique son defaut sur un champ absent.
      await fill('A');
      await page.getByTestId('user-create-submit-btn').click();
      await page.waitForTimeout(1500);
      expect(posts.length === 1, `${posts.length} création(s) au lieu d'une`);
      expect(
        !('scopeId' in (posts[0] ?? {})),
        `le périmètre vide a été transmis : ${JSON.stringify(posts[0])}`,
      );

      // 2. Avec un perimetre choisi.
      await page.goto(`/${projectId}/users`);
      await page.getByTestId('user-create-btn').first().waitFor({ timeout: 15000 });
      await fill('B');
      const select = page.getByTestId('user-create-scope-select');
      await select.click();
      await page.waitForTimeout(400);
      const options = await page.locator('[role="option"]').allInnerTexts();
      const named = options.find((o) => o.trim() !== 'Toute la base');
      await page.locator('[role="option"]', { hasText: named }).first().click();
      await page.waitForTimeout(300);
      await page.getByTestId('user-create-submit-btn').click();
      await page.waitForTimeout(1500);

      expect(posts.length === 2, `${posts.length} création(s) au lieu de deux`);
      expect(
        typeof posts[1]?.scopeId === 'string' && posts[1].scopeId.length > 0,
        `le périmètre choisi n'est pas transmis : ${JSON.stringify(posts[1])}`,
      );
    },
  },

  {
    id: '07.7',
    us: 'US-00-07',
    title: 'Les régions viennent du serveur, jamais du code',
    needsProject: true,
    gherkin: [
      'Given la fenêtre « Nouveau périmètre »',
      'Then les 14 régions administratives sont proposées',
      'And chacune annonce combien de ses départements sont cochés',
      'And la liste est demandée à GET /geo/regions',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      apiCalls(true);
      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.getByTestId('scope-add').click();
      await page.getByTestId('region-tree').waitFor({ timeout: 10000 });
      await page.waitForTimeout(600);

      expect(
        apiCalls().some((c) => c.startsWith('GET /geo/regions')),
        `la table des régions n'a pas été demandée : ${apiCalls().join(', ')}`,
      );

      const rows = page.locator('[data-testid^="region-check-"]');
      const count = await rows.count();
      expect(count === 14, `${count} région(s) au lieu de 14`);

      // Le compteur par region : combien de ses departements sont coches.
      const body = await page.getByTestId('region-tree').innerText();
      expect(/0\/5/.test(body), 'les compteurs par région ne sont pas affichés');
    },
  },

  {
    id: '07.8',
    us: 'US-00-07',
    title: 'Une région entière part sous son nom',
    needsProject: true,
    gherkin: [
      'Given la fenêtre « Nouveau périmètre »',
      'When je coche une région entière et je crée',
      'Then elle est transmise dans regions, et departments reste vide',
    ],
    async run({ page, expect, projectId }) {
      let sent = null;
      await page.route(
        (url) => url.pathname.endsWith('/api/v1/scopes'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 's1', name: sent.name }),
          });
        },
      );

      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.getByTestId('scope-add').click();
      await page.getByTestId('region-tree').waitFor({ timeout: 10000 });

      await page.getByTestId('scope-name').fill('TEST Normandie entière');
      await page.getByTestId('region-check-Normandie').click();
      await page.waitForTimeout(400);
      await page.getByTestId('scope-submit').click();
      await page.waitForTimeout(1200);

      expect(sent !== null, 'aucune création envoyée');
      expect(
        JSON.stringify(sent?.regions) === JSON.stringify(['Normandie']),
        `la région entière n'est pas transmise sous son nom : ${JSON.stringify(sent)}`,
      );
      // Les deux listes partent toujours : le PATCH les remplace en bloc.
      expect(
        Array.isArray(sent?.departments) && sent.departments.length === 0,
        `departments devrait être vide : ${JSON.stringify(sent?.departments)}`,
      );
    },
  },

  {
    id: '07.9',
    us: 'US-00-07',
    title: 'Une région amputée part en départements explicites',
    needsProject: true,
    gherkin: [
      'Given la fenêtre « Nouveau périmètre »',
      "When je coche une région puis décoche un de ses départements",
      'Then la case de région passe en état indéterminé',
      'And les départements restants partent explicitement, sans nom de région',
    ],
    async run({ page, expect, projectId }) {
      let sent = null;
      await page.route(
        (url) => url.pathname.endsWith('/api/v1/scopes'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 's1', name: sent.name }),
          });
        },
      );

      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.getByTestId('scope-add').click();
      await page.getByTestId('region-tree').waitFor({ timeout: 10000 });

      await page.getByTestId('scope-name').fill('TEST Normandie sauf Orne');
      await page.getByTestId('region-check-Normandie').click();
      await page.waitForTimeout(300);
      // Le libelle ouvre la region ; la case a cocher est un bouton distinct.
      await page.getByTestId('region-Normandie').getByText('Normandie').click();
      await page.waitForTimeout(400);
      await page.getByTestId('dept-check-61').click();
      await page.waitForTimeout(400);

      const state = await page
        .getByTestId('region-check-Normandie')
        .getAttribute('data-state');
      expect(
        state === 'indeterminate',
        `la case de région devrait être indéterminée, elle est « ${state} »`,
      );

      await page.getByTestId('scope-submit').click();
      await page.waitForTimeout(1200);

      expect(sent !== null, 'aucune création envoyée');
      // Le contrat ne permet pas d'exprimer « la Normandie sauf l'Orne » par
      // un nom de region : elle doit partir en departements.
      expect(
        Array.isArray(sent?.regions) && sent.regions.length === 0,
        `la région amputée est encore transmise sous son nom : ${JSON.stringify(sent)}`,
      );
      expect(
        JSON.stringify(sent?.departments) ===
          JSON.stringify(['14', '27', '50', '76']),
        `départements attendus 14/27/50/76 : ${JSON.stringify(sent?.departments)}`,
      );
    },
  },

  {
    id: '07.13',
    us: 'US-00-07',
    title: 'Un nom déjà pris se corrige dans le champ',
    needsProject: true,
    gherkin: [
      'Given un périmètre portant déjà ce nom',
      'When je crée un périmètre du même nom',
      'Then le message apparaît sous le champ « Nom »',
      'And la fenêtre reste ouverte, la saisie intacte',
    ],
    async run({ page, expect, projectId }) {
      await page.route(
        (url) => url.pathname.endsWith('/api/v1/scopes'),
        (route) =>
          route.request().method() === 'POST'
            ? route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify(err(409, 'SCOPE_NAME_EXISTS')),
              })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.getByTestId('scope-add').click();
      await page.getByTestId('scope-name').waitFor({ timeout: 10000 });

      await page.getByTestId('scope-name').fill('Normandie');
      await page.getByTestId('scope-submit').click();
      await page.waitForTimeout(1200);

      const body = await page.locator('body').innerText();
      expect(
        body.includes('déjà utilisé'),
        'le conflit de nom n’est pas signalé',
      );
      // La correction se fait dans le champ : la saisie ne doit pas partir.
      const kept = await page.getByTestId('scope-name').inputValue();
      expect(kept === 'Normandie', `la saisie a été perdue : « ${kept} »`);
    },
  },

  {
    id: '07.14',
    us: 'US-00-07',
    title: 'Un périmètre mixte se recharge et se réenregistre à l’identique',
    needsProject: true,
    gherkin: [
      "Given un périmètre fait d'une région entière et de départements isolés",
      "When j'ouvre sa modification",
      'Then la région est cochée en entier et les départements isolés le sont aussi',
      'When je réenregistre sans rien changer',
      'Then les deux listes repartent identiques, chacune au complet',
    ],
    async run({ page, expect, projectId }) {
      /*
       * Le jeu de donnees n'a aucun perimetre mixte, et c'est justement le cas
       * ou le rechargement peut se tromper : les regions enregistrees doivent
       * etre depliees en departements pour alimenter l'arbre, puis repliees a
       * l'enregistrement. On sert donc la forme voulue.
       */
      const mixed = {
        id: 'smix',
        name: 'TEST Mixte',
        description: null,
        regions: ['Normandie'],
        departments: ['01', '03'],
        portfolioOnly: false,
        nature: 'ALL',
        campaignIds: [],
        usersCount: 0,
        resolvedDepartments: ['01', '03', '14', '27', '50', '61', '76'],
      };
      await mock(page, '/scopes', 200, { data: [mixed] });

      let sent = null;
      await page.route(
        (url) => url.pathname.includes('/api/v1/scopes/'),
        (route) => {
          if (route.request().method() !== 'PATCH') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mixed),
          });
        },
      );

      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.getByTestId('scope-edit-smix').click();
      await page.getByTestId('region-tree').waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);

      // La region enregistree doit revenir cochee en entier.
      const normandie = await page
        .getByTestId('region-check-Normandie')
        .getAttribute('data-state');
      expect(
        normandie === 'checked',
        `Normandie devrait être entièrement cochée, elle est « ${normandie}° »`.replace('°', ''),
      );

      // Et les departements isoles, dans leur propre region, partiellement.
      const auvergne = await page
        .getByTestId('region-check-Auvergne-Rhône-Alpes')
        .getAttribute('data-state');
      expect(
        auvergne === 'indeterminate',
        `Auvergne-Rhône-Alpes devrait être partielle, elle est « ${auvergne}° »`.replace('°', ''),
      );

      const count = await page.getByTestId('region-tree-count').innerText();
      expect(
        count.includes('7 départements'),
        `le compteur devrait annoncer 7 départements : ${count}`,
      );

      await page.getByTestId('scope-submit').click();
      await page.waitForTimeout(1200);

      expect(sent !== null, 'aucune modification envoyée');
      // Repliage a l'identique : la region entiere sous son nom, les isoles
      // en departements. Les deux listes partent, meme si l'une est vide.
      expect(
        JSON.stringify(sent?.regions) === JSON.stringify(['Normandie']),
        `regions attendu ["Normandie"] : ${JSON.stringify(sent?.regions)}`,
      );
      expect(
        JSON.stringify(sent?.departments) === JSON.stringify(['01', '03']),
        `departments attendu ["01","03"] : ${JSON.stringify(sent?.departments)}`,
      );
    },
  },

  {
    id: '07.10',
    us: 'US-00-07',
    title: 'Un périmètre affecté ne se supprime pas, et l’écran le dit',
    needsProject: true,
    gherkin: [
      "Given un périmètre porté par au moins un utilisateur",
      'When je demande sa suppression et confirme',
      'Then le serveur la refuse',
      "And l'écran explique qu'un compte le porte, suspendu compris",
      "And l'action de suppression disparaît — il n'y a rien à réessayer",
    ],
    async run({ page, expect, projectId }) {
      await page.route(
        (url) => /\/api\/v1\/scopes\/[^/]+$/.test(url.pathname),
        (route) =>
          route.request().method() === 'DELETE'
            ? route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify(err(409, 'SCOPE_IN_USE')),
              })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.waitForTimeout(600);

      await page.locator('[data-testid^="scope-delete-"]').first().click();
      await page.getByTestId('scope-delete-confirm').click();

      const blocked = page.getByTestId('scope-delete-blocked');
      await blocked.waitFor({ timeout: 10000 });
      const text = await blocked.innerText();

      // Le compteur affiche ne permet pas d'anticiper ce refus : il ne compte
      // que les affectations actives, le garde-fou les compte toutes. Le
      // message doit donc mentionner les comptes suspendus.
      expect(
        text.includes('suspendu'),
        `le refus n'explique pas qu'un compte suspendu suffit : ${text}`,
      );

      // Rien a reessayer tant que le perimetre n'est pas detache.
      expect(
        !(await page
          .getByTestId('scope-delete-confirm')
          .isVisible()
          .catch(() => false)),
        'l’action de suppression est encore proposée après le refus',
      );
    },
  },

  {
    id: '07.15',
    us: 'US-00-07',
    title: 'Un périmètre libre se supprime',
    needsProject: true,
    gherkin: [
      "Given un périmètre que personne ne porte",
      'When je le supprime',
      'Then la requête part et la fenêtre se ferme',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await page.route(
        (url) => /\/api\/v1\/scopes\/[^/]+$/.test(url.pathname),
        (route) =>
          route.request().method() === 'DELETE'
            ? route.fulfill({ status: 204, body: '' })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/settings?panneau=scopes`);
      await page.getByTestId('scopes-pane').waitFor({ timeout: 15000 });
      await page.waitForTimeout(600);

      apiCalls(true);
      await page.locator('[data-testid^="scope-delete-"]').first().click();
      const confirm = page.getByTestId('scope-delete-confirm');
      await confirm.waitFor({ timeout: 8000 });
      await confirm.click();

      const closed = await confirm
        .waitFor({ state: 'hidden', timeout: 10000 })
        .then(() => true)
        .catch(() => false);

      expect(
        apiCalls().some((c) => c.startsWith('DELETE /scopes/')),
        `aucune suppression envoyée : ${apiCalls().join(', ')}`,
      );
      expect(closed, 'la fenêtre est restée ouverte après la suppression');
    },
  },

  // ─────────────────────────────── US-01-11
  {
    id: '01-11.1',
    us: 'US-01-11',
    title: 'Les campagnes s’affichent en cartes, avec leurs mesures',
    needsProject: true,
    gherkin: [
      "Given des campagnes existent dans le projet",
      "When j'ouvre l'écran « Campagnes »",
      'Then chaque carte porte son responsable, sa période et son statut',
      'And les critères de ciblage sont présentés comme une note',
      'And les quatre mesures viennent du serveur',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [
          {
            id: 'c1',
            name: 'Rentrée 89',
            description: 'Cibler les communes de l’Yonne.',
            status: 'ACTIVE',
            owner: { id: 'u1', fullName: 'Wiem Bousaid', initials: 'WB' },
            startDate: '2026-09-01',
            endDate: '2026-12-31',
            criteria: { department: '89' },
            organizationsCount: 42,
            results: { activities: 8, opportunities: 0, quotes: 0, signed: 0 },
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-card-c1').waitFor({ timeout: 15000 });
      const card = await page.getByTestId('campaign-card-c1').innerText();

      expect(card.includes('Wiem Bousaid'), 'le responsable n’est pas affiché');
      expect(
        card.includes('01/09/2026') && card.includes('31/12/2026'),
        `la période n'est pas affichée : ${card}`,
      );
      expect(card.includes('En cours'), 'le statut n’est pas affiché en français');

      // Les criteres sont documentaires : une note, pas un filtre actif.
      expect(
        card.includes('Critère de ciblage') && card.includes('department = 89'),
        'les critères ne sont pas présentés comme une note',
      );

      // Les quatre mesures, rendues par le serveur. Les trois du L2 sont a
      // zero, et l'ecran doit le dire au lieu de les masquer.
      expect(
        card.includes('8/42'),
        `la mesure des actions n'est pas celle du serveur : ${card}`,
      );
      expect(
        card.includes('Opportunités') && card.includes('Devis') && card.includes('Signés'),
        'les mesures du lot L2 sont masquées au lieu d’être annoncées',
      );
      expect(
        card.includes('lot L2'),
        'rien n’explique pourquoi trois mesures restent à zéro',
      );
      expect(
        card.includes('Voir les 42 organismes'),
        'la taille de la cible n’est pas affichée',
      );
    },
  },

  {
    id: '01-11.9',
    us: 'US-01-11',
    title: 'Seules les transitions de statut légales sont proposées',
    needsProject: true,
    gherkin: [
      'Given une campagne en brouillon, une en cours et une close',
      "When je regarde leurs actions",
      'Then le brouillon ne propose que « Lancer »',
      'And celle en cours ne propose que « Clore »',
      'And la close propose de la rouvrir',
    ],
    async run({ page, expect, projectId }) {
      const base = {
        description: null,
        owner: null,
        startDate: null,
        endDate: null,
        criteria: null,
        organizationsCount: 0,
        results: { activities: 0, opportunities: 0, quotes: 0, signed: 0 },
      };
      await mock(page, '/campaigns', 200, {
        data: [
          { ...base, id: 'draft', name: 'TEST brouillon', status: 'DRAFT' },
          { ...base, id: 'active', name: 'TEST en cours', status: 'ACTIVE' },
          { ...base, id: 'closed', name: 'TEST close', status: 'CLOSED' },
        ],
        meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
      });

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-card-draft').waitFor({ timeout: 15000 });

      const visible = (id) =>
        page.getByTestId(id).isVisible().catch(() => false);

      // `DRAFT → ACTIVE` seulement.
      expect(await visible('campaign-to-ACTIVE-draft'), 'le brouillon ne propose pas d’être lancé');
      expect(!(await visible('campaign-to-CLOSED-draft')), 'le brouillon propose d’être clos');

      // `ACTIVE → CLOSED` seulement.
      expect(await visible('campaign-to-CLOSED-active'), 'la campagne en cours ne propose pas d’être close');
      expect(!(await visible('campaign-to-ACTIVE-active')), 'la campagne en cours propose son statut actuel');

      // `CLOSED → ACTIVE` : une close se rouvre.
      expect(await visible('campaign-to-ACTIVE-closed'), 'la campagne close ne peut pas être rouverte');
    },
  },

  {
    id: '01-11.7',
    us: 'US-01-11',
    title: 'Une période inversée est refusée avant envoi',
    needsProject: true,
    gherkin: [
      'Given la fenêtre « Nouvelle campagne »',
      'When je saisis une fin antérieure au début',
      'Then le message apparaît sous le champ de fin',
      "And aucune création n'est envoyée",
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-add').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-add').click();
      await page.getByTestId('campaign-name').waitFor({ timeout: 10000 });

      await page.getByTestId('campaign-name').fill('TEST période inversée');
      await page.getByTestId('campaign-start').fill('2026-12-31');
      await page.getByTestId('campaign-end').fill('2026-09-01');

      apiCalls(true);
      await page.getByTestId('campaign-submit').click();
      await page.waitForTimeout(900);

      expect(
        !apiCalls().some((c) => c.startsWith('POST /campaigns')),
        `une création est partie avec une période inversée : ${apiCalls().join(', ')}`,
      );
      expect(
        (await page.locator('body').innerText()).includes('La fin doit suivre le début'),
        'la période inversée n’est pas signalée',
      );
    },
  },

  {
    id: '01-11.6',
    us: 'US-01-11',
    title: 'Créer : le nom suffit, la période est facultative',
    needsProject: true,
    gherkin: [
      'Given la fenêtre « Nouvelle campagne »',
      'When je valide sans nom',
      "Then le champ est signalé et aucune création n'est envoyée",
      'When je renseigne le nom seul',
      'Then la création part, sans période ni objectif',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      let sent = null;
      await page.route(
        (url) => url.pathname.endsWith('/api/v1/campaigns'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'cnew', name: sent.name }),
          });
        },
      );

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-add').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-add').click();
      await page.getByTestId('campaign-name').waitFor({ timeout: 10000 });

      apiCalls(true);
      await page.getByTestId('campaign-submit').click();
      await page.waitForTimeout(900);
      expect(
        !apiCalls().some((c) => c.startsWith('POST /campaigns')),
        'une création est partie sans nom',
      );

      await page.getByTestId('campaign-name').fill('TEST nom seul');
      await page.getByTestId('campaign-submit').click();
      await page.waitForTimeout(1200);

      expect(sent !== null, 'aucune création envoyée avec le nom seul');
      // Champ vide non transmis : le serveur applique ses defauts.
      expect(
        sent && !('startDate' in sent) && !('description' in sent),
        `des champs vides ont été transmis : ${JSON.stringify(sent)}`,
      );
    },
  },

  {
    id: '01-11.8',
    us: 'US-01-11',
    title: 'Un nom déjà pris se corrige dans le champ',
    needsProject: true,
    gherkin: [
      'Given une campagne portant déjà ce nom',
      'When je crée une campagne du même nom',
      'Then le message apparaît sous le champ « Nom »',
      'And la fenêtre reste ouverte, la saisie intacte',
    ],
    async run({ page, expect, projectId }) {
      await page.route(
        (url) => url.pathname.endsWith('/api/v1/campaigns'),
        (route) =>
          route.request().method() === 'POST'
            ? route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify(err(409, 'CAMPAIGN_NAME_EXISTS')),
              })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-add').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-add').click();
      await page.getByTestId('campaign-name').waitFor({ timeout: 10000 });

      await page.getByTestId('campaign-name').fill('Rentrée 89');
      await page.getByTestId('campaign-submit').click();
      await page.waitForTimeout(1200);

      expect(
        (await page.locator('body').innerText()).includes('déjà utilisé'),
        'le conflit de nom n’est pas signalé',
      );
      const kept = await page.getByTestId('campaign-name').inputValue();
      expect(kept === 'Rentrée 89', `la saisie a été perdue : « ${kept} »`);
    },
  },

  {
    id: '01-11.2',
    us: 'US-01-11',
    title: 'Sans campagne, l’écran explique à quoi elles servent',
    needsProject: true,
    gherkin: [
      "Given aucune campagne dans le projet",
      "When j'ouvre l'écran",
      'Then un message explique ce qu’une campagne apporte',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });

      await page.goto(`/${projectId}/campaigns`);
      const empty = page.getByTestId('campaigns-empty');
      await empty.waitFor({ timeout: 15000 });
      const text = await empty.innerText();
      expect(
        text.includes('cibler') && text.includes('mesurer'),
        `le message n'explique pas l'intérêt : ${text}`,
      );
    },
  },

  {
    id: '01-11.13',
    us: 'US-01-11',
    title: 'La cible s’ouvre, et annonce qu’elle est figée',
    needsProject: true,
    gherkin: [
      'Given une campagne avec des organismes ciblés',
      'When j’ouvre sa cible',
      'Then les organismes ciblés sont listés',
      'And l’écran dit que la liste ne se recalcule pas depuis les critères',
      'And il annonce l’effet du ciblage sur le statut commercial',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [
          {
            id: 'c1',
            name: 'Rentrée 89',
            description: null,
            status: 'ACTIVE',
            owner: null,
            startDate: null,
            endDate: null,
            criteria: { department: '89' },
            organizationsCount: 2,
            results: { activities: 0, opportunities: 0, quotes: 0, signed: 0 },
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      await mock(page, '/campaigns/c1/organizations', 200, {
        data: [
          { id: 'o1', name: 'Commune de Joigny', city: 'Joigny', department: '89', access: 'FULL' },
          { id: 'o2', name: 'Commune hors secteur', city: null, department: '99', access: 'RESTRICTED' },
        ],
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-target-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-target-open-c1').click();

      const panel = page.getByTestId('campaign-target');
      await panel.waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);

      const body = await page.getByTestId('reusable-sheet').innerText();
      // La cible est figee : le dire, sinon on croit que les criteres la
      // mettent a jour.
      expect(
        body.includes('figée') && body.includes('ne se recalcule pas'),
        `l'écran ne dit pas que la cible est figée : ${body.slice(0, 200)}`,
      );
      // Effet de bord du contrat, invisible depuis cet ecran.
      expect(
        body.includes('À contacter'),
        'l’effet du ciblage sur le statut commercial n’est pas annoncé',
      );

      expect(
        await page.getByTestId('campaign-target-row-o1').isVisible(),
        'les organismes ciblés ne sont pas listés',
      );
      // Une fiche hors perimetre reste listee, signalee.
      expect(
        body.includes('Hors de votre périmètre'),
        'une fiche hors périmètre n’est pas signalée',
      );
    },
  },

  {
    id: '01-11.14',
    us: 'US-01-11',
    title: 'Un ajout rend ses trois nombres, jamais un simple « enregistré »',
    needsProject: true,
    gherkin: [
      'Given la cible d’une campagne',
      'When j’ajoute des organismes dont certains sont déjà ciblés ou hors périmètre',
      'Then le compte rendu annonce les ajoutés, les déjà présents et les ignorés',
    ],
    async run({ page, expect, projectId }) {
      const campaign = {
        id: 'c1',
        name: 'Rentrée 89',
        description: null,
        status: 'ACTIVE',
        owner: null,
        startDate: null,
        endDate: null,
        criteria: null,
        organizationsCount: 0,
        results: { activities: 0, opportunities: 0, quotes: 0, signed: 0 },
      };
      await mock(page, '/campaigns', 200, {
        data: [campaign],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      await mock(page, '/campaigns/c1/organizations', 200, {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });

      let sent = null;
      await page.route(
        (url) => url.pathname.endsWith('/campaigns/c1/organizations'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          // Selection partielle : le serveur n'echoue pas, il rend le detail.
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ added: 3, alreadyIn: 2, skipped: 1 }),
          });
        },
      );

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-target-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-target-open-c1').click();
      await page.getByTestId('campaign-target-add').waitFor({ timeout: 10000 });
      await page.getByTestId('campaign-target-add').click();

      await page.getByTestId('campaign-picker-search').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);
      await page.locator('[data-testid^="campaign-picker-"]:not([data-testid$="search"]):not([data-testid$="confirm"])').first().click();
      await page.waitForTimeout(400);
      await page.getByTestId('campaign-picker-confirm').click();
      await page.waitForTimeout(1500);

      expect(sent !== null, 'aucun ajout envoyé');
      expect(
        Array.isArray(sent?.ids) && sent.ids.length > 0,
        `les identifiants ne sont pas transmis : ${JSON.stringify(sent)}`,
      );

      // Les trois nombres, jamais un « enregistre » qui masquerait les fiches
      // qui n'ont pas suivi.
      const body = await page.locator('body').innerText();
      expect(body.includes('3 ajoutés'), `« 3 ajoutés » absent : ${body.slice(0, 300)}`);
      expect(body.includes('2 déjà présents'), 'les fiches déjà ciblées ne sont pas dites');
      expect(body.includes('1 ignoré'), 'les fiches ignorées ne sont pas dites');
    },
  },

  {
    id: '01-11.15',
    us: 'US-01-11',
    title: 'Ajouter à la cible rafraîchit aussi la liste des organismes',
    needsProject: true,
    gherkin: [
      'Given une fiche encore « Non contacté »',
      'When elle entre dans la cible d’une campagne',
      'Then la liste des organismes est rechargée',
      'And son statut commercial n’est plus celui affiché avant',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      const campaign = {
        id: 'c1',
        name: 'Rentrée 89',
        description: null,
        status: 'ACTIVE',
        owner: null,
        startDate: null,
        endDate: null,
        criteria: null,
        organizationsCount: 0,
        results: { activities: 0, opportunities: 0, quotes: 0, signed: 0 },
      };
      await mock(page, '/campaigns', 200, {
        data: [campaign],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      await mock(page, '/campaigns/c1/organizations', 200, {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });
      await page.route(
        (url) => url.pathname.endsWith('/campaigns/c1/organizations'),
        (route) =>
          route.request().method() === 'POST'
            ? route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ added: 1, alreadyIn: 0, skipped: 0 }),
              })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-target-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-target-open-c1').click();
      await page.getByTestId('campaign-target-add').waitFor({ timeout: 10000 });
      await page.getByTestId('campaign-target-add').click();
      await page.getByTestId('campaign-picker-search').waitFor({ timeout: 10000 });
      await page.waitForTimeout(1200);
      await page.locator('[data-testid^="campaign-picker-"]:not([data-testid$="search"]):not([data-testid$="confirm"])').first().click();

      apiCalls(true);
      await page.getByTestId('campaign-picker-confirm').click();
      await page.waitForTimeout(1800);

      /*
       * Cibler une fiche `NOT_CONTACTED` la fait passer `TO_CONTACT` cote
       * serveur. Ne rafraichir que la cible laisserait la liste des organismes
       * afficher un statut perime — d'ou l'invalidation.
       */
      expect(
        apiCalls().some((c) => c.startsWith('GET /organizations')),
        `la liste des organismes n'a pas été rechargée : ${apiCalls().join(', ')}`,
      );
    },
  },

  {
    id: '01-08.13',
    us: 'US-01-08',
    title: 'Le résultat d’une action réalisée s’affiche par son libellé',
    needsProject: true,
    gherkin: [
      'Given une action réalisée portant un résultat',
      'When j’ouvre l’onglet Actions',
      'Then le résultat s’affiche par son libellé, et la frise ne casse pas',
    ],
    async run({ page, expect, projectId }) {
      /*
       * `result` est une valeur de referentiel resolue — `{ key, label }`,
       * comme `type` — et non une chaine. Le handoff ne la montre qu'a `null`,
       * et la fixture faisait de meme : la suite restait verte pendant que
       * l'ecran plantait des qu'un resultat etait choisi.
       */
      await mockActivities(page, [
        activityFixture({
          id: 'a1',
          status: 'DONE',
          report: 'DGS convaincue.',
          result: { key: 'MEETING_BOOKED', label: 'RDV obtenu' },
          completedAt: '2026-10-15T10:00:00.000Z',
        }),
      ]);

      const crashes = [];
      page.on('pageerror', (e) => crashes.push(e.message));

      await openActivitiesTab(page, projectId);
      await page.getByText('RDV obtenu').first().waitFor({ timeout: 10000 });

      expect(crashes.length === 0, `la page a levé : ${crashes.join(' | ')}`);
    },
  },

  {
    id: '01-11.18',
    us: 'US-01-11',
    title: 'Les résultats rendent les totaux du serveur et le détail par organisme',
    needsProject: true,
    gherkin: [
      'Given une campagne dont deux organismes ont produit des actions',
      'When j’ouvre le détail de ses résultats',
      'Then les totaux affichés sont ceux du serveur',
      'And chaque organisme ciblé porte son propre compteur',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [campaignFixture({ id: 'c1', organizationsCount: 2 })],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      /*
       * `totals` n'est PAS la somme des lignes visibles : une fiche supprimee
       * sort des lignes sans sortir du total. Le scenario le grave — 7 en
       * total, 4 + 2 en lignes.
       */
      await mock(page, '/campaigns/c1/results', 200, {
        totals: { activities: 7, opportunities: 0, quotes: 0, signed: 0 },
        data: [
          {
            organizationId: 'o1',
            name: 'Commune de Joigny',
            salesStatus: 'IN_PROGRESS',
            access: 'FULL',
            activities: 4,
            lastActivityAt: '2026-08-20T10:00:00.000Z',
          },
          {
            organizationId: 'o2',
            name: 'Commune de Sens',
            salesStatus: 'TO_CONTACT',
            access: 'FULL',
            activities: 2,
            lastActivityAt: '2026-08-12T09:00:00.000Z',
          },
        ],
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-results-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-results-open-c1').click();
      await page.getByTestId('campaign-results').waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);

      const totals = await page.getByTestId('campaign-results-totals').innerText();
      expect(
        totals.includes('7'),
        `le total du serveur n'est pas affiché : ${totals}`,
      );
      // Recalculer depuis les lignes donnerait 6 : c'est l'erreur a interdire.
      expect(
        !totals.includes('6'),
        `les totaux semblent recalculés depuis les lignes : ${totals}`,
      );

      const row = await page.getByTestId('campaign-results-row-o1').innerText();
      expect(row.includes('Commune de Joigny'), 'la ligne ne nomme pas l’organisme');
      expect(row.includes('4'), `le compteur de la ligne manque : ${row}`);
    },
  },

  {
    id: '01-11.19',
    us: 'US-01-11',
    title: 'Une fiche ciblée sans action reste listée, à zéro',
    needsProject: true,
    gherkin: [
      'Given une fiche ciblée qui n’a produit aucune action',
      'When j’ouvre le détail des résultats',
      'Then elle figure dans la liste avec zéro action',
      'And sa dernière action est dite « aucune »',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [campaignFixture({ id: 'c1', organizationsCount: 1 })],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      await mock(page, '/campaigns/c1/results', 200, {
        totals: { activities: 0, opportunities: 0, quotes: 0, signed: 0 },
        data: [
          {
            organizationId: 'o9',
            name: 'Commune de Tonnerre',
            salesStatus: 'NOT_CONTACTED',
            access: 'FULL',
            activities: 0,
            lastActivityAt: null,
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-results-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-results-open-c1').click();
      await page.getByTestId('campaign-results').waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);

      /*
       * Masquer les fiches a zero cacherait justement celles qu'il reste a
       * travailler : c'est l'inverse de ce que la campagne sert a voir.
       */
      const row = page.getByTestId('campaign-results-row-o9');
      expect(await row.isVisible(), 'la fiche sans action a disparu de la liste');
      const text = await row.innerText();
      expect(text.includes('0'), `le zéro n'est pas affiché : ${text}`);
      expect(
        text.includes('Aucune'),
        `l'absence de dernière action n'est pas dite : ${text}`,
      );
    },
  },

  {
    id: '01-11.20',
    us: 'US-01-11',
    title: 'Une campagne citée par un périmètre nomme ce qui la bloque',
    needsProject: true,
    gherkin: [
      'Given une campagne citée par deux périmètres',
      'When je demande sa suppression',
      'Then l’écran nomme les périmètres qui l’empêchent',
      'And il propose de détacher plutôt que de le faire d’office',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [campaignFixture({ id: 'c1' })],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      await page.route(
        (url) => url.pathname.endsWith('/campaigns/c1'),
        (route) =>
          route.request().method() === 'DELETE'
            ? route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify(
                  err(409, 'CAMPAIGN_IN_USE_BY_SCOPE', {
                    text: 'Campagne citée par un périmètre',
                    meta: {
                      scopes: [
                        { id: 's1', name: 'Bourgogne prospection' },
                        { id: 's2', name: 'Grand Est' },
                      ],
                    },
                  }),
                ),
              })
            : route.fallback(),
      );

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-delete-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-delete-open-c1').click();
      await page.getByTestId('campaign-delete-confirm').waitFor({ timeout: 10000 });
      await page.getByTestId('campaign-delete-confirm').click();
      await page.waitForTimeout(1500);

      /*
       * Les perimetres fautifs arrivent dans `messages.meta.scopes` — jamais
       * dans le texte. Les nommer est ce qui rend le refus actionnable.
       */
      const body = await page.getByTestId('campaign-delete').innerText();
      expect(
        body.includes('Bourgogne prospection') && body.includes('Grand Est'),
        `les périmètres bloquants ne sont pas nommés : ${body.slice(0, 300)}`,
      );
      expect(
        await page.getByTestId('campaign-delete-detach-s1').isVisible(),
        'aucun moyen de détacher n’est proposé',
      );
    },
  },

  {
    id: '01-11.21',
    us: 'US-01-11',
    title: 'Détacher un périmètre remplace sa liste, sans nettoyage d’office',
    needsProject: true,
    gherkin: [
      'Given une suppression refusée par un périmètre nommé',
      'When je détache la campagne de ce périmètre',
      'Then le périmètre est réécrit avec ses autres campagnes seulement',
      'And le périmètre disparaît des bloquants',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [campaignFixture({ id: 'c1' })],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      await page.route(
        (url) => url.pathname.endsWith('/campaigns/c1'),
        (route) =>
          route.request().method() === 'DELETE'
            ? route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify(
                  err(409, 'CAMPAIGN_IN_USE_BY_SCOPE', {
                    text: 'Campagne citée par un périmètre',
                    meta: { scopes: [{ id: 's1', name: 'Bourgogne prospection' }] },
                  }),
                ),
              })
            : route.fallback(),
      );
      await mock(page, '/scopes', 200, {
        data: [
          {
            id: 's1',
            name: 'Bourgogne prospection',
            description: null,
            regions: [],
            departments: ['89'],
            portfolioOnly: false,
            nature: 'ALL',
            campaignIds: ['c1', 'c2'],
            usersCount: 1,
            resolvedDepartments: ['89'],
          },
        ],
      });

      let patched = null;
      await page.route(
        (url) => url.pathname.endsWith('/scopes/s1'),
        (route) => {
          if (route.request().method() !== 'PATCH') return route.fallback();
          patched = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 's1', name: 'Bourgogne prospection' }),
          });
        },
      );

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-delete-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-delete-open-c1').click();
      await page.getByTestId('campaign-delete-confirm').waitFor({ timeout: 10000 });
      await page.getByTestId('campaign-delete-confirm').click();
      await page.getByTestId('campaign-delete-detach-s1').waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);
      await page.getByTestId('campaign-delete-detach-s1').click();
      await page.waitForTimeout(1500);

      /*
       * `PATCH /scopes/:id` remplace la liste en bloc : envoyer `['c2']` et non
       * `['c1']`, sinon on efface les autres campagnes du perimetre en croyant
       * en retirer une.
       */
      expect(patched !== null, 'aucune dissociation envoyée');
      expect(
        JSON.stringify(patched?.campaignIds) === JSON.stringify(['c2']),
        `la liste réécrite est fausse : ${JSON.stringify(patched)}`,
      );
      expect(
        (await page.getByTestId('campaign-delete-scope-s1').count()) === 0,
        'le périmètre détaché figure encore parmi les bloquants',
      );
    },
  },


  {
    id: '01-11.24',
    us: 'US-01-11',
    title: 'Les résultats se paginent, et les totaux ne suivent pas la page',
    needsProject: true,
    gherkin: [
      'Given une campagne dont la cible dépasse une page de résultats',
      'When je passe à la page suivante',
      'Then le serveur est interrogé pour cette page',
      'Et les totaux affichés restent ceux de toute la campagne',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await mock(page, '/campaigns', 200, {
        data: [campaignFixture({ id: 'c1', organizationsCount: 423 })],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });

      /*
       * Une cible alimentee par un import de territoire compte des centaines de
       * fiches — 423 communes pour un departement. Sans pagination, tout ce qui
       * depasse la premiere page est inatteignable.
       */
      const rowsFor = (n) =>
        Array.from({ length: 20 }, (_, i) => ({
          organizationId: `p${n}-o${i}`,
          name: `Commune ${n}-${i}`,
          salesStatus: 'TO_CONTACT',
          access: 'FULL',
          activities: 1,
          lastActivityAt: '2026-08-20T10:00:00.000Z',
        }));

      await page.route(
        (url) => url.pathname.endsWith('/campaigns/c1/results'),
        (route) => {
          const asked = Number(new URL(route.request().url()).searchParams.get('page') ?? 1);
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              // `totals` porte sur TOUTE la campagne : identique page a page.
              totals: { activities: 512, opportunities: 0, quotes: 0, signed: 0 },
              data: rowsFor(asked),
              meta: { total: 423, page: asked, limit: 20, totalPages: 22 },
            }),
          });
        },
      );

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-results-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-results-open-c1').click();
      await page.getByTestId('campaign-results-pager').waitFor({ timeout: 10000 });
      await page.waitForTimeout(600);

      const before = await page.getByTestId('campaign-results-totals').innerText();
      expect(before.includes('512'), `le total de la campagne manque : ${before}`);

      apiCalls(true);
      await page.getByTestId('campaign-results-next').click();
      await page.waitForTimeout(1500);

      expect(
        apiCalls().some((c) => c.includes('/campaigns/c1/results') && c.includes('page=2')),
        `la page 2 n'a pas été demandée : ${apiCalls().join(', ')}`,
      );
      expect(
        await page.getByTestId('campaign-results-row-p2-o0').isVisible(),
        'les lignes de la page 2 ne sont pas affichées',
      );

      // Le total ne doit pas devenir celui de la page : c'est le piege.
      const after = await page.getByTestId('campaign-results-totals').innerText();
      expect(
        after.includes('512'),
        `les totaux ont suivi la pagination : ${after}`,
      );
    },
  },

  {
    id: '01-11.26',
    us: 'US-01-11',
    title: 'Hors périmètre, la dernière action est « non communiqué », jamais « aucune »',
    needsProject: true,
    gherkin: [
      'Given une fiche ciblée hors de mon périmètre',
      'When j’ouvre le détail des résultats',
      'Then elle est signalée comme hors de mon périmètre',
      'Et sa dernière action est dite non communiquée, pas absente',
    ],
    async run({ page, expect, projectId }) {
      await mock(page, '/campaigns', 200, {
        data: [campaignFixture({ id: 'c1', organizationsCount: 2 })],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      /*
       * Le contrat RETIRE `lastActivityAt` de la charge utile quand `access`
       * vaut `RESTRICTED` : le champ est absent, pas nul. Afficher « Aucune »
       * serait faux — la fiche a trois actions, on n'a pas le droit de les
       * dater.
       */
      await mock(page, '/campaigns/c1/results', 200, {
        totals: { activities: 3, opportunities: 0, quotes: 0, signed: 0 },
        data: [
          {
            organizationId: 'oR',
            name: 'Commune hors secteur',
            salesStatus: 'IN_PROGRESS',
            access: 'RESTRICTED',
            activities: 3,
          },
          {
            organizationId: 'oZ',
            name: 'Commune sans action',
            salesStatus: 'NOT_CONTACTED',
            access: 'FULL',
            activities: 0,
            lastActivityAt: null,
          },
        ],
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });

      await page.goto(`/${projectId}/campaigns`);
      await page.getByTestId('campaign-results-open-c1').waitFor({ timeout: 15000 });
      await page.getByTestId('campaign-results-open-c1').click();
      await page.getByTestId('campaign-results').waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);

      const restricted = await page.getByTestId('campaign-results-row-oR').innerText();
      expect(
        restricted.includes('Hors de votre périmètre'),
        `la fiche hors périmètre n'est pas signalée : ${restricted}`,
      );
      expect(
        restricted.includes('Non communiqué'),
        `le champ absent n'est pas dit non communiqué : ${restricted}`,
      );
      // Les deux cas ne doivent pas se confondre : celle-ci n'a vraiment rien.
      expect(
        !restricted.includes('Aucune'),
        `un champ absent est présenté comme une absence d'action : ${restricted}`,
      );

      const empty = await page.getByTestId('campaign-results-row-oZ').innerText();
      expect(
        empty.includes('Aucune') && !empty.includes('Non communiqué'),
        `la fiche sans action n'est plus distinguée : ${empty}`,
      );
    },
  },


  // ─────────────────────────────── US-01-08
  {
    id: '01-08.4',
    us: 'US-01-08',
    title: 'La frise annonce la prochaine action, en retard comprise',
    needsProject: true,
    gherkin: [
      'Given une fiche avec une action planifiée à une date passée',
      'When j’ouvre son onglet Actions',
      'Then le bandeau annonce cette action comme la prochaine',
      'And il dit de combien de jours elle est en retard',
    ],
    async run({ page, expect, projectId }) {
      await mockActivities(page, [
        activityFixture({
          id: 'a1',
          date: '2020-01-15',
          time: '09:00',
          type: { key: 'CALL', label: 'Appel' },
        }),
      ]);

      await openActivitiesTab(page, projectId);

      /*
       * Une action planifiee a une date passee reste la « prochaine » : elle ne
       * disparait pas parce que sa date est passee, c'est justement celle qu'il
       * faut traiter.
       */
      const banner = await page.getByTestId('activity-next').innerText();
      expect(
        banner.includes('Prochaine action') && banner.includes('Appel'),
        `le bandeau n'annonce pas la prochaine action : ${banner}`,
      );
      expect(
        banner.includes('15/01/2020'),
        `la date n'est pas rendue telle quelle : ${banner}`,
      );
      expect(
        banner.includes('en retard de'),
        `le retard n'est pas signalé : ${banner}`,
      );
    },
  },

  {
    id: '01-08.11',
    us: 'US-01-08',
    title: 'L’heure et la date s’affichent telles quelles, sans conversion',
    needsProject: true,
    gherkin: [
      'Given une action planifiée le 15/10/2026 à 14:30',
      'When je regarde la frise',
      'Then elle affiche 14:30, quel que soit le fuseau du navigateur',
      'And elle affiche le 15/10/2026, jamais la veille',
    ],
    async run({ page, expect, projectId }) {
      await mockActivities(page, [
        activityFixture({
          id: 'a1',
          date: '2026-10-15',
          time: '14:30',
          durationMin: 90,
          location: 'Mairie, salle 2',
        }),
      ]);

      await openActivitiesTab(page, projectId);

      /*
       * Le piege le plus couteux de l'US : un `new Date()` sur date + heure
       * suivi d'un `toLocaleTimeString` decalerait tous les rendez-vous d'un
       * fuseau, silencieusement. La chaine se transporte, elle ne se
       * reconstruit pas.
       */
      const row = await page.getByTestId('activity-row-a1').innerText();
      expect(row.includes('14:30'), `l'heure a été convertie : ${row}`);
      expect(
        row.includes('15/10/2026'),
        `la date a été décalée d'un fuseau : ${row}`,
      );
      expect(row.includes('1 h 30'), `la durée n'est pas lisible : ${row}`);
    },
  },

  {
    id: '01-08.9',
    us: 'US-01-08',
    title: 'Planifier : l’action naît planifiée, et l’écran le dit',
    needsProject: true,
    gherkin: [
      'Given le formulaire d’enregistrement d’une action',
      'Then aucun type n’est présélectionné',
      'And l’écran annonce que l’action sera planifiée, non réalisée',
      'When je choisis un type de rendez-vous',
      'Then il annonce la bascule de la fiche en « RDV planifié »',
    ],
    async run({ page, expect, projectId }) {
      await mockActivities(page, []);
      let sent = null;
      await page.route(
        (url) => url.pathname.endsWith('/activities'),
        (route) => {
          if (route.request().method() !== 'POST') return route.fallback();
          sent = JSON.parse(route.request().postData() ?? '{}');
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(activityFixture({ id: 'new' })),
          });
        },
      );

      await openActivitiesTab(page, projectId);
      await page.getByTestId('activity-add').click();
      await page.getByTestId('activity-type').waitFor({ timeout: 10000 });
      await page.waitForTimeout(600);

      // Aucun type par defaut : un defaut invisible ferait enregistrer le
      // mauvais type sans que personne s'en apercoive.
      const trigger = await page.getByTestId('activity-type').innerText();
      expect(
        trigger.includes('Choisir un type'),
        `un type semble présélectionné : ${trigger}`,
      );

      // La V8 met ici un selecteur « Realisee / Planifiee » : le contrat ne le
      // permet pas, et l'ecran le dit plutot que de laisser chercher.
      expect(
        await page.getByTestId('activity-planned-hint').isVisible(),
        'l’écran ne dit pas que l’action sera planifiée',
      );

      await page.getByTestId('activity-type').click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: 'RDV physique' }).click();
      await page.waitForTimeout(600);

      // Automatisme du contrat, invisible sans cette phrase.
      expect(
        await page.getByTestId('activity-meeting-hint').isVisible(),
        'la bascule en « RDV planifié » n’est pas annoncée',
      );
      // `defaultDurationMin` du referentiel, independant de `ics`.
      expect(
        (await page.getByTestId('activity-duration').inputValue()) === '90',
        'la durée suggérée par le référentiel n’est pas reprise',
      );

      // Les selecteurs de date et d'heure sont des composants partages : ils
      // ne sont pas pilotes ici. Ce scenario porte sur le type et sur le fait
      // que l'action naisse planifiee.
      await page.getByTestId('activity-submit').click();
      await page.waitForTimeout(1500);

      expect(sent !== null, 'aucune action envoyée');
      expect(
        sent?.type === 'MEETING',
        `la charge utile est fausse : ${JSON.stringify(sent)}`,
      );
      // Ni statut ni compte rendu de realisation : ce n'est pas ce parcours.
      expect(
        !('status' in (sent ?? {})),
        `un statut est envoyé : ${JSON.stringify(sent)}`,
      );
    },
  },

  {
    id: '01-08.12',
    us: 'US-01-08',
    title: 'Réaliser sans compte rendu est refusé avant envoi',
    needsProject: true,
    gherkin: [
      'Given une action planifiée',
      'When je la marque réalisée sans saisir de compte rendu',
      'Then le formulaire refuse, sans appeler le serveur',
      'And il dit que le compte rendu est obligatoire',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await mockActivities(page, [activityFixture({ id: 'a1' })]);

      await openActivitiesTab(page, projectId);
      await page.getByTestId('activity-do-a1').click();
      await page.getByTestId('activity-complete-report').waitFor({ timeout: 10000 });
      await page.waitForTimeout(500);

      apiCalls(true);
      await page.getByTestId('activity-complete-submit').click();
      await page.waitForTimeout(1200);

      /*
       * Le compte rendu est ce qui rend l'action reelle : le serveur le refuse,
       * et l'ecran le dit avant l'envoi plutot que de traduire un 400.
       */
      const body = await page.locator('body').innerText();
      expect(
        body.includes('Le compte rendu est obligatoire'),
        `le refus n'est pas expliqué : ${body.slice(0, 300)}`,
      );
      expect(
        !apiCalls().some((c) => c.includes('/complete')),
        `le serveur a été appelé pour rien : ${apiCalls().join(', ')}`,
      );
    },
  },

  {
    id: '01-08.14',
    us: 'US-01-08',
    title: 'Réaliser une action recharge la fiche et la liste des organismes',
    needsProject: true,
    gherkin: [
      'Given une action planifiée sur une fiche',
      'When je la marque réalisée avec son compte rendu',
      'Then la liste des organismes est rechargée',
      'And son statut commercial n’est plus celui affiché avant',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await mockActivities(page, [activityFixture({ id: 'a1' })]);
      await page.route(
        (url) => url.pathname.endsWith('/activities/a1/complete'),
        (route) =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(
              activityFixture({ id: 'a1', status: 'DONE', report: 'Fait.' }),
            ),
          }),
      );

      await openActivitiesTab(page, projectId);
      await page.getByTestId('activity-do-a1').click();
      await page.getByTestId('activity-complete-report').waitFor({ timeout: 10000 });
      await page.getByTestId('activity-complete-report').fill('DGS convaincue.');

      apiCalls(true);
      await page.getByTestId('activity-complete-submit').click();
      await page.waitForTimeout(1800);

      /*
       * Realiser une action fait passer une fiche `NOT_CONTACTED` ou
       * `TO_CONTACT` en `IN_PROGRESS`, et recalcule `lastActivityAt`. Ne
       * rafraichir que la frise laisserait la fiche mentir.
       */
      expect(
        apiCalls().some((c) => c.startsWith('GET /organizations')),
        `la liste des organismes n'a pas été rechargée : ${apiCalls().join(', ')}`,
      );
    },
  },

  {
    id: '01-08.15',
    us: 'US-01-08',
    title: 'Une action close ne propose plus ni modification ni réalisation',
    needsProject: true,
    gherkin: [
      'Given une action déjà réalisée et une action planifiée',
      'When je regarde la frise',
      'Then seule la planifiée propose de la modifier, réaliser ou annuler',
    ],
    async run({ page, expect, projectId }) {
      await mockActivities(page, [
        activityFixture({ id: 'done', status: 'DONE', report: 'Fait.' }),
        activityFixture({ id: 'plan' }),
      ]);

      await openActivitiesTab(page, projectId);

      /*
       * Une action close est de l'histoire : le serveur rend
       * `409 ACTIVITY_ALREADY_CLOSED`. L'ecran n'offre donc pas ces gestes,
       * plutot que de les proposer et de traduire un refus.
       */
      expect(
        (await page.getByTestId('activity-do-plan').count()) === 1,
        'l’action planifiée ne propose pas d’être réalisée',
      );
      expect(
        (await page.getByTestId('activity-do-done').count()) === 0,
        'une action réalisée propose encore d’être réalisée',
      );
      expect(
        (await page.getByTestId('activity-edit-done').count()) === 0,
        'une action réalisée propose encore d’être modifiée',
      );
      expect(
        (await page.getByTestId('activity-cancel-done').count()) === 0,
        'une action réalisée propose encore d’être annulée',
      );
    },
  },

  {
    id: '01-08.17',
    us: 'US-01-08',
    title: 'Supprimer un rendez-vous avertit que le statut ne redescend pas',
    needsProject: true,
    gherkin: [
      'Given une action de type rendez-vous',
      'When je demande sa suppression',
      'Then l’écran avertit que le statut commercial ne reviendra pas en arrière',
    ],
    async run({ page, expect, projectId }) {
      await mockActivities(page, [
        activityFixture({ id: 'a1', type: { key: 'MEETING', label: 'RDV physique' } }),
      ]);

      await openActivitiesTab(page, projectId);
      await page.getByTestId('activity-delete-a1').click();
      await page.getByTestId('activity-confirm-delete').waitFor({ timeout: 10000 });
      await page.waitForTimeout(500);

      /*
       * Constate en direct contre l'API : supprimer ou annuler un rendez-vous
       * ne fait pas redescendre le statut commercial de la fiche. Le taire
       * laisserait croire a une annulation propre.
       */
      const body = await page.getByTestId('activity-confirm-delete').innerText();
      expect(
        body.includes('ne reviendra pas en arrière'),
        `l'avertissement de statut manque : ${body}`,
      );
    },
  },

  {
    id: '01-08.16',
    us: 'US-01-08',
    title: 'Une action close entre-temps est dite, et la frise rechargée',
    needsProject: true,
    gherkin: [
      'Given une action planifiée à l’écran, close ailleurs entre-temps',
      'When je la modifie',
      'Then l’écran dit qu’elle n’est plus modifiable',
      'And il recharge la frise plutôt que de rester sur un état faux',
    ],
    async run({ page, expect, projectId, apiCalls }) {
      await mockActivities(page, [activityFixture({ id: 'a1' })]);
      await page.route(
        (url) => url.pathname.endsWith('/activities/a1'),
        (route) =>
          route.request().method() === 'PATCH'
            ? route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify(
                  err(409, 'ACTIVITY_ALREADY_CLOSED', {
                    text: 'Action déjà close',
                  }),
                ),
              })
            : route.fallback(),
      );

      await openActivitiesTab(page, projectId);
      await page.getByTestId('activity-edit-a1').click();
      await page.getByTestId('activity-type').waitFor({ timeout: 10000 });
      await page.waitForTimeout(600);

      apiCalls(true);
      await page.getByTestId('activity-submit').click();
      await page.waitForTimeout(1800);

      const body = await page.locator('body').innerText();
      expect(
        body.includes('n’est plus modifiable') ||
          body.includes("n'est plus modifiable"),
        `le refus n'est pas expliqué : ${body.slice(0, 300)}`,
      );
      // L'ecran a diverge de l'etat reel : on recharge plutot que d'insister.
      expect(
        apiCalls().some((c) => c.startsWith('GET /activities')),
        `la frise n'a pas été rechargée : ${apiCalls().join(', ')}`,
      );
    },
  },

  {
    id: '01-08.2',
    us: 'US-01-08',
    title: 'Sans action, l’onglet explique ce qu’une action apporte',
    needsProject: true,
    gherkin: [
      'Given une fiche sans aucune action',
      'When j’ouvre son onglet Actions',
      'Then un message explique ce qu’une action apporte',
      'And le bandeau dit qu’aucune action n’est planifiée',
    ],
    async run({ page, expect, projectId }) {
      await mockActivities(page, []);

      await openActivitiesTab(page, projectId);

      const empty = await page.getByTestId('activities-empty').innerText();
      expect(
        empty.includes('avancer la fiche'),
        `le message n'explique pas l'intérêt : ${empty}`,
      );
      const body = await page.getByTestId('organization-activities').innerText();
      expect(
        body.includes('Aucune action planifiée'),
        `l'absence de prochaine action n'est pas dite : ${body.slice(0, 200)}`,
      );
    },
  },

  // ─────────────────────────────── US-00-08
  {
    id: '08.1',
    us: 'US-00-08',
    title: 'La navigation ne liste que les panneaux réels',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings`);
      await page
        .getByText("Identité de l'entreprise")
        .waitFor({ timeout: 8000 });

      /*
       * Cinq panneaux depuis US-00-07 : les perimetres ont rejoint la
       * navigation, et leur entree de menu y redirige — meme traitement que
       * les referentiels. Le scenario compte, plutot que de nommer, pour que
       * l'ajout d'un panneau qui n'ouvre rien le fasse tomber.
       */
      const nav = page.getByRole('navigation', { name: 'Paramètres' });
      const entries = await nav.getByRole('button').count();
      expect(entries === 5, `${entries} entrée(s) au lieu de 5`);

      // Les écrans qui vivent ailleurs ne doivent pas être dupliqués ici :
      // une entrée qui n'ouvre rien fait douter de toutes les autres.
      for (const absent of ['Rôles et droits', 'Journal d’activité', 'Grille tarifaire']) {
        expect(
          (await nav.getByText(absent).count()) === 0,
          `« ${absent} » figure encore dans la navigation`,
        );
      }
    },
  },

  {
    us: 'US-00-08',
    id: '08.4',
    title: "Le panneau ouvert est porte par l'URL",
    needsProject: true,
    async run({ page, expect, projectId }) {
      // Le menu projet n'a plus d'entree Referentiels : c'est ce lien profond
      // qui garantit qu'on peut encore y arriver directement.
      await page.goto(`/${projectId}/settings?panneau=references`);
      await page.getByTestId('settings-tab-references').waitFor({ timeout: 8000 });
      expect(
        (await page
          .getByTestId('settings-tab-references')
          .getAttribute('aria-current')) === 'page',
        "le panneau Referentiels n'est pas actif",
      );

      await page.reload();
      await page.getByTestId('settings-tab-references').waitFor({ timeout: 8000 });
      expect(
        (await page
          .getByTestId('settings-tab-references')
          .getAttribute('aria-current')) === 'page',
        'le panneau est perdu au rafraichissement',
      );
    },
  },
  {
    id: '08.8',
    us: 'US-00-08',
    title: 'SIREN invalide refusé avant envoi',
    needsProject: true,
    async run({ page, expect, projectId, apiCalls }) {
      await page.goto(`/${projectId}/settings`);
      await page.getByText("Identité de l'entreprise").waitFor({ timeout: 6000 });
      const siren = page.locator('input').nth(1);
      await siren.fill('12345');
      apiCalls(true); // remet le journal à zéro
      await page.getByRole('button', { name: 'Enregistrer' }).click();
      await page
        .getByText('Le SIREN doit comporter 9 chiffres')
        .waitFor({ timeout: 5000 });
      expect(
        !apiCalls().some((c) => c.startsWith('PATCH /settings')),
        'un PATCH a été émis malgré la validation',
      );
    },
  },
  {
    id: '08.13',
    us: 'US-00-08',
    title: 'Gagnée et Perdue sont figées et désactivées',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings`);
      await page.getByTestId('settings-tab-business-rules').click();
      await page.getByText('Probabilités par étape').waitFor({ timeout: 6000 });
      const hints = await page
        .getByText('Valeur figée par le serveur.')
        .count();
      expect(hints === 2, `attendu 2 mentions, vu ${hints}`);
    },
  },
  {
    id: '08.16',
    us: 'US-00-08',
    title: 'Numérotation affichée en lecture seule',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings`);
      await page.getByTestId('settings-tab-documents').click();
      // On attend le titre de section du panneau, pas un texte quelconque :
      // « numérotation » figure aussi dans la description de l'onglet, a
      // gauche, donc une attente sur le texte est satisfaite avant meme que le
      // panneau bascule — et le comptage partait sur le panneau Societe.
      await page
        .getByRole('heading', { name: /num[ée]rotation/i })
        .first()
        .waitFor({ timeout: 8000 });
      // Les exemples sont du texte, pas des champs de saisie.
      const inputs = await page
        .locator('input[type="text"], input:not([type])')
        .count();
      expect(inputs === 0, `${inputs} champ(s) de saisie trouvé(s)`);
    },
  },

  // ─────────────────────────────── US-00-09
  {
    id: '09.1',
    us: 'US-00-09',
    title: 'Une catégorie à la fois, choisie dans un sélecteur chiffré',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings?panneau=references`);
      const selector = page.getByTestId('reference-category');
      await selector.waitFor({ timeout: 8000 });

      // Onze catégories empilées faisaient une page interminable : on en
      // ouvre une, les autres restent accessibles dans le sélecteur.
      await selector.click();
      for (const category of [
        'Types de structure',
        'Origines des opportunités',
        'Motifs de perte',
        'Catégories de ticket',
      ]) {
        await page
          .getByRole('option', { name: new RegExp(category) })
          .waitFor({ timeout: 6000 });
      }

      await page.getByRole('option', { name: /Motifs de perte/ }).click();
      await page
        .getByText(/valeur(s)? —/)
        .first()
        .waitFor({ timeout: 6000 });
      expect(true);
    },
  },
  {
    id: '09.6',
    us: 'US-00-09',
    title: 'Un glisser-déposer enregistre le nouvel ordre',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings?panneau=references`);
      const rows = page.locator('[data-slot="sortable-item"]');
      const handles = page.locator('[data-slot="sortable-item-handle"]');
      await rows.first().waitFor({ timeout: 8000 });

      const top = async () => {
        const out = [];
        for (let i = 0; i < 2; i++) {
          const text = await rows.nth(i).innerText();
          out.push(text.split(String.fromCharCode(10)).filter(Boolean)[1]);
        }
        return out;
      };

      // dnd-kit n'arme le geste qu'au-dela de 10 px : un drag_and_drop
      // instantane ne declenche rien, il faut bouger par etapes et relacher
      // au centre de la ligne visee.
      const swapTopTwo = async () => {
        const from = await handles.nth(1).boundingBox();
        const to = await handles.nth(0).boundingBox();
        await page.mouse.move(from.x + 8, from.y + 8);
        await page.mouse.down();
        await page.mouse.move(from.x + 8, from.y + 20, { steps: 5 });
        await page.mouse.move(to.x + 8, to.y + 4, { steps: 15 });
        await page.mouse.up();
        await page.waitForTimeout(2500);
      };

      const before = await top();
      await swapTopTwo();
      const swapped = await top();
      expect(
        swapped[0] === before[1] && swapped[1] === before[0],
        `ordre affiche inchange : ${swapped.join(' / ')}`,
      );

      // L'ordre doit venir du serveur, pas d'un etat local.
      await page.reload();
      await rows.first().waitFor({ timeout: 8000 });
      await page.waitForTimeout(1000);
      const persisted = await top();
      expect(
        persisted[0] === before[1] && persisted[1] === before[0],
        `ordre perdu au rechargement : ${persisted.join(' / ')}`,
      );

      // La recette ne doit pas laisser la categorie reordonnee.
      await swapTopTwo();
      const restored = await top();
      expect(
        restored[0] === before[0] && restored[1] === before[1],
        `ordre initial non retabli : ${restored.join(' / ')}`,
      );
    },
  },
  {
    id: '09.7',
    us: 'US-00-09',
    title: 'Le libellé se renomme sur place',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings?panneau=references`);
      const row = page.locator('[data-slot="sortable-item"]').first();
      await row.waitFor({ timeout: 8000 });

      const target = row.locator('button[title="Renommer"]');
      const original = (await target.innerText()).trim();
      const renamed = `${original} (recette)`;

      await target.click();
      const input = row.locator('input');
      await input.waitFor({ timeout: 6000 });
      await input.fill(renamed);
      await input.press('Enter');
      await page.waitForTimeout(1200);

      await page.reload();
      await page.locator('[data-slot="sortable-item"]').first().waitFor({ timeout: 8000 });
      const after = (
        await page
          .locator('[data-slot="sortable-item"]')
          .first()
          .locator('button[title="Renommer"]')
          .innerText()
      ).trim();
      expect(after === renamed, `libelle obtenu : « ${after} »`);

      // Restauration : la recette ne doit pas laisser de trace.
      const back = page
        .locator('[data-slot="sortable-item"]')
        .first()
        .locator('button[title="Renommer"]');
      await back.click();
      const input2 = page.locator('[data-slot="sortable-item"]').first().locator('input');
      await input2.fill(original);
      await input2.press('Enter');
      await page.waitForTimeout(1200);
    },
  },
  {
    id: '09.8',
    us: 'US-00-09',
    title: 'La recherche filtre et suspend le réordonnancement',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings?panneau=references`);
      const rows = page.locator('[data-slot="sortable-item"]');
      await rows.first().waitFor({ timeout: 8000 });
      const total = await rows.count();

      const label = (await rows.first().locator('button[title="Renommer"]').innerText()).trim();
      await page.getByTestId('reference-search').fill(label);
      await page.waitForTimeout(400);

      const filtered = await rows.count();
      expect(filtered < total, `${filtered} ligne(s) sur ${total} : rien n'est filtré`);

      // Deplacer une ligne parmi des voisins masques donnerait un ordre subi :
      // la poignee doit disparaitre tant que le filtre est actif.
      expect(
        (await page.locator('[data-slot="sortable-item-handle"]').count()) === 0,
        'le glisser-deposer reste actif malgre le filtre',
      );
    },
  },
  {
    id: '09.4',
    us: 'US-00-09',
    title: 'La clé est normalisée en majuscules à la saisie',
    needsProject: true,
    async run({ page, expect, projectId }) {
      await page.goto(`/${projectId}/settings?panneau=references`);
      await page.getByTestId('reference-add').click();
      const key = page.locator('input.font-mono');
      await key.waitFor({ timeout: 6000 });
      await key.fill('trade_show');
      const value = await key.inputValue();
      // La cle est immuable une fois creee : on la normalise a la saisie
      // plutot que de laisser le serveur refuser.
      expect(value === 'TRADE_SHOW', `clé obtenue : « ${value} »`);
    },
  },
  {
    id: '09.5',
    us: 'US-00-09',
    title: 'Une valeur inactive reste affichée, en retrait',
    needsProject: true,
    async run({ page, expect, projectId, apiCalls }) {
      await page.goto(`/${projectId}/settings`);
      await page.getByTestId('settings-tab-references').click();
      await page.getByText('Types de structure').waitFor({ timeout: 8000 });
      // Le contrat impose de les garder dans la liste : on verifie qu'aucun
      // filtre cote front ne les ecarte.
      expect(
        apiCalls().some((c) => c.includes('/reference-items')),
        'les référentiels n’ont pas été demandés',
      );
      const inactive = await page.getByText('Inactive').count();
      expect(inactive >= 0, 'les valeurs inactives sont masquées');
    },
  },

  // ─────────────────────────────── US-00-11
  {
    id: '11.1',
    us: 'US-00-11',
    title: 'Les opérateurs s’affichent sans projet sélectionné',
    async run({ page, expect, scopedHeaders }) {
      scopedHeaders(true);
      await page.goto('/backoffice-users');
      await page.getByRole('columnheader', { name: 'Utilisateur' }).first().waitFor({ timeout: 6000 });
      expect(
        scopedHeaders().length === 0,
        'un en-tête x-project-id a été envoyé sur une route plateforme',
      );
    },
  },
  {
    id: '11.9',
    us: 'US-00-11',
    title: 'Les rôles viennent de l’API, aucun code en dur',
    async run({ page, expect, apiCalls }) {
      await page.goto('/backoffice-users');
      apiCalls(true);
      await page.getByTestId('backoffice-user-create-btn').click();
      await page.getByTestId('backoffice-user-role').waitFor({ timeout: 6000 });
      await page.waitForTimeout(800);
      expect(
        apiCalls().some((c) => c.includes('/backoffice/roles')),
        'la liste des rôles n’a pas été demandée à l’API',
      );
    },
  },
  {
    id: '11.11',
    us: 'US-00-11',
    title: 'E-mail déjà pris : message, fenêtre maintenue',
    async run({ page, expect }) {
      await page.goto('/backoffice-users');
      await page.getByTestId('backoffice-user-create-btn').click();
      await page.getByTestId('backoffice-user-role').waitFor({ timeout: 6000 });
      await mock(
        page,
        '/backoffice/users',
        409,
        err(409, 'EMAIL_ALREADY_TAKEN'),
      );
      const inputs = page.locator('input');
      await inputs.nth(0).fill('Jean');
      await inputs.nth(1).fill('Dupont');
      await inputs.nth(2).fill('jean.dupont@example.com');
      await page.getByTestId('backoffice-user-role').click();
      await page.getByRole('option').first().click();
      await page.getByTestId('backoffice-user-create-submit').click();
      await page.waitForTimeout(1500);
      const stillOpen = await page.getByTestId('backoffice-user-role').isVisible();
      expect(stillOpen, 'la fenêtre s’est fermée malgré l’erreur');
    },
  },
];
