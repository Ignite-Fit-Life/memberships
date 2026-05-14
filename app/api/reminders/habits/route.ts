import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type HabitReminderRow = {
  id: string;
  user_id: string;
  habit_id: string;
  reminder_email: string | null;
  reminder_time: string;
  timezone: string;
  days_of_week: number[];
  last_sent_at: string | null;
  habits: {
    title: string;
    target_value: number | null;
    target_unit: string | null;
  } | null;
};

function localParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    dateKey: `${value("year")}-${value("month")}-${value("day")}`,
    day: weekdayMap[value("weekday")] ?? 0,
    minutes: Number(value("hour")) * 60 + Number(value("minute"))
  };
}

function reminderMinutes(reminderTime: string) {
  const [hour, minute] = reminderTime.split(":").map(Number);
  return hour * 60 + minute;
}

async function sendHabitEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_EMAIL_FROM;

  if (!apiKey || !from) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html })
  });

  if (!response.ok) {
    throw new Error(`Habit reminder email failed: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from("habit_reminders")
    .select("id,user_id,habit_id,reminder_email,reminder_time,timezone,days_of_week,last_sent_at,habits(title,target_value,target_unit)")
    .eq("is_active", true)
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const dueReminders = ((data ?? []) as HabitReminderRow[]).filter((reminder) => {
    if (!reminder.reminder_email) return false;

    const local = localParts(now, reminder.timezone);
    if (!reminder.days_of_week.includes(local.day)) return false;

    const targetMinutes = reminderMinutes(reminder.reminder_time);
    const isDueWindow = local.minutes >= targetMinutes && local.minutes < targetMinutes + 15;
    if (!isDueWindow) return false;

    if (!reminder.last_sent_at) return true;
    return localParts(new Date(reminder.last_sent_at), reminder.timezone).dateKey !== local.dateKey;
  });

  for (const reminder of dueReminders) {
    const habit = reminder.habits;
    const target =
      habit?.target_value && habit?.target_unit
        ? ` Target: ${habit.target_value} ${habit.target_unit}.`
        : "";
    const habitUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/habits`;
    const title = habit?.title || "your habit";

    await sendHabitEmail(
      reminder.reminder_email!,
      `Habit reminder: ${title}`,
      `<p>Quick reminder to complete ${title}.${target}</p><p><a href="${habitUrl}">Log your habit</a></p>`
    );

    await supabaseAdmin
      .from("habit_reminders")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", reminder.id);

    await supabaseAdmin.from("notification_logs").insert({
      user_id: reminder.user_id,
      channel: "email",
      recipient: reminder.reminder_email,
      subject: `Habit reminder: ${title}`,
      status: "sent"
    });
  }

  return NextResponse.json({ checked: data?.length ?? 0, sent: dueReminders.length });
}
