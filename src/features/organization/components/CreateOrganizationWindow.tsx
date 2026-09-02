import { Button } from '@/components/ui/button';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import {
  CREATE_MODES,
  CREATE_ORGANIZATION_UI,
} from '../constants/organizationCreate.constants';
import {
  useCreateOrganizationForm,
  type CreateOrganizationHooks,
} from '../hooks/useCreateOrganizationForm';
import { CreateOrganizationBody } from './CreateOrganizationBody';

const UI = CREATE_ORGANIZATION_UI;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ouvre la fiche creee : l'utilisateur enchaine presque toujours dessus. */
  onCreated?: (id: string) => void;
};

function Footer({
  hooks,
  onClose,
  onCreated,
}: {
  hooks: CreateOrganizationHooks;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { form, mode, submit, loading, duplicates } = hooks;

  // En mode registre il n'y a rien a creer : on choisit d'abord une fiche, ce
  // qui bascule sur la saisie. Le bouton reste visible mais inactif, plutot
  // que d'apparaitre soudain — c'est ce que fait la V8.
  const canCreate = mode === CREATE_MODES.MANUAL && !duplicates;

  const onSubmit = form.handleSubmit(async () => {
    const created = await submit();
    if (!created) return;
    onClose();
    if (hooks.createdId) onCreated?.(hooks.createdId);
  });

  return (
    <>
      <Button type="button" variant="outline" onClick={onClose}>
        {UI.ACTIONS.CANCEL}
      </Button>
      <Button
        type="button"
        data-testid="org-create-submit"
        disabled={!canCreate || loading}
        onClick={() => void onSubmit()}
      >
        {UI.ACTIONS.CREATE}
      </Button>
    </>
  );
}

/** Creation d'un organisme — US-01-02, ecran `openCreateOrg` de la V8. */
export function CreateOrganizationWindow({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  return (
    <ReusableWindow<CreateOrganizationHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      description={UI.DESCRIPTION}
      useHooks={useCreateOrganizationForm}
      preventClose
      onClosed={(hooks) => hooks.reset()}
      renderBody={(hooks) => <CreateOrganizationBody hooks={hooks} />}
      renderFooter={(hooks) => (
        <Footer
          hooks={hooks}
          onClose={() => onOpenChange(false)}
          onCreated={onCreated}
        />
      )}
    />
  );
}
