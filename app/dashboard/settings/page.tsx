'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  credits: number;
  subscription_tier: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // For now, just show basic auth info
      setProfile({
        id: user.id,
        email: user.email || '',
        display_name: user.user_metadata?.display_name || null,
        credits: 100,
        subscription_tier: 'free',
      });

      setDisplayName(user.user_metadata?.display_name || '');
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSaveProfile = useCallback(async () => {
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
        },
      });

      if (error) {
        toast.error('Failed to save profile: ' + error.message);
        setSaving(false);
        return;
      }

      toast.success('Profile updated successfully');
      setSaving(false);
    } catch (err: any) {
      console.error('[v0] Error saving profile:', err);
      toast.error('An error occurred while saving');
      setSaving(false);
    }
  }, [displayName]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <FieldGroup>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Email cannot be changed. Contact support if needed.
            </p>
          </FieldGroup>

          {/* Display Name */}
          <FieldGroup>
            <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
            <Input
              id="displayName"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saving}
            />
          </FieldGroup>

          {/* Save Button */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="gap-2"
            >
              {saving && <Loader className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Your current subscription and credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subscription Tier</span>
            <span className="font-semibold capitalize">{profile?.subscription_tier}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Available Credits</span>
            <span className="font-semibold text-primary">{profile?.credits}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
