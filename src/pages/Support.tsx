import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Политика конфиденциальности
            </h1>
            <p className="text-muted-foreground">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">1. Общие положения</h2>
              <p className="text-muted-foreground leading-relaxed">
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса PhotoCRM. Мы серьезно относимся к защите ваших данных и соблюдаем все применимые законы о защите персональных данных.
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">2. Собираемые данные</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы собираем следующие типы информации:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Регистрационные данные (имя, email, пароль)</li>
                <li>Данные о клиентах и заказах, которые вы добавляете в систему</li>
                <li>Техническая информация (IP-адрес, браузер, операционная система)</li>
                <li>Данные об использовании сервиса (действия в системе, посещенные страницы)</li>
              </ul>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">3. Использование данных</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы используем собранные данные для:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Предоставления и улучшения сервиса</li>
                <li>Персонализации вашего опыта использования</li>
                <li>Обеспечения безопасности и предотвращения мошенничества</li>
                <li>Связи с вами по важным вопросам, касающимся сервиса</li>
                <li>Анализа использования для улучшения функциональности</li>
              </ul>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">4. Защита данных</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы применяем современные технологии защиты информации:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Шифрование данных при передаче (SSL/TLS)</li>
                <li>Шифрование паролей и чувствительных данных</li>
                <li>Регулярное резервное копирование</li>
                <li>Ограниченный доступ к данным только уполномоченному персоналу</li>
                <li>Регулярные проверки безопасности</li>
              </ul>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">5. Передача данных третьим лицам</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением случаев:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Когда это необходимо для предоставления сервиса (например, хостинг-провайдеры)</li>
                <li>При наличии вашего явного согласия</li>
                <li>По требованию законодательства</li>
              </ul>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">6. Ваши права</h2>
              <p className="text-muted-foreground leading-relaxed">
                Вы имеете право:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Получать информацию о хранящихся данных</li>
                <li>Исправлять неточные данные</li>
                <li>Удалять свои данные</li>
                <li>Ограничивать обработку данных</li>
                <li>Отозвать согласие на обработку</li>
                <li>Экспортировать свои данные</li>
              </ul>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы используем cookies для обеспечения работы сервиса, аналитики и улучшения пользовательского опыта. Вы можете настроить использование cookies в настройках вашего браузера.
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-display font-bold">8. Контакты</h2>
              <p className="text-muted-foreground leading-relaxed">
                Если у вас есть вопросы о политике конфиденциальности или вы хотите воспользоваться своими правами, свяжитесь с нами:
              </p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:privacy@photocrm.ru" className="text-primary hover:text-primary/80">privacy@photocrm.ru</a>
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/")}
              className="group"
            >
              <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
