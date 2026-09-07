import { formatInteger } from '@/shared/utils/string-utils';
import type { IssueCode } from '../utils/grid-issues';
/** Grille tarifaire — L2 · US-02-01. Routes scopees projet. */
export const PRICING_ROUTES = {
  PRICING_GRIDS_API: '/pricing-grids',
  ACTIVE_GRID_API: '/pricing-grids/active',
  GRID_API: (id: string) => `/pricing-grids/${id}`,
  ACTIVATE_GRID_API: (id: string) => `/pricing-grids/${id}/activate`,
} as const;

/**
 * Aucune version active sur le projet.
 *
 * Ce n'est pas une panne : un projet neuf n'a pas encore de grille. Tout ce
 * qui en depend — le filtre par strate, le libelle de strate d'une fiche —
 * disparait alors, sans message d'erreur.
 */
export const PRICING_NO_ACTIVE = 'PRICING_GRID_NO_ACTIVE';

/**
 * Un devis **emis** retient la version — SPEC-18.
 *
 * Les brouillons ne bloquent pas : ils sont recalcules dans la meme
 * transaction. `quotesCount` ne distingue pas les deux, le front ne peut donc
 * pas trancher : il tente la correction et lit ce code.
 */
export const PRICING_HAS_QUOTES = 'PRICING_GRID_HAS_QUOTES';
export const PRICING_DATE_INVALID = 'PRICING_GRID_EFFECTIVE_DATE_INVALID';

/** La version active ne se supprime pas : le projet serait sans grille. */
export const PRICING_GRID_ACTIVE = 'PRICING_GRID_ACTIVE';

/**
 * Version preparee sur une grille qui n'est plus active — SPEC-18.
 *
 * `meta` porte `activeVersion` et `basedOnVersion`. Franchissable avec
 * `force: true` : revenir volontairement a une grille anterieure est
 * legitime, et le serveur le journalise comme tel.
 */
export const PRICING_BASE_OUTDATED = 'PRICING_GRID_BASE_OUTDATED';

/**
 * Un identifiant d'option ou de prestation que ce projet n'a jamais
 * distribue — SPEC-19.
 *
 * Le front ne fabrique plus d'identifiant : un element nouveau part **sans
 * `id`**, le serveur lui en donne un. Ce code ne devrait donc plus jamais
 * apparaitre ; s'il apparait, c'est qu'un `id` a ete invente quelque part.
 */
export const PRICING_UNKNOWN_ITEM_ID = 'PRICING_GRID_UNKNOWN_ITEM_ID';

/**
 * Un element retire est encore porte par un devis **brouillon** — SPEC-19.
 *
 * `meta.items` nomme les elements, `meta.quotes` les devis qui les
 * retiennent : l'ecran les liste sans analyser une phrase. Le serveur bloque
 * plutot que de laisser filer, car retirer la formule d'un brouillon le
 * rendrait illisible — il se recalcule a chaque lecture.
 */
export const PRICING_ITEM_IN_USE = 'PRICING_GRID_ITEM_IN_USE';

/**
 * Combien de versions la liste charge d'un coup.
 *
 * Le defaut du contrat, et il suffit : une grille se revise quelques fois par
 * an, pas quotidiennement. La pagination viendra si un projet la depasse.
 */
export const PRICING_PAGE_SIZE = 20;

/**
 * Les bornes du calendrier des dates d'effet.
 *
 * Elles ne viennent pas du contrat, qui n'en pose aucune : c'est un confort
 * de saisie. Un an en arriere pour relire une version passee, cinq ans en
 * avant parce qu'une grille se prepare a l'annee, pas a la decennie.
 */
export const PRICING_CALENDAR = {
  YEARS_BACK: 1,
  YEARS_AHEAD: 5,
} as const;

