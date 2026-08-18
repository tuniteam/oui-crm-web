import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UserDetailsResponse } from '../types/userDetails';

export function useUser(userId?: string, enabled: boolean = true) {
  return useQuery<UserDetailsResponse>({
    queryKey: ['users', 'detail', userId],
    queryFn: () => userService.getOne(userId as string),
    enabled: enabled && !!userId,
  });
}
