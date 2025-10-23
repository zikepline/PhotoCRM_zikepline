import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Kanban, Calculator, Users, Building2, CheckSquare, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { useSidebarContext } from '@/contexts/SidebarContext';

const navItems = [
  { title: 'Панель управления', url: '/', icon: LayoutDashboard },
  { title: 'Доска заказов', url: '/kanban', icon: Kanban },
  { title: 'Калькулятор заказа', url: '/calculator', icon: Calculator },
  { title: 'Контакты', url: '/contacts', icon: Users },
  { title: 'Компании', url: '/companies', icon: Building2 },
  { title: 'Задачи', url: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebarContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showText, setShowText] = useState(!collapsed);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (collapsed) {
      setShowText(false);
    } else {
      const timer = setTimeout(() => setShowText(true), 200);
      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Вы вышли из системы');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка выхода');
    }
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 border-b border-sidebar-border">
        {collapsed ? (
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center">
            P
          </div>
        ) : (
          <>
            <h1 className={`text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap transition-opacity duration-200 ${showText ? 'opacity-100' : 'opacity-0'}`}>
              PhotoCRM
            </h1>
            <p className={`text-sm text-sidebar-foreground/70 mt-1 whitespace-nowrap transition-opacity duration-200 ${showText ? 'opacity-100' : 'opacity-0'}`}>
              Система управления
            </p>
          </>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.url}>
              <NavLink
                to={item.url}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'text-sidebar-foreground hover:bg-sidebar-accent',
                    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                  )
                }
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className={`whitespace-nowrap transition-opacity duration-200 ${showText ? 'opacity-100' : 'opacity-0'}`}>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {!isLoading && user && (
          <div className={cn("flex items-center gap-3 px-4 py-3", collapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className={`flex-1 min-w-0 transition-opacity duration-200 ${showText ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-sm font-medium text-sidebar-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.user_metadata?.name || 'Пользователь'}
                </div>
                <div className="text-xs text-sidebar-foreground/70 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Выход" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${showText ? 'opacity-100' : 'opacity-0'}`}>Выход</span>}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border hover:bg-sidebar-accent"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
        )}
      </Button>
    </aside>
  );
}