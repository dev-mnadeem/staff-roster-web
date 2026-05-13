// A stand-in for the ShiftSync API, for browser tests and screenshots.
//
// It answers the routes this app calls with fictional Coastal Eats data built
// around the current time, so "on duty now" and "this week" always have
// something in them. It is deliberately dumb: any password signs in a known
// email, tokens are unsigned, and writes only flip in-memory state. Never
// point a real deployment at it.
//
//   node e2e/mock-api/server.mjs            # listens on :4010
//   MOCK_API_PORT=5000 node e2e/mock-api/server.mjs

import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 4010);
const HOUR = 60 * 60 * 1000;
const STAMP = "2026-01-05T09:00:00.000Z";

// --- reference data ---------------------------------------------------------

const locations = [
  ["loc-sm", "Coastal Eats — Santa Monica", "America/Los_Angeles", "1410 Ocean Ave"],
  ["loc-vb", "Coastal Eats — Venice Beach", "America/Los_Angeles", "22 Windward Ave"],
  ["loc-bk", "Coastal Eats — Brooklyn", "America/New_York", "85 Water St"],
  ["loc-bo", "Coastal Eats — Boston", "America/New_York", "300 Atlantic Ave"],
].map(([id, name, timezone, address]) => ({
  id, name, timezone, address, createdAt: STAMP, updatedAt: STAMP,
}));

const skills = ["line_cook", "server", "bartender", "host"].map((name) => ({
  id: `skill-${name}`, name, createdAt: STAMP, updatedAt: STAMP,
}));

const loc = (id) => locations.find((l) => l.id === id);
const skill = (name) => skills.find((s) => s.name === name);

// [id, name, email local part, role, desired hours, certified at, skills]
const people = [
  ["u-admin", "Avery Admin", "admin", "admin", null, [], []],
  ["u-west", "Marco West", "west-manager", "manager", null, [], []],
  ["u-east", "Maya East", "east-manager", "manager", null, [], []],
  ["u-sarah", "Sarah Chen", "sarah", "staff", 32, ["loc-sm", "loc-vb"], ["server", "host"]],
  ["u-alex", "Alex Kim", "alex", "staff", 40, ["loc-sm", "loc-vb", "loc-bk"], ["line_cook", "server"]],
  ["u-diego", "Diego Ramos", "diego", "staff", 36, ["loc-sm", "loc-vb"], ["line_cook", "bartender"]],
  ["u-lena", "Lena Fischer", "lena", "staff", 24, ["loc-bk", "loc-bo"], ["server", "host"]],
  ["u-maria", "Maria Lopez", "maria", "staff", 38, ["loc-sm", "loc-vb"], ["bartender", "server"]],
  ["u-nina", "Nina Alvarez", "nina", "staff", 30, ["loc-bk", "loc-bo"], ["line_cook", "server"]],
  ["u-omar", "Omar Haddad", "omar", "staff", 40, ["loc-bk", "loc-bo"], ["bartender", "line_cook"]],
  ["u-priya", "Priya Patel", "priya", "staff", 20, ["loc-bo", "loc-bk"], ["host", "server"]],
  ["u-tom", "Tom Nguyen", "tom", "staff", 35, ["loc-vb", "loc-sm"], ["line_cook", "host"]],
  ["u-yuki", "Yuki Tanaka", "yuki", "staff", 28, ["loc-bo", "loc-bk"], ["server", "bartender"]],
];

const team = people.map(([id, displayName, local, role, desired, certs, skillNames]) => ({
  id,
  email: `${local}@coastaleats.test`,
  role,
  displayName,
  desiredHoursPerWeek: desired ?? undefined,
  certifications: certs.map(loc),
  skills: skillNames.map(skill),
  managedLocations:
    id === "u-west" ? [loc("loc-sm"), loc("loc-vb")]
    : id === "u-east" ? [loc("loc-bk"), loc("loc-bo")]
    : [],
}));

const member = (id) => team.find((m) => m.id === id);

// --- time-relative schedule -------------------------------------------------

/** UTC instant for a wall-clock hour on `dayOffset` days from today, in `tz`. */
function wallClock(tz, dayOffset, hour) {
  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  const guess = Date.UTC(+parts.year, +parts.month - 1, +parts.day + dayOffset, hour);
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, timeZoneName: "longOffset",
  }).formatToParts(new Date(guess)).find((p) => p.type === "timeZoneName").value;
  const [, sign, hh, mm] = offsetName.match(/GMT([+-])(\d{2}):?(\d{2})?/) ?? [, "+", "0", "0"];
  const offsetMs = (sign === "-" ? -1 : 1) * (Number(hh) * HOUR + Number(mm ?? 0) * 60_000);
  return new Date(guess - offsetMs).toISOString();
}

