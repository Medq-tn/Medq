'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, UserCheck, UserX, TrendingUp, Calendar, MoreHorizontal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState, useEffect } from 'react';
import { getAdminStats, getUsers, getAdminAnalytics } from '@/lib/actions/admin';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    active: number;
    newUsers: number;
    retained: number;
    reactivated: number;
    period: string;
  };
  chartData: Array<{
    date: string;
    newUsers: number;
    retained: number;
    reactivated: number;
    churned: number;
  }>;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    status: 'retained' | 'reactivated' | 'new' | 'churned';
    createdAt: Date;
    avatar?: string;
  }>;
  reports: {
    signUpsPerWeek: number;
    signInsPerWeek: number;
    totalSignUps: number;
  };
}

export function EnhancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [interval, setInterval] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(5);
  const [usersTotal, setUsersTotal] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      active: 0,
      newUsers: 0,
      retained: 0,
      reactivated: 0,
      period: 'Loading...'
    },
    chartData: [],
    recentUsers: [],
    reports: {
      signUpsPerWeek: 0,
      signInsPerWeek: 0,
      totalSignUps: 0
    }
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      
      // Parse date range for API call
      const today = new Date();
      let startDate: Date;
      let endDate = today;
      
      switch (dateRange) {
        case 'Last 7 days':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Last 30 days':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'Last 90 days':
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Fetch real analytics data
      const [adminStats, analyticsResult] = await Promise.all([
        getAdminStats(),
        getAdminAnalytics({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          interval,
        })
      ]);
      
      // Transform chart data
      const chartData = analyticsResult.chartData.map(item => ({
        date: formatChartDate(item.date, interval),
        newUsers: item.newUsers,
        retained: item.retained || 0,
        reactivated: item.reactivated || 0,
        churned: -(item.churned || 0), // Negative for display
      }));

      setAnalyticsData({
        overview: {
          active: analyticsResult.overview.active,
          newUsers: analyticsResult.overview.newUsers,
          retained: analyticsResult.overview.retained,
          reactivated: analyticsResult.overview.reactivated,
          period: analyticsResult.overview.period || `${dateRange} (${interval})`
        },
        chartData,
        recentUsers: analyticsData.recentUsers, // keep current list; updated separately
        reports: analyticsResult.reports,
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchUsersPage = async () => {
    try {
      setUsersLoading(true);
      const usersData = await getUsers(userPage, userLimit);
      const transformedRecentUsers = usersData.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: determineUserStatus(user),
        createdAt: user.createdAt,
      }));
      setUsersTotal(usersData.total);
      setAnalyticsData(prev => ({
        ...prev,
        recentUsers: transformedRecentUsers,
      }));
    } catch (error) {
      console.error('Error fetching users page:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, interval]);

  useEffect(() => {
    fetchUsersPage();
  }, [userPage, userLimit]);

  const determineUserStatus = (user: any): 'retained' | 'reactivated' | 'new' | 'churned' => {
    if (user.hasActiveSubscription) return 'retained';
    
    const daysSinceCreated = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated <= 7) return 'new';
    if (daysSinceCreated <= 30) return 'reactivated';
    return 'churned';
  };

  const formatChartDate = (date: string, interval: string): string => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    switch (interval) {
      case 'Daily':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'Weekly': {
        const week = Math.max(1, Math.ceil(d.getDate() / 7));
        const mon = d.toLocaleDateString('en-US', { month: 'short' });
        return `Week ${week}, ${mon}`;
      }
      case 'Monthly':
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'retained': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'reactivated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'new': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'churned': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    // Hash the UUID string to get a consistent color index
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6">
  {analyticsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Date range</span>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last 90 days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Interval</span>
            <Select value={interval} onValueChange={(value: 'Daily' | 'Weekly' | 'Monthly') => setInterval(value)}>
              <SelectTrigger className="w-full sm:w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.active}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.overview.period}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.newUsers}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.overview.period}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retained</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.retained}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.overview.period}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reactivated</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.reactivated}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.overview.period}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 items-center">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">New users</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm">Reactivated</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Retained</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-sm">Retained churned</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <span className="text-sm">Reactivated churned</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-black"></div>
              <span className="text-sm">New users churned</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Bar dataKey="newUsers" stackId="positive" fill="#10b981" />
              <Bar dataKey="retained" stackId="positive" fill="#3b82f6" />
              <Bar dataKey="reactivated" stackId="positive" fill="#8b5cf6" />
              <Bar dataKey="churned" stackId="negative" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Cohort Table and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Cohort */}
        <Card className="lg:col-span-2">
          <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle>User cohort</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {`${(usersTotal === 0 ? 0 : (userPage - 1) * userLimit + 1)}-${Math.min(userPage * userLimit, usersTotal)} of ${usersTotal} • Results per page:`}
                  <select
                    className="ml-1 rounded border border-border bg-background px-2 py-0.5 text-xs"
                    value={userLimit}
                    onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      setUserLimit(newLimit);
                      setUserPage(1);
                    }}
                  >
                    {[5, 10, 20, 50].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentUsers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(user.id)}`}>
                      {getInitials(user.name, user.email)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-row flex-wrap">
                    <Badge className={getStatusColor(user.status)}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {user.createdAt.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {usersLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserPage(p => Math.max(1, p - 1))}
                disabled={userPage <= 1 || usersLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {usersTotal === 0 ? '0/0' : `${userPage}/${Math.max(1, Math.ceil(usersTotal / userLimit))}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserPage(p => Math.min(Math.max(1, Math.ceil(usersTotal / userLimit)), p + 1))}
                disabled={userPage >= Math.max(1, Math.ceil(usersTotal / userLimit)) || usersLoading}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Inscriptions par semaine</div>
              </div>
              <div className="text-2xl font-bold">{analyticsData.reports.signUpsPerWeek}</div>
              <div className="text-xs text-muted-foreground">{analyticsData.overview.period}</div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={analyticsData.chartData.slice(-10)}>
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{analyticsData.chartData[0]?.date || 'Début'}</span>
                <span>{analyticsData.chartData[analyticsData.chartData.length - 1]?.date || 'Fin'}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-xs" asChild>
                <Link href="/admin/users" aria-label="Voir tous les utilisateurs">
                  Voir tous les utilisateurs →
                </Link>
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Connexions par semaine</div>
              </div>
              <div className="text-2xl font-bold">{analyticsData.reports.signInsPerWeek}</div>
              <div className="text-xs text-muted-foreground">{analyticsData.overview.period}</div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={analyticsData.chartData.slice(-10)}>
                  <Line 
                    type="monotone" 
                    dataKey="retained" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{analyticsData.chartData[0]?.date || 'Début'}</span>
                <span>{analyticsData.chartData[analyticsData.chartData.length - 1]?.date || 'Fin'}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-xs" asChild>
                <Link href="/admin/users" aria-label="Voir tous les utilisateurs">
                  Voir tous les utilisateurs →
                </Link>
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Total des inscriptions</div>
              </div>
              <div className="text-2xl font-bold">{analyticsData.reports.totalSignUps.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Depuis le début</div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={analyticsData.chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{analyticsData.chartData[0]?.date || 'Début'}</span>
                <span>{analyticsData.chartData[analyticsData.chartData.length - 1]?.date || 'Fin'}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-xs" asChild>
                <Link href="/admin/users" aria-label="Voir tous les utilisateurs">
                  Voir tous les utilisateurs →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
