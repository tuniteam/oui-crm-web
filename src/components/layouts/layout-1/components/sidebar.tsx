import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLayout } from './context';
import { SidebarFooter } from './sidebar-footer';
import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
  const { sidebarTheme } = useLayout();
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        'sidebar bg-background lg:border-e lg:border-border lg:fixed lg:top-0 lg:bottom-0 lg:z-20 lg:flex flex-col items-stretch shrink-0',
        (sidebarTheme === 'dark' || pathname.includes('dark-sidebar')) &&
          'dark',
      )}
    >
      <div className="overflow-hidden flex flex-col grow">
        <div className="w-(--sidebar-default-width) flex flex-col grow min-h-0">
          <SidebarMenu />
          <SidebarFooter />
        </div>
      </div>
    </div>
  );
}
