import { LayoutProvider } from './components/context';
import { Main } from './components/main';

export function Layout1() {
  return (
    <>
      <LayoutProvider>
        <Main />
      </LayoutProvider>
    </>
  );
}
