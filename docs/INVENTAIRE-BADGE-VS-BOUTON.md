# Inventaire — écart entre l'existant et la règle « pastille ≠ bouton »

> Relevé le 04/09/2026 sur `src/`, branche `feat/suivi-prospection`.
> Règle de référence : `docs/REGLE-BADGE-VS-BOUTON.md`.
> Méthode : lecture du code (`Badge`, `Button`, classes utilitaires), pas
> d'extrapolation. Chaque ligne citée a été ouverte.

---

## Résumé

| Article de la règle | État | Portée de l'écart |
|---|---|---|
| **1. La forme sépare** (pilule vs rectangle) | **non appliqué partout** | 23 fichiers, ~40 pastilles — aucune n'est en pilule, aucune ne porte de point |
| **2. Pas de fond pastel sur un bouton** | **déjà respecté** | 0 bouton pastel trouvé ; en revanche 5 aplats rouges pleins hors confirmation |
| **3. Actions détachées du contenu** | **non appliqué** | 14 barres d'actions, aucune séparée par un filet |

La bonne nouvelle : **le défaut le plus grave (un bouton déguisé en pastille)
n'existe pas dans l'application.** Il n'existait que dans la maquette. L'écart
réel est ailleurs, et il est plus mécanique que grave.

---

## Article 1 — la forme ne sépare rien aujourd'hui

### Le constat

Sur les 23 fichiers qui affichent une pastille, **aucun** n'utilise
`shape="circle"` et **aucun** n'utilise `BadgeDot`. Toutes les pastilles sont
donc des rectangles `rounded-md` (6 px) de 24 px de haut.

En face, un bouton secondaire de ligne (`Button variant="outline" size="sm"`)
est un rectangle de 7 px de rayon et 28 px de haut, bordé lui aussi. **Un
pixel de rayon et quatre pixels de haut séparent les deux familles.** Seul le
remplissage diffère : pastel d'un côté, blanc de l'autre. C'est exactement ce
que la règle interdit de laisser porter par la couleur seule.

### Détail — où sont les pastilles

Les points d'entrée, par ordre de portée :

| Emplacement | Pastilles | Remarque |
|---|---|---|
| `src/components/shared/StatusBadge.tsx` | 2 | **Levier le plus fort** : irrigue 5 écrans (utilisateurs back-office ×2, projets ×2, utilisateurs) |
| `src/features/organization/components/organizationColumns.tsx:158,178,197` | 3 | statut commercial, statut client, priorité — la colonne la plus lue de l'application |
| `src/features/organization/components/OrganizationPanel.tsx:143,149,159,167` | 4 | en-tête de fiche |
| `src/features/activity/components/OrganizationActivitiesTab.tsx:193,201` | 2 | frise des actions — l'écran de la capture d'origine |
| `src/features/organization/components/BoardCard.tsx:168,181` | 2 | carte kanban (lot en cours) |
| `src/features/organization/components/OrganizationContactsTab.tsx:121,126,132` | 3 | contacts |
| `src/features/settings/components/panes/ScopesPane.tsx` | 5 | périmètres |
| `src/features/campaign/…` (3 fichiers) | 3 | campagnes |
| `src/features/activity/components/AgendaList.tsx:88` | 1 | horizon d'urgence |
| `src/features/organization/components/ProspectionScreen.tsx:225` | 1 | compteur de colonne — **cas particulier, voir plus bas** |
| `src/features/errors/…` (3 fichiers) | 4 | écrans d'erreur |
| `src/components/ui/data-grid-column-filter.tsx`, `multi-select-combobox.tsx` | 4 | composants techniques, hors charte métier |

### Une contradiction déjà présente dans le code

`src/features/project/components/project-details/skeleton/ProjectInformationsTabSkeleton.tsx:37-40`
dessine les pastilles de chargement en `h-6 w-28 rounded-full` — **en pilule.**
Le squelette anticipe déjà la forme que la règle demande ; c'est la pastille
réelle qui ne suit pas. À l'affichage, la forme change entre le chargement et
le contenu.

---

## Article 2 — respecté sur le fond, à ajuster sur un point

### Ce qui est conforme

