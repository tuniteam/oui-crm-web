# Revue du thème — pourquoi l'application est plus terne que la maquette

> Relevé le 04/09/2026 dans le navigateur (fiche « CC du Pays de Château-Gontier »,
> liste des organismes), pas sur lecture de CSS. Comparaison avec `docs/OuiCRM_V8.html`.

---

## Le constat

Ce n'est pas une question de goût des couleurs : **les couleurs du thème
n'arrivent pas jusqu'aux composants.** Trois causes se cumulent, de la plus
mécanique à la plus conceptuelle.

### 1. Les jetons que les composants réclament n'existent pas

`Badge` demande `--color-<variante>-soft` et `--color-<variante>-accent`, avec
un repli sur les échelles génériques de Tailwind. Relevé sur
`document.documentElement` :

| Jeton demandé par le composant | Valeur résolue |
|---|---|
| `--color-primary-soft` · `--color-primary-accent` | **absent** |
| `--color-success-soft` · `--color-success-accent` | **absent** |
| `--color-info` · `-soft` · `-accent` | **absent** (les trois) |
| `--color-warning-soft` · `--color-warning-accent` | **absent** |
| `--color-destructive` · `-soft` · `-accent` | **absent** (les trois) |

Le bloc `@theme` de `globals.css` ne remonte que `--color-primary`,
`--color-success`, `--color-warning` et leurs `-foreground`. Tout le reste
retombe sur Tailwind.

**Ce que ça donne à l'écran**, mesuré sur la fiche :

| Pastille | Couleur rendue | Attendu |
|---|---|---|
| « Réalisée » | `oklch(0.488 0.243 264.376)` = **blue-700** sur blue-50 | vert |
| « Normale » | blue-700 sur blue-50 | selon la priorité |
| « En cours de prospection » | `#333` sur `#F8F9FA`, **sans bordure** | couleur de marque |
| « Non client », « Planifiée », « Non intéressé » | le même gris, toutes | trois couleurs différentes |

Conséquences concrètes :

- **L'azur n'atteint aucune pastille.** `--brand-primary: #0369A1` est bien
  défini, mais les pastilles « primary » sortent en `#1d4ed8`, le bleu par
  défaut de Tailwind. Deux bleus cohabitent donc à l'écran sans que personne
  ne l'ait décidé.
- **La variante `info` sortirait en violet** : son repli est
  `--color-violet-700`. C'est exactement la couleur Periscolia qu'on a retirée
  du thème — elle rentre par la porte de derrière.
- `--success-soft`, `--info-soft`, `--warning-soft`, `--destructive-soft` sont
  définis dans `theme.oui-crm.css` et **ne servent à rien** : aucun composant
  ne les lit sous ce nom.

### 2. Aucune table « vocabulaire métier → couleur »

Les variantes sont écrites en dur, composant par composant, et le choix ne
suit pas le sens :

```tsx
// OrganizationActivitiesTab.tsx
variant={a.status === 'DONE' ? 'primary' : 'secondary'}
// OrganizationPanel.tsx — statut commercial, statut client, étiquettes
<Badge variant="secondary" appearance="outline">
```

« Réalisée » est donc de la couleur de marque au lieu du vert, et le statut
commercial — l'information la plus structurante de la fiche — est gris.
`grep` ne trouve **aucune** table statut → couleur dans le projet.

La maquette, elle, en a une : `.tag.red`, `.tag.green`, `.tag.blue`,
`.tag.amber`, `.tag.purple`, chacune avec son triplet texte / fond / bordure.

### 3. La liste ne colore rien du tout

Sur `/organizations`, « En cours de prospection », « RDV programmé »,
« À contacter », « Clôturé » sont du **texte brut** dans une cellule. Priorité
(« Chaud »), étiquettes (« Marché public en cours », « À surveiller ») sont en
gris clair sous le nom. La maquette en fait des tags colorés.

C'est là que la différence de « peps » se joue le plus : un tableau de dix
lignes entièrement gris ne se lit pas en diagonale.

---

## Ce que la maquette fait et que nous ne faisons pas

Au-delà des couleurs, relevé sur la fiche d'organisme :

| Élément | Maquette | Nous |
|---|---|---|
| Pastilles d'en-tête | 4 tags colorés (statut, client, priorité, étiquette) | 3 tags gris |
| Onglets | « Contacts (2) », « Actions (3) » | sans compteur |
| Frise d'actions | pastille de couleur par action + rail vertical | cartes empilées, sans repère visuel |
| Statut d'action | « Planifiée » bleu, « Réalisée » vert, « RDV obtenu » vert | gris, bleu, gris |
| Bouton Supprimer | teinté rouge | contour neutre, comme « Modifier » |
| Bandeau prochaine action | ambre quand en retard | neutre en toutes circonstances |
| Rayon des cartes | `14px` | `8px` (`--radius: 0.5rem`) |
| Ombre | `0 10px 28px rgba(18,20,29,.07)` | plus serrée |

---

## État

