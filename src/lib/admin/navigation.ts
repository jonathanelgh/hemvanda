import type { TeamRole } from "@/lib/admin/auth";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: "overview" | "bookings" | "schedule" | "leads" | "customers" | "team" | "settings" | "blog" | "showcase";
  roles: TeamRole[];
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Översikt",
    href: "/admin",
    icon: "overview",
    roles: ["admin", "staff"],
  },
  {
    label: "Bokningar",
    href: "/admin/bookings",
    icon: "bookings",
    roles: ["admin", "staff"],
  },
  {
    label: "Schema",
    href: "/admin/schedule",
    icon: "schedule",
    roles: ["admin", "staff"],
  },
  {
    label: "Förfrågningar",
    href: "/admin/leads",
    icon: "leads",
    roles: ["admin", "staff"],
  },
  {
    label: "Blogg",
    href: "/admin/blog",
    icon: "blog",
    roles: ["admin", "staff"],
  },
  {
    label: "Referenser",
    href: "/admin/showcases",
    icon: "showcase",
    roles: ["admin", "staff"],
  },
  {
    label: "Kunder",
    href: "/admin/customers",
    icon: "customers",
    roles: ["admin"],
  },
  {
    label: "Team",
    href: "/admin/team",
    icon: "team",
    roles: ["admin"],
  },
  {
    label: "Inställningar",
    href: "/admin/settings",
    icon: "settings",
    roles: ["admin", "staff"],
  },
];

export function getNavItemsForRole(role: TeamRole) {
  return adminNavItems.filter((item) => item.roles.includes(role));
}
