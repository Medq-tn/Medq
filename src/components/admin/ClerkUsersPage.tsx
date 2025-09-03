'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, ArrowUpDown, X, Check, Trash, Loader2 } from 'lucide-react';
import { getUsers, updateUserRole, updateUserNiveau, getAllNiveaux } from '@/lib/actions/admin';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'student' | 'maintainer' | 'admin';
  createdAt: Date;
  profileCompleted: boolean;
  hasActiveSubscription: boolean;
  subscriptionExpiresAt: Date | null;
  niveau: {
    id: string;
    name: string;
  } | null;
}

interface Niveau {
  id: string;
  name: string;
  order: number;
}

interface PaginationInfo {
  page: number;
  totalPages: number;
  totalItems: number;
}

export function ClerkUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Created');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  
  // Role change confirmation dialog state
  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    isOpen: boolean;
    userId: string;
    currentRole: string;
    newRole: string;
    userName: string;
    confirmationText: string;
  }>({
    isOpen: false,
    userId: '',
    currentRole: '',
    newRole: '',
    userName: '',
    confirmationText: '',
  });

  // Filter state
  const [filters, setFilters] = useState({
    roles: [] as string[],
    niveaux: [] as string[],
    hasActiveSubscription: null as boolean | null,
    profileCompleted: null as boolean | null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Inline JS confirm delete
  const confirmDeleteInline = async (userId: string, userEmail: string) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Delete ${userEmail}? This action cannot be undone.`);
      if (!ok) return;
    }
    try {
      // Optimistically hide the row immediately
      setPendingDeleteIds(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }
      // Commit removal after server success
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: 'User deleted', description: `${userEmail} has been removed.` });
    } catch (err) {
      console.error('Delete user error:', err);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
      // Revert the optimistic hide on error
      setPendingDeleteIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
    finally {
      // Ensure cleanup if success path removed user, the id may already be gone; safe to delete
      setPendingDeleteIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const fetchUsers = async (page = 1, searchTerm = search, currentFilters = filters) => {
    setIsLoading(true);
    try {
      const [usersResult, niveauxResult] = await Promise.all([
        getUsers(page, 10, searchTerm, currentFilters),
        getAllNiveaux()
      ]);
      
      setUsers(usersResult.users);
      setNiveaux(niveauxResult);
      setPagination({
        page: usersResult.page,
        totalPages: usersResult.totalPages,
        totalItems: usersResult.total
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'maintainer' | 'admin') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Open confirmation dialog
    setRoleChangeDialog({
      isOpen: true,
      userId,
      currentRole: user.role,
      newRole,
      userName: user.name || user.email,
      confirmationText: '',
    });
  };

  const confirmRoleChange = async () => {
    const { userId, newRole, confirmationText } = roleChangeDialog;
    
    // Check if the confirmation text matches the new role
    if (confirmationText.toLowerCase() !== newRole.toLowerCase()) {
      toast({
        title: "Invalid Confirmation",
        description: `Please type "${newRole}" to confirm the role change`,
        variant: "destructive",
      });
      return;
    }

    try {
      const typedNewRole = newRole as 'student' | 'maintainer' | 'admin';
      await updateUserRole(userId, typedNewRole);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: typedNewRole } : user
      ));
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      });
      
      // Close dialog and reset state
      setRoleChangeDialog({
        isOpen: false,
        userId: '',
        currentRole: '',
        newRole: '',
        userName: '',
        confirmationText: '',
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const cancelRoleChange = () => {
    setRoleChangeDialog({
      isOpen: false,
      userId: '',
      currentRole: '',
      newRole: '',
      userName: '',
      confirmationText: '',
    });
  };

  const handleNiveauChange = async (userId: string, niveauId: string | null) => {
    try {
      await updateUserNiveau(userId, niveauId);
      const selectedNiveau = niveauId ? niveaux.find(n => n.id === niveauId) : null;
      setUsers(prev => prev.map(user => 
        user.id === userId ? { 
          ...user, 
          niveau: selectedNiveau ? { id: selectedNiveau.id, name: selectedNiveau.name } : null 
        } : user
      ));
      toast({
        title: "Niveau Updated",
        description: `User niveau has been updated to ${selectedNiveau?.name || 'No niveau'}`,
      });
    } catch (error) {
      console.error('Error updating user niveau:', error);
      toast({
        title: "Error",
        description: "Failed to update user niveau",
        variant: "destructive",
      });
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    ((searchTerm: string) => {
      setIsLoading(true);
      fetchUsers(1, searchTerm, filters);
    }),
    [filters]
  );

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        debouncedSearch(search);
      } else {
        fetchUsers(1, '', filters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    fetchUsers(currentPage, search, filters);
  }, [filters]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string | boolean | null, checked?: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (filterType) {
        case 'role':
          if (checked) {
            newFilters.roles = [...prev.roles, value as string];
          } else {
            newFilters.roles = prev.roles.filter(role => role !== value);
          }
          break;
        case 'niveau':
          if (checked) {
            newFilters.niveaux = [...prev.niveaux, value as string];
          } else {
            newFilters.niveaux = prev.niveaux.filter(niveau => niveau !== value);
          }
          break;
        case 'hasActiveSubscription':
          newFilters.hasActiveSubscription = value as boolean | null;
          break;
        case 'profileCompleted':
          newFilters.profileCompleted = value as boolean | null;
          break;
      }
      
      return newFilters;
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      roles: [],
      niveaux: [],
      hasActiveSubscription: null,
      profileCompleted: null,
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.roles.length;
    count += filters.niveaux.length;
    if (filters.hasActiveSubscription !== null) count++;
    if (filters.profileCompleted !== null) count++;
    return count;
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
    return colors[parseInt(id) % colors.length];
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const TableSkeleton = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">
                <div className="flex items-center gap-2">
                  User
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center gap-2">
                  Role
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center gap-2">
                  Niveau
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center gap-2">
                  Last signed in
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center gap-2">
                  Joined
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted/70 dark:bg-muted/30 rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-muted/70 dark:bg-muted/30 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-muted/70 dark:bg-muted/30 rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-10 w-32 bg-muted/70 dark:bg-muted/30 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-10 w-32 bg-muted/70 dark:bg-muted/30 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted/70 dark:bg-muted/30 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted/70 dark:bg-muted/30 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-muted/70 dark:bg-muted/30 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Sort by:</span>
                <span>{sortBy}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Created">Created</SelectItem>
              <SelectItem value="Name">Name</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                disabled={isLoading}
                className={`relative transition-all duration-200 ${
                  getActiveFilterCount() > 0 
                    ? 'border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:border-blue-400 dark:hover:bg-blue-900/60 dark:text-blue-200' 
                    : 'hover:bg-muted dark:hover:bg-muted dark:border-muted-foreground/20 dark:text-foreground'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-300 dark:text-blue-900 font-medium">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 border border-border bg-background dark:bg-slate-900 shadow-lg dark:shadow-2xl dark:shadow-black/20" align="end">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-foreground" />
                    <h4 className="font-semibold text-foreground">Filter Users</h4>
                  </div>
                  {getActiveFilterCount() > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Role Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 dark:text-slate-200">
                    Role
                    {filters.roles.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-2 dark:bg-slate-700 dark:text-slate-200">
                        {filters.roles.length}
                      </Badge>
                    )}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['student', 'maintainer', 'admin'].map((role) => (
                      <div key={role} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 dark:hover:bg-slate-800/60 transition-colors">
                        <Checkbox
                          id={`role-${role}`}
                          checked={filters.roles.includes(role)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('role', role, checked as boolean)
                          }
                          className="dark:border-slate-600 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500"
                        />
                        <Label 
                          htmlFor={`role-${role}`} 
                          className="text-sm capitalize cursor-pointer flex-1 dark:text-slate-200"
                        >
                          {role}
                        </Label>
                        {filters.roles.includes(role) && (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Niveau Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 dark:text-slate-200">
                    Niveau
                    {filters.niveaux.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-2 dark:bg-slate-700 dark:text-slate-200">
                        {filters.niveaux.length}
                      </Badge>
                    )}
                  </Label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {niveaux.map((niveau) => (
                      <div key={niveau.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 dark:hover:bg-slate-800/60 transition-colors">
                        <Checkbox
                          id={`niveau-${niveau.id}`}
                          checked={filters.niveaux.includes(niveau.id)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('niveau', niveau.id, checked as boolean)
                          }
                          className="dark:border-slate-600 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500"
                        />
                        <Label 
                          htmlFor={`niveau-${niveau.id}`} 
                          className="text-sm cursor-pointer flex-1 dark:text-slate-200"
                        >
                          {niveau.name}
                        </Label>
                        {filters.niveaux.includes(niveau.id) && (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Subscription Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium dark:text-slate-200">Subscription Status</Label>
                  <Select 
                    value={filters.hasActiveSubscription === null ? 'all' : 
                           filters.hasActiveSubscription ? 'active' : 'inactive'}
                    onValueChange={(value) => 
                      handleFilterChange('hasActiveSubscription', 
                        value === 'all' ? null : value === 'active')
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All users</SelectItem>
                      <SelectItem value="active">Active subscription</SelectItem>
                      <SelectItem value="inactive">No subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Profile Completion Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium dark:text-slate-200">Profile Status</Label>
                  <Select 
                    value={filters.profileCompleted === null ? 'all' : 
                           filters.profileCompleted ? 'completed' : 'incomplete'}
                    onValueChange={(value) => 
                      handleFilterChange('profileCompleted', 
                        value === 'all' ? null : value === 'completed')
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All profiles</SelectItem>
                      <SelectItem value="completed">Profile completed</SelectItem>
                      <SelectItem value="incomplete">Profile incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Apply/Reset Buttons */}
                {getActiveFilterCount() > 0 && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearAllFilters}
                        className="flex-1"
                      >
                        Reset Filters
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/30 dark:bg-muted/20 rounded-lg border dark:border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filters.roles.map(role => (
              <Badge key={role} variant="secondary" className="capitalize bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors">
                Role: {role}
                <button 
                  onClick={() => handleFilterChange('role', role, false)}
                  className="ml-2 hover:bg-blue-300 dark:hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.niveaux.map(niveauId => {
              const niveau = niveaux.find(n => n.id === niveauId);
              return niveau ? (
                <Badge key={niveauId} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors">
                  Niveau: {niveau.name}
                  <button 
                    onClick={() => handleFilterChange('niveau', niveauId, false)}
                    className="ml-2 hover:bg-green-300 dark:hover:bg-green-700 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ) : null;
            })}
            {filters.hasActiveSubscription !== null && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800 transition-colors">
                {filters.hasActiveSubscription ? 'Active subscription' : 'No subscription'}
                <button 
                  onClick={() => handleFilterChange('hasActiveSubscription', null)}
                  className="ml-2 hover:bg-purple-300 dark:hover:bg-purple-700 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.profileCompleted !== null && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800 transition-colors">
                {filters.profileCompleted ? 'Profile completed' : 'Profile incomplete'}
                <button 
                  onClick={() => handleFilterChange('profileCompleted', null)}
                  className="ml-2 hover:bg-orange-300 dark:hover:bg-orange-700 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Users Table */}
      {isLoading ? <TableSkeleton /> : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">
                  <div className="flex items-center gap-2">
                    User
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-medium">
                  <div className="flex items-center gap-2">
                    Role
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-medium">
                  <div className="flex items-center gap-2">
                    Niveau
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-medium">
                  <div className="flex items-center gap-2">
                    Last signed in
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-medium">
                  <div className="flex items-center gap-2">
                    Joined
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className={`relative transition-opacity ${pendingDeleteIds.has(user.id) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${getAvatarColor(user.id)} text-white text-sm font-medium`}>
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.name || user.email.split('@')[0]}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={user.role} 
                      onValueChange={(newRole: 'student' | 'maintainer' | 'admin') => handleRoleChange(user.id, newRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="maintainer">Maintainer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={user.niveau?.id || "none"} 
                      onValueChange={(niveauId) => handleNiveauChange(user.id, niveauId === "none" ? null : niveauId)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No niveau</SelectItem>
                        {niveaux.map((niveau) => (
                          <SelectItem key={niveau.id} value={niveau.id}>
                            {niveau.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(user.createdAt)}
                  </TableCell>
          <TableCell className="text-right overflow-visible">
                    <Button
                      type="button"
                      variant="destructive"
            size="sm"
                      onClick={() => confirmDeleteInline(user.id, user.email)}
                      aria-label={`Delete ${user.email}`}
                      className="min-w-[112px] pointer-events-auto relative z-[1]"
                      disabled={pendingDeleteIds.has(user.id)}
                      aria-busy={pendingDeleteIds.has(user.id)}
                    >
                      {pendingDeleteIds.has(user.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting…
                        </>
                      ) : (
                        <>
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            1-10 of {pagination.totalItems}
          </div>
          <div className="flex items-center gap-2">
            <span>Results per page</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="sm" disabled={currentPage === 1}>
                1
              </Button>
              {pagination.totalPages > 1 && (
                <Button variant="ghost" size="sm">
                  2
                </Button>
              )}
              {pagination.totalPages > 2 && (
                <Button variant="ghost" size="sm">
                  3
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Dialog */}
      <Dialog open={roleChangeDialog.isOpen} onOpenChange={cancelRoleChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              You are about to change the role of <strong>{roleChangeDialog.userName}</strong> from{' '}
              <strong>{roleChangeDialog.currentRole}</strong> to <strong>{roleChangeDialog.newRole}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> This action will change the user's permissions and access level.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmation-input">
                Type <strong>"{roleChangeDialog.newRole}"</strong> to confirm:
              </Label>
              <Input
                id="confirmation-input"
                value={roleChangeDialog.confirmationText}
                onChange={(e) => setRoleChangeDialog(prev => ({
                  ...prev,
                  confirmationText: e.target.value
                }))}
                placeholder={`Type "${roleChangeDialog.newRole}" here`}
                className="font-mono"
              />
            </div>

  {/* No custom delete dialog; using native window.confirm */}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelRoleChange}>
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={roleChangeDialog.confirmationText.toLowerCase() !== roleChangeDialog.newRole.toLowerCase()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Role Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
