/**
 * Génère `docs/INVENTAIRE-API-FRONT.html` — l'inventaire des routes de l'API,
 * augmenté d'une colonne : consommée par le front, ou pas.
 *
 * La source des routes reste `oui-crm-api/docs/INVENTAIRE-API.html` : on ne
 * recopie pas sa liste, on la relit à chaque génération. Un inventaire figé
 * serait faux dès la story suivante.
 *
 * La couverture, elle, est déduite du code : on résout les constantes de route
 * de chaque feature, puis on regarde quels verbes les services appellent
 * réellement. Rien n'est déclaré à la main — une route ajoutée sans être
 * appelée n'apparaîtra pas comme couverte.
 *
 *   node scripts/api-coverage.mjs
 *   node scripts/api-coverage.mjs --inventory=../autre/chemin.html
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';

/** Retour a la ligne, sans sequence d'echappement : les outils de format
 * du depot en reecrivaient une en retour reel, cassant la chaine. */
const NL = String.fromCharCode(10);

const args = process.argv.slice(2);
const value = (name) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

const INVENTORY =
  value('inventory') ?? '../oui-crm-api/docs/INVENTAIRE-API.html';
const OUT = 'docs/INVENTAIRE-API-FRONT.html';

if (!existsSync(INVENTORY)) {
  console.error(
    `Inventaire introuvable : ${INVENTORY}\n` +
      `C'est le document de l'API (dépôt voisin, hors git). Passer --inventory=<chemin> si besoin.`,
  );
  process.exit(1);
}

// ── Inventaire de l'API ────────────────────────────────────────────────────

const html = readFileSync(INVENTORY, 'utf8');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/**
 * Structure du document de l'API : lot (`<h2>`), puis US (`div.us-head`),
 * puis les routes. On reprend son decoupage tel quel — deux inventaires qui
 * ne se rangeraient pas pareil ne se compareraient plus.
 */
const lots = [];
{
  const re =
    /<h2[^>]*>(.*?)<\/h2>|<div class="us-head">(.*?)<\/div>|<tr><td class="m">(.*?)<\/tr>/gs;

  let lot = null;
  let us = null;
  let m;

  while ((m = re.exec(html))) {
    if (m[1] !== undefined) {
      lot = { title: strip(m[1]), stories: [] };
      lots.push(lot);
      us = null;
      continue;
    }

    if (m[2] !== undefined) {
      const head = m[2];
      const id = head.match(/<span class="us-id">([^<]*)<\/span>/)?.[1] ?? '';
      const title = head.match(/<span class="us-title">([^<]*)<\/span>/)?.[1] ?? '';
      const pill = head.match(/<span class="pill[^"]*">([^<]*)<\/span>/)?.[1] ?? '';
      us = { id: strip(id), title: strip(title), status: strip(pill), rows: [] };
      if (!lot) {
        lot = { title: 'Routes', stories: [] };
        lots.push(lot);
      }
      lot.stories.push(us);
      continue;
    }

    const cells = `<td class="m">${m[3]}</tr>`.match(
      // La cellule d'URL peut contenir une balise imbriquee (`?q` pour les
      // parametres de requete) : on capture jusqu'a `</td>` puis on nettoie,
      // sinon ces lignes etaient purement et simplement perdues.
      /<span class="method (\w+)">\w+<\/span><\/td><td class="u">(.*?)<\/td><td class="p">(.*?)<\/td><td class="t">(.*?)<\/td><td class="s">(.*?)<\/td>/s,
    );
    if (!cells || !us) continue;

    us.rows.push({
      method: cells[1],
      url: strip(cells[2]).replace(/\s*\?.*$/, ''),
      permission: strip(cells[3]),
      status: strip(cells[5]),
    });
  }
}

/** Vue a plat, pour les totaux et le rapprochement. */
const sections = lots.map((l) => ({
  title: l.title,
  rows: l.stories.flatMap((u) => u.rows),
}));

// ── Ce que le front appelle ────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const files = walk('src');

/**
 * Constantes de route, résolues en motifs.
 *
 * Deux formes dans le code : `CLE: '/chemin'` et
 * `CLE: (id) => `/chemin/${id}``. Les interpolations deviennent `:param`, ce
 * qui aligne sur l'écriture de l'inventaire.
 */
