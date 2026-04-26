'use client';

import { useCallback, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Brain, Beaker, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Failed to logout: ' + error.message);
      return;
    }

    toast.success('Logged out successfully');
    router.push('/');
  }, [router]);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Brain },
    { href: '/dashboard/experiments', label: 'Experiments', icon: Beaker },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const NavContent = () => (
    <>
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}>
          <Button
            variant={pathname === href ? 'default' : 'ghost'}
            className="w-full justify-start gap-3"
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Button>
        </Link>
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-destructive hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </Button>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-40 md:hidden"
        size="icon"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border
          flex flex-col transition-transform duration-200 z-40 md:z-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">LabGenius</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <NavContent />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
          <p>© 2026 LabGenius AI</p>
        </div>
      </aside>

      {/* Mobile Close on Navigation */}
      <div
        className="fixed inset-0 z-30 md:hidden"
        style={{ pointerEvents: mobileOpen ? 'auto' : 'none' }}
      />
    </>
  );
}
