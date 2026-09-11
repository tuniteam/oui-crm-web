import { ReusableWindow } from '@/components/window/ReusableWindow';
import { CREATE_PROJECT_UI } from '../../constants/constants';
import {
  useCreateProjectForm,
  type CreateProjectHooks,
} from '../../hooks/useCreateProjectForm';
import type { CreateProjectResponse } from '../../types/projectCreate';
import { CreateProjectBody } from './CreateProjectBody';
import { CreateProjectFooter } from './CreateProjectFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (created: CreateProjectResponse) => void;
};

/**
 * Créer un projet — back-office, patron de `CreateBackofficeUserWindow`.
 *
 * `preventClose` : un clic à côté ou Échap ne doit pas faire perdre une
 * saisie. La fenêtre ne se ferme qu'à la croix ou par « Annuler ».
 */
export function CreateProjectWindow({ open, onOpenChange, onCreated }: Props) {
  return (
    <ReusableWindow<CreateProjectHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={CREATE_PROJECT_UI.TITLE}
      description={CREATE_PROJECT_UI.DESCRIPTION}
      useHooks={useCreateProjectForm}
      preventClose
      onClosed={({ reset }) => reset()}
      className="max-w-2xl"
      renderBody={(hooks) => <CreateProjectBody hooks={hooks} />}
      renderFooter={(hooks) => (
        <CreateProjectFooter
          hooks={hooks}
          onClose={() => onOpenChange(false)}
          onCreated={onCreated}
        />
      )}
    />
  );
}
