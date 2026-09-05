import * as React from 'react';
import {
  BoldItalicUnderlineToggles,
  CreateLink,
  MDXEditor,
  type MDXEditorMethods,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  toolbarPlugin,
  UndoRedo,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { cn } from '@/lib/utils';

/** Marque la zone de saisie : c'est elle qu'on mesure et qu'on cible, pas l'enveloppe. */
const EDITABLE_CLASS = 'oui-md-content';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Hauteur et rythme de la zone de saisie, sans connaitre sa classe interne. */
  contentClassName?: string;
  'data-testid'?: string;
};

/**
 * Le champ d'un compte rendu.
 *
 * L'utilisateur voit le gras en gras et les puces en puces ; **ce qui est
 * enregistre reste du Markdown**, donc du texte. Ce choix n'est pas cosmetique :
 * le serveur n'assainit rien (aucun `sanitize` dans `oui-crm-api`), et il
 * reinjecte le compte rendu tel quel dans la description des invitations ICS
 * (`activities.utils.ts`). Du HTML y arriverait en balises brutes dans
 * l'agenda du destinataire, et sans assainissement il faudrait le traiter comme
 * une entree hostile. Du Markdown y reste lisible et inoffensif.
 *
 * Rendu en lecture : `MarkdownText`.
 */
export function MarkdownTextarea({
  value = '',
  onChange,
  onBlur,
  disabled,
  placeholder,
  className,
  contentClassName,
  'data-testid': testId,
}: Props) {
  const ref = React.useRef<MDXEditorMethods>(null);
  const host = React.useRef<HTMLDivElement>(null);

  /*
   * L'identifiant de test va sur la zone editable, pas sur l'enveloppe : c'est
   * elle que l'on remplit et que l'on lit. `MDXEditor` n'expose pas de moyen de
   * lui passer un attribut, d'ou ce report a la main.
   */
  React.useEffect(() => {
    const node = host.current;
    if (!testId || !node) return;
    /* La zone editable n'existe pas encore au premier rendu : l'editeur la
       monte ensuite. On la marque des qu'elle parait. */
    const mark = () => {
      const editable = node.querySelector('[contenteditable="true"]');
      if (!editable) return false;
      editable.setAttribute('data-testid', testId);
      return true;
    };
    if (mark()) return;
    const observer = new MutationObserver(() => {
      if (mark()) observer.disconnect();
    });
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [testId]);

  /*
   * L'editeur ne se recontrole pas : il garde son propre etat. On ne lui pousse
   * une valeur que lorsqu'elle diverge vraiment — a l'ouverture d'une fenetre,
   * ou apres un `reset` du formulaire. Sans ce garde-fou, chaque frappe
   * replacerait le curseur au debut.
   */
  React.useEffect(() => {
    if (ref.current && ref.current.getMarkdown() !== value) {
      ref.current.setMarkdown(value);
    }
  }, [value]);

  return (
    <div
      ref={host}
      className={cn(
        'rounded-md border border-input bg-background text-sm shadow-xs',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
    >
      <MDXEditor
        ref={ref}
        markdown={value}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={disabled}
        placeholder={placeholder}
        contentEditableClassName={cn(EDITABLE_CLASS, contentClassName)}
        plugins={[
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          /* Le strict necessaire : un compte rendu n'est pas un document.
             Ni titres, ni tableaux, ni images. */
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
                <ListsToggle options={['bullet', 'number']} />
                <CreateLink />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}
