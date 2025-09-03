'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  User, 
  BarChart3, 
  BookOpen, 
  Activity,
  Calendar,
  Mail,
  GraduationCap,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface UserDetails {
  id: string;
  email: string;
  name: string | null;
  role: 'student' | 'maintainer' | 'admin';
  profileCompleted: boolean;
  hasActiveSubscription: boolean;
  createdAt: string;
  niveau?: {
    name: string;
  } | null;
  semester?: {
    name: string;
  } | null;
  stats: {
    totalProgress: number;
    completedLectures: number;
    averageScore: number;
    totalQuestions: number;
    recentActivity: Array<{
      type: string;
      lectureTitle: string;
      score: number;
      createdAt: string;
    }>;
  };
}

export default function AdminUserDashboardPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de l\'utilisateur',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur réseau lors du chargement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'maintainer': return 'secondary';
      case 'student': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Chargement du tableau de bord utilisateur...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h2>
            <Button asChild>
              <Link href="/admin/users">Retour à la liste des utilisateurs</Link>
            </Button>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Utilisateur</h1>
              <p className="text-muted-foreground">
                Vue détaillée de l'activité et des performances de l'utilisateur
              </p>
            </div>
          </div>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{user.name || 'Nom non défini'}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                  {user.hasActiveSubscription && (
                    <Badge className="bg-green-100 text-green-800">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Inscrit le</p>
                    <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                
                {user.niveau && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Niveau</p>
                      <p className="text-sm text-muted-foreground">
                        {user.niveau.name}
                        {user.semester && ` - ${user.semester.name}`}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Profil</p>
                    <p className="text-sm text-muted-foreground">
                      {user.profileCompleted ? 'Complété' : 'Incomplet'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Score Moyen</p>
                    <p className="text-sm text-muted-foreground">
                      {user.stats.averageScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Dashboard */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progression Totale</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.stats.totalProgress}</div>
                    <p className="text-xs text-muted-foreground">activités complétées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cours Terminés</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.stats.completedLectures}</div>
                    <p className="text-xs text-muted-foreground">lectures complétées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Questions Répondues</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.stats.totalQuestions}</div>
                    <p className="text-xs text-muted-foreground">questions traitées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.stats.averageScore.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">score moyen</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Détails de Progression</CardTitle>
                  <CardDescription>
                    Analyse détaillée des performances par cours et spécialité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cette section sera développée pour afficher des graphiques détaillés de progression.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activité Récente</CardTitle>
                  <CardDescription>
                    Dernières activités de l'utilisateur sur la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.stats.recentActivity.length > 0 ? (
                      user.stats.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{activity.lectureTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(activity.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {activity.score.toFixed(1)}%
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Aucune activité récente</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
