/**
 * 400 TEMPLATE_INVALID — le gabarit televerse n'est pas exploitable.
 *
 * Le serveur renvoie dans `messages.details` une liste lisible : une entree
 * `missing: <balise>` par balise obligatoire absente, ou `parse: …` en cas de
 * syntaxe Handlebars incorrecte. Ces details sont l'essentiel du message :
 * les perdre laisserait l'utilisateur avec « gabarit invalide » sans savoir
 * quelle balise ajouter.
 */
export class TemplateInvalidError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[]) {
    super(message);
    this.name = 'TemplateInvalidError';
    this.details = details;
  }
}
