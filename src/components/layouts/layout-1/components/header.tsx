import { useEffect, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { UI } from '@/constants';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useMeStore } from '@/contexts/useMeStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarFooter } from './sidebar-footer';
import { SidebarMenu } from './sidebar-menu';
import { Breadcrumb } from './breadcrumb';
import { useLayout } from './context';

export function Header() {
  const { resolvedTheme } = useTheme();
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const { sidebarCollapse, setSidebarCollapse } = useLayout();
  const isBackoffice = useMeStore((s) => s.isBackoffice());

  const handleCollapse = () => {
    document.body.classList.add('sidebar-collapsing');
    setSidebarCollapse(!sidebarCollapse);
    setTimeout(() => document.body.classList.remove('sidebar-collapsing'), 350);
  };

  const { pathname } = useLocation();
  const mobileMode = useIsMobile();

  useEffect(() => {
    setIsSidebarSheetOpen(false);
  }, [pathname]);

  return (
    <header className={cn(
      'header fixed top-0 z-30 start-0 flex items-stretch shrink-0 border-b border-border bg-background end-0 pe-(--removed-body-scroll-bar-size,0px)',
      isBackoffice && 'header-backoffice',
    )}>
      {/* Desktop: logo zone — direct child of header (no container-fluid padding) so border-e aligns with sidebar right border */}
      <div className="hidden lg:flex items-center gap-3 px-5 shrink-0 border-e border-border w-(--sidebar-default-width)">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCollapse}
              className="flex items-center justify-center size-7 rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors shrink-0"
            >
              {sidebarCollapse
                ? <PanelLeftOpen className="size-3.5" />
                : <PanelLeftClose className="size-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {sidebarCollapse ? UI.SIDEBAR.EXPAND : UI.SIDEBAR.COLLAPSE}
          </TooltipContent>
        </Tooltip>
        <Link to="/">
          <img
            src={toAbsoluteUrl(
              resolvedTheme === 'dark'
                ? '/media/app/default-logo-dark.svg'
                : '/media/app/default-logo.svg',
            )}
            className="h-13 w-auto"
            alt="logo"
          />
        </Link>
      </div>

      {/* Mobile + desktop breadcrumb/notifications */}
      <div className="container-fluid flex grow items-stretch">
        {/* Mobile: hamburger + breadcrumb left, notif right */}
        <div className="flex lg:hidden items-center grow justify-between self-center">
          <div className="flex items-center gap-2 grow min-w-0">
            {mobileMode && (
              <Sheet
                open={isSidebarSheetOpen}
                onOpenChange={setIsSidebarSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" mode="icon">
                    <Menu className="text-muted-foreground/70" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="sidebar p-0 gap-0 w-68.75"
                  side="left"
                  close={false}
                >
                  <SheetHeader className="p-0 space-y-0" />
                  <SheetBody className="flex flex-col h-full p-0">
                    <div className="flex-1 overflow-y-auto">
                      <SidebarMenu />
                    </div>
                    <SidebarFooter />
                  </SheetBody>
                </SheetContent>
              </Sheet>
            )}
            <Breadcrumb />
          </div>
         
        </div>

        {/* Desktop: breadcrumb + notification */}
        <div className="hidden lg:flex items-center grow">
          <Breadcrumb />
        </div>
       
      </div>
    </header>
  );
}
 