import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart3, Calendar, Calculator, Users, Building2, Kanban, CheckCircle2, ArrowRight, TrendingUp, Clock, Shield, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Аналитика и отчеты",
      description: "Детальная статистика по заказам и доходам. Отслеживайте ключевые показатели бизнеса."
    },
    {
      icon: Kanban,
      title: "Канбан-доска",
      description: "Управляйте заказами визуально. Перемещайте карточки между этапами работы."
    },
    {
      icon: Calculator,
      title: "Калькулятор налогов",
      description: "Расчет налоговой нагрузки для разных форм ведения бизнеса."
    },
    {
      icon: Users,
      title: "Управление контактами",
      description: "Ведите базу клиентов с историей взаимодействий и важными деталями."
    },
    {
      icon: Building2,
      title: "Работа с компаниями",
      description: "Отдельный учет корпоративных клиентов и крупных заказов."
    },
    {
      icon: Calendar,
      title: "Календарь задач",
      description: "Планируйте события и отслеживайте важные даты в удобном календаре."
    }
  ];

  const benefits = [
    "Экономьте до 10 часов в неделю на рутине",
    "Увеличьте доход на 30% за счет аналитики",
    "Не теряйте заказы и клиентов",
    "Работайте откуда угодно: доступ через браузер"
  ];

  const stats = [
    { icon: TrendingUp, value: "3x", label: "Рост эффективности" },
    { icon: Clock, value: "10ч", label: "Экономия времени в неделю" },
    { icon: Shield, value: "99.9%", label: "Надежность системы" },
    { icon: Zap, value: "24/7", label: "Доступ к данным" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-accent/10 to-transparent blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                PhotoCRM
              </span>
              <br />
              <span className="text-foreground">Управляйте бизнесом,</span>
              <br />
              <span className="text-foreground">а не хаосом</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Всё для управления фотобизнесом в одной системе: от первого контакта с клиентом до сдачи заказа и аналитики
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-lg px-8 h-14 group"
              >
                Начать работу
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 h-14"
              >
                Войти в систему
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Быстрая регистрация</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Интуитивный интерфейс</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Готово за минуты</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="text-center space-y-3 animate-fade-in"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Всё необходимое в одном месте
            </h2>
            <p className="text-xl text-muted-foreground">
              Перестаньте жонглировать между десятком приложений. PhotoCRM объединяет все инструменты для работы.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-8 rounded-2xl border bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  Почему фотографы выбирают PhotoCRM
                </h2>
                <p className="text-xl text-muted-foreground">
                  Мы создали систему, которая понимает специфику работы фотографа и экономит ваше время.
                </p>
                <div className="space-y-4 pt-4">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 animate-fade-in"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border-2 border-primary/10">
                  <div className="space-y-6">
                    <div className="bg-card rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Доход за месяц</div>
                          <div className="text-2xl font-bold">₽&nbsp;450,000</div>
                        </div>
                      </div>
                      <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent w-3/4 animate-[scale-in_1s_ease-out]" />
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Заказов в работе</span>
                        <span className="text-2xl font-bold">12</span>
                      </div>
                      <div className="flex gap-2">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i} 
                            className="flex-1 h-1.5 bg-primary/20 rounded-full animate-fade-in"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] p-12 md:p-16 text-center text-white">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
              
              <div className="relative space-y-6">
                <h2 className="text-4xl md:text-5xl font-display font-bold">
                  Начните управлять бизнесом<br />профессионально уже сегодня
                </h2>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Простая регистрация и быстрый старт работы в системе.
                </p>
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14 shadow-2xl group"
                  >
                    Создать аккаунт
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  PhotoCRM
                </h3>
                <p className="text-muted-foreground">
                  Современная CRM-система для управления фотобизнесом
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Компания</h4>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => navigate("/about")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      О нас
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/blog")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Блог <span className="text-xs">(в разработке)</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/support")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Поддержка
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/privacy")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Политика конфиденциальности
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t text-center text-muted-foreground">
              <p>&copy; 2025 PhotoCRM. Все права защищены.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
