import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Save } from 'lucide-react';

export default function SuperSettingsModule() {
  const [loading, setLoading] = useState(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Super Settings</h2>
          <p className="text-muted-foreground">System-wide configuration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>GGR & Game API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>GGR Coin</Label>
              <Input value={settings.ggr_coin} onChange={(e) => setSettings({ ...settings, ggr_coin: e.target.value })} placeholder="Enter GGR coin value" />
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

        <Card>
          <CardHeader>
            <CardTitle>Limits Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Deposit</Label>
                <Input type="number" value={settings.min_deposit} onChange={(e) => setSettings({ ...settings, min_deposit: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Max Deposit</Label>
                <Input type="number" value={settings.max_deposit} onChange={(e) => setSettings({ ...settings, max_deposit: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Withdrawal</Label>
                <Input type="number" value={settings.min_withdraw} onChange={(e) => setSettings({ ...settings, min_withdraw: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Max Withdrawal</Label>
                <Input type="number" value={settings.max_withdraw} onChange={(e) => setSettings({ ...settings, max_withdraw: e.target.value })} placeholder="0" />
              </div>
            </div>
            <Separator />
            <div>
              <Label>Default Exposure Limit</Label>
              <Input type="number" value={settings.exposure_limit} onChange={(e) => setSettings({ ...settings, exposure_limit: e.target.value })} placeholder="5000" />
              <p className="text-xs text-muted-foreground mt-1">Applied to new user accounts by default</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
