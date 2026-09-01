import { useQuery } from '@tanstack/react-query';
import { backofficeUserService } from '../services/backoffice-user.service';
import type { BackofficeUserDetails } from '../types/backofficeUser';

export function useBackofficeUser(userId?: string, enabled: boolean = true) {
  return useQuery<BackofficeUserDetails>({
    queryKey: ['backoffice-users', 'detail', userId],
    queryFn: () => backofficeUserService.getOne(userId as string),
    enabled: enabled && !!userId,
  });
}
