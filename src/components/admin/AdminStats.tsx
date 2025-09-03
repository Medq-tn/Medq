import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { RecentActivity } from './RecentActivity';
import { EngagementMetrics } from './EngagementMetrics';
import { getAdminStats } from '@/lib/actions/admin';

interface AdminStatsData {
  // Basic counts
  users: number;
  
  // Recent activity
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    role: string;
  }>;
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast({
          title: t('common.error'),
          description: t('common.tryAgain'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [t]);
  
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <Card className="animate-pulse border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-12" />
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-800/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Unable to Load Data</h3>
          <p className="text-muted-foreground">{t('common.error')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Basic Stats Cards - Simplified for user management only */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card shadow-md transform hover:scale-105">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {t('admin.registeredUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Activity */}
        <RecentActivity 
          recentUsers={stats.recentUsers}
        />
        
        {/* User Engagement Metrics */}
        <EngagementMetrics />
      </div>
    </div>
  );
}
