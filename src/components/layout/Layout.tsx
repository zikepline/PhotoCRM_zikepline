import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { collapsed } = useSidebarContext();
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className={cn(
        "flex-1 overflow-x-hidden transition-all duration-300",
        collapsed ? "ml-20" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}
