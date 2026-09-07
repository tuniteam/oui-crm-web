# Règle de projet — ouvrir un élément d'une liste

> Établie le 06/09/2026, à partir de l'existant : quatre tables sur quatre
> suivaient déjà ce patron sans qu'il soit écrit. S'applique à **tout écran de
> OUI CRM**, existant ou à venir.

---

## Le problème que la règle traite

L'écran *Paramètres › Grille tarifaire* ouvrait une version en cliquant son
**numéro** dans la première cellule. Rien ne distinguait ce « v1 » cliquable du
« Commune » de la colonne voisine, qui ne l'est pas. **Tant qu'il faut passer la
souris pour savoir ce qui ouvre une ligne, l'écran est mal dessiné** — c'est le
même constat que `docs/REGLE-BADGE-VS-BOUTON.md`, appliqué aux listes.

---

## La règle

**Ouvrir un élément d'une liste passe toujours par la colonne « Actions »** :
dernière colonne, en-tête centré, un bouton-icône **œil** en `ghost` avec
infobulle.

- **Jamais un libellé cliquable dans une cellule.** Une valeur s'affiche ; elle
  ne s'actionne pas.
- **Jamais une ligne entière cliquable.** Elle devient ambiguë dès qu'elle porte
  autre chose — une case à cocher d'action groupée, un lien, un menu. La liste
  des organismes en porte deux.
- `ReusableTable` **n'expose pas** `onRowClick` : le choix est déjà tranché par
  l'outillage, s'en écarter demande de le contourner.

### Ce que ça donne dans le code

```tsx
{
  id: ACTIONS_COLUMN_ID,
  header: () => (
    <span className="flex w-full justify-center text-sm">{H.ACTIONS}</span>
  ),
  cell: ({ row }) => (
    <div className="flex items-center justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            mode="icon"
            variant="ghost"
            data-testid={`xxx-view-${row.original.id}`}
            onClick={() => open(row.original.id)}
          >
            <Eye />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{ACTIONS.VIEW}</TooltipContent>
      </Tooltip>
    </div>
  ),
}
```

`ACTIONS_COLUMN_ID` vit dans `src/constants/table.ts` — la colonne est reconnue
par le gestionnaire de colonnes, qui l'épingle et l'exclut du masquage.

---

## Portée

**Toute liste tabulaire**, y compris celles qui n'utilisent pas
`ReusableTable` : le tableau des versions tarifaires en est une, et il devait
s'y conformer comme les autres.

**Une liste de cartes n'est pas concernée.** Ses actions vivent dans la carte,
et la carte n'a pas de colonnes — les campagnes et le tableau de prospection
sont dans ce cas. La règle porte sur les tableaux, pas sur toute collection.

**Les actions autres que « ouvrir »** — modifier, supprimer, activer — vivent
dans la même colonne, à droite de l'œil, sous forme de boutons-icônes.
Au-delà de trois, elles passent dans un menu `⋯`.

---

## Contrôle avant de livrer un écran

1. Peut-on ouvrir un élément **sans** passer par la colonne Actions ? Si oui,
   c'est un défaut.
2. La colonne Actions est-elle la dernière, et son en-tête centré ?
3. Le bouton porte-t-il une infobulle ? Une icône seule ne se devine pas.

---

## Écrans conformes au 06/09/2026

Organismes, Utilisateurs, Projets, Comptes back-office, Grille tarifaire.

Hors périmètre, à dessein : Campagnes et Suivi de prospection, qui affichent des
cartes.