/** `/users/:userId/x` et `/users/:id/x` désignent la même route. */
const normalise = (u) => u.replace(/:[A-Za-z0-9_]+/g, ':id').replace(/\/$/, '');

/**
 * On cherche les objets `XXX_ROUTES`, pas les fichiers nommes `*.routes.ts`.
 *
 * Le filtre precedent portait sur le nom du fichier : les contacts declarent
 * `CONTACT_ROUTES` dans `contact.constants.ts`, et leurs quatre routes
 * n'etaient donc pas comptees. On suit desormais le nom de la constante —
 * `*_ROUTES` ou `*_API`, les deux conventions du projet.
 * n'etaient donc pas comptees. La convention du projet est le nom de la
 * constante, pas celui du fichier — c'est elle qu'on suit.
 */
const routeByName = new Map();
const entryRe = /(\w+)\s*:\s*(?:\([^)]*\)\s*=>\s*)?[`']([^`']*)[`']/g;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const declRe = /[A-Za-z0-9_]*(?:ROUTES|API)\s*(?::[^=]*)?=\s*\{/g;
  let decl;
  while ((decl = declRe.exec(src))) {
    // Bloc equilibre : une route peut contenir des accolades d'interpolation.
    let depth = 0;
    let end = decl.index + decl[0].length - 1;
    for (let i = end; i < src.length; i += 1) {
      if (src[i] === '{') depth += 1;
      else if (src[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const block = src.slice(decl.index, end + 1);
    entryRe.lastIndex = 0;
    let m;
    while ((m = entryRe.exec(block))) {
      const [, name, raw] = m;
      if (!raw.startsWith('/')) continue;
      routeByName.set(name, raw.replace(/\$\{[^}]*\}/g, ':id'));
    }
  }
}

/**
 * Chemins connus du front.
 *
 * On prend les constantes de route declarees par les features. C'est la
 * surface d'API que le front sait adresser.
 *
 * Limite assumee, ecrite aussi dans la page : une constante declaree mais
 * jamais appelee compte comme couverte. Resoudre l'appel reel demandait
 * d'interpreter l'expression passee a `api.<verbe>(...)` — concatenations,
 * gabarits, constantes composees — et produisait des chemins faux. Mieux vaut
 * une regle simple et exacte qu'une regle fine et fausse.
 */
const consumed = new Map();

for (const [name, pattern] of routeByName) {
  const key = normalise(pattern);
  const bucket = consumed.get(key) ?? new Set();
  bucket.add(name);
  consumed.set(key, bucket);
}

/**
 * Parcours a suivre dans le front pour declencher chaque appel.
 *
 * Ecrit a la main, et c'est voulu : aucun code ne dit par quel chemin
 * d'interface on atteint une route. La cle est `METHODE /chemin` — un meme
 * chemin sert plusieurs verbes, qui se declenchent depuis des endroits
 * differents.
 *
 * `auto` marque les appels qu'aucun geste ne declenche directement : ils
 * partent du chargement d'un ecran ou de l'intercepteur.
 */
const STEPS_RAW = {
  // ── Authentification et compte
  'POST /auth/login': ['Écran de connexion', 'Saisir e-mail et mot de passe', 'Se connecter'],
  'POST /auth/refresh': { auto: true, steps: ['Intercepteur, sur un 401 TOKEN_EXPIRED — jamais déclenché à la main'] },
  'POST /auth/logout': ['Pied du rail', 'Menu du compte', 'Se déconnecter'],
  'POST /auth/activation/validate': { auto: true, steps: ['Ouvrir le lien d’activation reçu par e-mail (/activate?token=)'] },
  'POST /auth/activation/complete': ['Écran d’activation', 'Choisir un mot de passe', 'Activer le compte'],
  'POST /auth/password-reset/request': ['Écran de connexion', 'Mot de passe oublié', 'Saisir l’e-mail', 'Envoyer'],
  'POST /auth/password-reset/validate': { auto: true, steps: ['Ouvrir le lien reçu par e-mail (/reset?token=)'] },
  'POST /auth/password-reset/complete': ['Écran de réinitialisation', 'Choisir un mot de passe', 'Valider'],
  'POST /auth/email-change/request': ['Mon profil', 'Informations d’accès', 'Modifier l’email', 'Saisir la nouvelle adresse et le mot de passe'],
  'POST /auth/email-change/confirm': { auto: true, steps: ['Ouvrir le lien de confirmation reçu par e-mail (/email-change?token=)'] },

  // ── Profil
  'GET /profile/me': { auto: true, steps: ['Chargé après la connexion, puis à chaque montage de l’application'] },
  'PATCH /profile': ['Mon profil', 'Informations personnelles', 'Modifier', 'Enregistrer'],
  'PATCH /profile/change-password': ['Mon profil', 'Sécurité', 'Modifier le mot de passe'],
  'PATCH /profile/avatar': ['Mon profil', 'Photo de profil', 'Modifier', 'Choisir une image'],
  'DELETE /profile/avatar': ['Mon profil', 'Photo de profil', 'Modifier', 'Supprimer'],

  // ── Projets (back-office)
  'GET /projects': ['Menu Projets'],
  'GET /projects/:id': ['Menu Projets', 'Ouvrir un projet'],

  // ── Utilisateurs du projet
  'GET /users': ['Ouvrir un projet', 'Administration', 'Utilisateurs'],
  'POST /users': ['Utilisateurs', 'Nouvel utilisateur', 'Renseigner nom, e-mail, initiales et rôle', 'Créer'],
  'GET /users/:id': ['Utilisateurs', 'Icône œil d’une ligne'],
  'PATCH /users/:id': ['Fiche utilisateur', 'Modifier', 'Enregistrer'],
  'DELETE /users/:id': ['Fiche utilisateur', 'Retrait du projet', 'Retirer du projet'],
  'POST /users/:id/resend-activation': ['Fiche d’un compte en attente', 'Renvoyer l’invitation'],
  'GET /roles': { auto: true, steps: ['Alimente les sélecteurs de rôle : filtre de la liste, création et modification'] },

  // ── Comptes back-office
  'GET /backoffice/users': ['Menu Opérateurs'],
  'POST /backoffice/users': ['Opérateurs', 'Nouvel opérateur'],
  'GET /backoffice/users/:id': ['Opérateurs', 'Icône œil d’une ligne'],
  'PATCH /backoffice/users/:id': ['Fiche opérateur', 'Modifier'],
  'DELETE /backoffice/users/:id': ['Fiche opérateur', 'Supprimer'],
  'GET /backoffice/roles': { auto: true, steps: ['Alimente le sélecteur de rôle des opérateurs'] },

  // ── Réglages, documents, référentiels
  'GET /settings': ['Ouvrir un projet', 'Administration', 'Paramètres'],
  'PATCH /settings': ['Paramètres', 'Société ou Règles commerciales', 'Enregistrer'],
  'GET /settings/documents': ['Paramètres', 'Documents et numérotation'],
  'POST /settings/documents/:type': ['Paramètres', 'Documents et numérotation', 'Déposer un gabarit'],
  'GET /settings/documents/:type/preview': ['Paramètres', 'Documents et numérotation', 'Aperçu d’un gabarit'],
  'POST /settings/signature-image': ['Paramètres', 'Documents et numérotation', 'Déposer un cachet'],
  'DELETE /settings/signature-image': ['Paramètres', 'Documents et numérotation', 'Supprimer le cachet'],
  'GET /reference-items': ['Paramètres', 'Référentiels'],
  'POST /reference-items': ['Référentiels', 'Choisir une catégorie', 'Ajouter une valeur'],
  'PATCH /reference-items/:id': ['Référentiels', 'Renommer une valeur, la désactiver, ou la glisser pour changer son ordre'],
  'DELETE /reference-items/:id': ['Référentiels', 'Supprimer une valeur inutilisée'],
  'GET /files/:fileId/download': ['Paramètres', 'Documents et numérotation', 'Télécharger un gabarit ou le cachet'],

  // ── Organismes (L1)
  'GET /organizations': ['Ouvrir un projet', 'Prospection', 'Organismes'],
  'GET /organizations/:id': ['Organismes', 'Icône œil d’une ligne — la fiche ouverte est aussi adressable par `?fiche=<id>`'],
  'PATCH /organizations/:id': ['Panneau d’un organisme', 'Modifier un champ', 'Enregistrer les modifications'],
  'POST /projects': { todo: true, steps: ['Route déclarée, sans écran : la création de projet reste à développer'] },
  'PATCH /projects/:id': { todo: true, steps: ['Route déclarée, sans écran : la modification de projet reste à développer'] },
  'POST /organizations': ['Organismes', 'Nouvel organisme', 'Saisie manuelle', 'Renseigner nom, type et département', 'Créer la fiche'],
  'DELETE /organizations/:id': ['Panneau d’un organisme', 'Bas de la fiche, « Supprimer la fiche »', 'Confirmer dans la fenêtre'],
  'GET /organizations/:id/contacts': ['Panneau d’un organisme', 'Onglet « Contacts »'],
  'POST /organizations/:id/contacts': ['Onglet « Contacts »', 'Ajouter un contact', 'Renseigner prénom et nom', 'Créer le contact'],
  'PATCH /contacts/:id': ['Onglet « Contacts »', 'Modifier sur une ligne', 'Enregistrer'],
  'DELETE /contacts/:id': ['Onglet « Contacts »', 'Supprimer sur une ligne', 'Confirmer — si des actions le référencent, « Ne pas démarcher » est proposé à la place'],
  'GET /organizations/search-registry': ['Organismes', 'Nouvel organisme', 'Recherche officielle', 'Saisir un nom ou un SIRET (3 caractères minimum)', 'Rechercher'],
};

/** Les cles sont ecrites avec le nom reel du parametre (`:fileId`, `:type`) ;
 *  le rapprochement, lui, normalise tout en `:id`. On aligne ici, sinon ces
 *  entrees ne seraient jamais trouvees. */
const STEPS = Object.fromEntries(
  Object.entries(STEPS_RAW).map(([key, v]) => {
    const [method, path] = key.split(' ');
    return [`${method} ${normalise(path)}`, v];
  }),
);

// ── Rendu ──────────────────────────────────────────────────────────────────

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let total = 0;
let covered = 0;

const isConsumed = (r) => consumed.has(normalise(r.url));

const rowHtml = (r) => {
  total += 1;
  const where = consumed.get(normalise(r.url));
  if (where) covered += 1;
  const names = where ? [...where].join(', ') : '';
  const entry = STEPS[`${r.method} ${normalise(r.url)}`];
  const list = Array.isArray(entry) ? entry : entry?.steps;
  const kind = Array.isArray(entry) ? 'manuel' : entry?.auto ? 'auto' : entry?.todo ? 'todo' : null;

  return `        <tr>
          <td><span class="m ${r.method}">${r.method}</span></td>
          <td class="u">${esc(r.url)}</td>
          <td class="p">${esc(r.permission)}</td>
          <td class="s">${esc(r.status)}</td>
          <td class="f">${
            where
              ? `<span class="tag yes">déclarée</span><span class="src" title="${esc(names)}">${esc(names)}</span>`
              : '<span class="tag no">absente du front</span>'
          }</td>
          <td class="how">${
            list
              ? (kind === 'auto'
                  ? '<span class="tag auto">automatique</span>'
                  : kind === 'todo'
                    ? '<span class="tag no">à développer</span>'
                    : '') +
                (kind === 'manuel'
                  ? `<ol>${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`
                  : `<p>${esc(list.join(' '))}</p>`)
              : where
                ? '<span class="tag no">parcours à documenter</span>'
                : '<span class="none">—</span>'
          }</td>
        </tr>`;
};

const storyHtml = (us) => {
  const done = us.rows.filter(isConsumed).length;
  const state = done === 0 ? 'no' : done === us.rows.length ? 'yes' : 'part';
  return `    <article class="us">
      <h3>
        <span class="us-id">${esc(us.id)}</span>
        <span class="us-title">${esc(us.title)}</span>
        <span class="api-state">${esc(us.status)}</span>
        <span class="tag ${state}">${done} / ${us.rows.length} côté front</span>
      </h3>
      <div class="wrap"><table>
        <thead><tr><th>Méthode</th><th>Route</th><th>Accès</th><th>API</th><th>Front</th><th>Parcours dans le front</th></tr></thead>
        <tbody>
${us.rows.map(rowHtml).join(NL)}
        </tbody>
      </table></div>
    </article>`;
};

const body = lots
  .filter((l) => l.stories.some((u) => u.rows.length))
  .map((lot) => {
    const rows = lot.stories.flatMap((u) => u.rows);
    const done = rows.filter(isConsumed).length;
    return `<section>
  <h2>${esc(lot.title)} <span class="count">${done} / ${rows.length} routes côté front · ${lot.stories.length} US</span></h2>
${lot.stories
  .filter((u) => u.rows.length)
  .map(storyHtml)
  .join(NL)}
</section>`;
  })
  .join(NL);

/**
 * Appels du front qu'aucune route de l'inventaire ne reconnait.
 *
 * C'est le controle le plus utile du document : il attrape les routes
 * heritees de soft-m qui n'existent pas dans cette API. Le front appelait
 * ainsi `PATCH /users/:id/email` — l'ecran repondait 404 sans que rien ne le
 * signale.
 */
const known = new Set(
  sections.flatMap((s) => s.rows.map((r) => normalise(r.url))),
);
/**
 * Les fichiers de constantes melangent deux choses : les chemins d'API et les
 * chemins de navigation de react-router. On ne retient ici que les premiers —
 * un `/users/:id/informations` est un ecran, pas une route serveur, et le
 * signaler comme manquant a l'inventaire n'aurait aucun sens.
 */
const routerPaths = new Set(
  [...routeByName.entries()]
    .filter(([, pattern]) =>
      readFileSync('src/routing/app-routing-setup.tsx', 'utf8').includes(
        `"${pattern.replace(/:id/g, '')}`.slice(0, 12),
      ),
    )
    .map(([, pattern]) => normalise(pattern)),
);

const isScreen = (key) =>
  key.endsWith('/informations') ||
  key.startsWith('/backoffice-users') ||
  key === '/:id/dashboard' ||
  key === '/auth/reset-password/request' ||
  routerPaths.has(key);

const orphans = [...consumed.entries()]
  .filter(([key]) => !known.has(key) && !isScreen(key))
  .map(([key, files]) => ({ key, files: [...files] }))
  .sort((a, b) => a.key.localeCompare(b.key));

const orphanSection = orphans.length
  ? `<section>
  <h2>Déclarées par le front, absentes de l'inventaire <span class="count">${orphans.length}</span></h2>
  <p class="lede" style="margin:0 0 4px">Ces chemins n'existent dans aucune route de l'API. Les chemins de navigation ont été écartés.</p>
  <div class="wrap"><table>
    <thead><tr><th>Appel</th><th>Déclaré dans</th></tr></thead>
    <tbody>
${orphans
  .map(
    (o) => `      <tr><td class="u">${esc(o.key)}</td><td class="p">${esc(
      o.files.join(', '),
    )}</td></tr>`,
  )
  .join(NL)}
    </tbody>
  </table></div>
</section>`
  : '';

const page = `<title>Couverture API par le front</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
  :root {
    --bg:#F6F9FB; --surface:#FFFFFF; --ink:#14232E; --muted:#5A7184; --line:#D9E4EC;
    --accent:#0369A1; --yes:#147A46; --yes-soft:#E2F3E9; --no:#64748B; --no-soft:#EDF1F5;
    --GET:#0369A1; --POST:#147A46; --PATCH:#B45309; --PUT:#B45309; --DELETE:#B3261E;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg:#0E181F; --surface:#15222B; --ink:#E3EDF4; --muted:#8FA6B5; --line:#253842;
      --accent:#4FA8D8; --yes:#4CC38A; --yes-soft:#10331F; --no:#8FA6B5; --no-soft:#22313C;
      --GET:#4FA8D8; --POST:#4CC38A; --PATCH:#E8A254; --PUT:#E8A254; --DELETE:#E5736C;
    }
  }
  :root[data-theme="dark"] {
    --bg:#0E181F; --surface:#15222B; --ink:#E3EDF4; --muted:#8FA6B5; --line:#253842;
    --accent:#4FA8D8; --yes:#4CC38A; --yes-soft:#10331F; --no:#8FA6B5; --no-soft:#22313C;
    --GET:#4FA8D8; --POST:#4CC38A; --PATCH:#E8A254; --PUT:#E8A254; --DELETE:#E5736C;
  }
  body{background:var(--bg);color:var(--ink);font-family:'Plus Jakarta Sans',system-ui,sans-serif;line-height:1.55}
  .page{max-width:1080px;margin:0 auto;padding:48px 24px 80px;display:flex;flex-direction:column;gap:36px}
  h1{margin:0;font-size:30px;font-weight:800;letter-spacing:-.02em}
  .lede{margin:0;max-width:70ch;color:var(--muted)}
  .kpi{display:flex;gap:12px;flex-wrap:wrap}
  .kpi div{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 18px;min-width:150px}
  .kpi b{display:block;font-size:26px;font-weight:800}
  .kpi span{font-size:12px;color:var(--muted)}
  section{display:flex;flex-direction:column;gap:18px}
  .us{display:flex;flex-direction:column;gap:8px}
  h3{margin:0;font-size:14px;font-weight:700;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .us-id{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;color:var(--accent);background:var(--yes-soft);background:color-mix(in srgb,var(--accent) 12%,transparent);padding:2px 8px;border-radius:6px}
  .us-title{font-weight:600}
  .api-state{font-size:11.5px;font-weight:600;color:var(--muted)}
  .tag.part{background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}
  h2{margin:0 0 2px;font-size:19px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
  .count{font-size:12px;font-weight:600;color:var(--muted)}
  .wrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
  table{border-collapse:collapse;width:100%;min-width:900px;font-size:13px}
  th{text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:10px 14px;border-bottom:1px solid var(--line);font-weight:700}
  td{padding:9px 14px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:0}
  .u{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12.5px}
  .p,.s{color:var(--muted);font-size:12.5px}
  .m{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:2px 7px;border-radius:5px;border:1px solid currentColor}
  .m.GET{color:var(--GET)} .m.POST{color:var(--POST)} .m.PATCH{color:var(--PATCH)}
  .m.PUT{color:var(--PUT)} .m.DELETE{color:var(--DELETE)}
  .tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px}
  .tag.yes{background:var(--yes-soft);color:var(--yes)}
  .tag.no{background:var(--no-soft);color:var(--no)}
  .how{max-width:300px}
  .how ol{margin:0;padding-left:18px;font-size:12px;color:var(--muted);display:flex;flex-direction:column;gap:2px}
  .how li{padding-left:2px}
  .how p{margin:4px 0 0;font-size:12px;color:var(--muted)}
  .how .none{color:var(--muted);opacity:.5}
  .tag.auto{background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}
  .src{display:block;margin-top:3px;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--muted);max-width:34ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  footer{border-top:1px solid var(--line);padding-top:18px;font-size:12.5px;color:var(--muted)}
</style>

<div class="page">
  <header style="display:flex;flex-direction:column;gap:14px">
    <h1>Couverture API par le front</h1>
    <p class="lede">
      Les routes de <code>INVENTAIRE-API.html</code>, augmentées de ce que le
      front consomme réellement. La colonne <b>API</b> dit si la route existe,
      la colonne <b>Front</b> si un service l'appelle.
    </p>
    <div class="kpi">
      <div><b>${total}</b><span>routes inventoriées</span></div>
      <div><b>${covered}</b><span>consommées par le front</span></div>
      <div><b>${total - covered}</b><span>non consommées</span></div>
      <div><b>${Math.round((covered / total) * 100)}%</b><span>de couverture</span></div>
    </div>
  </header>

${body}
${orphanSection}

  <footer>
    <p>Généré par <code>npm run api:coverage</code> — ne pas éditer à la main.
    Source des routes : <code>${esc(INVENTORY)}</code>. La couverture est déduite
    des appels <code>api.get/post/patch/delete</code> des services, pas d'une
    liste tenue à la main : une route déclarée mais jamais appelée compte comme
    non consommée.</p>
  </footer>
</div>
`;

writeFileSync(OUT, page);
console.log(
  `${OUT} — ${covered}/${total} route(s) consommée(s) par le front (${Math.round((covered / total) * 100)} %).`,
);
if (orphans.length) {
  console.log(
    `${orphans.length} appel(s) du front absent(s) de l'inventaire :

` +
      orphans.map((o) => `  ${o.key}`).join(NL),
  );
}
