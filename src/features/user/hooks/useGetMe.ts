import { useQuery } from '@tanstack/react-query';
import { tokenService } from '@/features/auth/services/token.service';
import { userService } from '@/features/user/services/user.service';
import { useMeStore } from '@/contexts/useMeStore';

export function useGetMe() {
  const setMe = useMeStore((s) => s.setMe);
  

  const hasToken = !!tokenService.getAccessToken();

  return useQuery({
    queryKey: ['me'],
    enabled: hasToken,
    retry: false,
    queryFn: async () => {
      const me = await userService.me();
      setMe(me);
     
      return me;
    },
  });
}
