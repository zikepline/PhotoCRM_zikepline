import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <Construction className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            Блог PhotoCRM
          </h1>
          
          <div className="bg-card border rounded-2xl p-8 space-y-4">
            <p className="text-xl text-muted-foreground">
              Раздел находится в разработке
            </p>
            <p className="text-muted-foreground">
              Скоро здесь появятся полезные статьи о работе с CRM-системой, советы по управлению фотобизнесом и последние новости проекта.
            </p>
          </div>

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
  );
};

export default Blog;
