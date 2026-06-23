import {
  CreditCard,
  DollarSign,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Users,
  Video,
} from 'lucide-react';

export type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
};

export function getAdminNav(): NavItem[] {
  return [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Creators', icon: Users, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: Users, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Submissions', icon: Video, href: '/dashboard/admin/submissions' },
    { label: 'Messaging', icon: MessageSquare, href: '/dashboard/admin/messaging' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];
}

export function getBrandNav(): NavItem[] {
  return [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];
}

export function getCreatorNav(): NavItem[] {
  return [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/creator' },
    { label: 'Browse Jobs', icon: Search, href: '/dashboard/creator/browse' },
    { label: 'My Assignments', icon: Video, href: '/dashboard/creator/assignments' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { label: 'Earnings', icon: DollarSign, href: '/dashboard/creator/earnings' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];
}

export function getDashboardNav(role: 'admin' | 'brand' | 'creator'): NavItem[] {
  if (role === 'admin') return getAdminNav();
  if (role === 'creator') return getCreatorNav();
  return getBrandNav();
}
