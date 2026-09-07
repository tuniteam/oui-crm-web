# Demande API — `search-registry` ne rend pas la population

> Émise par le front le 05/09/2026, avant de porter la recherche registre sur
> une fiche existante. Contrat lu dans `HANDOFF-L1.md` § `GET
> /organizations/search-registry`. Aucun code n'a été modifié pour écrire ce
> document.

---

## Ce qui manque, et pourquoi ça compte

`GET /organizations/search-registry?q=` rend aujourd'hui :

```
name, siret, siren, address, postalCode, city, inseeCode, department, isActive
```

La complétude d'une fiche, elle, compte **six** critères — `SIRET`, `ADDRESS`,
`POSTAL_CODE`, `POPULATION`, `PRIMARY_CONTACT`, `EMAIL`.

Le registre en couvre **trois**. Ni la population ni l'e-mail n'y figurent.

La population n'est pas un critère comme les autres : sans elle, aucune strate
tarifaire ne se calcule et **`blocks.quote` reste vrai** — le devis est bloqué.
Une fiche complétée depuis le registre resterait donc bloquée sur le point qui
compte le plus, et la fonctionnalité serait perçue comme ratée.

## Ce que nous demandons

Ajouter `population` au contrat de sortie, pour les résultats qui sont des
**communes**.

```json
{ "data": [{ "name": "COMMUNE DE JOIGNY", "siret": "21890206500013",
             "inseeCode": "89206", "department": "89",
             "population": 9820,
             "isActive": true }] }
```

`null` — et non l'absence du champ — quand la population est inconnue ou que le
résultat n'est pas une commune (EPCI, syndicat, association). Le front
distingue déjà « non renseigné » de « vide ».

## Pourquoi côté serveur, et pas côté front

Le code INSEE que la route possède déjà suffit à obtenir la population auprès
de `geo.api.gouv.fr`. Nous ne le ferons **pas** depuis le navigateur :

- une dépendance externe dans le front échappe au contrat, au cache et à la
  maîtrise des pannes ;
- `search-registry` fait déjà l'aiguillage Sirene / recherche-entreprises côté
  serveur — une seconde source au même endroit est cohérente avec ce choix ;
- la règle du projet est qu'un appel externe passe par l'API.

## Dégradation attendue

La même que celle déjà en place, et pour la même raison : une source
indisponible ne doit pas emporter les autres.

Si la source de population ne répond pas, **rendre le résultat sans elle**
(`population: null`) plutôt qu'un `503` sur toute la recherche. Le SIRET et
l'adresse restent utiles même sans la population, et le front sait déjà
basculer en saisie manuelle sur `503 REGISTRY_UNAVAILABLE` / `504
REGISTRY_TIMEOUT`.

## Ce que le front fait en attendant

Le portage de la recherche registre sur une fiche existante ne dépend pas de
cette demande : il remplit SIRET, adresse, code postal, code INSEE, ville et
département. La population reste en saisie manuelle, et le bandeau de fiche
incomplète continue de l'annoncer.

Aucun contournement ne sera écrit côté front — nous attendrons le champ.

## Accessoirement : l'e-mail

Le sixième critère non plus n'est pas couvert. Nous ne le demandons **pas** :
l'annuaire officiel ne porte pas d'adresse de contact fiable pour une commune,
et une valeur approximative sur un champ qui sert à la prospection ferait plus
de dégâts qu'un champ vide. L'e-mail reste une saisie commerciale.
