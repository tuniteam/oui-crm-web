import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';

type Props = {
  children: string;
  className?: string;
};

/**
 * Un compte rendu, rendu en Markdown restreint.
 *
 * Ce qui est **stocke reste du texte** : le contrat de l'API ne connait qu'une
 * chaine, et un champ lu ailleurs en brut reste lisible. Le balisage n'existe
 * qu'a l'affichage.
 *
 * `react-markdown` ne rend jamais de HTML brut — il produit des elements React
 * et echappe le reste. Un `<script>` colle dans un compte rendu s'affiche donc
 * comme du texte, sans qu'on ait a assainir quoi que ce soit.
 *
 * Les elements autorises sont exactement ceux que la barre d'outils sait
 * produire : gras, italique, listes, liens. Titres, images et tableaux sont
 * rendus comme du texte ordinaire — un compte rendu n'est pas un document.
 */
export function MarkdownText({ children, className }: Props) {
  return (
    <div
      className={cn(
        'space-y-2 [&_a]:font-medium [&_a]:text-primary [&_a]:underline',
        '[&_li]:ms-4 [&_li]:list-outside [&_ol]:list-decimal [&_ul]:list-disc',
        '[&_ol]:space-y-0.5 [&_ul]:space-y-0.5',
        className,
      )}
    >
      <Markdown
        allowedElements={[
          'p',
          'strong',
          'em',
          'ul',
          'ol',
          'li',
          'a',
          'br',
          'del',
          'code',
        ]}
        unwrapDisallowed
        components={{
          /* Un lien d'un compte rendu part vers l'exterieur : il ne doit ni
             emmener l'application avec lui, ni exposer son contexte. */
          a: ({ href, children: label }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
