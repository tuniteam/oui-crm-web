# Handoff API — libellés de rôles en anglais

**Destinataire :** projet `oui-crm-api`
**Origine :** revue de l'interface livrée, 2026-09-02
**Portée :** données de seed, pas de contrat — aucun changement de payload attendu

## Ce que voit l'utilisateur

L'application est intégralement en français. Deux écrans y affichent pourtant
des libellés anglais, et ce sont les seuls :

| Écran | Champ | Ce qui s'affiche |
|---|---|---|
| Utilisateurs (liste) | colonne **Rôle** | `Project administrator`, `Sales representative`, `Deployment consultant`, `Trainer` |
| Fiche utilisateur | champ **Rôle** | idem |
| Mon profil | **Rôle(s)** | `Platform administrator` |
| Opérateurs (liste et fiche) | colonne **Rôle** | idem, côté back-office |

## Pourquoi le front ne le corrige pas

Ces chaînes viennent telles quelles de l'API : `roleLabel` sur
`GET /users`, `GET /users/:id`, `GET /backoffice/users`, `GET /roles` et
`GET /profile/me`. Le front les rend sans transformation, ce qui est le
comportement voulu — la valeur est déjà décrite comme le libellé lisible du
rôle.

Traduire côté front supposerait une table `roleCode → libellé français`
maintenue en double du référentiel de rôles. Elle divergerait au premier rôle
ajouté, et ferait mentir `roleLabel`, qui n'aurait plus de raison d'exister.
La correction appartient à la source.

## Ce qui est demandé

Que `name` (ou le champ dont dérive `roleLabel`) soit renseigné en français
dans le seed des rôles, projet et back-office. À titre indicatif :

| `roleCode` | Libellé attendu |
|---|---|
| `SUPER_ADMIN` | Administrateur de la plateforme |
| `PROJECT_ADMIN` | Administrateur du projet |
| `SALES_REP` | Commercial |
| `DEPLOYMENT_CONSULTANT` | Consultant déploiement |
| `TRAINER` | Formateur |

Les codes ne changent pas : le front route sur `roleCode`, jamais sur le
libellé. Aucun écran n'est à reprendre une fois le seed corrigé.

## Vérification

Après correction, `GET /roles` doit renvoyer des `name` français, et la
colonne Rôle de l'écran Utilisateurs les afficher sans autre intervention.
