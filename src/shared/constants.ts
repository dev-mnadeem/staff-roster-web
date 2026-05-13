export enum UserRole {
  Admin = "admin",
  Manager = "manager",
  Staff = "staff",
}

export enum QueryKeys {
  CurrentUser = "currentUser",
  Locations = "locations",
  Location = "location",
  Skills = "skills",
  Skill = "skill",
  Team = "team",
  TeamMember = "teamMember",
  Shifts = "shifts",
  Shift = "shift",
  Availability = "availability",
  Assignments = "assignments",
  DryRun = "dryRun",
  OvertimeOverrides = "overtimeOverrides",
  Swaps = "swaps",
  Swap = "swap",
  SwapsOpen = "swapsOpen",
  Notifications = "notifications",
  NotificationsUnread = "notificationsUnread",
  Audit = "audit",
  Suggestions = "suggestions",
  OnDuty = "onDuty",
  AnalyticsFairness = "analyticsFairness",
  AnalyticsOvertime = "analyticsOvertime",
  NotificationChannel = "notificationChannel",
}

export enum AuthMode {
  Login = "login",
  Signup = "signup",
}
