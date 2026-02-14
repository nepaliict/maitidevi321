import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
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
  const [darkMode, setDarkMode] = useState(true);
  const modules = getModulesForRole(role);
  const roleConfig = ROLE_CONFIG[role];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } border-r border-border bg-card/50 flex flex-col transition-all duration-300 relative`}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

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
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center`}
              >
                <span className="text-sm font-bold text-white">
                  {roleConfig.label[0]}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-lg">KarnaliX</h2>
                <Badge className={roleConfig.badge}>{roleConfig.label}</Badge>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center`}
            >
              <span className="text-sm font-bold text-white">
                {roleConfig.label[0]}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {modules.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  title={collapsed ? mod.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="font-medium truncate">{mod.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2">
          {/* Dark/Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            {darkMode ? <Moon className="w-4 h-4 shrink-0" /> : <Sun className="w-4 h-4 shrink-0" />}
            {!collapsed && <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          <Separator />

          {/* User Info */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-bold">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <h1 className="text-xl font-bold">
                {modules.find((m) => m.id === activeModule)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {modules.find((m) => m.id === activeModule)?.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium font-mono">
                    ₹{user.wallet_balance?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          {children({ activeModule, setActiveModule })}
        </div>
      </main>
    </div>
  );
}
