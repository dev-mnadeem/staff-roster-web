import Link from "next/link";
import { type FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";

export type DashboardLinksProps = {
  role: UserRole;
};

type LinkItem = {
  label: string;
  href: string;
  description: string;
};

type Section = {
  title: string;
  description: string;
  items: LinkItem[];
};

export const DashboardLinks: FunctionComponent<DashboardLinksProps> = ({
  role,
}) => {
  const sections = sectionsForRole(role);

  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:bg-muted/40 hover:border-primary/40 group flex flex-col gap-1 rounded-md border p-3 transition-colors"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

function sectionsForRole(role: UserRole): Section[] {
  const schedule: Section = {
    title: "Schedule",
    description: "See and manage shifts.",
    items: [
      {
        label: "Shifts",
        href: ROUTES.shifts,
        description:
          role === UserRole.Staff
            ? "Browse published shifts at locations you're certified at."
            : "Create, edit, and publish shifts.",
      },
      {
        label: "On duty now",
        href: ROUTES.onDuty,
        description: "Live view of who's working right now.",
      },
    ],
  };

  if (role === UserRole.Admin || role === UserRole.Manager) {
    schedule.items.push({
      label: "Analytics",
      href: ROUTES.analytics,
      description: "Hours distribution, premium fairness, weekly overtime.",
    });
  }

  const coverage: Section = {
    title: "Coverage",
    description:
      role === UserRole.Staff
        ? "Set when you're available, swap or drop shifts, pick up open ones."
        : "Approve swaps and drop requests from your team.",
    items: [
      {
        label: "Swaps & drops",
        href: ROUTES.swaps,
        description:
          role === UserRole.Staff
            ? "Track requests you've made or that need your acceptance."
            : "Approve or reject pending swap and drop requests.",
      },
    ],
  };

  if (role === UserRole.Staff) {
    coverage.items.unshift({
      label: "My availability",
      href: ROUTES.availability,
      description:
        "Set recurring weekly windows and one-off date exceptions.",
    });
    coverage.items.push({
      label: "Open shifts",
      href: ROUTES.openShifts,
      description: "Drops you can claim that match your skills.",
    });
  }

  const sections: Section[] = [schedule, coverage];

  if (role === UserRole.Admin) {
    sections.push({
      title: "Administration",
      description: "Catalog and oversight (admin only).",
      items: [
        {
          label: "Locations",
          href: ROUTES.locations,
          description: "Add or edit locations across the company.",
        },
        {
          label: "Skills",
          href: ROUTES.skills,
          description: "Maintain the skill catalog (server, bartender, etc.).",
        },
        {
          label: "Team",
          href: ROUTES.team,
          description:
            "Edit certifications, skills, and managed-location assignments.",
        },
        {
          label: "Audit log",
          href: ROUTES.adminAudit,
          description: "Full change history with CSV export.",
        },
      ],
    });
  }

  return sections;
}
