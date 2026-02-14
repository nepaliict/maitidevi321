import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  Wallet,
  Menu,
} from 'lucide-react';
import {
  type UserRole,
  type AdminModule,
  getModulesForRole,
  ROLE_CONFIG,
} from '@/config/adminRoles';

interface AdminLayoutProps {
  role: UserRole;
  children: (props: { activeModule: string; setActiveModule: (id: string) => void }) => React.ReactNode;
}

export default function AdminLayout({ role, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const modules = getModulesForRole(role);
  const roleConfig = ROLE_CONFIG[role];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleModuleClick = (id: string) => {
    setActiveModule(id);
    setMobileOpen(false);
  };

  // Group modules for better sidebar organization
  const moduleGroups = [
    { label: 'Overview', ids: ['dashboard', 'messages'] },
    { label: 'User Management', ids: ['super-users', 'master-users', 'player-users'] },
    { label: 'Finance', ids: ['kyc', 'deposits', 'withdrawals', 'settlement', 'exposure-transfer'] },
    { label: 'Gaming', ids: ['game-categories', 'game-providers', 'games', 'game-wallet', 'bonus-rules', 'player-transfer'] },
    { label: 'Reports', ids: ['game-logs', 'transaction-audit', 'transactions', 'activity-logs', 'analytics'] },
    { label: 'System', ids: ['sessions', 'super-settings'] },
  ];

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className={`w-full justify-start mb-3 ${collapsed ? 'px-2' : ''}`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2">Back to Platform</span>}
        </Button>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center shadow-lg`}
            >
              <span className="text-sm font-bold text-white">
                {roleConfig.label[0]}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-lg gradient-text">KarnaliX</h2>
              <Badge className={`${roleConfig.badge} text-xs`}>{roleConfig.label}</Badge>
            </div>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center shadow-lg cursor-default`}
              >
                <span className="text-sm font-bold text-white">
                  {roleConfig.label[0]}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{roleConfig.label}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {moduleGroups.map((group) => {
            const groupModules = modules.filter((m) => group.ids.includes(m.id));
            if (groupModules.length === 0) return null;
            return (
              <div key={group.label} className="mb-1">
                {!collapsed && (
                  <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {group.label}
                  </p>
                )}
                {collapsed && <Separator className="my-2" />}
                {groupModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeModule === mod.id;
                  const btn = (
                    <button
                      key={mod.id}
                      onClick={() => handleModuleClick(mod.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      {!collapsed && (
                        <span className="font-medium truncate text-sm">{mod.label}</span>
                      )}
                    </button>
                  );
                  if (collapsed) {
                    return (
                      <Tooltip key={mod.id}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right">{mod.label}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return <React.Fragment key={mod.id}>{btn}</React.Fragment>;
                })}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 shrink-0" /> : <Sun className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        <Separator />

        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className={`w-full ${collapsed ? 'px-2' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } border-r border-border bg-card/50 backdrop-blur-sm hidden lg:flex flex-col transition-all duration-300 relative`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top Bar */}
        <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold">
                  {modules.find((m) => m.id === activeModule)?.label || 'Dashboard'}
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                  {modules.find((m) => m.id === activeModule)?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Balance Pills */}
              {user && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-neon-green" />
                    <div>
                      <p className="text-[10px] text-muted-foreground leading-none">Main</p>
                      <p className="text-sm font-bold font-mono leading-tight">
                        ₹{user.wallet_balance?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground leading-none">P&L</p>
                      <p className="text-sm font-bold font-mono leading-tight">₹0</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {children({ activeModule, setActiveModule })}
        </div>
      </main>
    </div>
  );
}
