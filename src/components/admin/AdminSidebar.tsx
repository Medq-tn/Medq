'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  X, 
  GraduationCap,
  Brain
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
// toast removed
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, setOpen, setOpenMobile, isMobile: sidebarIsMobile, open, openMobile, toggleSidebar } = useSidebar();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const iconSize = state === 'expanded' ? 'h-5 w-5' : 'h-6 w-6';
  const isCollapsedDesktop = !isMobile && state !== 'expanded';
  
  const studentPanelItem = {
    label: t('admin.studentPanel') || 'Student Panel',
    icon: GraduationCap,
    href: '/dashboard',
    description: 'Go to student dashboard'
  };
  
  const isAdmin = user?.role === 'admin';
  const isMaintainer = user?.role === 'maintainer';

  const adminMenuItems = [
    { label: t('admin.dashboard'), icon: LayoutDashboard, href: '/admin', description: 'Admin dashboard overview' },
    { label: t('admin.users'), icon: Users, href: '/admin/users', description: 'Manage users' },
    studentPanelItem
  ];

  const maintainerMenuItems = [
    studentPanelItem
  ];

  const menuItems = isAdmin ? adminMenuItems : isMaintainer ? maintainerMenuItems : [studentPanelItem];

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (err) {
      console.error('Unexpected sign out error:', err);
    }
  };

  const handleCloseSidebar = () => {
    if (sidebarIsMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  // Hide Crisp bubble when mobile sidebar is open to avoid overlap
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (!w.$crisp) return;
    try {
      if (openMobile) {
        w.$crisp.push(["do", "chat:hide"]);
      } else {
        w.$crisp.push(["do", "chat:show"]);
      }
    } catch (_) {
      // noop
    }
  }, [openMobile]);

  return (
    <>
  <Sidebar className="border-r border-border bg-background shadow-xl sm:shadow-lg group-data-[collapsible=icon]:bg-background group-data-[collapsible=icon]:shadow-lg group-data-[collapsible=icon]:border-r" collapsible="icon">
  <SidebarHeader className={`border-b border-border py-3 sm:py-4 ${state === 'expanded' ? 'bg-white px-4 sm:px-6' : 'bg-transparent px-2 border-b-0'}`}>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseSidebar}
      className="md:hidden hover:bg-muted rounded-xl"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close sidebar</span>
                </Button>
              )}
      {(state === "expanded" || isMobile) ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
        <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      MedQ
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Admin Panel</span>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
      <ScrollArea className={`h-full ${state === 'expanded' ? 'pr-1' : 'pr-0'} pb-4`}>
            <SidebarGroup className="mt-3 sm:mt-4">
              <SidebarGroupContent>
                <SidebarMenu className={`space-y-1.5 ${state === 'expanded' ? 'px-2 sm:px-3' : 'px-0'}`}>
                  {menuItems.slice(0, -1).map((item) => {
                    // Check if current page matches the item
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                          asChild 
                          tooltip={item.label}
              className={(() => {
                            const base = 'group transition-all duration-200 font-medium rounded-xl';
                            if (isCollapsedDesktop) {
                              const active = isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-700 hover:bg-blue-100';
                return `${base} h-10 w-full mx-0 flex items-center justify-center ${active}`;
                            }
                            const bg = isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-white hover:bg-blue-50 text-gray-900';
                            return `${base} px-3 py-3 min-h-[44px] flex items-center ${bg}`;
                          })()}
                        >
                          <Link href={item.href} className={`flex items-center ${state === 'expanded' ? 'gap-3 w-full' : 'justify-center'}`}>
                            <item.icon className={`${iconSize} ${isCollapsedDesktop ? 'text-current' : (isActive ? 'text-white' : 'text-blue-600')} transition-all flex-shrink-0`} />
                            {!isCollapsedDesktop && (
                              <span className={`block font-medium text-sm`}>
                                {item.label}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                    
                
                  
                
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
        
  <SidebarFooter className={`border-t border-border py-2.5 sm:py-3 ${state === 'expanded' ? 'bg-white px-3 sm:px-4' : 'bg-transparent px-2 border-t-0'}`}>
      <div className="space-y-2 pb-[max(env(safe-area-inset-bottom),8px)]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isCollapsedDesktop ? 'outline' : 'ghost'}
                  size={isCollapsedDesktop ? 'icon' : 'sm'}
                  className={`${isCollapsedDesktop
                    ? 'h-10 w-full mx-0 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-600/40 dark:hover:bg-red-900/20 flex items-center justify-center'
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl w-full justify-start px-3 py-3 min-h-[44px]'} `}
                  onClick={handleSignOut}
                  title={t('auth.signOut')}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsedDesktop && (
                    <span className="ml-3 font-medium text-sm">{t('auth.signOut')}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{t('auth.signOut')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarFooter>
      </Sidebar>
    {/* SidebarRail removed to prevent duplicate floating icons when collapsed */}
    </>
  );
}

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false} className="w-full">
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        {children}
      </div>
    </SidebarProvider>
  );
}