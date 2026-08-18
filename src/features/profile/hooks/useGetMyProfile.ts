import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profile-service';

export function useGetMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    retry: false,
    queryFn: async () => {
      return await profileService.getMyProfile();
    },
  });
}
