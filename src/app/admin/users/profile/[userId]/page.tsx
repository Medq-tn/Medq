'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Calendar, Award, Activity, Settings, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface UserProfileData {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    emailVerified: Date | null;
    profileCompleted: boolean;
    niveauId: string | null;
    semesterId: string | null;
    niveau: { id: string; name: string } | null;
    semester: { id: string; name: string } | null;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
    subscription: {
      hasActiveSubscription: boolean;
      subscriptionExpiresAt: string | null;
    };
  };
  statistics: {
    totalQuestions: number;
    completedQuestions: number;
    completionRate: number;
    averageScore: number;
    recentActivity30Days: number;
    accountAgeDays: number;
    uniqueStudyDays: number;
    avgSessionsPerWeek: number;
    totalPinnedItems: number;
    totalComments: number;
  };
  academicProgress: Array<{
    specialtyId: string;
    specialtyName: string;
    icon: string | null;
    totalLectures: number;
  }>;
  subscriptionHistory: Array<{
    hasActiveSubscription: boolean;
    subscriptionExpiresAt: string | null;
  }>;
  engagement: {
    level: string;
    lastActiveWithin: string;
    consistencyScore: number;
  };
}

export default function UserProfileManagementPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    niveauId: '',
    semesterId: '',
    emailVerified: false,
    profileCompleted: false
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/admin/users/profile/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const profileData = await response.json();
        setData(profileData);
        
        // Initialize form data
        setFormData({
          name: profileData.user.name || '',
          email: profileData.user.email || '',
          role: profileData.user.role || '',
          niveauId: profileData.user.niveauId || '',
          semesterId: profileData.user.semesterId || '',
          emailVerified: !!profileData.user.emailVerified,
          profileCompleted: profileData.user.profileCompleted
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/profile/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      const result = await response.json();
      
      // Refresh the data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'maintainer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'Très élevé': return 'text-green-600 dark:text-green-400';
      case 'Élevé': return 'text-blue-600 dark:text-blue-400';
      case 'Modéré': return 'text-yellow-600 dark:text-yellow-400';
      case 'Faible': return 'text-orange-600 dark:text-orange-400';
      case 'Très faible': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout>
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (error || !data) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Erreur
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || 'Impossible de charger les données du profil'}
            </p>
            <Button asChild>
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux utilisateurs
              </Link>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/admin/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Profil - {data.user.name || data.user.email}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Gestion du profil et paramètres utilisateur
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={editMode ? "destructive" : "outline"}
                onClick={() => setEditMode(!editMode)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {editMode ? "Annuler" : "Modifier"}
              </Button>
              {editMode && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Informations</TabsTrigger>
              <TabsTrigger value="academic">Académique</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
              <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations de base
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Rôle</Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Étudiant</SelectItem>
                              <SelectItem value="maintainer">Mainteneur</SelectItem>
                              <SelectItem value="admin">Administrateur</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>Nom complet</Label>
                          <p className="font-medium">{data.user.name || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="font-medium">{data.user.email}</p>
                        </div>
                        <div>
                          <Label>Rôle</Label>
                          <Badge className={getRoleColor(data.user.role)}>
                            {data.user.role}
                          </Badge>
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Label>Email vérifié</Label>
                      {editMode ? (
                        <Switch
                          checked={formData.emailVerified}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, emailVerified: checked })
                          }
                        />
                      ) : (
                        <Badge variant={data.user.emailVerified ? "default" : "secondary"}>
                          {data.user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Profil complété</Label>
                      {editMode ? (
                        <Switch
                          checked={formData.profileCompleted}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, profileCompleted: checked })
                          }
                        />
                      ) : (
                        <Badge variant={data.user.profileCompleted ? "default" : "secondary"}>
                          {data.user.profileCompleted ? 'Complété' : 'Incomplet'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Détails du compte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Créé le</Label>
                      <p className="font-medium">{formatDate(data.user.createdAt)}</p>
                    </div>
                    <div>
                      <Label>Dernière modification</Label>
                      <p className="font-medium">{formatDate(data.user.updatedAt)}</p>
                    </div>
                    <div>
                      <Label>Âge du compte</Label>
                      <p className="font-medium">{data.statistics.accountAgeDays} jours</p>
                    </div>
                    <div>
                      <Label>ID utilisateur</Label>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {data.user.id}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Level */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Niveau académique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Niveau</Label>
                      <p className="font-medium">
                        {data.user.niveau?.name || 'Non défini'}
                      </p>
                    </div>
                    <div>
                      <Label>Semestre</Label>
                      <p className="font-medium">
                        {data.user.semester?.name || 'Non défini'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques de progression</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Questions tentées</Label>
                        <p className="text-2xl font-bold">{data.statistics.totalQuestions}</p>
                      </div>
                      <div>
                        <Label>Questions complétées</Label>
                        <p className="text-2xl font-bold">{data.statistics.completedQuestions}</p>
                      </div>
                      <div>
                        <Label>Taux de réussite</Label>
                        <p className="text-2xl font-bold">{data.statistics.completionRate}%</p>
                      </div>
                      <div>
                        <Label>Score moyen</Label>
                        <p className="text-2xl font-bold">{data.statistics.averageScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Specialties Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Spécialités étudiées</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.academicProgress.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.academicProgress.map((specialty) => (
                        <div key={specialty.specialtyId} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{specialty.specialtyName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {specialty.totalLectures} cours
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Aucune spécialité étudiée
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Niveau d'engagement</Label>
                        <p className={`text-lg font-bold ${getEngagementColor(data.engagement.level)}`}>
                          {data.engagement.level}
                        </p>
                      </div>
                      <div>
                        <Label>Score de consistance</Label>
                        <p className="text-lg font-bold">{data.engagement.consistencyScore}%</p>
                      </div>
                      <div>
                        <Label>Dernière activité</Label>
                        <p className="font-medium">{data.engagement.lastActiveWithin}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Activité récente (30 jours)</Label>
                        <p className="text-2xl font-bold">{data.statistics.recentActivity30Days}</p>
                      </div>
                      <div>
                        <Label>Jours d'étude uniques</Label>
                        <p className="text-2xl font-bold">{data.statistics.uniqueStudyDays}</p>
                      </div>
                      <div>
                        <Label>Sessions/semaine (moy.)</Label>
                        <p className="text-2xl font-bold">{data.statistics.avgSessionsPerWeek}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Éléments épinglés</Label>
                        <p className="text-2xl font-bold">{data.statistics.totalPinnedItems}</p>
                      </div>
                      <div>
                        <Label>Commentaires</Label>
                        <p className="text-2xl font-bold">{data.statistics.totalComments}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>État de l'abonnement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Abonnement actif</Label>
                      <Badge variant={data.user.subscription.hasActiveSubscription ? "default" : "secondary"}>
                        {data.user.subscription.hasActiveSubscription ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    {data.user.subscription.subscriptionExpiresAt && (
                      <div>
                        <Label>Expire le</Label>
                        <p className="font-medium">
                          {formatDate(data.user.subscription.subscriptionExpiresAt)}
                        </p>
                      </div>
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