**P1, P2 et P3 sont implémentés** (04/09/2026). P4 à P7 restent à faire.
Vérifié dans le navigateur : les pastilles résolvent bien les jetons du thème
— `#075985` sur `#E0F2FE` pour la marque, `#047857` sur `#D1FAE5` pour le
succès, `#0F766E` sur `#CCFBF1` pour l'information, `#92400E` sur `#FEF3C7`
pour l'alerte, `#B91C1C` sur `#FEE2E2` pour le danger. Plus aucun repli
Tailwind.

## Propositions

Classées par rapport effet / coût. Les trois premières sont, à mon sens, ce qui
change vraiment l'impression d'ensemble.

### P1 — Brancher les jetons manquants · **effet maximal, coût minimal**

Une trentaine de lignes dans `globals.css` et `theme.oui-crm.css`. Rien d'autre
à toucher : tous les `Badge` existants changent de couleur d'un coup, et l'azur
atteint enfin l'interface.

Il faut compléter le triplet de la maquette — **texte / fond / bordure** — que
notre thème n'a qu'à moitié (`--X` et `--X-soft`, sans le ton de texte lisible
ni la bordure) :

| Rôle | Texte (`-accent`) | Fond (`-soft`) | Contraste |
|---|---|---|---|
| Marque | `#075985` | `#E0F2FE` | 6,59:1 — AA |
| Succès | `#047857` | `#D1FAE5` | 4,84:1 — AA |
| Information | `#0F766E` | `#CCFBF1` | 4,86:1 — AA |
| Avertissement | `#92400E` | `#FEF3C7` | 6,37:1 — AA |
| Danger | `#B91C1C` | `#FEE2E2` | 5,30:1 — AA |

Toutes les paires passent AA en texte normal (calcul WCAG, pas à l'œil).

**Un arbitrage à trancher** : dans la maquette, la marque est violette et le
bleu sert d'information — les deux ne se confondent pas. Notre marque étant
azur, `info` en bleu entrerait en collision avec elle. D'où le **teal**
(`#0F766E`) ci-dessus, qui est déjà la valeur de `--info` dans le thème. À
valider : c'est le seul écart assumé avec la maquette.

### P2 — Une table « vocabulaire → couleur », unique et partagée

Un fichier de correspondance, sur le modèle des vocabulaires déjà repris de la
V8 en `as const` :

```ts
export const SALES_STATUS_TONE = {
  NOT_CONTACTED: 'secondary',
  TO_CONTACT:    'info',
  IN_PROGRESS:   'primary',
  MEETING_SCHEDULED: 'warning',
  WON:  'success',
  LOST: 'destructive',
} as const;
```

Et l'équivalent pour la priorité, le statut d'action, le résultat d'action.
Aujourd'hui chaque composant redécide seul, et se trompe : « Réalisée » en
couleur de marque plutôt qu'en vert.

Bénéfice au-delà de l'esthétique : la même valeur porte la même couleur
partout, dans la liste comme dans la fiche.

### P3 — Colorer la liste des organismes

Statut commercial et priorité en tags, avec la table de P2. C'est l'écran le
plus consulté, et le seul entièrement gris aujourd'hui.

### P4 — La frise d'actions

Pastille colorée par action et rail vertical, comme la maquette : la couleur
dit le statut avant qu'on lise le texte. Le bandeau « prochaine action » passe
en ambre quand elle est en retard — l'information existe déjà dans le code, on
ne l'exploite pas visuellement.

### P5 — Le bouton Supprimer

Teinte rouge légère plutôt qu'un contour neutre identique à « Modifier ». Les
jetons `--btn-destructive-*` existent déjà dans le thème et ne sont pas
utilisés à cet endroit.

### P6 — Rayon et ombre

`--radius` de `8px` à `12px`, et une ombre de carte plus diffuse. La maquette
est à `14px` ; `12px` me paraît un bon compromis avec la densité de nos
tableaux. À juger sur pièce plutôt que sur description.

### P7 — Compteurs dans les onglets

« Contacts (2) », « Actions (3) ». Pas une question de couleur, mais c'est de
l'information immédiate que la maquette donne et que nous perdons.

---

## Ce que je ne propose pas

- **Reprendre le violet de la maquette.** La charte est azur, décidée. Le
  problème n'est pas la teinte de marque, c'est qu'elle n'atteint pas les
  composants.
- **Saturer davantage.** Les fonds pastel de la maquette sont clairs
  (`#e8f6ee`, `#e8f4fc`) ; le manque de peps vient du gris uniforme, pas d'un
  manque de saturation.
- **Toucher au rail de navigation.** Il est déjà conforme et lisible.

---

## Ordre suggéré

P1 seul se voit immédiatement sur toute l'application et ne peut rien casser
d'autre que des couleurs. P2 et P3 se tiennent ensemble. P4 à P7 relèvent
du confort et peuvent attendre.

Aperçu visuel des paires proposées : `docs/revue-theme.html`, à ouvrir dans un
navigateur.