Aucun `Button` ne porte de fond pastel au repos. Les recherches sur
`bg-*-50`, `bg-*-100`, `bg-destructive/10` et `bg-[var(--color-*-soft)]`
appliqués à un bouton ne remontent rien. Aucune pastille n'est cliquable :
zéro `onClick` sur un `Badge`, zéro `BadgeButton` en dehors du composant.

### Ce qui s'écarte : l'aplat rouge plein hors confirmation

La règle réserve `variant="destructive"` (aplat rouge saturé) au bouton de
confirmation d'une boîte de dialogue. Six emplacements le respectent —
`ActivityConfirmWindow:75`, `CampaignDeleteDialog:140`, `DeleteContactWindow:97`,
`DeleteOrganizationWindow:64`, `DeleteScopeWindow:75`, `DeleteUserFooter:43`.

Cinq s'en écartent :

| Emplacement | Contexte | Sévérité |
|---|---|---|
| `OrganizationContactsTab.tsx:168` | « Supprimer » de ligne, ouvre une confirmation | **à aligner** — un aplat rouge par ligne de contact crie plus fort que le contenu |
| `ScopesPane.tsx:165` | « Supprimer » de ligne, ouvre une confirmation | **à aligner** — même motif |
| `OrganizationSummaryTab.tsx:460` | carte « zone dangereuse » dédiée | **à trancher** |
| `UserDeleteCard.tsx:26` | carte « zone dangereuse » dédiée | **à trancher** |
| `BackofficeUserInformationsPage.tsx:94` | « Suspendre », en-tête de page | **à trancher** |

Les trois derniers relèvent du motif reconnu de la « zone dangereuse » : un
encart isolé dont l'aplat rouge est le sujet même. On peut légitimement les
sortir de la règle — mais il faut l'écrire, sinon le prochain développement
tranchera au hasard.

---

## Article 3 — les actions ne sont jamais détachées

14 barres d'actions dans `src/features` ; **aucune** n'est séparée du contenu
par un filet. Le cas typique, celui de la capture :

`src/features/activity/components/OrganizationActivitiesTab.tsx:227`
```tsx
<div className="mt-3 flex flex-wrap gap-2">
```

12 px d'écart, rien d'autre. Même motif dans `OrganizationContactsTab`,
`ScopesPane`, `CampaignsScreen`.

---

## Deux exceptions que l'inventaire a fait apparaître

La règle ne les prévoyait pas. Elles doivent y être ajoutées, sinon elles
seront lues comme des infractions :

1. **Le bouton-icône circulaire.** `UserAvatar.tsx:52` est un `rounded-full`
   cliquable — un rond de 40 px portant une seule icône, sans libellé. Ce
   n'est pas une pilule : une pilule est allongée et porte du texte. À
   autoriser explicitement.
2. **Les ronds décoratifs et les compteurs.** Avatars, pastilles de jour dans
   `AgendaMonth.tsx:71`, barre de progression de `CampaignsScreen.tsx:250`,
   compteur de colonne de `ProspectionScreen.tsx:225` : des ronds qui ne sont
   ni une étiquette d'état, ni une action. Hors périmètre de la règle.

---

## Plan d'alignement proposé, par effet de levier

| # | Geste | Fichiers touchés | Écrans corrigés |
|---|---|---|---|
| 1 | Passer `Badge` en pilule **par défaut** (`shape: 'circle'` comme valeur par défaut de la variante) | 1 | **les 23**, d'un coup |
| 2 | Ajouter le point de couleur au `Badge` métier (via `StatusBadge` et les pastilles de statut) | 1 à 3 | les écrans de statut |
| 3 | Créer un `Button` « destructif secondaire » (blanc, libellé rouge, pastel au survol) et l'appliquer aux 2 « Supprimer » de ligne | 3 | contacts, périmètres |
| 4 | Ajouter le filet au-dessus des barres d'actions des cartes et frises | 4 à 6 | actions, contacts, périmètres, campagnes |
| 5 | Aligner le squelette `rounded-full` déjà en place — rien à faire s'il on fait le geste 1 | 0 | — |

Le geste 1 seul referme l'essentiel de l'écart de l'article 1 pour un seul
fichier modifié. Les gestes 3 et 4 sont du travail à la main, écran par écran.

**Rien n'a été modifié.** Ce document est un état des lieux ; l'ordre
d'exécution et l'arbitrage sur les « zones dangereuses » restent à valider.
