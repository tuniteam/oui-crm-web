import { useEffect } from 'react';
import { useServerErrorStore } from '@/contexts/useServerErrorStore';
import { Error500 } from '@/features/errors/components/error-500';
import { useGetMe } from '@/features/user/hooks/useGetMe';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayout } from './context';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function Main() {
  const isMobile = useIsMobile();
  const { sidebarCollapse } = useLayout();
  useGetMe();
  useEffect(() => {
    const bodyClass = document.body.classList;

    if (sidebarCollapse) {
      bodyClass.add('sidebar-collapse');
    } else {
      bodyClass.remove('sidebar-collapse');
    }
  }, [sidebarCollapse]);

  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add('demo1');
    bodyClass.add('sidebar-fixed');
    bodyClass.add('header-fixed');

    const timer = setTimeout(() => {
      bodyClass.add('layout-initialized');
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove('demo1');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
      bodyClass.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []); // Runs only once on mount

  const has500Error = useServerErrorStore((state) => state.serverError);
  return (
    <>
      {!isMobile && <Sidebar />}

      <div className="wrapper flex grow flex-col min-h-screen pt-0">
        {/* Header */}
        <Header />
        {/* Main content */}
        <main className="grow flex flex-col px-5 overflow-auto pt-(--header-height)">
          {has500Error ? (
            <Error500 />
          ) : (
            <div className="flex flex-col grow pt-4 lg:pt-5">
              <Outlet />
           
            </div>
          )}
        </main>
      </div>
    </>
  );
}
