import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Users, Zap } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              О <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">PhotoCRM</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Мы создаем инструменты, которые помогают фотографам сосредоточиться на творчестве, а не на рутине
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Наша миссия</h3>
              <p className="text-muted-foreground">
                Упростить управление фотобизнесом и помочь фотографам расти профессионально
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Для кого</h3>
              <p className="text-muted-foreground">
                Для фотографов любого уровня: от начинающих до профессиональных студий
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Наш подход</h3>
              <p className="text-muted-foreground">
                Простота, скорость и все необходимые функции в одной системе
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12 space-y-6">
            <h2 className="text-3xl font-display font-bold">
              История проекта
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                PhotoCRM родился из реальной потребности фотографов в удобном инструменте для управления своим бизнесом. Мы заметили, что большинство существующих решений либо слишком сложные, либо недостаточно функциональные.
              </p>
              <p>
                Наша цель — создать систему, которая будет интуитивно понятной, но при этом мощной. Систему, которая растет вместе с вашим бизнесом и помогает принимать правильные решения на основе данных.
              </p>
              <p>
                Мы постоянно развиваем продукт, слушая обратную связь от пользователей и добавляя новые функции, которые действительно нужны в работе.
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

export default About;
