import { useContent } from '@/hooks/useContent';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import {
  UpdateProfileHooks,
  useUpdateProfileForm,
} from '../../hooks/useUpdateProfileForm';
import { UpdateProfileBody } from './UpdateProfileBody';
import { UpdateProfileFooter } from './UpdateProfileFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateProfileWindow({ open, onOpenChange }: Props) {
  const { updateProfile } = useContent();

  return (
    <ReusableWindow<UpdateProfileHooks>
      open={open}
      onClosed={({ form }) => form.reset()}
      onOpenChange={onOpenChange}
      title={updateProfile.TITLE}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={() => useUpdateProfileForm()}
      preventClose
      renderBody={(hooks) => <UpdateProfileBody hooks={hooks} />}
      renderFooter={(hooks) => (
        <UpdateProfileFooter
          hooks={hooks}
          onClose={() => onOpenChange(false)}
        />
      )}
    />
  );
}
