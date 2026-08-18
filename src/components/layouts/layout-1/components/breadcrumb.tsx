import { Fragment } from 'react';
import {  ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-1.config';
import { MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';



export function Breadcrumb() {
  const { pathname } = useLocation();
  
  const { getBreadcrumb } = useMenu(pathname);

 


  const items: MenuItem[] = getBreadcrumb(
  MENU_SIDEBAR
  );


  const lastItem = items[items.length - 1];

  return (
    <div className="flex items-center gap-2 text-xs lg:text-sm font-medium">
      <div className="flex lg:hidden items-center gap-1.5 min-w-0">
       
        {lastItem && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary font-medium text-xs truncate min-w-0">
            {lastItem.icon && <lastItem.icon className="size-3.5 shrink-0" />}
            <span className="truncate">{lastItem.title}</span>
          </span>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-2">
       
        {items.map((item, index) => {
          const last = index === items.length - 1;
          const Icon = item.icon;
          return (
            <Fragment key={`root-${index}`}>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors',
                  last
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                {Icon && <Icon className="size-3.5" />}
                {item.title}
              </span>
              {!last && (
                <ChevronRight
                  className="size-3.5 text-muted-foreground/50"
                  key={`sep-${index}`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
