import { useState } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Shield, Palette, Globe, Mail, Phone, Download, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      rsvpUpdates: true,
      reminderAlerts: true,
    },
    privacy: {
      profileVisibility: "private",
      shareAnalytics: false,
      allowDataExport: true,
    },
    preferences: {
      language: "en",
      timezone: "UTC-8",
      dateFormat: "MM/DD/YYYY",
      theme: "light",
    },
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    // In a real application, this would save to the server
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Requested",
      description: "Your data export will be ready shortly and sent to your email.",
    });
  };

  const handleDeleteAccount = () => {
    // In a real application, this would show a confirmation dialog
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100">
      <NavigationHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-semibold text-gray-800 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and application settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Notifications */}
          <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      handleSettingChange('notifications', 'emailNotifications', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <p className="text-xs text-gray-500">Receive text message alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => 
                      handleSettingChange('notifications', 'smsNotifications', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-gray-500">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      handleSettingChange('notifications', 'pushNotifications', checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">RSVP Updates</Label>
                    <p className="text-xs text-gray-500">Get notified when guests respond</p>
                  </div>
                  <Switch
                    checked={settings.notifications.rsvpUpdates}
                    onCheckedChange={(checked) => 
                      handleSettingChange('notifications', 'rsvpUpdates', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Reminder Alerts</Label>
                    <p className="text-xs text-gray-500">Wedding milestone reminders</p>
                  </div>
                  <Switch
                    checked={settings.notifications.reminderAlerts}
                    onCheckedChange={(checked) => 
                      handleSettingChange('notifications', 'reminderAlerts', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-500" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profileVisibility" className="text-sm font-medium">
                    Profile Visibility
                  </Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => 
                      handleSettingChange('privacy', 'profileVisibility', value)
                    }
                  >
                    <SelectTrigger className="mt-1 border-blush-200 focus:border-gold-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Share Analytics</Label>
                    <p className="text-xs text-gray-500">Help improve our service with usage data</p>
                  </div>
                  <Switch
                    checked={settings.privacy.shareAnalytics}
                    onCheckedChange={(checked) => 
                      handleSettingChange('privacy', 'shareAnalytics', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Data Export</Label>
                    <p className="text-xs text-gray-500">Enable downloading your data</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowDataExport}
                    onCheckedChange={(checked) => 
                      handleSettingChange('privacy', 'allowDataExport', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Palette className="w-5 h-5 text-gold-500" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language" className="text-sm font-medium">
                    Language
                  </Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => 
                      handleSettingChange('preferences', 'language', value)
                    }
                  >
                    <SelectTrigger className="mt-1 border-blush-200 focus:border-gold-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Timezone
                  </Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => 
                      handleSettingChange('preferences', 'timezone', value)
                    }
                  >
                    <SelectTrigger className="mt-1 border-blush-200 focus:border-gold-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dateFormat" className="text-sm font-medium">
                    Date Format
                  </Label>
                  <Select
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => 
                      handleSettingChange('preferences', 'dateFormat', value)
                    }
                  >
                    <SelectTrigger className="mt-1 border-blush-200 focus:border-gold-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="theme" className="text-sm font-medium">
                    Theme
                  </Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => 
                      handleSettingChange('preferences', 'theme', value)
                    }
                  >
                    <SelectTrigger className="mt-1 border-blush-200 focus:border-gold-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Download className="w-5 h-5 text-gold-500" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Export Your Data</Label>
                    <p className="text-xs text-gray-500">Download all your wedding and guest data</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    className="border-gold-200 text-gold-600 hover:bg-gold-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <Separator />
                
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Danger Zone:</strong> The actions below are irreversible.
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-red-700">Delete Account</Label>
                    <p className="text-xs text-red-500">Permanently delete your account and all data</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              className="gold-gradient text-white px-8"
            >
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}