import { AppShell } from "@/components/AppShell";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  );
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : null;
}

async function createProgram(formData: FormData) {
  "use server";

  await adminClient().from("workout_programs").insert({
    title: text(formData, "title"),
    description: text(formData, "description"),
    duration_weeks: numberValue(formData, "duration_weeks") || 12,
    level: text(formData, "level") || "all levels",
    cover_image_url: text(formData, "cover_image_url") || null,
    is_published: formData.get("is_published") === "on"
  });

  revalidatePath("/admin");
  revalidatePath("/workouts");
}

async function createWeek(formData: FormData) {
  "use server";

  await adminClient().from("program_weeks").insert({
    program_id: text(formData, "program_id"),
    week_number: numberValue(formData, "week_number") || 1,
    title: text(formData, "title"),
    description: text(formData, "description")
  });

  revalidatePath("/admin");
  revalidatePath("/workouts");
}

async function createWorkout(formData: FormData) {
  "use server";

  await adminClient().from("workouts").insert({
    week_id: text(formData, "week_id"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    day_number: numberValue(formData, "day_number") || 1,
    estimated_minutes: numberValue(formData, "estimated_minutes"),
    video_url: text(formData, "video_url") || null
  });

  revalidatePath("/admin");
  revalidatePath("/workouts");
}

async function createExercise(formData: FormData) {
  "use server";

  await adminClient().from("exercises").insert({
    workout_id: text(formData, "workout_id"),
    title: text(formData, "title"),
    instructions: text(formData, "instructions"),
    demo_video_url: text(formData, "demo_video_url") || null,
    sets: numberValue(formData, "sets"),
    reps: text(formData, "reps"),
    prescribed_weight: text(formData, "prescribed_weight"),
    prescribed_rpe: numberValue(formData, "prescribed_rpe"),
    tempo: text(formData, "tempo"),
    rest_seconds: numberValue(formData, "rest_seconds"),
    coaching_cues: text(formData, "coaching_cues"),
    substitutions: text(formData, "substitutions"),
    sort_order: numberValue(formData, "sort_order") || 0
  });

  revalidatePath("/admin");
  revalidatePath("/workouts");
}

async function createHabit(formData: FormData) {
  "use server";

  await adminClient().from("habits").insert({
    title: text(formData, "title"),
    description: text(formData, "description"),
    frequency: text(formData, "frequency") || "daily",
    target_value: numberValue(formData, "target_value"),
    target_unit: text(formData, "target_unit"),
    is_active: formData.get("is_active") !== "off"
  });

  revalidatePath("/admin");
  revalidatePath("/habits");
}

async function createCheckInTemplate(formData: FormData) {
  "use server";

  const questions = text(formData, "questions")
    .split("\n")
    .map((question) => question.trim())
    .filter(Boolean)
    .map((question) => ({ question }));

  await adminClient().from("check_in_templates").insert({
    title: text(formData, "title"),
    description: text(formData, "description"),
    frequency: text(formData, "frequency") || "weekly",
    questions,
    is_active: formData.get("is_active") !== "off"
  });

  revalidatePath("/admin");
  revalidatePath("/check-ins");
}

async function createLesson(formData: FormData) {
  "use server";

  await adminClient().from("classroom_lessons").insert({
    title: text(formData, "title"),
    description: text(formData, "description"),
    category: text(formData, "category") || "Performance",
    video_url: text(formData, "video_url") || null,
    thumbnail_url: text(formData, "thumbnail_url") || null,
    sort_order: numberValue(formData, "sort_order") || 0,
    is_published: formData.get("is_published") === "on"
  });

  revalidatePath("/admin");
  revalidatePath("/classroom");
}

async function createCommunity(formData: FormData) {
  "use server";

  await adminClient().from("communities").insert({
    name: text(formData, "name"),
    description: text(formData, "description"),
    visibility: text(formData, "visibility") || "members"
  });

  revalidatePath("/admin");
  revalidatePath("/community");
}

async function getAdminData() {
  const supabase = adminClient();

  const [programs, weeks, workouts, habits, templates, lessons, communities] = await Promise.all([
    supabase.from("workout_programs").select("id,title,duration_weeks,level,is_published").order("created_at", { ascending: false }),
    supabase.from("program_weeks").select("id,title,week_number,workout_programs(title)").order("week_number", { ascending: true }),
    supabase.from("workouts").select("id,title,day_number,program_weeks(title,workout_programs(title))").order("day_number", { ascending: true }),
    supabase.from("habits").select("id,title,frequency,target_value,target_unit,is_active").order("created_at", { ascending: false }),
    supabase.from("check_in_templates").select("id,title,frequency,is_active").order("created_at", { ascending: false }),
    supabase.from("classroom_lessons").select("id,title,category,is_published,sort_order").order("sort_order", { ascending: true }),
    supabase.from("communities").select("id,name,visibility").order("created_at", { ascending: false })
  ]);

  return {
    programs: programs.data ?? [],
    weeks: weeks.data ?? [],
    workouts: workouts.data ?? [],
    habits: habits.data ?? [],
    templates: templates.data ?? [],
    lessons: lessons.data ?? [],
    communities: communities.data ?? []
  };
}

export default async function AdminPage() {
  const data = await getAdminData();

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Control center.</h1>
          <p className="lead">Create workouts, lessons, habits, check-ins, and communities.</p>
        </div>
      </div>

      <section className="admin-stack">
        <article className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Workout Programs</p>
              <h2>Create a program</h2>
            </div>
            <span>{data.programs.length} programs</span>
          </div>
          <form className="form admin-form" action={createProgram}>
            <input name="title" placeholder="Program title" required />
            <textarea name="description" placeholder="Description" rows={3} />
            <div className="form-grid">
              <input name="duration_weeks" type="number" placeholder="Weeks, e.g. 12" defaultValue={12} />
              <input name="level" placeholder="Level, e.g. Beginner to Advanced" />
            </div>
            <input name="cover_image_url" placeholder="Cover image URL" />
            <label className="check-row">
              <input name="is_published" type="checkbox" defaultChecked /> Published
            </label>
            <button className="button" type="submit">Add Program</button>
          </form>
        </article>

        <article className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Program Builder</p>
              <h2>Add weeks and workouts</h2>
            </div>
          </div>
          <div className="grid two">
            <form className="form admin-form" action={createWeek}>
              <h3>Add Week</h3>
              <select name="program_id" required>
                <option value="">Choose program</option>
                {data.programs.map((program: any) => (
                  <option value={program.id} key={program.id}>{program.title}</option>
                ))}
              </select>
              <input name="week_number" type="number" placeholder="Week number" defaultValue={1} />
              <input name="title" placeholder="Week title" required />
              <textarea name="description" placeholder="Week focus" rows={3} />
              <button className="button" type="submit">Add Week</button>
            </form>

            <form className="form admin-form" action={createWorkout}>
              <h3>Add Workout</h3>
              <select name="week_id" required>
                <option value="">Choose week</option>
                {data.weeks.map((week: any) => (
                  <option value={week.id} key={week.id}>
                    {week.workout_programs?.title} / Week {week.week_number}: {week.title}
                  </option>
                ))}
              </select>
              <input name="title" placeholder="Workout title" required />
              <div className="form-grid">
                <input name="day_number" type="number" placeholder="Day number" defaultValue={1} />
                <input name="estimated_minutes" type="number" placeholder="Minutes" />
              </div>
              <input name="video_url" placeholder="Workout overview video URL" />
              <textarea name="description" placeholder="Workout notes" rows={3} />
              <button className="button" type="submit">Add Workout</button>
            </form>
          </div>
        </article>

        <article className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Exercises</p>
              <h2>Add exercise prescription</h2>
            </div>
            <span>{data.workouts.length} workouts</span>
          </div>
          <form className="form admin-form wide-form" action={createExercise}>
            <select name="workout_id" required>
              <option value="">Choose workout</option>
              {data.workouts.map((workout: any) => (
                <option value={workout.id} key={workout.id}>
                  {workout.program_weeks?.workout_programs?.title} / {workout.program_weeks?.title} / Day {workout.day_number}: {workout.title}
                </option>
              ))}
            </select>
            <input name="title" placeholder="Exercise title" required />
            <input name="demo_video_url" placeholder="Demo video URL" />
            <div className="form-grid four">
              <input name="sets" type="number" placeholder="Sets" />
              <input name="reps" placeholder="Reps" />
              <input name="prescribed_weight" placeholder="Load/weight" />
              <input name="prescribed_rpe" type="number" step="0.5" placeholder="RPE" />
              <input name="tempo" placeholder="Tempo" />
              <input name="rest_seconds" type="number" placeholder="Rest seconds" />
              <input name="sort_order" type="number" placeholder="Order" defaultValue={0} />
            </div>
            <textarea name="instructions" placeholder="Instructions" rows={3} />
            <textarea name="coaching_cues" placeholder="Coaching cues" rows={3} />
            <textarea name="substitutions" placeholder="Substitutions" rows={3} />
            <button className="button" type="submit">Add Exercise</button>
          </form>
        </article>

        <section className="grid two">
          <article className="card admin-panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">Habits</p>
                <h2>Create habit</h2>
              </div>
              <span>{data.habits.length} habits</span>
            </div>
            <form className="form admin-form" action={createHabit}>
              <input name="title" placeholder="Habit title" required />
              <textarea name="description" placeholder="Description" rows={3} />
              <select name="frequency" defaultValue="daily">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <div className="form-grid">
                <input name="target_value" type="number" step="0.1" placeholder="Target value" />
                <input name="target_unit" placeholder="Target unit, e.g. glasses" />
              </div>
              <button className="button" type="submit">Add Habit</button>
            </form>
          </article>

          <article className="card admin-panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">Check-ins</p>
                <h2>Create check-in</h2>
              </div>
              <span>{data.templates.length} templates</span>
            </div>
            <form className="form admin-form" action={createCheckInTemplate}>
              <input name="title" placeholder="Template title" required />
              <textarea name="description" placeholder="Description" rows={3} />
              <select name="frequency" defaultValue="weekly">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <textarea name="questions" placeholder="One question per line" rows={5} />
              <button className="button" type="submit">Add Check-in</button>
            </form>
          </article>
        </section>

        <section className="grid two">
          <article className="card admin-panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">Classroom</p>
                <h2>Create lesson</h2>
              </div>
              <span>{data.lessons.length} lessons</span>
            </div>
            <form className="form admin-form" action={createLesson}>
              <input name="title" placeholder="Lesson title" required />
              <textarea name="description" placeholder="Description" rows={3} />
              <input name="category" placeholder="Category, e.g. Mobility" />
              <input name="video_url" placeholder="Video URL" />
              <input name="thumbnail_url" placeholder="Thumbnail URL" />
              <input name="sort_order" type="number" placeholder="Sort order" defaultValue={0} />
              <label className="check-row">
                <input name="is_published" type="checkbox" defaultChecked /> Published
              </label>
              <button className="button" type="submit">Add Lesson</button>
            </form>
          </article>

          <article className="card admin-panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">Communities</p>
                <h2>Create community</h2>
              </div>
              <span>{data.communities.length} communities</span>
            </div>
            <form className="form admin-form" action={createCommunity}>
              <input name="name" placeholder="Community name" required />
              <textarea name="description" placeholder="Description" rows={3} />
              <select name="visibility" defaultValue="members">
                <option value="members">Members</option>
                <option value="private">Private</option>
                <option value="company">Company</option>
                <option value="cohort">Cohort</option>
              </select>
              <button className="button" type="submit">Add Community</button>
            </form>
          </article>
        </section>
      </section>
    </AppShell>
  );
}
