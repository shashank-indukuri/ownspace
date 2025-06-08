import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  weddingId: number;
}

interface WeddingStats {
  totalGuests: number;
  confirmed: number;
  pending: number;
  declined: number;
  responseRate: number;
}

export function StatsOverview({ weddingId }: StatsOverviewProps) {
  const { data: stats, isLoading } = useQuery<WeddingStats>({
    queryKey: [`/api/weddings/${weddingId}/stats`],
  });

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/60 rounded-xl p-6 h-24"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Guests",
      value: stats.totalGuests,
      icon: Users,
      iconBg: "bg-blush-200",
      iconColor: "text-gold-500",
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      iconBg: "bg-gold-100",
      iconColor: "text-gold-500",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-full flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