// [location, day offset, start hour, end hour, skill, headcount, premium, status, assigned]
const shiftPlan = [
  ["loc-sm", 0, 11, 19, "server", 2, false, "published", ["u-sarah", "u-maria"]],
  ["loc-sm", 0, 17, 23, "line_cook", 2, false, "published", ["u-alex"]],
  ["loc-vb", 1, 11, 19, "host", 1, false, "published", ["u-tom"]],
  ["loc-vb", 1, 18, 23, "bartender", 1, true, "draft", []],
  ["loc-bk", 0, 11, 19, "server", 2, false, "published", ["u-lena", "u-nina"]],
  ["loc-bk", 1, 17, 23, "bartender", 1, true, "published", ["u-omar"]],
  ["loc-bo", 1, 11, 19, "host", 1, false, "draft", []],
  ["loc-bo", 2, 17, 23, "server", 2, true, "published", ["u-yuki"]],
];

const shifts = shiftPlan.map(([locationId, day, from, to, skillName, headcount, isPremium, status], i) => {
  const location = loc(locationId);
  return {
    id: `shift-${i + 1}`,
    locationId,
    startAt: wallClock(location.timezone, day, from),
    endAt: wallClock(location.timezone, day, to),
    requiredSkillId: skill(skillName).id,
    headcount,
    isPremium,
    status,
    publishedAt: status === "published" ? STAMP : null,
    version: 1,
    createdAt: STAMP,
    updatedAt: STAMP,
    location,
    requiredSkill: skill(skillName),
  };
});

const assignmentsFor = (shiftId) => {
  const index = Number(shiftId.replace("shift-", "")) - 1;
  return (shiftPlan[index]?.[8] ?? []).map((staffId) => ({
    id: `as-${shiftId}-${staffId}`,
    shiftId,
    staffId,
    staffDisplayName: member(staffId).displayName,
    staffEmail: member(staffId).email,
    assignedById: "u-admin",
    assignedAt: STAMP,
  }));
};

function onDuty() {
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const crews = {
    "loc-sm": [["server", 3, ["u-sarah", "u-maria"]], ["line_cook", 2, ["u-alex"]]],
    "loc-vb": [["host", 1, ["u-tom"]]],
    "loc-bk": [["server", 2, ["u-lena", "u-nina"]], ["bartender", 1, []]],
    "loc-bo": [],
  };
  return locations.map((l) => ({
    locationId: l.id,
    locationName: l.name,
    locationTimezone: l.timezone,
    shifts: crews[l.id].map(([skillName, headcount, staff], i) => ({
      id: `duty-${l.id}-${i}`,
      startAt: iso(now - 2 * HOUR - i * HOUR),
      endAt: iso(now + 4 * HOUR + i * HOUR),
      requiredSkillName: skillName,
      headcount,
      assignedStaff: staff.map((id) => ({
        id, displayName: member(id).displayName, email: member(id).email,
      })),
    })),
  }));
}

const staffOnly = team.filter((m) => m.role === "staff");
const hoursById = {
  "u-sarah": 30, "u-alex": 38, "u-diego": 22, "u-lena": 18, "u-maria": 41,
  "u-nina": 26, "u-omar": 44, "u-priya": 12, "u-tom": 33, "u-yuki": 20,
};
const premiumById = {
  "u-sarah": 1, "u-alex": 2, "u-diego": 0, "u-lena": 1, "u-maria": 3,
  "u-nina": 1, "u-omar": 4, "u-priya": 0, "u-tom": 2, "u-yuki": 1,
};

function fairness() {
  const rows = staffOnly.map((m) => ({
    staffId: m.id,
    displayName: m.displayName,
    totalHours: hoursById[m.id],
    premiumShifts: premiumById[m.id],
    desiredHoursPerWeek: m.desiredHoursPerWeek,
    varianceVsDesired: hoursById[m.id] - m.desiredHoursPerWeek,
  }));
  const average = rows.reduce((s, r) => s + r.premiumShifts, 0) / rows.length;
  return {
    from: shifts[0].startAt.slice(0, 10),
    to: shifts.at(-1).endAt.slice(0, 10),
    rows,
    premiumShiftsAverage: Math.round(average * 10) / 10,
  };
}

function overtime() {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return {
    weekStart: start.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
    rows: staffOnly.map((m) => {
      const weeklyHours = hoursById[m.id];
      return {
        staffId: m.id,
        displayName: m.displayName,
        weeklyHours,
        warningLevel: weeklyHours >= 60 ? "block" : weeklyHours >= 35 ? "warn" : "ok",
      };
    }),
  };
}

