import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="hover-elevate transition-all duration-200 h-[120px] overflow-hidden" data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        <CardContent className="p-4 h-full">
          <div className="flex items-start justify-between gap-3 h-full">
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-sm font-medium text-muted-foreground mb-1 truncate">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {trend && (
                  <span
                    className={`text-xs font-medium ${
                      trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
              )}
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
