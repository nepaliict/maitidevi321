import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Coins, 
  Users, 
  Gamepad2, 
  Settings,
  ArrowLeft,
  Plus,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function MasterAdminPanel() {
  const { user, logout, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mint Coins Form
  const [mintForm, setMintForm] = useState({
    to_user_id: '',
    amount: '',
    description: ''
  });

  // Create User Form
  const [userForm, setUserForm] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    role: 'admin'
  });

  useEffect(() => {
    if (!isMasterAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isMasterAdmin, navigate]);

  const loadData = async () => {
    try {
      const [usersData, gamesData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getGames()
      ]);
      setUsers(usersData);
      setGames(gamesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleMintCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.mintCoins(
        mintForm.to_user_id,
        parseFloat(mintForm.amount),
        mintForm.description
      );
      toast.success('Coins minted successfully!');
      setMintForm({ to_user_id: '', amount: '', description: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mint coins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.createUser(userForm);
      toast.success('User created successfully!');
      setUserForm({ email: '', username: '', password: '', full_name: '', role: 'admin' });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Master Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user?.full_name || user?.username}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Gamepad2 },
            { id: 'mint', label: 'Mint Coins', icon: Coins },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'games', label: 'Game Management', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-neon-green/20 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Games</p>
                  <p className="text-2xl font-bold">{games.length}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">System Status</p>
                  <p className="text-2xl font-bold text-neon-green">Online</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mint Coins Tab */}
        {activeTab === 'mint' && (
          <div className="max-w-2xl">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Coins className="w-6 h-6 text-accent" />
                Mint Coins
              </h2>

              <form onSubmit={handleMintCoins} className="space-y-4">
                <div>
                  <Label htmlFor="to_user_id">Target User ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="to_user_id"
                      value={mintForm.to_user_id}
                      onChange={(e) => setMintForm({ ...mintForm, to_user_id: e.target.value })}
                      placeholder="Enter user ID"
                      required
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={mintForm.amount}
                    onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={mintForm.description}
                    onChange={(e) => setMintForm({ ...mintForm, description: e.target.value })}
                    placeholder="e.g., Initial allocation"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Minting...' : 'Mint Coins'}
                </Button>
              </form>

              {/* Recent Users List */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Quick Select Users</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users.slice(0, 10).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => setMintForm({ ...mintForm, to_user_id: u.id })}
                    >
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Create User Form */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" />
                Create New User
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-muted border border-border"
                  >
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </div>

            {/* Users List */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">All Users</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {users.map((u) => (
                  <div key={u.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          u.role === 'master_admin' ? 'bg-accent/20 text-accent' :
                          u.role === 'admin' ? 'bg-primary/20 text-primary' :
                          u.role === 'agent' ? 'bg-secondary/20 text-secondary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                        {u.is_active ? (
                          <span className="text-xs px-2 py-1 bg-neon-green/20 text-neon-green rounded">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded">
                            Suspended
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Balance: ₹{u.wallet_balance?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-muted-foreground">
                        KYC: {u.kyc_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Games Management Tab */}
        {activeTab === 'games' && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-neon-green" />
              Game Management
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <div key={game.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{game.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      game.is_active ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {game.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Bet:</span>
                      <span className="font-mono">₹{game.min_bet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Bet:</span>
                      <span className="font-mono">₹{game.max_bet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RTP:</span>
                      <span className="font-mono">{game.rtp}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {games.length === 0 && (
              <div className="text-center py-12">
                <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No games available</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
