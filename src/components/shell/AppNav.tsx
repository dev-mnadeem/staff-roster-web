"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";
import { UserRole } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";

type NavItem = {
  href: string;
  label: string;
  /** Roles allowed to see the link. Omit for everyone. */
  roles?: UserRole[];
};

type NavGroup = {
  heading: string;
  items: NavItem[];
};

/**
 * Grouped by what someone is trying to do, not by which API serves it.
 * "Coverage" holds the things a manager checks when a shift is at risk;
 * "Setup" holds the things you configure once and rarely revisit.
 */
const NAV: NavGroup[] = [
  {
    heading: "Schedule",
    items: [
      { href: ROUTES.dashboard, label: "Overview" },
      { href: ROUTES.shifts, label: "Shifts" },
      { href: ROUTES.onDuty, label: "On duty now" },
      {
        href: ROUTES.planner,
        label: "Auto-fill",
        roles: [UserRole.Admin, UserRole.Manager],
      },
      {
        href: ROUTES.analytics,
        label: "Analytics",
        roles: [UserRole.Admin, UserRole.Manager],
      },
    ],
  },
  {
    heading: "Coverage",
    items: [
      { href: ROUTES.swaps, label: "Swaps & drops" },
      { href: ROUTES.openShifts, label: "Open shifts" },
      { href: ROUTES.availability, label: "My availability" },
    ],
  },
  {
    heading: "Setup",
    items: [
      { href: ROUTES.locations, label: "Locations" },
      { href: ROUTES.skills, label: "Skills" },
      { href: ROUTES.team, label: "Team", roles: [UserRole.Admin] },
      {
        href: ROUTES.adminAudit,
        label: "Audit log",
        roles: [UserRole.Admin],
      },
    ],
  },
];

type Props = {
  role: UserRole;
  /** Called after a link is followed, so the mobile drawer can close itself. */
  onNavigate?: () => void;
};

export function AppNav({ role, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6" aria-label="Main">
      {NAV.map((group) => {
        const visible = group.items.filter(
          (item) => !item.roles || item.roles.includes(role),
        );
        // A heading with nothing under it is noise — drop the whole group.
        if (visible.length === 0) return null;

        return (
          <div key={group.heading} className="flex flex-col gap-1">
            <h2 className="px-3 pb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {group.heading}
            </h2>
            {visible.map((item) => {
              // `startsWith` so a detail page keeps its section highlighted,
              // but an exact check for the overview or every route matches it.
              const active =
                item.href === ROUTES.dashboard
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