function plan(body) {
  const label = (s) => `${s.location.name} · ${s.requiredSkill.name}`;
  return {
    from: body.from,
    to: body.to,
    locationIds: locations.map((l) => l.id),
    assignments: [
      ["shift-2", "u-diego", "Diego Ramos had the fewest hours this week (22.0h) among 2 eligible staff, so taking it evens the spread against the other 1."],
      ["shift-4", "u-maria", "Maria Lopez was the only person who cleared every rule for this shift."],
      ["shift-7", "u-priya", "Priya Patel had the fewest hours this week (12.0h) among 3 eligible staff, so taking it evens the spread against the other 2."],
      ["shift-8", "u-lena", "Lena Fischer had the fewest hours this week (18.0h) among 2 eligible staff, so taking it evens the spread against the other 1."],
    ].map(([shiftId, staffId, reason]) => ({
      shiftId,
      staffId,
      staffName: member(staffId).displayName,
      reason,
      weeklyHoursBefore: hoursById[staffId],
      premiumShiftsBefore: premiumById[staffId],
    })),
    unfilled: [
      { shiftId: "shift-6", shiftLabel: label(shifts[5]), remaining: 1, blockers: [
        { reason: "not certified at this location", staffCount: 6 },
        { reason: "lacks the required skill", staffCount: 2 },
      ] },
    ],
    metrics: { slotsTotal: 12, slotsFilled: 11, coverage: 11 / 12, hoursSpreadBefore: 32, hoursSpreadAfter: 26 },
    explanation: {
      source: "rules",
      summary: "Filled 4 slots, bringing coverage to 92% (11 of 12). Hours are more even than before (spread 32.0h → 26.0h). 1 slot could not be filled, because most staff are not certified at Brooklyn.",
    },
  };
}

const ago = (hours) => new Date(Date.now() - hours * HOUR).toISOString();

const notifications = [
  { id: "n-1", type: "swap_requested", title: "Swap request from Sarah Chen", body: "Santa Monica · server, Saturday evening", readAt: null, createdAt: ago(1) },
  { id: "n-2", type: "overtime_warning", title: "Omar Haddad is projected at 44h", body: "Above the 35h warning line this week", readAt: null, createdAt: ago(5) },
  { id: "n-3", type: "shift_published", title: "Brooklyn schedule published", body: null, readAt: ago(20), createdAt: ago(26) },
].map((n) => ({ userId: "u-admin", payload: null, emailSimulated: false, ...n }));

function swap(id, type, status, requesterId, shift, extra = {}) {
  return {
    id, type, status,
    requestingAssignmentId: `as-${shift.id}-${requesterId}`,
    requesterId,
    requesterDisplayName: member(requesterId).displayName,
    targetStaffId: null, targetStaffDisplayName: null, targetAssignmentId: null,
    expiresAt: null, decidedById: null, decidedAt: null, rejectionReason: null,
    createdAt: ago(3), updatedAt: ago(3),
    shiftId: shift.id, shiftStartAt: shift.startAt, shiftEndAt: shift.endAt,
    shiftLocationName: shift.location.name, shiftLocationTimezone: shift.location.timezone,
    ...extra,
  };
}

const swaps = {
  outgoing: [],
  incoming: [swap("sw-1", "swap", "pending", "u-sarah", shifts[0], {
    targetStaffId: "u-maria", targetStaffDisplayName: "Maria Lopez",
  })],
  awaitingApproval: [swap("sw-2", "swap", "accepted_by_peer", "u-lena", shifts[4], {
    targetStaffId: "u-priya", targetStaffDisplayName: "Priya Patel",
  })],
};
const openDrops = [swap("sw-3", "drop", "pending", "u-omar", shifts[5], { expiresAt: shifts[5].startAt })];

const audit = [
  ["a-1", "shift", "shift-1", "publish", "loc-sm", 2],
  ["a-2", "shift_assignment", "as-shift-1-u-sarah", "assign", "loc-sm", 3],
  ["a-3", "swap_request", "sw-2", "swap_accept", "loc-bk", 4],
  ["a-4", "overtime_override", "ov-1", "override_grant", "loc-bk", 8],
  ["a-5", "shift", "shift-4", "create", "loc-vb", 12],
].map(([id, entityType, entityId, action, locationId, hours]) => ({
  id, actorId: "u-admin", entityType, entityId, action, locationId,
  before: null, after: { status: action }, createdAt: ago(hours),
}));

// --- HTTP -------------------------------------------------------------------

const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

function tokenFor(user) {
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  return `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: user.id, email: user.email, exp })}.mock`;
}

