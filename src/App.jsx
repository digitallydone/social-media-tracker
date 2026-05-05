import React, { useEffect, useMemo, useState } from "react";

const APP_TITLE = "Client Social Media Posting Tracker";
const PLAN_STORAGE_KEY = "client-posting-tracker-plans";
const STATUS_STORAGE_KEY = "client-posting-tracker-status-records";
const SESSION_STORAGE_KEY = "client-posting-tracker-session";
const STATUS_DRAFTS_STORAGE_KEY = "client-posting-tracker-status-drafts";

const PLATFORM_OPTIONS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "X / Twitter",
  "YouTube",
];

const CONTENT_FORMAT_OPTIONS = [
  "Graphic",
  "Carousel",
  "Video",
  "Reel",
  "Story",
  "Article",
  "Photo",
  "Animation",
  "Infographic",
  "Poll",
  "Live Session",
  "Testimonial",
];

const STATUS_OPTIONS = ["Posted", "Awaiting Approval", "Missed", "Rescheduled"];
const ACCESS_ROLE_OPTIONS = ["admin", "manager", "client"];

const DEMO_USERS = [
  { id: "admin-1", name: "Richard", role: "admin", clientName: "", mode: "demo" },
  { id: "manager-1", name: "Team Lead", role: "manager", clientName: "", mode: "demo" },
  { id: "client-1", name: "Acme Client", role: "client", clientName: "Acme Client", mode: "demo" },
];

const EMPTY_PLAN_FORM = {
  clientName: "",
  date: "",
  platforms: ["Instagram"],
  platformFormats: { Instagram: "" },
  platformTimes: { Instagram: "" },
  topic: "",
  notes: "",
};

const EMPTY_STATUS_DRAFT = {
  status: "",
  postLink: "",
  notes: "",
  reach: "",
  impressions: "",
  likes: "",
  comments: "",
  shares: "",
  clicks: "",
};

const EMPTY_INVITE_FORM = {
  email: "",
  fullName: "",
  role: "manager",
  clientName: "",
};

function createId(prefix = "item") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function withPlanId(plan) {
  return {
    ...plan,
    id: plan.id || createId("plan"),
  };
}

function withStatusId(record) {
  return {
    ...record,
    id: record.id || createId("status"),
  };
}

const DEFAULT_PLANS = [
  withPlanId({
    clientName: "Acme Client",
    date: "2026-05-01",
    platform: "Instagram",
    topic: "Product Highlight",
    format: "Carousel",
    time: "10:00",
    notes: "Launch week hero content",
  }),
  withPlanId({
    clientName: "Acme Client",
    date: "2026-05-02",
    platform: "Facebook",
    topic: "Customer Testimonial",
    format: "Graphic",
    time: "13:00",
    notes: "Needs client quote signoff",
  }),
  withPlanId({
    clientName: "Acme Client",
    date: "2026-06-04",
    platform: "TikTok",
    topic: "Behind the Scenes",
    format: "Video",
    time: "16:30",
    notes: "Shoot scheduled in studio",
  }),
  withPlanId({
    clientName: "Beta Foods",
    date: "2026-05-03",
    platform: "LinkedIn",
    topic: "Founder Message",
    format: "Article",
    time: "09:30",
    notes: "Leadership brand post",
  }),
];

const DEFAULT_STATUS_RECORDS = [
  withStatusId({
    planId: DEFAULT_PLANS[0].id,
    clientName: "Acme Client",
    date: "2026-05-01",
    platform: "Instagram",
    topic: "Product Highlight",
    format: "Carousel",
    time: "10:00",
    status: "Posted",
    postLink: "https://example.com/post/1",
    notes: "Published successfully",
    reach: 12400,
    impressions: 28900,
    likes: 1840,
    comments: 126,
    shares: 72,
    clicks: 418,
  }),
  withStatusId({
    planId: DEFAULT_PLANS[1].id,
    clientName: "Acme Client",
    date: "2026-05-02",
    platform: "Facebook",
    topic: "Customer Testimonial",
    format: "Graphic",
    time: "13:00",
    status: "Awaiting Approval",
    postLink: "",
    notes: "Waiting for client feedback",
    reach: null,
    impressions: null,
    likes: null,
    comments: null,
    shares: null,
    clicks: null,
  }),
  withStatusId({
    planId: DEFAULT_PLANS[2].id,
    clientName: "Acme Client",
    date: "2026-06-04",
    platform: "TikTok",
    topic: "Behind the Scenes",
    format: "Video",
    time: "16:30",
    status: "Rescheduled",
    postLink: "",
    notes: "Reshoot moved to next week",
    reach: null,
    impressions: null,
    likes: null,
    comments: null,
    shares: null,
    clicks: null,
  }),
  withStatusId({
    planId: DEFAULT_PLANS[3].id,
    clientName: "Beta Foods",
    date: "2026-05-03",
    platform: "LinkedIn",
    topic: "Founder Message",
    format: "Article",
    time: "09:30",
    status: "Posted",
    postLink: "https://example.com/post/4",
    notes: "Posted from founder profile",
    reach: 8200,
    impressions: 19200,
    likes: 640,
    comments: 38,
    shares: 19,
    clicks: 211,
  }),
];

function readStoredItems(storageKey, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readStoredObject(storageKey, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function formatDateLabel(date) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTimeLabel(time) {
  if (!time) return "-";
  const [hour, minute] = time.split(":");
  const parsed = new Date();
  parsed.setHours(Number(hour), Number(minute), 0, 0);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function parseMetricValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed);
}

function formatMetricValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toLocaleString();
}

function getEngagementTotal(record) {
  return (Number(record?.likes) || 0) + (Number(record?.comments) || 0) + (Number(record?.shares) || 0);
}

function hasPerformanceMetrics(record) {
  return ["reach", "impressions", "likes", "comments", "shares", "clicks"].some((key) => {
    const value = record?.[key];
    return value !== null && value !== undefined && value !== "";
  });
}

