import {
  PermissionMatrix,
  type MatrixChoice,
} from '@/components/shared/PermissionMatrix';
import { ROLES_UI } from '../constants/roles.constants';
import type { PermissionModule } from '../hooks/useRoles';
import type { CellValue } from '../hooks/useRoleDraft';

const UI = ROLES_UI;

/**
 * Les trois états d'un droit, dans l'ordre où on les lit : rien, puis de plus
 * en plus large.
 *
 * `ALL` n'y figure pas : il est réservé aux rôles du back-office, et l'API le
 * refuse. Ne pas le proposer vaut mieux que le proposer et le faire refuser.
 */
const CHOICES: readonly MatrixChoice<CellValue>[] = [
  { value: 'NONE', label: UI.SCOPE.NONE.LABEL, hint: UI.SCOPE.NONE.HINT },
  { value: 'OWN', label: UI.SCOPE.OWN.LABEL, hint: UI.SCOPE.OWN.HINT },
  { value: 'PROJECT', label: UI.SCOPE.PROJECT.LABEL, hint: UI.SCOPE.PROJECT.HINT },
];

/**
 * La matrice des droits d'un rôle — le vocabulaire, la disposition étant
 * partagée avec les exceptions individuelles d'un utilisateur.
 *
 * En lecture — rôle système, ou avant de cliquer « Modifier » — la portée
 * s'affiche en pastille, et un droit non accordé n'affiche rien.
 */
export function RoleMatrix({
  modules,
  valueOf,
  setCell,
  grantedCount,
  editing,
}: {
  modules: PermissionModule[];
  valueOf: (code: string) => CellValue;
  setCell: (code: string, value: CellValue) => void;
  grantedCount: (codes?: string[]) => number;
  editing: boolean;
}) {
  return (
    <PermissionMatrix<CellValue>
      testId="role-matrix"
      cellTestId="role"
      modules={modules}
      /* Un rôle offre les mêmes trois portées sur chaque droit. */
      choicesFor={() => CHOICES}
      valueOf={valueOf}
      setCell={setCell}
      countOf={(codes) =>
        UI.DRAWER.MODULE_COUNT(grantedCount(codes), codes.length)
      }
      readLabelOf={(value) =>
        value === 'NONE' ? null : UI.SCOPE[value].LABEL
      }
      editing={editing}
    />
  );
}
