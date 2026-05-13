"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";
import { isWithin } from "@/shared/paths";
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

/**
 * The one nav link that owns `pathname`: the deepest one containing it.
 * "/swaps/open" sits inside both "/swaps" and "/swaps/open", and only the
 * latter should light up.
 */
export function activeNavHref(pathname: string): string | undefined {
  return NAV.flatMap((group) => group.items.map((item) => item.href))
    .filter((href) => isWithin(pathname, href))
    .sort((a, b) => b.length - a.length)[0];
}

type Props = {
  role: UserRole;
  /**
   * "sidebar" stacks the groups under their headings; "bar" lays every link
   * in one scrollable row for narrow screens, where the stacked version would
   * push the page itself below the fold.
   */
  layout?: "sidebar" | "bar";
};

export function AppNav({ role, layout = "sidebar" }: Props) {
  const activeHref = activeNavHref(usePathname());

  if (layout === "bar") {
    const items = NAV.flatMap((group) => group.items).filter(
      (item) => !item.roles || item.roles.includes(role),
    );
    return (
      <nav aria-label="Main">
        <ul className="flex gap-1.5">
          {items.map((item) => {
            const active = item.href === activeHref;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block whitespace-nowrap rounded-full border px-3 py-1 text-[13px] transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

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
              const active = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground shadow-[inset_2px_0_0_var(--primary)]"
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
