import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EngagementMetrics() {
  const { t } = useTranslation();

  return (
    <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <CardTitle className="text-lg font-semibold">{t('admin.userEngagement')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Platform Overview */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('admin.platformStatus')}</p>
                  <p className="text-xs text-muted-foreground">{t('admin.adminOnlyMode')}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {t('admin.active')}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('admin.userAccess')}</p>
                  <p className="text-xs text-muted-foreground">{t('admin.adminRestrictedAccess')}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {t('admin.restricted')}
              </Badge>
            </div>
          </div>

          {/* Simple Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              {t('admin.adminPanelInfo')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