function userFrom(req) {
  const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  try {
    const { sub } = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return member(sub) ?? null;
  } catch {
    return null;
  }
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const routes = [
  ["POST", /^\/auth\/login$/, async (req) => {
    const { email, password } = await readJson(req);
    const user = team.find((m) => m.email === String(email).toLowerCase());
    if (!user || !password) return [401, { message: "Invalid email or password" }];
    return [200, { accessToken: tokenFor(user) }];
  }],
  ["GET", /^\/me$/, (_, user) => [200, {
    id: user.id, email: user.email, role: user.role, displayName: user.displayName,
    desiredHoursPerWeek: user.desiredHoursPerWeek, lastSignInAt: ago(0.1), emailConfirmed: true,
  }]],
  ["GET", /^\/locations$/, () => [200, locations]],
  ["GET", /^\/skills$/, () => [200, skills]],
  ["GET", /^\/team$/, () => [200, team]],
  ["GET", /^\/team\/([^/]+)$/, (_, __, [id]) => (member(id) ? [200, member(id)] : [404, { message: "Not found" }])],
  ["GET", /^\/shifts$/, (_, __, ___, query) => {
    const locationId = query.get("locationId");
    return [200, locationId ? shifts.filter((s) => s.locationId === locationId) : shifts];
  }],
  ["GET", /^\/shifts\/([^/]+)$/, (_, __, [id]) => {
    const shift = shifts.find((s) => s.id === id);
    return shift ? [200, shift] : [404, { message: "Shift not found" }];
  }],
  ["POST", /^\/shifts\/([^/]+)\/(publish|unpublish)$/, (_, __, [id, verb]) => {
    const shift = shifts.find((s) => s.id === id);
    if (!shift) return [404, { message: "Shift not found" }];
    shift.status = verb === "publish" ? "published" : "draft";
    shift.version += 1;
    return [200, shift];
  }],
  ["GET", /^\/shifts\/([^/]+)\/assignments$/, (_, __, [id]) => [200, assignmentsFor(id)]],
  ["GET", /^\/shifts\/([^/]+)\/assignments\/suggestions$/, () => [200, ["u-priya", "u-lena", "u-diego"].map((id) => ({
    staffId: id, displayName: member(id).displayName, weeklyHours: hoursById[id],
  }))]],
  ["GET", /^\/shifts\/([^/]+)\/assignments\/dry-run$/, () => [200, { allowed: true, blocking: [], warnings: [] }]],
  ["POST", /^\/planner\/plan$/, async (req) => [200, plan(await readJson(req))]],
  ["GET", /^\/analytics\/fairness$/, () => [200, fairness()]],
  ["GET", /^\/analytics\/overtime$/, () => [200, overtime()]],
  ["GET", /^\/on-duty$/, () => [200, onDuty()]],
  ["GET", /^\/notifications$/, () => [200, notifications]],
  ["GET", /^\/notifications\/unread-count$/, () => [200, { count: notifications.filter((n) => !n.readAt).length }]],
  ["GET", /^\/notifications\/channel$/, () => [200, { channel: "in_app" }]],
  ["PUT", /^\/notifications\/channel$/, async (req) => [200, { channel: (await readJson(req)).channel }]],
  ["POST", /^\/notifications\/([^/]+)\/read$/, (_, __, [id]) => {
    const n = notifications.find((x) => x.id === id);
    if (n) n.readAt = new Date().toISOString();
    return [200, n ?? {}];
  }],
  ["POST", /^\/notifications\/mark-all-read$/, () => {
    for (const n of notifications) n.readAt ??= new Date().toISOString();
    return [200, { ok: true }];
  }],
  ["GET", /^\/swap-requests$/, () => [200, swaps]],
  ["GET", /^\/swap-requests\/open$/, () => [200, openDrops]],
  ["GET", /^\/audit$/, () => [200, audit]],
  ["GET", /^\/availability\/me$/, () => [200, { recurring: [], exceptions: [] }]],
  ["GET", /^\/overtime\/overrides$/, () => [200, []]],
];

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(status === 204 ? undefined : JSON.stringify(body));
}

createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
    });
    return res.end();
  }

  const url = new URL(req.url, "http://mock");
  const path = url.pathname.replace(/^\/api/, "");
  const route = routes.find(([method, pattern]) => method === req.method && pattern.test(path));
  if (!route) return send(res, 404, { message: `No mock for ${req.method} ${path}` });

  const user = userFrom(req);
  const isLogin = path === "/auth/login";
  if (!isLogin && !user) return send(res, 401, { message: "Unauthorized" });

  const [, pattern, handler] = route;
  const params = path.match(pattern).slice(1);
  const [status, body] = await handler(req, user, params, url.searchParams);
  send(res, status, body);
}).listen(PORT, () => {
  console.log(`mock ShiftSync API on http://127.0.0.1:${PORT}/api`);
});