export const PRICING_UI = {
  TITLE: 'Grille tarifaire',
  DESCRIPTION: 'Strates, formules et prix — une version datée à la fois',

  /**
   * Une grille est un **document date**, pas un reglage.
   *
   * Sans cette phrase en tete d'ecran, l'utilisateur modifie un prix, voit
   * « enregistre », et ne comprend pas pourquoi ses devis gardent l'ancien
   * tarif. C'est le seul risque serieux de cet ecran.
   */
  LEAD:
    'Chaque version est une photo complète et datée. Une seule chiffre les devis à un instant donné ; les devis déjà émis restent attachés à la leur.',

  COLUMNS: {
    ACTIONS: 'Actions',
    VERSION: 'Version',
    EFFECTIVE_DATE: 'Date d’effet',
    STATE: 'État',
    QUOTES: 'Devis chiffrés',
    CREATED_BY: 'Créée par',
    CREATED_AT: 'Créée le',
  },

  STATE: {
    ACTIVE: 'Active',
    PREPARED: 'En préparation',
    REPLACED: 'Remplacée',
  },

  VIEW: 'Voir la version',
  ACTIVATE: 'Activer',
  DELETE: 'Supprimer',

  /**
   * Pourquoi une version ne peut pas etre activee.
   *
   * `activation.reason` vient du serveur : **le front grise le bouton et
   * affiche la raison, il ne recalcule pas la regle**, qui vit cote serveur
   * une seule fois.
   */
  CANNOT_ACTIVATE: {
    ALREADY_ACTIVE: 'C’est déjà la version active.',
    BASE_OUTDATED: (base: number, active: number) =>
      `Préparée à partir de la v${base}, alors que la v${active} est active : l’activer écraserait ce qui a été fait entre-temps.`,
  },

  /** La filiation, quand elle existe : le signal qui manque a qui active. */
  DERIVED_FROM: (v: number) => `dérivée de la v${v}`,
  VERSION: (v: number) => `v${v}`,

  EMPTY: {
    TITLE: 'Aucune grille tarifaire',
    BODY: 'Ce projet n’a pas encore de grille : les devis ne peuvent pas être chiffrés.',
  },

  /** Le tiroir : les cinq tableaux de la V8, replies en accordeon. */
  DRAWER: {
    /**
     * Le nom d'un élément qu'on vient d'ajouter.
     *
     * Jamais vide : le serveur exige `name` et `label`, et les refuse en
     * anglais à l'enregistrement de toute la grille. Un nom par défaut se
     * relit et se remplace ; un champ vide se perd de vue.
     */
    NEW_NAMES: {
      OPTION: 'Nouvelle option',
      EXTRA: 'Nouvelle prestation',
    },
    /**
     * Ajouter et retirer — SPEC-19.
     *
     * Le `content` se poste en entier : ajouter un element, c'est envoyer le
     * document avec un element de plus. Aucune route par element, donc aucun
     * enregistrement a l'unite — tout part au meme moment que les prix.
     */
    ACTIONS: 'Actions',
    ADD: {
      BRACKET: 'Ajouter une strate',
      PLAN: 'Ajouter une formule',
      OPTION: 'Ajouter une option',
      SETUP: 'Ajouter un poste',
      EXTRA: 'Ajouter une prestation',
    },
    REMOVE: {
      BRACKET: 'Retirer cette strate',
      PLAN: 'Retirer cette formule',
      OPTION: 'Retirer cette option',
      SETUP: 'Retirer ce poste',
      EXTRA: 'Retirer cette prestation',
    },
    /** Le plafond, dit avant le clic plutot qu'apres un refus. */
    AT_MOST: (n: number, what: string) =>
      `Une grille ne peut pas dépasser ${n} ${what}.`,
    FAMILIES: {
      brackets: 'strates',
      plans: 'formules',
      options: 'options',
      setupFees: 'postes de frais',
      extras: 'prestations',
    },
    /** Retirer le dernier element d'une famille qui ne peut pas etre vide. */
    LAST_ONE: {
      BRACKET: 'Une grille garde au moins une strate.',
      PLAN: 'Une grille garde au moins une formule.',
    },
    /**
     * Ce qu'ajouter et retirer une strate font vraiment.
     *
     * Dit avant le geste : la couverture `[0, +∞[` doit rester entiere, donc
     * ajouter **coupe** la strate visee et retirer **rend sa plage** a la
     * voisine. Sans cette phrase, l'utilisateur croit inserer une ligne et
     * s'etonne que les bornes voisines bougent.
     */
    BRACKET_HINT:
      'Ajouter coupe la strate en deux ; retirer rend sa plage à la strate voisine. Les tailles de commune restent couvertes de bout en bout.',
    SETUP_WINDOW: {
      TITLE: 'Ajouter un poste de frais',
      LABEL: 'Libellé',
      LABEL_HINT:
        'Il s’imprime sur le devis, et doit rester distinct des autres postes : un devis déjà émis reventile ses lignes par libellé.',
      NATURE: 'Nature',
      NATURE_HINT:
        'Ce choix répartit le montant entre « formation » et « mise en place » dans le récapitulatif pluriannuel.',
      CONFIRM: 'Ajouter',
      CANCEL: 'Annuler',
      DUPLICATE: 'Un autre poste porte déjà ce libellé.',
      EMPTY: 'Donnez un libellé à ce poste.',
    },
    PLAN_WINDOW: {
      TITLE: 'Ajouter une formule',
      NAME: 'Nom de la formule',
      NAME_HINT:
        'Il apparaît sur le devis. La formule naît avec un prix à zéro sur chaque strate et sur chaque poste de frais.',
      CONFIRM: 'Ajouter',
      CANCEL: 'Annuler',
      EMPTY: 'Donnez un nom à cette formule.',
      RESERVED: '« label » et « nature » sont réservés : ce sont les attributs d’un poste de frais.',
      DUPLICATE: 'Une formule porte déjà ce nom.',
    },
    /** Retirer une formule retire aussi ses prix — le dire avant. */
    REMOVE_PLAN_HINT: (plan: string, posts: number) =>
      posts > 0
        ? `Retirer « ${plan} » efface son prix d’abonnement sur chaque strate, et ses prix sur les ${posts} postes de frais.`
        : `Retirer « ${plan} » efface son prix d’abonnement sur chaque strate.`,
  /**
   * Ce qu'un poste de frais est, en un mot — SPEC-19.
   *
   * Affiche a cote du libelle : c'est `nature`, et non plus la cle ecrite en
   * dur, qui decide si le montant tombe dans « formation » ou dans « mise en
   * place » sur le devis. Le taire laisserait deux postes identiques a l'oeil
   * ventiler differemment.
   */
  NATURE: {
    TRAINING: 'Formation',
    SETUP: 'Mise en place',
  },

    SECTIONS: {
      BRACKETS: 'Tranches de population',
      SUBSCRIPTION: 'Abonnement HT par mois',
      OPTIONS: 'Options mensuelles HT',
      SETUP: 'Frais de mise en place HT',
      EXTRAS: 'Matériel et prestations libres',
    },
    /** Ce que chaque section contient, dit sur son en-tete repliee. */
    COUNT: (n: number, one: string, many: string) =>
      `${n} ${n > 1 ? many : one}`,
    BRACKET_COUNT: ['strate', 'strates'] as const,
    PLAN_COUNT: ['formule', 'formules'] as const,
    OPTION_COUNT: ['option', 'options'] as const,
    SETUP_COUNT: ['poste', 'postes'] as const,
    EXTRA_COUNT: ['prestation', 'prestations'] as const,

    FROM: 'De',
    TO: 'À',
    OPEN_ENDED: 'et plus',
    LABEL: 'Libellé',
    PLAN: 'Formule',
    POST: 'Poste',
    UNIT_PRICE: 'Prix unitaire HT',
    /**
     * La franchise d'une option — `options[].included`.
     *
     * Ce n'est pas une mention, c'est une **regle de facturation** : avec
     * `included: 1`, prendre trois profils n'en facture que deux, et le devis
     * porte la ligne « Profil Gestionnaire (supplementaire) ». Le prix de la
     * colonne est donc celui du **supplementaire**, pas celui de l'option.
     *
     * « 1 inclus dans l'abonnement » etait vrai et muet sur l'essentiel : ce
     * qui se passe au-dela.
     */
    INCLUDED: (n: number) => `${n} compris`,
    INCLUDED_HINT: (n: number) =>
      n > 1
        ? `Les ${n} premiers sont compris dans l’abonnement ; on facture à partir du ${n + 1}ᵉ, au prix ci-contre.`
        : 'Le premier est compris dans l’abonnement ; on facture à partir du 2ᵉ, au prix ci-contre.',
    /**
     * L'en-tete de la colonne, et la phrase qui la sauve.
     *
     * « Compris » seul ne se suffit pas : la question « c'est quoi ? » est
     * revenue deux fois. Il faut dire **dans quoi** c'est compris, et **ce
     * qui se passe au-dela** — sans quoi on lit le prix de la colonne comme
     * le prix de l'option, alors que c'est celui du supplementaire.
     */
    INCLUDED_FIELD: 'Compris dans l’abo',
    INCLUDED_SUBHEAD: 'facturé au-delà',
    INCLUDED_NONE: 'Rien n’est compris : l’option est facturée dès la première unité.',
    /** L'unite des strates, dite une fois au lieu de six. */
    BRACKET_UNIT: 'habitants',
    NO_OPTIONS: 'Aucune option mensuelle.',
    NO_EXTRAS: 'Aucune prestation libre.',
    NO_SETUP: 'Aucun frais de mise en place.',
    CLOSE: 'Fermer',
  },

  /**
   * L'edition — tranche B.
   *
   * Rien ne part au serveur pendant la saisie : « Modifier » copie le contenu
   * en memoire, et « Enregistrer » envoie **un seul** `POST`. Dans la V8 chaque
   * case portait un `onchange` : transpose ici, cela creerait une version par
   * case modifiee, sans aucune route pour les retirer.
   */
  EDIT: {
    START: 'Modifier les tarifs',
    /**
     * Corriger sur place remplace la creation d'une version — SPEC-18.
     *
     * Tant qu'aucun devis **emis** n'est attache, on repare la version au lieu
     * d'en empiler une de plus. Le serveur tranche : `quotesCount` ne
     * distingue pas les brouillons des devis emis.
     */
    FIX: 'Enregistrer les corrections',
    FIXED: (v: number) => `Version ${v} corrigée.`,

    /**
     * Corriger la version **active** change les prix en vigueur, sans geste
     * d'activation. Ce n'est plus preparer, c'est appliquer.
     */
    ACTIVE_WARNING:
      'Cette version est active : vos corrections changeront les tarifs en vigueur immédiatement, sans activation.',

    /** Un devis emis retient la version : la seule issue est d'en creer une. */
    HAS_QUOTES: (n: number) =>
      `${n} devis émis est attaché à cette version : elle ne peut plus être corrigée.`,
    HAS_QUOTES_FALLBACK: 'Créer une nouvelle version à la place',
    CANCEL: 'Annuler les modifications',
    /** Le bouton dit ce qu'il fait : le versionnement doit etre visible au
     *  moment ou il compte. */
    SAVE: (next: number) => `Enregistrer — créera la v${next}`,
    DIRTY: (n: number) =>
      `${n} modification${n > 1 ? 's' : ''} non enregistrée${n > 1 ? 's' : ''}`,
    LEAVE_WARNING:
      'Vos modifications ne sont pas enregistrées. Fermer les perdra.',
    LEAVE_CONFIRM: 'Fermer sans enregistrer',
    LEAVE_STAY: 'Continuer à modifier',

    /**
     * Modifier une version qui n'est pas l'active repart de **son** contenu.
     *
     * Si v5 est active et qu'on corrige v1, la version 6 naitra du contenu de
     * v1 et effacera, en devenant active, tout ce qui a ete fait entre-temps.
     * Le serveur refuse desormais de l'activer (`409`), mais le dire ici evite
     * de creer la version pour rien.
     */
    NOT_ACTIVE: (edited: number, active: number) =>
      `Cette version sera créée à partir de la v${edited}, non de la version active (v${active}).`,
  },

  SAVE_WINDOW: {
    TITLE: 'Enregistrer une nouvelle version',
    /**
     * **Aucun numero annonce.** Il etait calcule depuis le plus haut connu ;
     * depuis que `DELETE` existe, la suite a des trous — supprimer la v4 ne
     * libere pas le 4, la suivante s'appelle v5 — et l'annonce serait fausse
     * juste apres une suppression. Le serveur attribue, l'ecran lit apres.
     */
    LEAD:
      'Vos modifications formeront une nouvelle version. Elle naît inactive : les devis continuent d’être chiffrés avec la version active jusqu’à ce que vous l’activiez.',
    EFFECTIVE_DATE: 'Date d’effet prévue',
    /**
     * Previsionnelle, et **refixee a l'activation** depuis SPEC-18.
     *
     * Le champ reste obligatoire a la creation (`400 INVALID_DATA` sans lui),
     * mais ce qui fait foi est la date donnee au moment d'activer : la figer
     * ici garantissait qu'elle serait fausse des que l'activation glissait.
     */
    EFFECTIVE_HINT:
      'Prévisionnelle : aucune bascule automatique. La date qui fera foi se confirme au moment d’activer.',
    CONFIRM: 'Créer la version',
    CANCEL: 'Annuler',
    SAVED: (v: number) => `Version ${v} créée — elle n’est pas encore active.`,
  },

  /**
   * Pourquoi une version ne se supprime pas.
   *
   * Contrairement a l'activation, le serveur n'envoie pas d'etat pret a
   * l'emploi : les deux raisons se lisent sur la ligne elle-meme — `active`
   * et `quotesCount`. Ce ne sont pas des regles recalculees, ce sont des
   * faits affiches dans les colonnes voisines.
   */
  CANNOT_DELETE: {
    ACTIVE: 'La version active ne se supprime pas : le projet serait sans grille.',
    HAS_QUOTES: (n: number) =>
      `${n} devis est attaché à cette version, brouillon compris : corriger une version répare ses brouillons, la supprimer les détruirait.`,
  },

  ACTIVATE_WINDOW: {
    TITLE: 'Activer cette version',
    /**
     * Ce que l'activation change, en langage clair — pas un « Confirmer ? ».
     *
     * `quotes` compte les devis **deja emis, toutes versions confondues** :
     * ce sont eux qui conservent leur chiffrage. Le decompte de la version
     * qu'on active dirait tout autre chose — souvent zero, puisqu'une version
     * preparee n'a rien chiffre.
     */
    LEAD: (v: number, quotes: number) =>
      quotes > 0
        ? `Les nouveaux devis seront chiffrés avec la version ${v}. Les ${quotes} devis déjà émis conservent leur chiffrage.`
        : `Les nouveaux devis seront chiffrés avec la version ${v}.`,
    /**
     * La date se fixe **a l'activation** depuis SPEC-18 : la figer a la
     * preparation garantissait qu'elle serait fausse des que l'activation
     * glissait d'un jour. Vide, elle prend le jour meme.
     */
    DATE: 'Date d’effet',
    DATE_HINT: 'Laissée vide, la date d’effet devient aujourd’hui.',
    /**
     * Le refus du serveur, dit avec les deux numeros.
     *
     * Ils arrivent dans `messages.meta` justement pour eviter d'analyser la
     * phrase du serveur, qui peut changer.
     */
    OUTDATED: (v: number, base: number, active: number) =>
      `La version ${v} a été préparée à partir de la version ${base}, alors que la version ${active} est active. L’activer écrase ce qui a été fait entre-temps — ce qui est légitime si vous revenez volontairement à cette grille.`,
    CONFIRM: 'Activer',
    CONFIRM_FORCE: 'Activer quand même',
    CANCEL: 'Annuler',
    DONE: (v: number) => `Version ${v} active — les nouveaux devis la suivent.`,
  },

  DELETE_WINDOW: {
    TITLE: 'Supprimer cette version',
    LEAD: (v: number) =>
      `La version ${v} sera retirée définitivement. Son numéro ne sera pas réutilisé.`,
    CONFIRM: 'Supprimer',
    CANCEL: 'Annuler',
    DONE: (v: number) => `Version ${v} supprimée.`,
  },

  ERRORS: {
    FETCH: 'Impossible de charger les grilles tarifaires',
    SAVE: 'Impossible d’enregistrer la grille',
    ACTIVE_GRID: 'La version active ne peut pas être supprimée : le projet se retrouverait sans grille.',
    /**
     * Ne devrait jamais s'afficher : le front n'invente plus d'identifiant.
     * Le message vise donc le developpeur autant que l'utilisateur.
     */
    UNKNOWN_ITEM: 'Un élément porte un identifiant inconnu du projet. Rechargez la version et recommencez.',

    /**
     * Le repli quand le serveur refuse le contenu — SPEC-19.
     *
     * `messages.details[]` est une **cle de correspondance**, pas une phrase :
     * l'anglais et les chemins techniques sont deliberes cote API. On les
     * traduit devant leur champ ; ce qui reste tombe ici.
     *
     * Ce repli n'est pas un ornement : le jour ou une regle s'ajoute cote
     * serveur, il est tout ce qui separe un message imparfait d'un ecran
     * muet — et l'ecran muet est pire.
     */
    INVALID_SUMMARY: (n: number) =>
      n > 1
        ? `Cette grille comporte ${n} anomalies.`
        : 'Cette grille comporte une anomalie.',
    INVALID_DETAIL: 'Voir le détail',
    /** Ce que le support doit pouvoir lire tel quel, sans le montrer d'office. */
    INVALID_RAW: 'Détail technique',
    IN_USE: (items: string[], quotes: string[]) =>
      `Impossible de retirer ${items.join(', ')} : ${
        quotes.length > 1
          ? `les devis ${quotes.join(', ')} les utilisent encore`
          : `le devis ${quotes[0]} l’utilise encore`
      }. Modifiez ou supprimez ${quotes.length > 1 ? 'ces devis' : 'ce devis'} d’abord.`,
    IN_USE_FALLBACK:
      'Un élément retiré est encore utilisé par un devis en brouillon de cette version.',
    DELETE_HAS_QUOTES: (n: number) =>
      `${n} devis est attaché à cette version, brouillon compris : retirez-le avant de supprimer.`,
    /** `details[]` porte le chemin fautif : on les rend tels quels tant que la
     *  resolution en cellules n'est pas faite (tranche C). */
    INVALID: 'La grille est refusée : ',
  },
} as const;

