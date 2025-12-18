import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation("documents");
  const { t: tCommon } = useTranslation("common");
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 - {t("notFound.title")}</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {t("notFound.description")}
          </p>

          <Button
            className="mt-6 w-full"
            onClick={() => setLocation("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            {tCommon("buttons.goToDashboard")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
