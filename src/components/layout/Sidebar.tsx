import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Kanban, Calculator, BarChart3, Users, Building2, CheckSquare, User as UserIcon, Shield, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { useSidebarContext } from '@/contexts/SidebarContext';

const navItems = [
  { title: 'Панель управления', url: '/', icon: LayoutDashboard },
  { title: 'Доска заказов', url: '/kanban', icon: Kanban },
  { title: 'Калькулятор заказа', url: '/calculator', icon: Calculator },
  { title: 'Аналитика', url: '/analytics', icon: BarChart3 },
  { title: 'Контакты', url: '/contacts', icon: Users },
  { title: 'Компании', url: '/companies', icon: Building2 },
  { title: 'Задачи', url: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebarContext();
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showText, setShowText] = useState(!collapsed);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!data);
      } catch (error) {
        setIsAdmin(false);
      }
    };

    const loadProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', userId)
          .single();
        
        setProfileData(data);
      } catch (error) {
        // Если профиль не найден, используем данные из сессии
        setProfileData(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false); // Сразу показываем интерфейс
      
      if (session?.user) {
        // Загружаем данные в фоне
        loadProfile(session.user.id);
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false); // Сразу показываем интерфейс
      
      if (session?.user) {
        // Загружаем данные в фоне
        loadProfile(session.user.id);
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
        setProfileData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (collapsed) {
      setShowText(false);
    } else {
      const timer = setTimeout(() => setShowText(true), 150);
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
      <div className="p-4 border-b border-sidebar-border flex items-center justify-start">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap flex items-center px-3">
          <span className="flex-shrink-0">P</span>
          {showText && !collapsed && (
            <span className="transition-opacity duration-200">
              hotoCRM
            </span>
          )}
        </h1>
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
                    'flex items-center rounded-lg transition-colors duration-200 h-12 px-3',
                    'text-sidebar-foreground hover:bg-sidebar-accent',
                    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                  )
                }
                title={collapsed ? item.title : undefined}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                {showText && !collapsed && (
                  <span className="whitespace-nowrap transition-opacity duration-200 ml-3">
                    {item.title}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
          
          {isAdmin && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-lg transition-colors duration-200 h-12 px-3',
                    'text-sidebar-foreground hover:bg-sidebar-accent',
                    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                  )
                }
                title={collapsed ? 'Админ панель' : undefined}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                {showText && !collapsed && (
                  <span className="whitespace-nowrap transition-opacity duration-200 ml-3">
                    Админ панель
                  </span>
                )}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {user && (
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center h-12 px-3 w-full hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profileData?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                  {(profileData?.name || user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {showText && !collapsed && (
              <div className="flex-1 min-w-0 ml-3 transition-opacity duration-200">
                <div className="text-sm font-medium text-sidebar-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                  {profileData?.name || user.user_metadata?.name || 'Пользователь'}
                </div>
                <div className="text-xs text-sidebar-foreground/70 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.email}
                </div>
              </div>
            )}
          </button>
        )}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "flex items-center text-sidebar-foreground hover:bg-sidebar-accent h-12",
            collapsed ? "w-12 justify-start px-3" : "w-full px-3 justify-start"
          )}
          title={collapsed ? "Выход" : undefined}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          {showText && !collapsed && (
            <span className="whitespace-nowrap transition-opacity duration-200 ml-3">
              Выход
            </span>
          )}
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
