import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type ReminderRow = {
  id: string;
  user_id: string;
  check_in_template_id: string;
  reminder_email: string | null;
  due_at: string;
  check_in_templates: {
    title: string;
  } | null;
};

async function sendReminderEmail(to: string, subject: string, html: string) {
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
    throw new Error(`Reminder email failed: ${response.status}`);
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

  const now = new Date().toISOString();
  const { data: reminders, error } = await supabaseAdmin
    .from("check_in_reminders")
    .select("id,user_id,check_in_template_id,reminder_email,due_at,check_in_templates(title)")
    .eq("status", "scheduled")
    .lte("due_at", now)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sent = [];

  for (const reminder of (reminders ?? []) as ReminderRow[]) {
    if (!reminder.reminder_email) continue;

    const title = reminder.check_in_templates?.title || "Ignite Fit Life Check-in";
    const checkInUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/check-ins`;

    await sendReminderEmail(
      reminder.reminder_email,
      `Reminder: ${title}`,
      `<p>Your Ignite Fit Life check-in is ready.</p><p><a href="${checkInUrl}">Complete your check-in</a></p>`
    );

    await supabaseAdmin
      .from("check_in_reminders")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", reminder.id);

    await supabaseAdmin.from("notification_logs").insert({
      user_id: reminder.user_id,
      channel: "email",
      recipient: reminder.reminder_email,
      subject: `Reminder: ${title}`,
      status: "sent"
    });

    sent.push(reminder.id);
  }

  return NextResponse.json({ processed: reminders?.length ?? 0, sent: sent.length });
}