/**
 * Ce que le serveur refuse, dit en français — SPEC-19.
 *
 * `grid-issues.ts` rend une **cause** et des paramètres ; la phrase vit ici,
 * avec le reste de l'interface. C'est le patron du projet, et c'est ce qui
 * rend l'utilitaire éprouvable sans rien afficher.
 *
 * Un `params` vide est normal : la plupart des causes se disent d'un trait.
 */
export const PRICING_ISSUE_TEXT: Record<
  IssueCode,
  (p: Record<string, string | number>) => string
> = {
  BRACKETS_REQUIRED: () => 'Définissez au moins une strate.',
  BRACKET_FIRST_AT_ZERO: () =>
    'La première strate doit commencer à 0 habitant.',
  BRACKET_LAST_OPEN: () =>
    'La dernière strate doit rester ouverte (« et plus »).',
  BRACKET_OVERLAP: (p) => `La strate « ${p.name} » empiète sur la précédente.`,
  /* La plage n'est nommée que si l'écran a le contenu fautif sous les yeux. */
  BRACKET_GAP: (p) =>
    p.from === undefined
      ? 'Il manque des tailles de commune : certaines ne pourraient pas être chiffrées.'
      : `Il manque les tailles entre ${formatInteger(Number(p.from))} et ${formatInteger(Number(p.to))} habitants : aucune commune de cette taille ne pourrait être chiffrée.`,
  BRACKET_MAX_BELOW_MIN: () => 'Le maximum est inférieur au minimum.',
  BRACKET_LABEL_REQUIRED: () => 'Donnez un nom à cette strate.',
  BRACKETS_AT_MOST: (p) => `Une grille ne peut pas dépasser ${p.max} strates.`,

  PLAN_RESERVED: (p) =>
    `« ${p.plan} » est un nom réservé : c’est un attribut des postes de frais, qui partagent leur objet avec les prix par formule.`,
  PLAN_DUPLICATE: () => 'Deux formules portent le même nom.',
  PLAN_NAME_REQUIRED: () => 'Une formule ne peut pas être sans nom.',
  PLANS_AT_MOST: (p) => `Une grille ne peut pas dépasser ${p.max} formules.`,

  SUBSCRIPTION_MISSING_PRICE: (p) =>
    `Formule « ${p.plan} » : il manque un prix à partir de la strate « ${p.bracket} ».`,
  SUBSCRIPTION_EXTRA_PRICE: (p) =>
    `Formule « ${p.plan} » : il y a plus de prix que de strates.`,
  /* Le serveur refuse plutôt que d'ignorer : un prix laissé derrière une
     formule supprimée ressusciterait d'anciens tarifs le jour où le nom
     revient. */
  SUBSCRIPTION_NO_SUCH_PLAN: (p) =>
    `Des prix d’abonnement subsistent pour la formule « ${p.plan} », qui n’existe plus.`,

  OPTION_MISSING_PRICE: (p) =>
    `Option « ${p.option} » : il manque un prix à partir de la strate « ${p.bracket} ».`,
  OPTION_NAME_REQUIRED: () => 'Donnez un nom à cette option.',
  OPTION_INCLUDED_INVALID: (p) =>
    `Option « ${p.option} » : la quantité comprise doit être un nombre positif ou nul.`,
  OPTION_DUPLICATE_ID: () => 'Deux options portent le même identifiant.',
  OPTIONS_AT_MOST: (p) => `Une grille ne peut pas dépasser ${p.max} options.`,

  SETUP_LABEL_REQUIRED: () => 'Donnez un libellé à ce poste.',
  SETUP_NATURE_REQUIRED: (p) =>
    `Le poste « ${p.post} » est-il de la formation ou de la mise en place ? C’est ce choix qui répartit le montant dans le récapitulatif pluriannuel.`,
  SETUP_NO_SUCH_PLAN: (p) =>
    `Le poste « ${p.post} » garde des prix pour la formule « ${p.plan} », qui n’existe plus.`,
  SETUP_MISSING_TABLE: (p) =>
    `Le poste « ${p.post} » n’a pas de prix pour la formule « ${p.plan} ».`,
  SETUP_MISSING_PRICE: (p) =>
    `Poste « ${p.post} », formule « ${p.plan} » : il manque un prix à partir de la strate « ${p.bracket} ».`,
  /* L'unicité n'est pas cosmétique : un devis figé reventile ses lignes
     stockées par libellé, et deux postes homonymes y seraient indiscernables. */
  SETUP_DUPLICATE_LABEL: () =>
    'Deux postes de frais portent le même libellé : un devis déjà émis ne saurait plus les distinguer.',
  SETUP_AT_MOST: (p) =>
    `Une grille ne peut pas dépasser ${p.max} postes de frais.`,

  EXTRA_PRICE_INVALID: (p) =>
    `Prestation « ${p.extra} » : le prix doit être un nombre positif ou nul.`,
  EXTRA_NAME_REQUIRED: () => 'Donnez un nom à cette prestation.',
  EXTRAS_AT_MOST: (p) =>
    `Une grille ne peut pas dépasser ${p.max} prestations.`,

  /* Jamais affiché : l'écran compte ces anomalies dans son repli et montre
     leur chaîne d'origine dans le détail dépliable. */
  UNKNOWN: () => '',
};
