import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Save, Settings, Globe, Shield, DollarSign } from 'lucide-react';

export default function SuperSettingsModule() {
  const [loading, setLoading] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [settings, setSettings] = useState({
    ggr_coin: '',
    game_api_url: '',
    game_api_secret: '',
    min_withdraw: '',
    min_deposit: '',
    max_withdraw: '',
    max_deposit: '',
    exposure_limit: '',
  });

  const handleSave = () => {
    // API call would go here
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Super Settings</h2>
            <p className="text-muted-foreground text-sm">System-wide configuration</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {hasSettings ? 'Update Settings' : 'Create Settings'}
          </Button>
        </div>
      </div>

      {!hasSettings && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Settings className="w-5 h-5 text-accent" />
            <p className="text-sm">No settings configured yet. Fill in the form below and click <strong>Create Settings</strong>.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">GGR & Game API</CardTitle>
            </div>
            <CardDescription>Configure game API connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>GGR Coin</Label>
              <Input value={settings.ggr_coin} onChange={(e) => setSettings({ ...settings, ggr_coin: e.target.value })} placeholder="Enter GGR coin value" />
              <p className="text-xs text-muted-foreground mt-1">Total GGR available for distribution</p>
            </div>
            <div>
              <Label>Game API URL</Label>
              <Input value={settings.game_api_url} onChange={(e) => setSettings({ ...settings, game_api_url: e.target.value })} placeholder="https://api.example.com" />
            </div>
            <div>
              <Label>Game API Secret</Label>
              <Input type="password" value={settings.game_api_secret} onChange={(e) => setSettings({ ...settings, game_api_secret: e.target.value })} placeholder="••••••••" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neon-green" />
              <CardTitle className="text-base">Deposit & Withdrawal Limits</CardTitle>
            </div>
            <CardDescription>Set min/max transaction limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Deposit</Label><Input type="number" value={settings.min_deposit} onChange={(e) => setSettings({ ...settings, min_deposit: e.target.value })} placeholder="0" /></div>
              <div><Label>Max Deposit</Label><Input type="number" value={settings.max_deposit} onChange={(e) => setSettings({ ...settings, max_deposit: e.target.value })} placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Withdrawal</Label><Input type="number" value={settings.min_withdraw} onChange={(e) => setSettings({ ...settings, min_withdraw: e.target.value })} placeholder="0" /></div>
              <div><Label>Max Withdrawal</Label><Input type="number" value={settings.max_withdraw} onChange={(e) => setSettings({ ...settings, max_withdraw: e.target.value })} placeholder="0" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon-purple" />
              <CardTitle className="text-base">Exposure Configuration</CardTitle>
            </div>
            <CardDescription>Default exposure settings for new accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label>Default Exposure Limit</Label>
              <Input type="number" value={settings.exposure_limit} onChange={(e) => setSettings({ ...settings, exposure_limit: e.target.value })} placeholder="5000" />
              <p className="text-xs text-muted-foreground mt-1">
                Applied to new user accounts by default. When a user wins beyond this limit, excess goes to exposure_balance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
