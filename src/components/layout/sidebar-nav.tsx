
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SpaceWiseIcon } from "@/components/icons";
import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  Users,
  Settings,
  Receipt,
  PackagePlus,
  Route,
  CalendarDays,
  CreditCard,
  ClipboardList,
  LogIn,
  DollarSign,
  ShoppingCart,    // Orders
  Warehouse,       // Units
  MapPin,          // Floor Plan
} from "lucide-react";

const navItems = [
  { href: "/dashboard",        label: "Dashboard",          icon: LayoutDashboard },
  // ── Core: Orders & Units (primary focus) ──
  { href: "/orders",           label: "📋 Orders",           icon: ShoppingCart },
  { href: "/units",            label: "📦 Unit Inventory",   icon: Warehouse },
  // ── Clients & Branches ──
  { href: "/clients",          label: "Clients",             icon: Users },
  { href: "/branches",         label: "Branches",            icon: Building2 },
  // ── Operations ──
  { href: "/bookings",         label: "Bookings (Legacy)",   icon: CalendarClock },
  { href: "/flexible-allocations", label: "Allocations",    icon: PackagePlus },
  { href: "/delivery-planning",label: "Delivery Planning",   icon: Route },
  { href: "/transactions",     label: "Transactions",        icon: Receipt },
  { href: "/branches/partner-payouts", label: "Partner Payouts", icon: DollarSign },
];

const devNavItems = [
  { href: "/checkout/gateway/booking-up-preconfirmed-1", label: "Gateway Checkout (Mock)", icon: CreditCard },
  { href: "/checkout/manual/booking-up-preconfirmed-2", label: "Manual Checkout (Mock)", icon: ClipboardList },
  { href: "/staff-login", label: "Staff Login (Mock)", icon: LogIn },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              tooltip={{ children: item.label, side: "right", align: "center" }}
              className="justify-start"
            >
              <a> 
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
      {/* Development/Mock Links - consider hiding these in production */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <SidebarMenuItem>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
              Mock Pages
            </div>
          </SidebarMenuItem>
          {devNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </>
      )}
    </SidebarMenu>
  );
}
