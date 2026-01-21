import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Bell,
  Shield,
  Lock,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  Ban,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export function SettingsSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
    twoFactorAuth: false,
    biometricLogin: false,
    darkMode: true,
    language: "en",
    currency: "NPR",
    timezone: "Asia/Kathmandu",
    depositLimit: "",
    sessionLimit: "",
    selfExclusion: false,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const handlePasswordChange = () => {
    toast.info("Password change feature - Please enter current and new password");
  };

  const handleEnable2FA = () => {
    setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth });
    toast.success(settings.twoFactorAuth ? "2FA disabled" : "2FA enabled");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Notification Settings */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">SMS Notifications</p>
              <p className="text-xs text-muted-foreground">Receive important alerts via SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Promotional Emails</p>
              <p className="text-xs text-muted-foreground">Receive bonus offers and promotions</p>
            </div>
            <Switch
              checked={settings.promotionalEmails}
              onCheckedChange={(checked) => setSettings({ ...settings, promotionalEmails: checked })}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add extra security to your account</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={handleEnable2FA}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Biometric Login</p>
              <p className="text-xs text-muted-foreground">Use fingerprint or face recognition</p>
            </div>
            <Switch
              checked={settings.biometricLogin}
              onCheckedChange={(checked) => setSettings({ ...settings, biometricLogin: checked })}
            />
          </div>
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Change Password
                </p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" size="sm" onClick={handlePasswordChange}>
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Preferences
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Language
            </Label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
            >
              <option value="en">English</option>
              <option value="ne">Nepali</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
            >
              <option value="NPR">NPR (₹)</option>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
            >
              <option value="Asia/Kathmandu">Nepal (GMT+5:45)</option>
              <option value="Asia/Kolkata">India (GMT+5:30)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              Theme
            </Label>
            <div className="flex gap-2">
              <Button
                variant={settings.darkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ ...settings, darkMode: true })}
                className="flex-1 gap-2"
              >
                <Moon className="w-4 h-4" /> Dark
              </Button>
              <Button
                variant={!settings.darkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ ...settings, darkMode: false })}
                className="flex-1 gap-2"
              >
                <Sun className="w-4 h-4" /> Light
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Gaming */}
      <div className="glass rounded-xl p-4 sm:p-6 border-accent/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" />
          Responsible Gaming
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set limits to help manage your gaming activity responsibly.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Daily Deposit Limit
            </Label>
            <Input
              type="number"
              placeholder="e.g., 5000"
              value={settings.depositLimit}
              onChange={(e) => setSettings({ ...settings, depositLimit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Session Time Limit (hours)
            </Label>
            <Input
              type="number"
              placeholder="e.g., 4"
              value={settings.sessionLimit}
              onChange={(e) => setSettings({ ...settings, sessionLimit: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-neon-red/10 rounded-lg border border-neon-red/30">
          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neon-red">Self-Exclusion</p>
              <p className="text-sm text-muted-foreground mb-3">
                Temporarily or permanently exclude yourself from the platform.
              </p>
              <Button variant="destructive" size="sm">
                Request Self-Exclusion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button variant="neon" size="lg" className="w-full gap-2" onClick={handleSave}>
        <Save className="w-5 h-5" /> Save All Settings
      </Button>
    </div>
  );
}
