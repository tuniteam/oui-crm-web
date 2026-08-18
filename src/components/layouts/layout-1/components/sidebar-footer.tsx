import { useGetMyProfile } from '@/features/profile/hooks/useGetMyProfile';
import { ChevronsUpDown, LogOut, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router';
import { COMMON, UI } from '@/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authService } from './../../../../features/auth/services/auth.service';
import { getAuthentictedUserInitials } from '@/features/profile/utils/profile.utils';
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';

export function SidebarFooter() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const profileUrl = '/profile';
  const { data } = useGetMyProfile();
  const fullName = `${data?.firstName} ${data?.lastName}`;
  const initials = getAuthentictedUserInitials(data?.firstName, data?.lastName);
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    <div className="sidebar-footer flex items-center shrink-0 px-2.5 pt-2 pb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-3 py-2.5 hover:bg-muted text-foreground rounded-xl"
          >
            <div className="flex items-center space-x-3 min-w-0 overflow-hidden">
              <ProfileAvatar
                avatarUrl={data?.avatarUrl}
                initials={initials}
                fullName={fullName}
                className="h-9 w-9 shrink-0"
              />
              <span
                data-slot="sidebar-footer-name"
                className="text-sm font-medium truncate"
              >
                {fullName}
              </span>
            </div>
            <ChevronsUpDown
              data-slot="sidebar-footer-chevron"
              className="h-4 w-4 opacity-70"
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          className="w-57 rounded-xl p-1"
        >
          <DropdownMenuItem
            onClick={() => {
              navigate(profileUrl);
            }}
          >
            <User className="mr-2 h-4 w-4 opacity-80" />
            {COMMON.ACTIONS.PROFILE}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="mr-2 h-4 w-4 opacity-80" />
            ) : (
              <Sun className="mr-2 h-4 w-4 opacity-80" />
            )}
            {theme === 'light' ? UI.THEME.DARK_MODE : UI.THEME.LIGHT_MODE}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const authS = authService;
              authS.logout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4 opacity-80" />
            {COMMON.ACTIONS.LOGOUT}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