function getStatusStyle(status) {
  switch (status) {
    case "Posted":
      return "bg-green-100 text-green-700 border-green-200";
    case "Awaiting Approval":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Missed":
      return "bg-red-100 text-red-700 border-red-200";
    case "Rescheduled":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Overdue":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPlanOverdue(plan, matchingStatus) {
  if (!plan?.date) return false;
  if (matchingStatus) return false;
  return plan.date < getTodayDateKey();
}

function getDayKey(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No Date";
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getWeekKey(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No Date";
  const day = parsed.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(parsed);
  monday.setDate(parsed.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} - ${sunday.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

function getMonthKey(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No Date";
  return parsed.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function getMonthStart(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function shiftMonth(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function getMonthInputValue(date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

function parseMonthInputValue(value) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
}

function isSameMonth(dateValue, monthDate) {
  if (!dateValue) return false;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return false;
  return (
    parsed.getFullYear() === monthDate.getFullYear() &&
    parsed.getMonth() === monthDate.getMonth()
  );
}

function formatMonthLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function getDefaultPlanDate(monthDate) {
  const now = new Date();
  if (
    now.getFullYear() === monthDate.getFullYear() &&
    now.getMonth() === monthDate.getMonth()
  ) {
    return formatDateKey(now);
  }
  return formatDateKey(monthDate);
}

function createPlatformBucket(platform) {
  return {
    platform,
    planned: 0,
    posted: 0,
    pending: 0,
    missed: 0,
    rescheduled: 0,
    overdue: 0,
    executionScore: 0,
  };
}

function calculateExecutionScore(planned, posted) {
  if (!planned) return 0;
  return Math.round((posted / planned) * 100);
}

function buildPeriodSummary(plans, statuses, getPeriodKey) {
  const grouped = {};

  plans.forEach((plan) => {
    const period = getPeriodKey(plan.date);
    if (!grouped[period]) grouped[period] = { period, platforms: {} };
    if (!grouped[period].platforms[plan.platform]) {
      grouped[period].platforms[plan.platform] = createPlatformBucket(plan.platform);
    }
    grouped[period].platforms[plan.platform].planned += 1;
  });

  statuses.forEach((record) => {
    const period = getPeriodKey(record.date);
    if (!grouped[period]) grouped[period] = { period, platforms: {} };
    if (!grouped[period].platforms[record.platform]) {
      grouped[period].platforms[record.platform] = createPlatformBucket(record.platform);
    }

    if (record.status === "Posted") grouped[period].platforms[record.platform].posted += 1;
    if (record.status === "Awaiting Approval") grouped[period].platforms[record.platform].pending += 1;
    if (record.status === "Missed") grouped[period].platforms[record.platform].missed += 1;
    if (record.status === "Rescheduled") grouped[period].platforms[record.platform].rescheduled += 1;
    if (record.status === "Overdue") grouped[period].platforms[record.platform].overdue += 1;
  });

  return Object.values(grouped).map((item) => {
    const platforms = Object.values(item.platforms).map((platformItem) => ({
      ...platformItem,
      executionScore: calculateExecutionScore(platformItem.planned, platformItem.posted),
    }));
    const totals = platforms.reduce(
      (acc, platformItem) => {
        acc.planned += platformItem.planned;
        acc.posted += platformItem.posted;
        acc.pending += platformItem.pending;
        acc.missed += platformItem.missed;
        acc.rescheduled += platformItem.rescheduled;
        acc.overdue += platformItem.overdue;
        return acc;
      },
      { planned: 0, posted: 0, pending: 0, missed: 0, rescheduled: 0, overdue: 0 }
    );

    return {
      period: item.period,
      platforms,
      totals,
      executionScore: calculateExecutionScore(totals.planned, totals.posted),
    };
  });
}

function getPlanKey(item) {
  return item.id;
}

function deletePlanState(plans, statusRecords, statusDrafts, planId) {
  return {
    plans: plans.filter((item) => item.id !== planId),
    statusRecords: statusRecords.filter((record) => record.planId !== planId),
    statusDrafts: Object.fromEntries(
      Object.entries(statusDrafts).filter(([key]) => key !== planId)
    ),
  };
}

function updatePlanState(plans, planId, replacementEntries) {
  const targetIndex = plans.findIndex((item) => item.id === planId);
  if (targetIndex < 0) return plans;
  const next = [...plans];
  next.splice(targetIndex, 1, ...replacementEntries);
  return next;
}

function buildBackupPayload(plans, statusRecords, currentUser) {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    mode: currentUser?.mode || "demo",
    plans,
    statusRecords,
  };
}

function downloadJsonFile(filename, data) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function getMonthGridStart(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = firstDay.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - diffToMonday);
  return start;
}

function getMonthGridDays(date) {
  const start = getMonthGridStart(date);
  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getAccessibleClientNames(plans) {
  return Array.from(new Set(plans.map((plan) => plan.clientName).filter(Boolean))).sort();
}

function parseClientScopeList(value) {
  if (!value) return [];
  return Array.from(
    new Set(
      String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function userCanAccessClient(user, clientName) {
  if (!user || !clientName) return false;
  if (user.role === "admin" || user.role === "manager") return true;
  return parseClientScopeList(user.clientName).includes(clientName);
}

function canEdit(user) {
  return user && (user.role === "admin" || user.role === "manager");
}

function canViewMultipleClients(user) {
  return user && (
    user.role === "admin" ||
    user.role === "manager" ||
    (user.role === "client" && parseClientScopeList(user.clientName).length > 1)
  );
}

function getTrackerConfig() {
  if (typeof window === "undefined") return null;
  return window.TRACKER_CONFIG || null;
}

function hasSharedConfiguration() {
  const config = getTrackerConfig();
  return Boolean(config?.supabaseUrl && config?.supabaseAnonKey && window.supabase?.createClient);
}

function getSupabaseClient() {
  const config = getTrackerConfig();
  if (!config?.supabaseUrl || !config?.supabaseAnonKey || !window.supabase?.createClient) return null;
  if (!window.__trackerSupabaseClient) {
    window.__trackerSupabaseClient = window.supabase.createClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      { auth: { persistSession: true, autoRefreshToken: true } }
    );
  }
  return window.__trackerSupabaseClient;
}

function mapDbPlan(row) {
  return withPlanId({
    id: row.id,
    clientName: row.client_name,
    date: row.date,
    platform: row.platform,
    topic: row.topic,
    format: row.format || "",
    time: row.time || "",
    notes: row.notes || "",
  });
}

function mapDbStatus(row) {
  return withStatusId({
    id: row.id,
    planId: row.plan_id,
    clientName: row.client_name,
    date: row.date,
    platform: row.platform,
    topic: row.topic,
    format: row.format || "",
    time: row.time || "",
    status: row.status,
    postLink: row.post_link || "",
    notes: row.notes || "",
    reach: row.reach ?? null,
    impressions: row.impressions ?? null,
    likes: row.likes ?? null,
    comments: row.comments ?? null,
    shares: row.shares ?? null,
    clicks: row.clicks ?? null,
  });
}

function toDbPlan(entry, actorId) {
  return {
    client_name: entry.clientName,
    date: entry.date,
    platform: entry.platform,
    topic: entry.topic,
    format: entry.format || null,
    time: entry.time || null,
    notes: entry.notes || null,
    created_by: actorId,
    updated_by: actorId,
  };
}

function toDbStatus(plan, draft, actorId) {
  return {
    plan_id: plan.id,
    client_name: plan.clientName,
    date: plan.date,
    platform: plan.platform,
    topic: plan.topic,
    format: plan.format || null,
    time: plan.time || null,
    status: draft.status,
    post_link: draft.postLink.trim() || null,
    notes: draft.notes.trim() || null,
    reach: parseMetricValue(draft.reach),
    impressions: parseMetricValue(draft.impressions),
    likes: parseMetricValue(draft.likes),
    comments: parseMetricValue(draft.comments),
    shares: parseMetricValue(draft.shares),
    clicks: parseMetricValue(draft.clicks),
    created_by: actorId,
    updated_by: actorId,
  };
}

function mapDbInvite(row) {
  return {
    email: row.email || "",
    fullName: row.full_name || "",
    role: row.role || "manager",
    clientName: row.client_name || "",
    createdAt: row.created_at || "",
  };
}

function runSelfChecks() {
  console.assert(normalizeUrl("example.com") === "https://example.com", "normalizeUrl should prepend https");
  console.assert(getMonthKey("2026-05-01").includes("2026"), "getMonthKey should include year");
  console.assert(Array.isArray(buildPeriodSummary(DEFAULT_PLANS, DEFAULT_STATUS_RECORDS, getMonthKey)), "buildPeriodSummary should return an array");
  console.assert(EMPTY_PLAN_FORM.platformTimes.Instagram === "", "platformTimes should be initialized once");
  console.assert(isPlanOverdue({ date: "2000-01-01" }, null) === true, "old unposted plans should be overdue");
  console.assert(calculateExecutionScore(10, 8) === 80, "execution score should be 80");
  console.assert(getMonthGridDays(new Date("2026-05-01")).length === 42, "calendar grid should have 42 days");
  console.assert(canEdit({ role: "admin" }) === true && canEdit({ role: "client" }) === false, "role permissions should work");
}

runSelfChecks();

function LoginScreen({
  users,
  onLogin,
  sharedMode,
  authEmail,
  onAuthEmailChange,
  onRequestMagicLink,
  authNotice,
  authLoading,
}) {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            {sharedMode ? "Shared Trial Access" : "Local Demo Access"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">{APP_TITLE}</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600">
            {sharedMode
              ? "This tracker is now ready for a remote team trial. Team members sign in with their email and work from the same shared plan and status records."
              : "This is still running in browser-local demo mode. Add the shared backend configuration to switch everyone onto the same remote workspace."}
          </p>
        </div>

        {sharedMode ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Team Sign In</h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter an invited team email. The app will send a magic link so each person can securely open the shared trial workspace.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onRequestMagicLink();
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Work Email</label>
                  <input
                    value={authEmail}
                    onChange={(event) => onAuthEmailChange(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    placeholder="name@yourcompany.com"
                    type="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading ? "Sending Link..." : "Send Magic Link"}
                </button>
              </form>
              {authNotice && (
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {authNotice}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Shared Trial Checklist</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">1. Add invited team emails with role and client scope.</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">2. Team members enter their email and receive a magic link.</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">3. Send the hosted URL to the pilot team.</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">4. Monitor activity using the shared logs and timestamps.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => onLogin(user)}
                className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{user.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{user.role.toUpperCase()}</div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Demo Sign In
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  {user.role === "client"
                    ? `View only for ${user.clientName}`
                    : user.role === "manager"
                      ? "Manage and report across clients"
                      : "Full access including setup and backend controls"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardHeader({ currentUser, selectedClientName, onSelectClient, clientOptions, onLogout }) {
  const allClientsLabel = currentUser.role === "client" ? "All My Brands" : "All Clients";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            {currentUser.mode === "shared" ? "Remote Trial Dashboard" : "Client Dashboard"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            {APP_TITLE}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Planned content stays separate from execution outcomes. Updates made in the planned log are only pushed to the execution log when you click Save Update.
          </p>
        </div>
        <div className="flex flex-col gap-3 xl:items-end">
          <div className="rounded-2xl bg-slate-100 px-5 py-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Signed in as {currentUser.name}</div>
            <div>{currentUser.role.toUpperCase()}</div>
            {currentUser.email && <div className="mt-1 text-xs text-slate-500">{currentUser.email}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            {clientOptions.length > 1 && (
              <select
                value={selectedClientName}
                onChange={(e) => onSelectClient(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <option value="All Clients">{allClientsLabel}</option>
                {clientOptions.map((client) => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            )}
            <button type="button" onClick={onLogout} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppNotice({ message }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
      <span className="font-semibold text-slate-900">Live Status</span>
      <span className="mx-2 text-slate-300">|</span>
      <span>{message}</span>
    </div>
  );
}

function ModeBanner({ currentUser, sharedModeReady, syncState }) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${sharedModeReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${sharedModeReady ? "text-emerald-900" : "text-amber-900"}`}>
            {sharedModeReady ? "Shared Trial Mode" : "Local Demo Mode"}
          </h3>
          <p className={`text-sm ${sharedModeReady ? "text-emerald-700" : "text-amber-700"}`}>
            {sharedModeReady
              ? `Your team is working from the same hosted workspace. Sync state: ${syncState}.`
              : "This machine is still using browser-local data. Add the shared backend keys in config.js before inviting the team."}
          </p>
        </div>
        <div className={`rounded-full px-4 py-2 text-xs font-semibold ${sharedModeReady ? "bg-white text-emerald-700" : "bg-white text-amber-700"}`}>
          {currentUser.mode === "shared" ? "Shared Access" : "Local Only"}
        </div>
      </div>
    </div>
  );
}

function ClientViewBanner({ currentUser }) {
  return (
    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">Client View</h3>
          <p className="text-sm text-blue-700">
            {currentUser.role === "client"
              ? `Read-only access for ${currentUser.clientName}. Backend tools are hidden.`
              : "This view is read-only and designed for safe client sharing. Backend editing tools are hidden."}
          </p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-700">
          Share-Friendly Mode
        </div>
      </div>
    </div>
  );
}

function SharedSetupPanel() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Remote Team Setup Needed</h3>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            This app is ready for shared hosting, but it is still running without backend credentials. Complete the Supabase setup in `README-REMOTE-TRIAL.md`, then copy `config.example.js` to `config.js` and fill in your project keys.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
          Next file: `README-REMOTE-TRIAL.md`
        </div>
      </div>
    </div>
  );
}

function AccessManagementPanel({
  inviteForm,
  onInviteFormChange,
  onInviteSubmit,
  onInviteEdit,
  onInviteDelete,
  accessInvites,
  inviteBusy,
  clientOptions,
}) {
  const selectedClientScopes = parseClientScopeList(inviteForm.clientName);

  function toggleClientScope(client) {
    const nextScopes = selectedClientScopes.includes(client)
      ? selectedClientScopes.filter((item) => item !== client)
      : [...selectedClientScopes, client];
    onInviteFormChange("clientName", nextScopes.join(", "));
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Shared Access Manager</h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Add the teammates and client contacts who should be allowed into the hosted tracker. Once an email is invited here, that person can use the magic-link sign-in flow without any Supabase access.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          {accessInvites.length} Invited
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,1fr)_minmax(0,1.4fr)]">
        <form
          onSubmit={onInviteSubmit}
          className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(event) => onInviteFormChange("email", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
              placeholder="teammate@company.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              value={inviteForm.fullName}
              onChange={(event) => onInviteFormChange("fullName", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
              placeholder="Team member name"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
              <select
                value={inviteForm.role}
                onChange={(event) => onInviteFormChange("role", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
              >
                {ACCESS_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Client Scope</label>
              <div className={`rounded-2xl border border-slate-200 bg-white p-3 ${inviteForm.role !== "client" ? "cursor-not-allowed bg-slate-100" : ""}`}>
                {inviteForm.role === "client" ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {clientOptions.map((client) => {
                        const selected = selectedClientScopes.includes(client);
                        return (
                          <button
                            key={client}
                            type="button"
                            onClick={() => toggleClientScope(client)}
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                              selected
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {client}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={inviteForm.clientName}
                      onChange={(event) => onInviteFormChange("clientName", event.target.value)}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400"
                      placeholder="Add extra brands as comma-separated names"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Select one or more brands above. You can also type additional brand names separated by commas.
                    </p>
                  </>
                ) : (
                  <div className="px-1 py-2 text-sm text-slate-400">Only required for client access</div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={inviteBusy}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {inviteBusy ? "Saving Access..." : "Save Access"}
          </button>
        </form>

        <div className="space-y-4">
          {accessInvites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No invited users yet. Add your pilot team here, then they can sign in with magic links from the hosted app.
            </div>
          ) : (
            accessInvites.map((invite) => (
              <div key={invite.email} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{invite.fullName || invite.email}</div>
                      <div className="text-sm text-slate-500">{invite.email}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                        {invite.role.toUpperCase()}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                        {invite.clientName || "All Clients"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Invited {invite.createdAt ? new Date(invite.createdAt).toLocaleString() : "recently"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={inviteBusy}
                      onClick={() => onInviteEdit(invite)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={inviteBusy}
                      onClick={() => onInviteDelete(invite.email)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DeploymentTools({ onExport, onImport, onResetData, hasData, isClientView, onToggleClientView, sharedModeReady }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            {sharedModeReady ? "Trial Operations" : "Deployment Tools"}
          </h3>
          <p className="text-sm text-slate-500">
            {sharedModeReady
              ? "Export shared records for review, switch between admin and client views, and keep the trial safe."
              : "Export a backup, restore a backup, switch between admin and client mode, or reset the app before going live."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onToggleClientView} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            {isClientView ? "Switch to Admin View" : "Switch to Client View"}
          </button>
          <button type="button" onClick={onExport} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Export Backup
          </button>
          {!isClientView && !sharedModeReady && (
            <label className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Import Backup
              <input type="file" accept="application/json" className="hidden" onChange={onImport} />
            </label>
          )}
          {!isClientView && !sharedModeReady && (
            <button
              type="button"
              onClick={onResetData}
              disabled={!hasData}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AccessSummary({ currentUser, selectedClientName }) {
  const clientScopeLabel = currentUser.role === "client"
    ? parseClientScopeList(currentUser.clientName).join(", ")
    : selectedClientName;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{currentUser.role.toUpperCase()}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Access Scope</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {clientScopeLabel || "All Clients"}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Permissions</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {canEdit(currentUser) ? "Edit + Report" : "Read Only"}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workspace</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {currentUser.mode === "shared" ? "Hosted Shared Data" : "Browser Local Data"}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">{stat.label}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</h2>
        </div>
      ))}
    </div>
  );
}

function MonthScopeControls({ monthDate, onChangeMonth, onPreviousMonth, onNextMonth, onGoToCurrentMonth }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Reporting Month</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{formatMonthLabel(monthDate)}</div>
          <p className="mt-2 text-sm text-slate-500">
            Planned content, execution log, stats, and reporting now follow this active month by default.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onPreviousMonth} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Prev Month</button>
          <input
            type="month"
            value={getMonthInputValue(monthDate)}
            onChange={(event) => {
              const next = parseMonthInputValue(event.target.value);
              if (next) onChangeMonth(next);
            }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          />
          <button type="button" onClick={onNextMonth} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Next Month</button>
          <button type="button" onClick={onGoToCurrentMonth} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Current Month</button>
        </div>
      </div>
    </div>
  );
}

function PlannedEntryForm({
  planForm,
  editingPlanId,
  onPlanChange,
  onTogglePlatform,
  onPlatformFormatChange,
  onPlatformTimeChange,
  onSubmit,
  onCancel,
  busy,
  mode = "create",
  title,
  description,
}) {
  const isEditMode = mode === "edit";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-slate-900">{title || (isEditMode ? "Edit Planned Entry" : "Planned Content Entry")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {description || (isEditMode
            ? "Update the selected planned entry here, then save and return straight to the planned log."
            : "Use this entry panel to create the content schedule your remote team will execute against.")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Client Name</label>
          <input
            value={planForm.clientName}
            onChange={(e) => onPlanChange("clientName", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
            placeholder="Enter client name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={planForm.date}
            onChange={(e) => onPlanChange("date", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(260px,1fr)_minmax(0,1.4fr)]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Platforms</label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 p-3">
              {PLATFORM_OPTIONS.map((platform) => {
                const checked = planForm.platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                      checked ? "bg-slate-100 text-slate-900" : "text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onTogglePlatform(platform)}
                      className="h-4 w-4"
                    />
                    <span>{platform}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">Each selected platform will be saved as its own planned row.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Content Format & Time</label>
            <div className="space-y-3 rounded-2xl border border-slate-200 p-3">
              {planForm.platforms.map((platform) => (
                <div key={platform} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-3 text-sm font-semibold text-slate-700">{platform}</div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <select
                      value={planForm.platformFormats[platform] || ""}
                      onChange={(e) => onPlatformFormatChange(platform, e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    >
                      <option value="">Select content format</option>
                      {CONTENT_FORMAT_OPTIONS.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={planForm.platformTimes[platform] || ""}
                      onChange={(e) => onPlatformTimeChange(platform, e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Choose a different content format and posting time for each selected platform.</p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Content Topic</label>
          <input
            value={planForm.topic}
            onChange={(e) => onPlanChange("topic", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
            placeholder="e.g. Product launch teaser"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Planning Notes</label>
          <textarea
            value={planForm.notes}
            onChange={(e) => onPlanChange("notes", e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
            placeholder="Capture campaign notes, goals, or dependencies"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : isEditMode || editingPlanId !== null ? "Update Planned Entry" : "Save Planned Entry"}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function EditPlanDialog({
  open,
  planForm,
  editingPlanId,
  onPlanChange,
  onTogglePlatform,
  onPlatformFormatChange,
  onPlatformTimeChange,
  onSubmit,
  onCancel,
  busy,
}) {
  if (!open) return null;

  return (
    <ModalShell
      title="Edit Planned Entry"
      subtitle="Make your changes here without leaving the planned log."
      onClose={onCancel}
    >
      <PlannedEntryForm
        planForm={planForm}
        editingPlanId={editingPlanId}
        onPlanChange={onPlanChange}
        onTogglePlatform={onTogglePlatform}
        onPlatformFormatChange={onPlatformFormatChange}
        onPlatformTimeChange={onPlatformTimeChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
        busy={busy}
        mode="edit"
      />
    </ModalShell>
  );
}

function StatusGuide() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Status Guide</h3>
      <div className="mt-5 space-y-3 text-sm text-slate-700">
        {[...STATUS_OPTIONS, "Overdue"].map((status) => (
          <div key={status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span>{status}</span>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function CalendarPostDetailsDialog({ post, onClose }) {
  if (!post) return null;

  return (
    <ModalShell
      title={post.topic || "Planned Post"}
      subtitle="Planned content details from the shared tracker"
      onClose={onClose}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Client</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{post.clientName || "-"}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Platform</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{post.platform || "-"}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Date</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{formatDateLabel(post.date)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Time</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{formatTimeLabel(post.time)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Format</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{post.format || "-"}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</div>
          <div className="mt-2">
            {post.currentStatus === "-"
              ? <span className="text-sm font-medium text-slate-500">Not Updated</span>
              : <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(post.currentStatus)}`}>{post.currentStatus}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Planning Notes</div>
        <div className="mt-3 text-sm leading-7 text-slate-700">{post.detailNotes || "No planning notes were added."}</div>
      </div>

      {hasPerformanceMetrics(post) && (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Performance Snapshot</div>
              <div className="mt-1 text-sm text-slate-500">A simple post-level view of how this content performed.</div>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Engagement {formatMetricValue(getEngagementTotal(post))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { label: "Reach", value: post.reach },
              { label: "Impressions", value: post.impressions },
              { label: "Likes", value: post.likes },
              { label: "Comments", value: post.comments },
              { label: "Shares", value: post.shares },
              { label: "Clicks", value: post.clicks },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{formatMetricValue(item.value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {post.currentStatus === "Posted" && post.currentPostLink && (
        <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Published Link</div>
          <a
            href={normalizeUrl(post.currentPostLink)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            View Post
          </a>
        </div>
      )}
    </ModalShell>
  );
}

function CalendarDayDetailsDialog({ dayLabel, rows, onClose, onSelectRow }) {
  if (!rows?.length) return null;

  return (
    <ModalShell
      title={dayLabel || "Scheduled Posts"}
      subtitle="Select a post to see its full details."
      onClose={onClose}
    >
      <div className="space-y-3">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelectRow?.(row)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{row.topic || "Planned Post"}</div>
                <div className="mt-1 text-xs text-slate-500">{row.clientName} | {row.platform}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatTimeLabel(row.time)}
                </span>
                {row.currentStatus !== "-" && (
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(row.currentStatus)}`}>
                    {row.currentStatus}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}

function CalendarView({ rows, monthDate, onPreviousMonth, onNextMonth, onGoToToday, onSelectRow, compact = false }) {
  const calendarDays = useMemo(() => getMonthGridDays(monthDate), [monthDate]);
  const monthTitle = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const rowsByDate = useMemo(() => {
    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.date]) grouped[row.date] = [];
      grouped[row.date].push(row);
    });
    return grouped;
  }, [rows]);
  const mobileDays = useMemo(() => {
    return calendarDays
      .filter((day) => day.getMonth() === monthDate.getMonth())
      .map((day) => ({
        dateKey: formatDateKey(day),
        label: day.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        }),
        rows: rowsByDate[formatDateKey(day)] || [],
      }))
      .filter((item) => item.rows.length > 0);
  }, [calendarDays, monthDate, rowsByDate]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Content Calendar</h3>
          <p className="text-sm text-slate-500">See planned content laid out by day for easier weekly and monthly planning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onPreviousMonth} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Prev</button>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">{monthTitle}</div>
          <button type="button" onClick={onNextMonth} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Next</button>
          <button type="button" onClick={onGoToToday} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Today</button>
        </div>
      </div>

      <div className="hidden grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="rounded-xl bg-slate-50 px-2 py-3">{day}</div>
        ))}
      </div>

      <div className="mt-2 space-y-3 md:hidden">
        {mobileDays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No posts scheduled for this month yet.
          </div>
        ) : (
          mobileDays.map((day) => (
            <div key={day.dateKey} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">{day.label}</div>
                <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-700">
                  {day.rows.length} post{day.rows.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="space-y-2">
                {day.rows.slice(0, 3).map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelectRow?.(row)}
                    className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] font-semibold text-slate-800">{row.platform}</span>
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${row.currentStatus === "-" ? "border-slate-200 bg-slate-100 text-slate-500" : getStatusStyle(row.currentStatus)}`}>
                        {row.currentStatus === "-" ? "Planned" : row.currentStatus}
                      </span>
                    </div>
                  </button>
                ))}
                {day.rows.length > 3 && (
                  <button
                    type="button"
                    onClick={() => onSelectRow?.({ __dayOverflow: true, dayLabel: day.label, rows: day.rows.slice(3) })}
                    className="pt-1 text-[11px] font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    +{day.rows.length - 3} more
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 hidden grid-cols-1 gap-2 md:grid md:grid-cols-7">
        {calendarDays.map((day) => {
          const dateKey = formatDateKey(day);
          const dayRows = rowsByDate[dateKey] || [];
          const isCurrentMonth = day.getMonth() === monthDate.getMonth();
          const isToday = dateKey === getTodayDateKey();
          return (
            <div key={dateKey} className={`min-h-[150px] rounded-2xl border p-3 ${isCurrentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400"} ${isToday ? "ring-2 ring-slate-300" : ""}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-sm font-semibold ${isCurrentMonth ? "text-slate-900" : "text-slate-400"}`}>{day.getDate()}</span>
                {dayRows.length > 0 && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">{dayRows.length}</span>}
              </div>
              {compact ? (
                <div className="space-y-2">
                  {dayRows.slice(0, 2).map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => onSelectRow?.(row)}
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-semibold text-slate-800">{row.platform}</span>
                        <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${row.currentStatus === "-" ? "border-slate-200 bg-slate-100 text-slate-500" : getStatusStyle(row.currentStatus)}`}>
                          {row.currentStatus === "-" ? "Planned" : row.currentStatus}
                        </span>
                      </div>
                    </button>
                  ))}
                  {dayRows.length === 0 && (
                    <div className="pt-3 text-[10px] font-medium uppercase tracking-wide text-slate-300">No posts</div>
                  )}
                  {dayRows.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onSelectRow?.({ __dayOverflow: true, dayLabel: getDayKey(dateKey), rows: dayRows.slice(2) })}
                      className="pt-1 text-[11px] font-semibold text-slate-500 transition hover:text-slate-700"
                    >
                      +{dayRows.length - 2} more
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {dayRows.slice(0, 3).map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => onSelectRow?.(row)}
                      className={`w-full rounded-xl bg-slate-50 p-2 text-left ${onSelectRow ? "transition hover:bg-slate-100" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-900">{row.platform}</span>
                        {row.currentStatus !== "-" && <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusStyle(row.currentStatus)}`}>{row.currentStatus}</span>}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[11px] text-slate-700">{row.topic}</div>
                      <div className="mt-1 text-[10px] text-slate-500">{formatTimeLabel(row.time)}</div>
                    </button>
                  ))}
                  {dayRows.length > 3 && (
                    <button
                      type="button"
                      onClick={() => onSelectRow?.({ __dayOverflow: true, dayLabel: getDayKey(dateKey), rows: dayRows.slice(3) })}
                      className="text-[11px] font-semibold text-slate-500 transition hover:text-slate-700"
                    >
                      +{dayRows.length - 3} more
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerformanceDashboard({ rows, monthDate, isClientView = false }) {
  const postedRows = useMemo(
    () => rows.filter((row) => row.currentStatus === "Posted" && hasPerformanceMetrics(row)),
    [rows]
  );

  const totals = useMemo(() => {
    return postedRows.reduce(
      (acc, row) => {
        acc.reach += Number(row.reach) || 0;
        acc.impressions += Number(row.impressions) || 0;
        acc.likes += Number(row.likes) || 0;
        acc.comments += Number(row.comments) || 0;
        acc.shares += Number(row.shares) || 0;
        acc.clicks += Number(row.clicks) || 0;
        return acc;
      },
      { reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0 }
    );
  }, [postedRows]);

  const engagementTotal = totals.likes + totals.comments + totals.shares;
  const averageEngagement = postedRows.length ? Math.round(engagementTotal / postedRows.length) : 0;

  const topPost = useMemo(() => {
    return postedRows.reduce((best, row) => {
      if (!best) return row;
      return getEngagementTotal(row) > getEngagementTotal(best) ? row : best;
    }, null);
  }, [postedRows]);

  const topPlatform = useMemo(() => {
    const grouped = {};
    postedRows.forEach((row) => {
      if (!grouped[row.platform]) {
        grouped[row.platform] = { platform: row.platform, engagement: 0, clicks: 0, posts: 0 };
      }
      grouped[row.platform].engagement += getEngagementTotal(row);
      grouped[row.platform].clicks += Number(row.clicks) || 0;
      grouped[row.platform].posts += 1;
    });
    return Object.values(grouped).sort((a, b) => b.engagement - a.engagement)[0] || null;
  }, [postedRows]);

  const leaderboard = useMemo(() => {
    return [...postedRows]
      .sort((a, b) => getEngagementTotal(b) - getEngagementTotal(a))
      .slice(0, 4);
  }, [postedRows]);

  const monthLabel = formatMonthLabel(monthDate);
  const postedRowsWithAnyMetrics = useMemo(
    () => rows.filter((row) => row.currentStatus === "Posted"),
    [rows]
  );

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {isClientView ? "Client Dashboard" : "Performance Dashboard"}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Performance Overview</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            A clean monthly view of content results for {monthLabel}, designed to keep reporting understandable at a glance.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          {postedRows.length} posted item{postedRows.length === 1 ? "" : "s"} with metrics
        </div>
      </div>

      {postedRows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          {postedRowsWithAnyMetrics.length === 0
            ? `No posted content was found for ${monthLabel}. Change the reporting month or save a posted update with metrics to start building client-friendly reporting.`
            : `Posted content exists for ${monthLabel}, but no metrics are attached to those posted items yet. Save reach, impressions, likes, comments, shares, or clicks to populate this dashboard.`}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_34%),linear-gradient(135deg,#0f172a,#172554_58%,#1d4ed8)] p-6 text-white shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
                    Reporting Focus
                  </div>
                  <h4 className="mt-4 text-3xl font-semibold">{formatMetricValue(totals.impressions)}</h4>
                  <p className="mt-2 text-sm text-slate-200">Total impressions generated across posted content this month.</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Avg Engagement</div>
                  <div className="mt-2 text-4xl font-semibold">{formatMetricValue(averageEngagement)}</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "Reach", value: totals.reach },
                  { label: "Clicks", value: totals.clicks },
                  { label: "Likes", value: totals.likes },
                  { label: "Shares", value: totals.shares },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{formatMetricValue(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Top Post</div>
                {topPost ? (
                  <>
                    <h4 className="mt-3 text-lg font-semibold text-slate-900">{topPost.topic || "Planned Post"}</h4>
                    <p className="mt-1 text-sm text-slate-500">{topPost.platform} · {topPost.clientName}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                        Reach {formatMetricValue(topPost.reach)}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                        Engagement {formatMetricValue(getEngagementTotal(topPost))}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No top post available yet.</p>
                )}
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Strongest Platform</div>
                {topPlatform ? (
                  <>
                    <h4 className="mt-3 text-lg font-semibold text-slate-900">{topPlatform.platform}</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatMetricValue(topPlatform.engagement)} engagement across {topPlatform.posts} posted item{topPlatform.posts === 1 ? "" : "s"}.
                    </p>
                    <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                      Clicks {formatMetricValue(topPlatform.clicks)}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No platform comparison available yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Impressions", value: totals.impressions },
              { label: "Reach", value: totals.reach },
              { label: "Engagement", value: engagementTotal },
              { label: "Clicks", value: totals.clicks },
              { label: "Comments", value: totals.comments },
              { label: "Shares", value: totals.shares },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                <div className="mt-3 text-3xl font-semibold text-slate-900">{formatMetricValue(item.value)}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Monthly Summary</h4>
                <p className="mt-1 text-sm text-slate-500">A client-friendly summary generated from the current month’s posted content.</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Ready for reporting
              </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Delivery</div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {postedRows.length} post{postedRows.length === 1 ? "" : "s"} went live in {monthLabel}, generating {formatMetricValue(totals.impressions)} impressions and {formatMetricValue(totals.reach)} reach.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Audience Response</div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Engagement reached {formatMetricValue(engagementTotal)} across likes, comments, and shares, with an average of {formatMetricValue(averageEngagement)} per posted item.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Standout Insight</div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {topPlatform
                    ? `${topPlatform.platform} led the month on engagement, while ${topPost?.topic || "the top post"} stood out as the strongest individual content piece.`
                    : "Add more posted content with metrics to unlock stronger platform and post-level comparisons."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Top Content This Month</h4>
                <p className="mt-1 text-sm text-slate-500">A simple leaderboard to support client reporting and next-step decisions.</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {leaderboard.length} Highlight{leaderboard.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {leaderboard.map((row, index) => (
                <div key={row.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        #{index + 1} Performer
                      </div>
                      <h5 className="mt-2 text-lg font-semibold text-slate-900">{row.topic || "Planned Post"}</h5>
                      <p className="mt-1 text-sm text-slate-500">{row.platform} · {row.clientName}</p>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {formatMetricValue(getEngagementTotal(row))} engagement
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Impressions</div>
                      <div className="mt-2 text-xl font-semibold text-slate-900">{formatMetricValue(row.impressions)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Clicks</div>
                      <div className="mt-2 text-xl font-semibold text-slate-900">{formatMetricValue(row.clicks)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlannedPostsPanel({ rows }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Planned Posts</h3>
          <p className="text-sm text-slate-500">Frontend view of all planned content. This is read-only and meant for quick review.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{rows.length} Posts</div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No planned posts yet. Saved items from the planner will appear here.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{plan.topic}</div>
                  <div className="mt-1 text-xs text-slate-500">{plan.clientName}</div>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{plan.platform}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div><div className="text-xs uppercase tracking-wide text-slate-400">Date</div><div className="mt-1 font-medium text-slate-800">{formatDateLabel(plan.date)}</div></div>
                <div><div className="text-xs uppercase tracking-wide text-slate-400">Time</div><div className="mt-1 font-medium text-slate-800">{formatTimeLabel(plan.time)}</div></div>
                <div><div className="text-xs uppercase tracking-wide text-slate-400">Format</div><div className="mt-1 font-medium text-slate-800">{plan.format || "-"}</div></div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Status</div>
                  <div className="mt-1">
                    {plan.currentStatus === "-" ? <span className="text-slate-400">Not Updated</span> : <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(plan.currentStatus)}`}>{plan.currentStatus}</span>}
                  </div>
                </div>
              </div>
              {plan.notes && <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600">{plan.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlannedContentTable({ rows, onDraftChange, onSaveUpdate, onEdit, onDelete, busy }) {
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedClient, setSelectedClient] = useState("All Clients");
  const platformOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.platform).filter(Boolean))).sort(),
    [rows]
  );
  const clientOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.clientName).filter(Boolean))).sort(),
    [rows]
  );
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const clientMatch = selectedClient === "All Clients" || row.clientName === selectedClient;
      const platformMatch = selectedPlatform === "All Platforms" || row.platform === selectedPlatform;
      return clientMatch && platformMatch;
    });
  }, [rows, selectedClient, selectedPlatform]);

  useEffect(() => {
    if (selectedPlatform !== "All Platforms" && !platformOptions.includes(selectedPlatform)) {
      setSelectedPlatform("All Platforms");
    }
  }, [platformOptions, selectedPlatform]);

  useEffect(() => {
    if (selectedClient !== "All Clients" && !clientOptions.includes(selectedClient)) {
      setSelectedClient("All Clients");
    }
  }, [clientOptions, selectedClient]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Planned Log</h3>
          <p className="text-sm text-slate-500">This is the backend record of all planned items captured from the planned interface. You can still edit, update, and push entries into the execution status log here.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{filteredRows.length} Planned</div>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedClient("All Clients")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            selectedClient === "All Clients"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          All Clients
        </button>
        {clientOptions.map((client) => (
          <button
            key={client}
            type="button"
            onClick={() => setSelectedClient(client)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              selectedClient === client
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {client}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedPlatform("All Platforms")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            selectedPlatform === "All Platforms"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          All Platforms
        </button>
        {platformOptions.map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => setSelectedPlatform(platform)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              selectedPlatform === platform
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            {rows.length === 0
              ? "No planned log entries yet. Use the planner to create your first post."
              : "No planned entries match this platform yet."}
          </div>
        ) : filteredRows.map((plan) => {
          const planKey = getPlanKey(plan);
          return (
            <div key={plan.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{plan.topic || "-"}</div>
                  <div className="mt-1 text-sm text-slate-500">{plan.clientName} · {plan.platform}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatDateLabel(plan.date)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {plan.format || "No format"}
                  </span>
                  {plan.currentStatus === "-" ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      Planned
                    </span>
                  ) : (
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(plan.currentStatus)}`}>
                      {plan.currentStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr,1.2fr]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Time</div>
                      <div className="mt-2 text-base font-semibold text-slate-900">{formatTimeLabel(plan.time)}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current Link</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {plan.currentPostLink ? (
                          <a href={normalizeUrl(plan.currentPostLink)} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                            View Post
                          </a>
                        ) : "No link"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Planning Notes</div>
                    <div className="mt-3 text-sm leading-7 text-slate-700">{plan.notes || "No planning notes added."}</div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Update Status</label>
                      <select value={plan.draftStatus} onChange={(e) => onDraftChange(planKey, "status", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                        <option value="">Select status</option>
                        {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Post Link</label>
                      <input value={plan.draftPostLink} onChange={(e) => onDraftChange(planKey, "postLink", e.target.value)} placeholder="Paste URL" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Update Notes</label>
                    <textarea value={plan.draftNotes} onChange={(e) => onDraftChange(planKey, "notes", e.target.value)} rows={3} placeholder="Add update notes" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Performance Metrics</label>
                      <span className="text-[11px] font-medium text-slate-400">Use for posted content reporting</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                      {[
                        ["reach", "Reach"],
                        ["impressions", "Impressions"],
                        ["likes", "Likes"],
                        ["comments", "Comments"],
                        ["shares", "Shares"],
                        ["clicks", "Clicks"],
                      ].map(([field, label]) => (
                        <div key={field}>
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
                          <input
                            type="number"
                            min="0"
                            value={plan[`draft${field.charAt(0).toUpperCase()}${field.slice(1)}`] ?? ""}
                            onChange={(e) => onDraftChange(planKey, field, e.target.value)}
                            placeholder={label}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" disabled={busy} onClick={() => onSaveUpdate(plan)} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">Save Update</button>
                    <button type="button" disabled={busy} onClick={() => onEdit(plan.id)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">Edit</button>
                    <button type="button" disabled={busy} onClick={() => onDelete(plan.id)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExecutionStatusTable({ rows }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Execution Status Log</h3>
          <p className="text-sm text-slate-500">Only saved updates from the planned content log appear here.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{rows.length} Updates</div>
      </div>
      <div className="space-y-4 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No execution updates yet. Saved updates from the planned log will appear here.
          </div>
        ) : rows.map((record) => (
          <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{record.topic || "-"}</div>
                <div className="mt-1 text-xs text-slate-500">{record.clientName} | {record.platform}</div>
              </div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(record.status)}`}>{record.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div><div className="text-xs uppercase tracking-wide text-slate-400">Date</div><div className="mt-1 font-medium text-slate-800">{formatDateLabel(record.date)}</div></div>
              <div><div className="text-xs uppercase tracking-wide text-slate-400">Time</div><div className="mt-1 font-medium text-slate-800">{formatTimeLabel(record.time)}</div></div>
            </div>
            <div className="mt-4 text-sm text-slate-700">{record.notes || "-"}</div>
            {hasPerformanceMetrics(record) && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">Impressions {formatMetricValue(record.impressions)}</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">Engagement {formatMetricValue(getEngagementTotal(record))}</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">Clicks {formatMetricValue(record.clicks)}</span>
              </div>
            )}
            {record.postLink && (
              <a href={normalizeUrl(record.postLink)} className="mt-4 inline-flex rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 underline underline-offset-4" target="_blank" rel="noreferrer">
                View Post
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead><tr className="text-left text-sm text-slate-500"><th className="px-4">Date</th><th className="px-4">Platform</th><th className="px-4">Topic</th><th className="px-4">Status</th><th className="px-4">Time</th><th className="px-4">Performance</th><th className="px-4">Link</th><th className="px-4">Notes</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="bg-slate-50"><td colSpan={8} className="rounded-2xl px-4 py-8 text-center text-sm text-slate-500">No execution updates yet. Saved updates from the planned log will appear here.</td></tr>
            ) : rows.map((record) => (
              <tr key={record.id} className="bg-slate-50">
                <td className="rounded-l-2xl px-4 py-4 text-sm font-medium text-slate-900">{formatDateLabel(record.date)}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{record.platform}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{record.topic || "-"}</td>
                <td className="px-4 py-4 text-sm"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(record.status)}`}>{record.status}</span></td>
                <td className="px-4 py-4 text-sm text-slate-700">{formatTimeLabel(record.time)}</td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {hasPerformanceMetrics(record) ? (
                    <div className="space-y-1 text-xs font-semibold">
                      <div>Imp {formatMetricValue(record.impressions)}</div>
                      <div>Eng {formatMetricValue(getEngagementTotal(record))}</div>
                      <div>Clk {formatMetricValue(record.clicks)}</div>
                    </div>
                  ) : "-"}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-700">{record.postLink ? <a href={normalizeUrl(record.postLink)} className="text-slate-900 underline underline-offset-4" target="_blank" rel="noreferrer">View Post</a> : "-"}</td>
                <td className="rounded-r-2xl px-4 py-4 text-sm text-slate-700">{record.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SnapshotPanel({ snapshotView, onToggle, activeSummary }) {
  const [selectedPeriod, setSelectedPeriod] = useState("");

  useEffect(() => {
    if (!activeSummary.length) {
      setSelectedPeriod("");
      return;
    }

    if (!activeSummary.some((item) => item.period === selectedPeriod)) {
      setSelectedPeriod(activeSummary[0].period);
    }
  }, [activeSummary, selectedPeriod]);

  const featuredPeriod =
    activeSummary.find((item) => item.period === selectedPeriod) || activeSummary[0] || null;

  const statusCards = featuredPeriod
    ? [
        {
          label: "Planned",
          value: featuredPeriod.totals.planned,
          className: "border-blue-200 bg-blue-50 text-blue-700",
        },
        {
          label: "Posted",
          value: featuredPeriod.totals.posted,
          className: "border-green-200 bg-green-50 text-green-700",
        },
        {
          label: "Pending",
          value: featuredPeriod.totals.pending,
          className: "border-yellow-200 bg-yellow-50 text-yellow-700",
        },
        {
          label: "Missed",
          value: featuredPeriod.totals.missed,
          className: "border-red-200 bg-red-50 text-red-700",
        },
        {
          label: "Rescheduled",
          value: featuredPeriod.totals.rescheduled,
          className: "border-orange-200 bg-orange-50 text-orange-700",
        },
        {
          label: "Overdue",
          value: featuredPeriod.totals.overdue,
          className: "border-rose-200 bg-rose-50 text-rose-700",
        },
      ]
    : [];

  const platformCards = featuredPeriod
    ? [...featuredPeriod.platforms].sort((a, b) => {
        const aWeight = a.planned + a.posted + a.pending + a.missed + a.rescheduled + a.overdue;
        const bWeight = b.planned + b.posted + b.pending + b.missed + b.rescheduled + b.overdue;
        return bWeight - aWeight;
      })
    : [];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Dashboard View
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Plan vs Execution
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Compare planned volume against execution outcomes with a cleaner,
            period-led dashboard view.
          </p>
        </div>
        <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1 xl:w-auto">
          <button
            type="button"
            onClick={() => onToggle("daily")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold xl:flex-none ${
              snapshotView === "daily" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => onToggle("weekly")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold xl:flex-none ${
              snapshotView === "weekly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => onToggle("monthly")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold xl:flex-none ${
              snapshotView === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {activeSummary.length === 0 || !featuredPeriod ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No snapshot data yet. Add planned posts and save status updates to generate reporting.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
            <div className="overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.26),_transparent_38%),linear-gradient(135deg,#0f172a,#1e293b_58%,#334155)] p-6 text-white shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                    Focus Period
                  </div>
                  <h4 className="mt-4 text-2xl font-semibold">{featuredPeriod.period}</h4>
                  <p className="mt-2 max-w-xl text-sm text-slate-300">
                    {featuredPeriod.totals.posted} of {featuredPeriod.totals.planned} planned posts
                    have been executed in this view.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Execution Score
                  </div>
                  <div className="mt-2 text-4xl font-semibold">{featuredPeriod.executionScore}%</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  <span>Completion</span>
                  <span>{featuredPeriod.totals.posted}/{featuredPeriod.totals.planned || 0} posted</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${featuredPeriod.executionScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                {statusCards.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                      {item.label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">Available Periods</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Click a period to refresh the dashboard focus.
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {activeSummary.length} Periods
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {activeSummary.map((periodItem) => {
                  const isActive = periodItem.period === featuredPeriod.period;
                  return (
                    <button
                      key={periodItem.period}
                      type="button"
                      onClick={() => setSelectedPeriod(periodItem.period)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-900"}`}>
                            {periodItem.period}
                          </div>
                          <div className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                            Planned {periodItem.totals.planned} · Posted {periodItem.totals.posted}
                          </div>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
                        }`}>
                          {periodItem.executionScore}%
                        </div>
                      </div>
                      <div className={`mt-3 h-2 overflow-hidden rounded-full ${isActive ? "bg-white/10" : "bg-slate-100"}`}>
                        <div
                          className={`h-full rounded-full ${isActive ? "bg-emerald-300" : "bg-slate-900"}`}
                          style={{ width: `${periodItem.executionScore}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {statusCards.map((item) => (
              <div key={`${featuredPeriod.period}-${item.label}`} className={`rounded-2xl border px-4 py-4 ${item.className}`}>
                <div className="text-xs font-semibold uppercase tracking-[0.16em]">{item.label}</div>
                <div className="mt-3 text-3xl font-semibold">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Platform Performance</h4>
                <p className="mt-1 text-sm text-slate-500">
                  A tidier platform-by-platform view for the selected period.
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {platformCards.length} Platforms
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {platformCards.map((platformItem) => (
                <div
                  key={`${featuredPeriod.period}-${platformItem.platform}`}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-lg font-semibold text-slate-900">{platformItem.platform}</h5>
                      <p className="mt-1 text-sm text-slate-500">
                        {platformItem.posted} posted from {platformItem.planned} planned entries
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 px-4 py-2 text-right text-white">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                        Score
                      </div>
                      <div className="mt-1 text-2xl font-semibold">{platformItem.executionScore}%</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <span>Posting Pace</span>
                      <span>{platformItem.posted}/{platformItem.planned || 0}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{ width: `${platformItem.executionScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                      Planned {platformItem.planned}
                    </span>
                    <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
                      Posted {platformItem.posted}
                    </span>
                    <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-yellow-700">
                      Pending {platformItem.pending}
                    </span>
                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                      Missed {platformItem.missed}
                    </span>
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                      Rescheduled {platformItem.rescheduled}
                    </span>
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                      Overdue {platformItem.overdue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientSocialMediaPostingTrackerInterface() {
  const initialDataMonth = getMonthStart(new Date());
  const [planForm, setPlanForm] = useState({
    ...EMPTY_PLAN_FORM,
    clientName: "Acme Client",
    date: getDefaultPlanDate(initialDataMonth),
    topic: "Campaign Reminder",
    platforms: ["Instagram", "Facebook"],
    platformFormats: { Instagram: "Carousel", Facebook: "Graphic" },
    platformTimes: { Instagram: "11:00", Facebook: "12:00" },
  });
  const [plans, setPlans] = useState(() => readStoredItems(PLAN_STORAGE_KEY, DEFAULT_PLANS).map(withPlanId));
  const [statusRecords, setStatusRecords] = useState(() => readStoredItems(STATUS_STORAGE_KEY, DEFAULT_STATUS_RECORDS).map(withStatusId));
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [snapshotView, setSnapshotView] = useState("weekly");
  const [statusDrafts, setStatusDrafts] = useState(() => readStoredObject(STATUS_DRAFTS_STORAGE_KEY, {}));
  const [notice, setNotice] = useState("Ready for deployment.");
  const [isClientView, setIsClientView] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [activeDataMonth, setActiveDataMonth] = useState(initialDataMonth);
  const [currentUser, setCurrentUser] = useState(() => readStoredObject(SESSION_STORAGE_KEY, null));
  const [selectedClientName, setSelectedClientName] = useState("All Clients");
  const [authEmail, setAuthEmail] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [syncState, setSyncState] = useState("idle");
  const [accessInvites, setAccessInvites] = useState([]);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE_FORM);
  const [selectedCalendarPost, setSelectedCalendarPost] = useState(null);
  const [selectedCalendarOverflow, setSelectedCalendarOverflow] = useState(null);

  const sharedModeReady = hasSharedConfiguration();
  const supabase = useMemo(() => getSupabaseClient(), [sharedModeReady]);

  useEffect(() => {
    if (typeof window !== "undefined" && !sharedModeReady) {
      if (currentUser) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, [currentUser, sharedModeReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STATUS_DRAFTS_STORAGE_KEY, JSON.stringify(statusDrafts));
  }, [statusDrafts]);

  const accessibleClientNames = useMemo(() => getAccessibleClientNames(plans), [plans]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "client") {
      setIsClientView(true);
      const scopes = parseClientScopeList(currentUser.clientName);
      setSelectedClientName(scopes.length <= 1 ? (scopes[0] || "All Clients") : "All Clients");
    } else if (!accessibleClientNames.includes(selectedClientName) && selectedClientName !== "All Clients") {
      setSelectedClientName("All Clients");
    }
  }, [currentUser, accessibleClientNames, selectedClientName]);

  async function loadRemoteSession() {
    if (!supabase) return;
    setSyncState("connecting");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setAuthNotice(sessionError.message);
      setSyncState("error");
      return;
    }

    const sessionUser = sessionData?.session?.user || null;
    if (!sessionUser) {
      setCurrentUser(null);
      setSyncState("idle");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, client_name")
      .eq("id", sessionUser.id)
      .single();

    let resolvedProfile = profile;

    if (profileError) {
      const { error: ensureError } = await supabase.rpc("ensure_my_profile");
      if (!ensureError) {
        const { data: syncedProfile, error: syncedProfileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, client_name")
          .eq("id", sessionUser.id)
          .single();

        if (!syncedProfileError) {
          resolvedProfile = syncedProfile;
        }
      }
    }

    if (!resolvedProfile) {
      setCurrentUser(null);
      setAuthNotice("This email has not been provisioned for the shared trial yet. Ask an admin to add it to invited access.");
      setSyncState("error");
      return;
    }

    setCurrentUser({
      id: resolvedProfile.id,
      name: resolvedProfile.full_name || sessionUser.email || "Team Member",
      role: resolvedProfile.role,
      clientName: resolvedProfile.client_name || "",
      email: sessionUser.email || "",
      mode: "shared",
    });
    setAuthNotice("");
    setSyncState("connected");
  }

  async function loadRemoteData(user) {
    if (!supabase || !user) return;
    setBusy(true);
    setSyncState("syncing");
    try {
      let planQuery = supabase
        .from("plans")
        .select("id, client_name, date, platform, topic, format, time, notes")
        .order("date", { ascending: true });

      let statusQuery = supabase
        .from("status_records")
        .select("id, plan_id, client_name, date, platform, topic, format, time, status, post_link, notes, reach, impressions, likes, comments, shares, clicks")
        .order("date", { ascending: true });

      if (user.role === "client" && user.clientName) {
        const clientScopes = parseClientScopeList(user.clientName);
        if (clientScopes.length === 1) {
          planQuery = planQuery.eq("client_name", clientScopes[0]);
          statusQuery = statusQuery.eq("client_name", clientScopes[0]);
        } else if (clientScopes.length > 1) {
          planQuery = planQuery.in("client_name", clientScopes);
          statusQuery = statusQuery.in("client_name", clientScopes);
        }
      }

      const remoteRequests = [planQuery, statusQuery];

      if (user.role === "admin") {
        remoteRequests.push(
          supabase
            .from("access_invites")
            .select("email, full_name, role, client_name, created_at")
            .order("created_at", { ascending: false })
        );
      }

      const remoteResults = await Promise.all(remoteRequests);
      const [{ data: planRows, error: plansError }, { data: statusRows, error: statusError }, inviteResult] = remoteResults;

      if (plansError) throw plansError;
      if (statusError) throw statusError;

      setPlans((planRows || []).map(mapDbPlan));
      setStatusRecords((statusRows || []).map(mapDbStatus));
      if (user.role === "admin") {
        if (inviteResult?.error) throw inviteResult.error;
        setAccessInvites((inviteResult?.data || []).map(mapDbInvite));
      } else {
        setAccessInvites([]);
      }
      setSyncState("connected");
    } catch (error) {
      setNotice(error.message || "Unable to sync shared data.");
      setSyncState("error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!sharedModeReady || !supabase) return undefined;
    let active = true;

    loadRemoteSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      if (active) loadRemoteSession();
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, [sharedModeReady, supabase]);

  useEffect(() => {
    if (sharedModeReady && currentUser?.mode === "shared") {
      loadRemoteData(currentUser);
    }
  }, [sharedModeReady, currentUser]);

  const filteredPlans = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "client") {
      const clientScopes = parseClientScopeList(currentUser.clientName);
      const scopedPlans = plans.filter((plan) => clientScopes.includes(plan.clientName));
      if (selectedClientName === "All Clients") return scopedPlans;
      return scopedPlans.filter((plan) => plan.clientName === selectedClientName);
    }
    if (selectedClientName === "All Clients") return plans;
    return plans.filter((plan) => plan.clientName === selectedClientName);
  }, [plans, currentUser, selectedClientName]);

  const filteredStatusRecords = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "client") {
      const clientScopes = parseClientScopeList(currentUser.clientName);
      const scopedRecords = statusRecords.filter((record) => clientScopes.includes(record.clientName));
      if (selectedClientName === "All Clients") return scopedRecords;
      return scopedRecords.filter((record) => record.clientName === selectedClientName);
    }
    if (selectedClientName === "All Clients") return statusRecords;
    return statusRecords.filter((record) => record.clientName === selectedClientName);
  }, [statusRecords, currentUser, selectedClientName]);

  const monthFilteredPlans = useMemo(() => {
    return filteredPlans.filter((plan) => isSameMonth(plan.date, activeDataMonth));
  }, [filteredPlans, activeDataMonth]);

  const monthFilteredStatusRecords = useMemo(() => {
    return filteredStatusRecords.filter((record) => isSameMonth(record.date, activeDataMonth));
  }, [filteredStatusRecords, activeDataMonth]);

  const handlePlanChange = (field, value) => setPlanForm((prev) => ({ ...prev, [field]: value }));
  const handleInviteFormChange = (field, value) =>
    setInviteForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "role" && value !== "client") next.clientName = "";
      return next;
    });

  const togglePlanPlatform = (platform) => {
    setPlanForm((prev) => {
      const exists = prev.platforms.includes(platform);
      const nextPlatforms = exists ? prev.platforms.filter((item) => item !== platform) : [...prev.platforms, platform];
      const safePlatforms = nextPlatforms.length ? nextPlatforms : [platform];
      const nextFormats = { ...prev.platformFormats };
      const nextTimes = { ...prev.platformTimes };
      if (exists && nextPlatforms.length) {
        delete nextFormats[platform];
        delete nextTimes[platform];
      } else {
        nextFormats[platform] = nextFormats[platform] || "";
        nextTimes[platform] = nextTimes[platform] || "";
      }
      const normalizedFormats = {};
      const normalizedTimes = {};
      safePlatforms.forEach((item) => {
        normalizedFormats[item] = nextFormats[item] || "";
        normalizedTimes[item] = nextTimes[item] || "";
      });
      return { ...prev, platforms: safePlatforms, platformFormats: normalizedFormats, platformTimes: normalizedTimes };
    });
  };

  const handlePlatformTimeChange = (platform, value) => setPlanForm((prev) => ({ ...prev, platformTimes: { ...prev.platformTimes, [platform]: value } }));
  const handlePlatformFormatChange = (platform, value) => setPlanForm((prev) => ({ ...prev, platformFormats: { ...prev.platformFormats, [platform]: value } }));

  const resetPlanForm = (clientName = "") => {
    setPlanForm({
      ...EMPTY_PLAN_FORM,
      clientName,
      date: getDefaultPlanDate(activeDataMonth),
      platforms: ["Instagram"],
      platformFormats: { Instagram: "" },
      platformTimes: { Instagram: "" },
    });
  };

  useEffect(() => {
    if (editingPlanId !== null) return;
    setPlanForm((prev) => {
      if (prev.date && isSameMonth(prev.date, activeDataMonth)) return prev;
      return {
        ...prev,
        date: getDefaultPlanDate(activeDataMonth),
      };
    });
  }, [activeDataMonth, editingPlanId]);

  async function handlePlanSubmit(event) {
    event.preventDefault();
    if (!planForm.clientName || !planForm.date || !planForm.topic || !planForm.platforms.length) return;

    const baseEntry = {
      clientName: planForm.clientName.trim(),
      date: planForm.date,
      topic: planForm.topic.trim(),
      notes: planForm.notes.trim(),
    };
    const entries = planForm.platforms.map((platform) => withPlanId({
      ...baseEntry,
      platform,
      time: planForm.platformTimes[platform] || "",
      format: (planForm.platformFormats[platform] || "").trim(),
    }));

    if (sharedModeReady && currentUser?.mode === "shared" && supabase) {
      setBusy(true);
      try {
        if (editingPlanId) {
          const { error: deleteError } = await supabase.from("plans").delete().eq("id", editingPlanId);
          if (deleteError) throw deleteError;
          const { error: insertError } = await supabase.from("plans").insert(entries.map((entry) => toDbPlan(entry, currentUser.id)));
          if (insertError) throw insertError;
          setNotice("Planned entry updated in shared workspace.");
        } else {
          const { error: insertError } = await supabase.from("plans").insert(entries.map((entry) => toDbPlan(entry, currentUser.id)));
          if (insertError) throw insertError;
          setNotice("Planned entry saved to shared workspace.");
        }
        setEditingPlanId(null);
        resetPlanForm(baseEntry.clientName);
        await loadRemoteData(currentUser);
      } catch (error) {
        setNotice(error.message || "Unable to save the plan.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (editingPlanId !== null) {
      const editingPlan = plans.find((item) => item.id === editingPlanId);
      setPlans((prev) => updatePlanState(prev, editingPlanId, entries));
      if (editingPlan) {
        const deleted = deletePlanState([], statusRecords, statusDrafts, editingPlan.id);
        setStatusRecords(deleted.statusRecords);
        setStatusDrafts(deleted.statusDrafts);
      }
      setEditingPlanId(null);
      setNotice("Planned entry updated.");
    } else {
      setPlans((prev) => [...entries, ...prev]);
      setNotice("Planned entry saved.");
    }
    resetPlanForm(baseEntry.clientName);
  }

  function handleEditPlan(planId) {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    setPlanForm({
      clientName: plan.clientName,
      date: plan.date,
      platforms: [plan.platform],
      platformFormats: { [plan.platform]: plan.format || "" },
      platformTimes: { [plan.platform]: plan.time || "" },
      topic: plan.topic,
      notes: plan.notes,
    });
    setEditingPlanId(planId);
    setNotice("Edit dialog opened.");
  }

  async function handleDeletePlan(planId) {
    const ok = typeof window === "undefined" ? true : window.confirm("Delete this planned entry?");
    if (!ok) return;

    if (sharedModeReady && currentUser?.mode === "shared" && supabase) {
      setBusy(true);
      try {
        const { error } = await supabase.from("plans").delete().eq("id", planId);
        if (error) throw error;
        if (editingPlanId === planId) {
          setEditingPlanId(null);
          resetPlanForm();
        }
        setNotice("Planned entry deleted from shared workspace.");
        await loadRemoteData(currentUser);
      } catch (error) {
        setNotice(error.message || "Unable to delete the plan.");
      } finally {
        setBusy(false);
      }
      return;
    }

    const deleted = deletePlanState(plans, statusRecords, statusDrafts, planId);
    setPlans(deleted.plans);
    setStatusRecords(deleted.statusRecords);
    setStatusDrafts(deleted.statusDrafts);
    if (editingPlanId === planId) {
      setEditingPlanId(null);
      resetPlanForm();
    }
    setNotice("Planned entry deleted.");
  }

  function handleCancelPlanEdit() {
    setEditingPlanId(null);
    resetPlanForm(planForm.clientName);
    setNotice("Edit cancelled.");
  }

  const updateDraft = (planKey, field, value) => setStatusDrafts((prev) => ({ ...prev, [planKey]: { ...(prev[planKey] || EMPTY_STATUS_DRAFT), [field]: value } }));

  async function saveDraftToStatusLog(plan) {
    const planKey = getPlanKey(plan);
    const draft = statusDrafts[planKey] || EMPTY_STATUS_DRAFT;
    if (!draft.status) {
      setNotice("Select a status before saving the update.");
      return;
    }

    if (sharedModeReady && currentUser?.mode === "shared" && supabase) {
      setBusy(true);
      try {
        const payload = toDbStatus(plan, draft, currentUser.id);
        const { data: existing, error: existingError } = await supabase
          .from("status_records")
          .select("id")
          .eq("plan_id", plan.id)
          .maybeSingle();

        if (existingError) throw existingError;

        if (existing?.id) {
          const { error } = await supabase
            .from("status_records")
            .update({ ...payload, updated_by: currentUser.id })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("status_records").insert(payload);
          if (error) throw error;
        }

        setStatusDrafts((prev) => {
          const next = { ...prev };
          delete next[planKey];
          return next;
        });
        setNotice(`Saved update for ${plan.platform} | ${plan.topic}`);
        await loadRemoteData(currentUser);
      } catch (error) {
        setNotice(error.message || "Unable to save the status update.");
      } finally {
        setBusy(false);
      }
      return;
    }

    const entry = withStatusId({
      planId: plan.id,
      clientName: plan.clientName,
      date: plan.date,
      platform: plan.platform,
      topic: plan.topic,
      format: plan.format,
      time: plan.time,
      status: draft.status,
      postLink: draft.postLink.trim(),
      notes: draft.notes.trim(),
      reach: parseMetricValue(draft.reach),
      impressions: parseMetricValue(draft.impressions),
      likes: parseMetricValue(draft.likes),
      comments: parseMetricValue(draft.comments),
      shares: parseMetricValue(draft.shares),
      clicks: parseMetricValue(draft.clicks),
    });
    setStatusRecords((prev) => {
      const existingIndex = prev.findIndex((item) => item.planId === plan.id);
      if (existingIndex >= 0) return prev.map((item, index) => (index === existingIndex ? { ...entry, id: item.id } : item));
      return [entry, ...prev];
    });
    setStatusDrafts((prev) => {
      const next = { ...prev };
      delete next[planKey];
      return next;
    });
    setNotice(`Saved update for ${plan.platform} | ${plan.topic}`);
  }

  function handleExportBackup() {
    downloadJsonFile("client-social-media-posting-tracker-backup.json", buildBackupPayload(plans, statusRecords, currentUser));
    setNotice("Backup exported successfully.");
  }

  async function handleImportBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const nextPlans = Array.isArray(parsed.plans) ? parsed.plans.map(withPlanId) : [];
      const nextStatuses = Array.isArray(parsed.statusRecords) ? parsed.statusRecords.map(withStatusId) : [];
      setPlans(nextPlans);
      setStatusRecords(nextStatuses);
      setStatusDrafts({});
      setEditingPlanId(null);
      resetPlanForm();
      setNotice("Backup imported successfully.");
    } catch {
      setNotice("Import failed. Please use a valid backup file.");
    }
    event.target.value = "";
  }

  function handleResetData() {
    const ok = typeof window === "undefined" ? true : window.confirm("Reset all live data and restore the current demo set?");
    if (!ok) return;
    setPlans(DEFAULT_PLANS.map(withPlanId));
    setStatusRecords(DEFAULT_STATUS_RECORDS.map(withStatusId));
    setStatusDrafts({});
    setEditingPlanId(null);
    resetPlanForm();
    setNotice("Data reset completed.");
  }

  useEffect(() => {
    if (!sharedModeReady && typeof window !== "undefined") {
      window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
    }
  }, [plans, sharedModeReady]);

  useEffect(() => {
    if (!sharedModeReady && typeof window !== "undefined") {
      window.localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusRecords));
    }
  }, [statusRecords, sharedModeReady]);

  const mergedPlanRows = useMemo(() => {
    return monthFilteredPlans.map((plan) => {
      const matchingStatus = monthFilteredStatusRecords.find((item) => item.planId === plan.id);
      const overdue = isPlanOverdue(plan, matchingStatus);
      const draft = statusDrafts[getPlanKey(plan)] || null;
      const currentStatus = matchingStatus?.status || (overdue ? "Overdue" : "-");
      const shouldUseStatusNotes = ["Posted", "Awaiting Approval", "Rescheduled", "Missed"].includes(currentStatus);
      const metricFields = ["reach", "impressions", "likes", "comments", "shares", "clicks"];
      const draftMetrics = Object.fromEntries(
        metricFields.map((field) => [
          `draft${field.charAt(0).toUpperCase()}${field.slice(1)}`,
          draft?.[field] ?? matchingStatus?.[field] ?? "",
        ])
      );
      return {
        ...plan,
        currentStatus,
        currentPostLink: matchingStatus?.postLink || "",
        reach: matchingStatus?.reach ?? null,
        impressions: matchingStatus?.impressions ?? null,
        likes: matchingStatus?.likes ?? null,
        comments: matchingStatus?.comments ?? null,
        shares: matchingStatus?.shares ?? null,
        clicks: matchingStatus?.clicks ?? null,
        detailNotes: shouldUseStatusNotes
          ? (matchingStatus?.notes || plan.notes || "")
          : (plan.notes || ""),
        draftStatus: draft?.status ?? matchingStatus?.status ?? "",
        draftPostLink: draft?.postLink ?? matchingStatus?.postLink ?? "",
        draftNotes: draft?.notes ?? matchingStatus?.notes ?? "",
        ...draftMetrics,
      };
    });
  }, [monthFilteredPlans, monthFilteredStatusRecords, statusDrafts, activeDataMonth]);

  const summaryStatusRecords = useMemo(() => {
    const base = [...monthFilteredStatusRecords];
    mergedPlanRows.forEach((plan) => {
      if (plan.currentStatus === "Overdue" && !base.some((item) => item.planId === plan.id)) {
        base.push(withStatusId({
          planId: plan.id,
          clientName: plan.clientName,
          date: plan.date,
          platform: plan.platform,
          topic: plan.topic,
          format: plan.format,
          time: plan.time,
          status: "Overdue",
          postLink: "",
          notes: "Automatically flagged as overdue.",
        }));
      }
    });
    return base;
  }, [mergedPlanRows, monthFilteredStatusRecords]);

  const overallExecutionScore = useMemo(
    () => calculateExecutionScore(monthFilteredPlans.length, mergedPlanRows.filter((item) => item.currentStatus === "Posted").length),
    [monthFilteredPlans.length, mergedPlanRows]
  );

  const stats = useMemo(() => {
    const counts = { planned: monthFilteredPlans.length, posted: 0, pending: 0, missed: 0, rescheduled: 0, overdue: 0 };
    mergedPlanRows.forEach((record) => {
      if (record.currentStatus === "Posted") counts.posted += 1;
      if (record.currentStatus === "Awaiting Approval") counts.pending += 1;
      if (record.currentStatus === "Missed") counts.missed += 1;
      if (record.currentStatus === "Rescheduled") counts.rescheduled += 1;
      if (record.currentStatus === "Overdue") counts.overdue += 1;
    });
    return [
      { label: "Planned", value: counts.planned },
      { label: "Posted", value: counts.posted },
      { label: "Pending", value: counts.pending },
      { label: "Missed", value: counts.missed },
      { label: "Rescheduled", value: counts.rescheduled },
      { label: "Overdue", value: counts.overdue },
      { label: "Score", value: `${overallExecutionScore}%` },
    ];
  }, [monthFilteredPlans, mergedPlanRows, overallExecutionScore]);

  const dailySummary = useMemo(() => buildPeriodSummary(monthFilteredPlans, summaryStatusRecords, getDayKey), [monthFilteredPlans, summaryStatusRecords]);
  const weeklySummary = useMemo(() => buildPeriodSummary(monthFilteredPlans, summaryStatusRecords, getWeekKey), [monthFilteredPlans, summaryStatusRecords]);
  const monthlySummary = useMemo(() => buildPeriodSummary(monthFilteredPlans, summaryStatusRecords, getMonthKey), [monthFilteredPlans, summaryStatusRecords]);
  const activeSummary = snapshotView === "daily" ? dailySummary : snapshotView === "weekly" ? weeklySummary : monthlySummary;

  async function requestMagicLink() {
    if (!supabase || !authEmail.trim()) return;
    setBusy(true);
    try {
      const config = getTrackerConfig();
      const emailRedirectTo = config?.appUrl || window.location.href;
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail.trim(),
        options: {
          emailRedirectTo,
        },
      });
      if (error) throw error;
      setAuthNotice(`Magic link sent to ${authEmail.trim()}.`);
    } catch (error) {
      setAuthNotice(error.message || "Unable to send magic link.");
    } finally {
      setBusy(false);
    }
  }

  function handleInviteEdit(invite) {
    setInviteForm({
      email: invite.email,
      fullName: invite.fullName,
      role: invite.role,
      clientName: invite.clientName || "",
    });
    setNotice(`Editing access for ${invite.email}.`);
  }

  async function handleInviteSubmit(event) {
    event.preventDefault();
    if (!supabase || currentUser?.mode !== "shared" || currentUser?.role !== "admin") return;

    const email = inviteForm.email.trim().toLowerCase();
    const fullName = inviteForm.fullName.trim();
    const role = inviteForm.role;
    const clientName = role === "client" ? inviteForm.clientName.trim() : "";

    if (!email) {
      setNotice("Add an email before saving access.");
      return;
    }

    if (role === "client" && !clientName) {
      setNotice("Client access requires a client scope.");
      return;
    }

    setInviteBusy(true);
    try {
      const { error } = await supabase.from("access_invites").upsert(
        {
          email,
          full_name: fullName || null,
          role,
          client_name: clientName || null,
        },
        { onConflict: "email" }
      );

      if (error) throw error;

      setInviteForm(EMPTY_INVITE_FORM);
      setNotice(`Access saved for ${email}.`);
      await loadRemoteData(currentUser);
    } catch (error) {
      setNotice(error.message || "Unable to save access.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function handleInviteDelete(email) {
    if (!supabase || currentUser?.mode !== "shared" || currentUser?.role !== "admin") return;
    const ok = typeof window === "undefined" ? true : window.confirm(`Remove invited access for ${email}?`);
    if (!ok) return;

    setInviteBusy(true);
    try {
      const { error } = await supabase.from("access_invites").delete().eq("email", email.toLowerCase());
      if (error) throw error;

      if (inviteForm.email.toLowerCase() === email.toLowerCase()) {
        setInviteForm(EMPTY_INVITE_FORM);
      }

      setNotice(`Removed access for ${email}.`);
      await loadRemoteData(currentUser);
    } catch (error) {
      setNotice(error.message || "Unable to remove access.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function handleLogout() {
    if (sharedModeReady && supabase && currentUser?.mode === "shared") {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setPlans([]);
      setStatusRecords([]);
      setStatusDrafts({});
      setSelectedClientName("All Clients");
      setIsClientView(false);
      setSelectedCalendarPost(null);
      setSelectedCalendarOverflow(null);
      setNotice("Logged out.");
      return;
    }

    setCurrentUser(null);
    setIsClientView(false);
    setSelectedClientName("All Clients");
    setSelectedCalendarPost(null);
    setSelectedCalendarOverflow(null);
    setNotice("Logged out.");
  }

  if (!currentUser) {
    return (
      <LoginScreen
        users={DEMO_USERS}
        onLogin={(user) => {
          setCurrentUser(user);
          setIsClientView(user.role === "client");
          setSelectedClientName(user.role === "client" ? user.clientName : "All Clients");
          setNotice(`${user.name} signed in.`);
        }}
        sharedMode={sharedModeReady}
        authEmail={authEmail}
        onAuthEmailChange={setAuthEmail}
        onRequestMagicLink={requestMagicLink}
        authNotice={authNotice}
        authLoading={busy}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHeader
          currentUser={currentUser}
          selectedClientName={selectedClientName}
          onSelectClient={setSelectedClientName}
          clientOptions={
            currentUser?.role === "client"
              ? parseClientScopeList(currentUser.clientName)
              : canViewMultipleClients(currentUser)
                ? accessibleClientNames
                : currentUser.clientName
                  ? [currentUser.clientName]
                  : []
          }
          onLogout={handleLogout}
        />
        <AppNotice message={notice} />
        {!isClientView && <ModeBanner currentUser={currentUser} sharedModeReady={sharedModeReady} syncState={syncState} />}
        {!sharedModeReady && <SharedSetupPanel />}
        {isClientView && <ClientViewBanner currentUser={currentUser} />}
        {!isClientView && <AccessSummary currentUser={currentUser} selectedClientName={selectedClientName} />}
        {!isClientView && sharedModeReady && currentUser.mode === "shared" && currentUser.role === "admin" && (
          <AccessManagementPanel
            inviteForm={inviteForm}
            onInviteFormChange={handleInviteFormChange}
            onInviteSubmit={handleInviteSubmit}
            onInviteEdit={handleInviteEdit}
            onInviteDelete={handleInviteDelete}
            accessInvites={accessInvites}
            inviteBusy={inviteBusy}
            clientOptions={accessibleClientNames}
          />
        )}

        <div className="space-y-8">
          {!isClientView && canEdit(currentUser) && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-semibold text-slate-900">Planned Content Entry</div><p className="mt-1 text-sm text-slate-600">Create the content schedule your team will execute against.</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-semibold text-slate-900">Planned Log</div><p className="mt-1 text-sm text-slate-600">Review, edit, and update each planned row directly from the backend log.</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-semibold text-slate-900">Execution Status Log</div><p className="mt-1 text-sm text-slate-600">Track saved outcomes and keep reporting aligned to posted activity.</p></div>
              </div>
            </div>
          )}

          {!isClientView && canEdit(currentUser) && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <PlannedEntryForm
                planForm={planForm}
                editingPlanId={editingPlanId}
                onPlanChange={handlePlanChange}
                onTogglePlatform={togglePlanPlatform}
                onPlatformFormatChange={handlePlatformFormatChange}
                onPlatformTimeChange={handlePlatformTimeChange}
                onSubmit={handlePlanSubmit}
                onCancel={handleCancelPlanEdit}
                busy={busy}
                mode="create"
              />
              <StatusGuide />
            </div>
          )}

          <div className="space-y-8">
            {canEdit(currentUser) && !isClientView && (
              <DeploymentTools
                onExport={handleExportBackup}
                onImport={handleImportBackup}
                onResetData={handleResetData}
                hasData={plans.length > 0 || statusRecords.length > 0}
                isClientView={isClientView}
                sharedModeReady={sharedModeReady}
                onToggleClientView={() => {
                  const next = !isClientView;
                  setIsClientView(next);
                  if (!next) setSelectedCalendarPost(null);
                  setSelectedCalendarOverflow(null);
                  setNotice(next ? "Client view enabled." : "Admin view enabled.");
                }}
              />
            )}
            {!isClientView && (
              <MonthScopeControls
                monthDate={activeDataMonth}
                onChangeMonth={setActiveDataMonth}
                onPreviousMonth={() => setActiveDataMonth((prev) => shiftMonth(prev, -1))}
                onNextMonth={() => setActiveDataMonth((prev) => shiftMonth(prev, 1))}
                onGoToCurrentMonth={() => setActiveDataMonth(getMonthStart(new Date()))}
              />
            )}
            {isClientView && (
              <>
                <PerformanceDashboard rows={mergedPlanRows} monthDate={activeDataMonth} isClientView />
                <StatCards stats={stats} />
                <SnapshotPanel snapshotView={snapshotView} onToggle={setSnapshotView} activeSummary={activeSummary} />
                <MonthScopeControls
                  monthDate={activeDataMonth}
                  onChangeMonth={setActiveDataMonth}
                  onPreviousMonth={() => setActiveDataMonth((prev) => shiftMonth(prev, -1))}
                  onNextMonth={() => setActiveDataMonth((prev) => shiftMonth(prev, 1))}
                  onGoToCurrentMonth={() => setActiveDataMonth(getMonthStart(new Date()))}
                />
              </>
            )}
            {!isClientView && canEdit(currentUser) && (
              <PlannedContentTable rows={mergedPlanRows} onDraftChange={updateDraft} onSaveUpdate={saveDraftToStatusLog} onEdit={handleEditPlan} onDelete={handleDeletePlan} busy={busy} />
            )}
            {!isClientView && <ExecutionStatusTable rows={summaryStatusRecords} />}
            {!isClientView && <StatCards stats={stats} />}
            {!isClientView && <PerformanceDashboard rows={mergedPlanRows} monthDate={activeDataMonth} />}
            <CalendarView
              rows={mergedPlanRows}
              monthDate={calendarMonth}
              onPreviousMonth={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              onNextMonth={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              onGoToToday={() => setCalendarMonth(new Date())}
              onSelectRow={(payload) => {
                if (payload?.__dayOverflow) {
                  setSelectedCalendarOverflow(payload);
                  return;
                }
                setSelectedCalendarPost(payload);
              }}
              compact
            />
            {canEdit(currentUser) && isClientView && (
              <DeploymentTools
                onExport={handleExportBackup}
                onImport={handleImportBackup}
                onResetData={handleResetData}
                hasData={plans.length > 0 || statusRecords.length > 0}
                isClientView={isClientView}
                sharedModeReady={sharedModeReady}
                onToggleClientView={() => {
                  const next = !isClientView;
                  setIsClientView(next);
                  if (!next) setSelectedCalendarPost(null);
                  setSelectedCalendarOverflow(null);
                  setNotice(next ? "Client view enabled." : "Admin view enabled.");
                }}
              />
            )}
            {!isClientView && <SnapshotPanel snapshotView={snapshotView} onToggle={setSnapshotView} activeSummary={activeSummary} />}
          </div>
        </div>
      </div>
      <EditPlanDialog
        open={!isClientView && canEdit(currentUser) && editingPlanId !== null}
        planForm={planForm}
        editingPlanId={editingPlanId}
        onPlanChange={handlePlanChange}
        onTogglePlatform={togglePlanPlatform}
        onPlatformFormatChange={handlePlatformFormatChange}
        onPlatformTimeChange={handlePlatformTimeChange}
        onSubmit={handlePlanSubmit}
        onCancel={handleCancelPlanEdit}
        busy={busy}
      />
      <CalendarPostDetailsDialog
        post={selectedCalendarPost}
        onClose={() => setSelectedCalendarPost(null)}
      />
      <CalendarDayDetailsDialog
        dayLabel={selectedCalendarOverflow?.dayLabel}
        rows={selectedCalendarOverflow?.rows}
        onClose={() => setSelectedCalendarOverflow(null)}
        onSelectRow={(row) => {
          setSelectedCalendarOverflow(null);
          setSelectedCalendarPost(row);
        }}
      />
    </div>
  );
}
