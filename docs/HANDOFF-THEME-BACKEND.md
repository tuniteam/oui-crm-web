# Handoff — Charte OUI-CRM à répercuter dans `oui-crm-api`

**Émetteur :** `oui-crm-web` · **Destinataire :** `oui-crm-api` · **Date :** 2026-08-31

Le front a changé de charte. Ce document liste les valeurs à appliquer côté API.
**Aucune modification n'a été faite dans `oui-crm-api`** — l'application est à la
main de l'équipe backend.

---

## 1. Pourquoi

La charte OUI-CRM reprenait la teinte de marque de Periscolia (`#5a45d6`, teinte
249°) avec `#6C5CE7`, teinte 247° : **2° d'écart**, soit le même violet. La
typographie était elle aussi identique (Inter des deux côtés).

Deux décisions ont été prises :

- **Teinte de marque : azur `#0369A1`** (teinte 201°, 48° d'écart avec Periscolia)
- **Typographie : Plus Jakarta Sans** pour l'interface, **IBM Plex Mono** pour les
  données alignées

Un troisième défaut, structurel, a été corrigé côté front et doit l'être côté API :
les couleurs sémantiques (erreur, alerte, succès, info) étaient des **alias des
accents de marque**. Conséquence mécanique : les quatre échouaient au seuil de
contraste WCAG AA. Une couleur d'état doit avoir sa propre valeur, indépendante
de la charte.

---

## 2. `src/mail/mail.constants.ts` → `EMAIL_THEME`

Trois valeurs à changer. Le reste est déjà aligné sur la grille de gris du front
et ne bouge pas.

| Clé | Actuel | Nouveau | Note |
|---|---|---|---|
| `colorPrimary` | `#2563EB` | `#0369A1` | Teinte de marque. Contraste 5.93 sur blanc (AA) |
| `colorWarning` | `#DC2626` | `#B45309` | `#DC2626` est la couleur d'**erreur**, pas d'alerte. Contraste 5.02 |
| `colorBorder` | `#E2E8F0` | `#DEE2E6` | Aligne sur `--gray-300` du front |
| `fontStack` | Inter | voir §3 | |

Inchangés et corrects : `colorText: #333333`, `colorTextMuted: #6C757D`,
`colorBgPage: #F8F9FA`, `displayLinkMaxLength: 60`.

### Valeur cible

```ts
export const EMAIL_THEME = {
  fontStack: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
  fontImportUrl:
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  colorPrimary: '#0369A1',
  colorText: '#333333',
  colorTextMuted: '#6C757D',
  colorBorder: '#DEE2E6',
  colorBgPage: '#F8F9FA',
  colorWarning: '#B45309',
  displayLinkMaxLength: 60,
} as const;
```

### Réserve importante sur la police en e-mail

Outlook et l'application Gmail **ignorent les webfonts**. Le `fontImportUrl` ne
sert que les clients qui les acceptent ; la majorité des destinataires verra la
**pile de repli**. C'est elle qu'il faut soigner, et elle est volontairement
conservatrice ci-dessus. Ne pas retirer les polices système de la liste.

---

## 3. Template PDF de facture

Le front expose des tokens de facture annotés « mirrors the values used by the
back PDF template » (`src/styles/theme.oui-crm.css`). Ils ont été mis à jour :

| Token | Actuel | Nouveau |
|---|---|---|
| `--invoice-header-bg` | `#6C5CE7` | `#0369A1` |
| `--invoice-accent` | `#6C5CE7` | `#0369A1` |

Le template PDF côté API doit suivre, sinon l'aperçu front et le PDF généré
divergeront. Les autres tokens de facture (`--invoice-text: #333333`,
`--invoice-text-muted: #6C757D`, `--invoice-off: #F8F9FA`,
`--invoice-amber: #FDCB6E`) sont inchangés.

---

## 4. Couleurs d'état, si l'API en produit

Si des couleurs d'état sont générées côté API (badges dans les e-mails, exports,
documents), utiliser ces valeurs et **non** les accents de marque :

| Rôle | Valeur | Contraste sur blanc |
|---|---|---|
| `success` | `#047857` | 5.48 ✅ |
| `info` | `#0F766E` | 5.47 ✅ |
| `warning` | `#B45309` | 5.02 ✅ |
| `destructive` | `#DC2626` | 4.83 ✅ |

Les anciennes teintes (`#00B894`, `#54A0FF`, `#FDCB6E`, `#FF6B6B`) restent
valides **en fond de pastille avec du texte foncé**, jamais en couleur de texte,
d'icône ou de fond de bouton : elles plafonnent entre 1.51 et 2.78 de contraste.

---

## 5. Palette de référence

```
Marque
  primaire         #0369A1   azur, teinte 201°
  primaire foncée  #075985   survol / état pressé
  primaire douce   #E0F2FE   fond de pastille

Accents (inchangés)
  rose             #FF6B6B
  ambre            #FDCB6E
  crème            #FEF3C7

Gris (inchangés)
  900 #1A1A1A · 800 #333333 · 700 #495057 · 600 #6C757D
  500 #ADB5BD · 400 #CED4DA · 300 #DEE2E6 · 200 #E9ECEF · 100 #F8F9FA
```

Source de vérité : `src/styles/theme.oui-crm.css` dans `oui-crm-web`.

---

## 6. Checklist d'application

- [ ] `EMAIL_THEME` : `colorPrimary`, `colorWarning`, `colorBorder`, `fontStack`, `fontImportUrl`
- [ ] Template PDF de facture : en-tête et accent en `#0369A1`
- [ ] Couleurs d'état découplées des accents de marque, si applicable
- [ ] Vérifier le rendu d'un e-mail d'activation dans Mailpit après changement
- [ ] Vérifier qu'une facture générée correspond à l'aperçu du front

Contrastes calculés selon WCAG 2.1, texte sur fond blanc.
