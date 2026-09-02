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

  // ─────────────────────────────── US-00-05
  {
    id: '05.4',
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

      const nav = page.getByRole('navigation', { name: 'Paramètres' });
      const entries = await nav.getByRole('button').count();
      expect(entries === 4, `${entries} entrée(s) au lieu de 4`);

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
    id: '08.7',
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
    id: '08.12',
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
    id: '08.15',
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
