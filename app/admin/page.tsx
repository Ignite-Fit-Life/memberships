import { AppShell } from "@/components/AppShell";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type DbRow = Record<string, any>;

const blockTypes = [
  ["strength", "Strength Block"],
  ["superset", "Superset"],
  ["circuit", "Circuit"],
  ["amrap", "AMRAP"],
  ["emom", "EMOM"],
  ["mobility", "Mobility Flow"],
  ["hiit", "Timed Interval / HIIT"],
  ["note", "Coach Note"]
];

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function numberValue(formData: FormData, key: string) {
  const raw = String(formData.get(key) || "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function refreshBuilder() {
  revalidatePath("/admin");
  revalidatePath("/workouts");
  revalidatePath("/habits");
  revalidatePath("/classroom");
  revalidatePath("/community");
}

async function createProgram(formData: FormData) {
  "use server";
  await adminClient().from("workout_programs").insert({
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    duration_weeks: numberValue(formData, "duration_weeks") || 12,
    level: text(formData, "level") || "all levels",
    cover_image_url: optionalText(formData, "cover_image_url"),
    is_published: formData.get("is_published") === "on"
  });
  refreshBuilder();
}

async function createWeek(formData: FormData) {
  "use server";
  await adminClient().from("program_weeks").insert({
    program_id: text(formData, "program_id"),
    week_number: numberValue(formData, "week_number") || 1,
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    focus: optionalText(formData, "focus"),
    sort_order: numberValue(formData, "sort_order") || 0
  });
  refreshBuilder();
}

async function createWorkout(formData: FormData) {
  "use server";
  await adminClient().from("workouts").insert({
    week_id: text(formData, "week_id"),
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    notes: optionalText(formData, "notes"),
    day_number: numberValue(formData, "day_number") || 1,
    estimated_minutes: numberValue(formData, "estimated_minutes"),
    video_url: optionalText(formData, "video_url"),
    sort_order: numberValue(formData, "sort_order") || 0
  });
  refreshBuilder();
}

async function createLibraryExercise(formData: FormData) {
  "use server";
  await adminClient().from("exercise_library").insert({
    name: text(formData, "name"),
    category: optionalText(formData, "category"),
    muscle_group: optionalText(formData, "muscle_group"),
    equipment: optionalText(formData, "equipment"),
    difficulty: optionalText(formData, "difficulty"),
    demo_video_url: optionalText(formData, "demo_video_url"),
    thumbnail_url: optionalText(formData, "thumbnail_url"),
    instructions: optionalText(formData, "instructions"),
    coaching_cues: optionalText(formData, "coaching_cues"),
    common_mistakes: optionalText(formData, "common_mistakes"),
    regression: optionalText(formData, "regression"),
    progression: optionalText(formData, "progression"),
    substitutions: optionalText(formData, "substitutions")
  });
  refreshBuilder();
}

async function createHabit(formData: FormData) {
  "use server";
  await adminClient().from("habits").insert({
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    frequency: text(formData, "frequency") || "daily",
    target_value: numberValue(formData, "target_value"),
    target_unit: optionalText(formData, "target_unit"),
    is_active: formData.get("is_active") === "on"
  });
  refreshBuilder();
}

async function createClassroomLesson(formData: FormData) {
  "use server";
  await adminClient().from("classroom_lessons").insert({
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    category: text(formData, "category") || "Performance",
    video_url: optionalText(formData, "video_url"),
    thumbnail_url: optionalText(formData, "thumbnail_url"),
    is_published: formData.get("is_published") === "on",
    sort_order: numberValue(formData, "sort_order") || 0
  });
  refreshBuilder();
}

async function createCommunity(formData: FormData) {
  "use server";
  await adminClient().from("communities").insert({
    name: text(formData, "name"),
    description: optionalText(formData, "description"),
    visibility: text(formData, "visibility") || "members"
  });
  refreshBuilder();
}

async function createWorkoutBlock(formData: FormData) {
  "use server";
  await adminClient().from("workout_blocks").insert({
    workout_id: text(formData, "workout_id"),
    type: text(formData, "type") || "strength",
    title: text(formData, "title"),
    instructions: optionalText(formData, "instructions"),
    rounds: numberValue(formData, "rounds"),
    work_seconds: numberValue(formData, "work_seconds"),
    rest_seconds: numberValue(formData, "rest_seconds"),
    time_cap_minutes: numberValue(formData, "time_cap_minutes"),
    sort_order: numberValue(formData, "sort_order") || 0
  });
  refreshBuilder();
}

async function addWorkoutExercise(formData: FormData) {
  "use server";
  const supabase = adminClient();
  const libraryId = text(formData, "exercise_id");
  let libraryExercise: DbRow | null = null;

  if (libraryId) {
    const { data } = await supabase
      .from("exercise_library")
      .select("*")
      .eq("id", libraryId)
      .single();
    libraryExercise = data;
  }

  await supabase.from("workout_exercises").insert({
    workout_block_id: text(formData, "workout_block_id"),
    exercise_id: libraryId || null,
    title: text(formData, "title") || libraryExercise?.name || "Exercise",
    demo_video_url: optionalText(formData, "demo_video_url") || libraryExercise?.demo_video_url || null,
    instructions: optionalText(formData, "instructions") || libraryExercise?.instructions || null,
    coaching_cues: optionalText(formData, "coaching_cues") || libraryExercise?.coaching_cues || null,
    substitutions: optionalText(formData, "substitutions") || libraryExercise?.substitutions || null,
    sets: numberValue(formData, "sets"),
    reps: optionalText(formData, "reps"),
    load: optionalText(formData, "load"),
    rpe: numberValue(formData, "rpe"),
    tempo: optionalText(formData, "tempo"),
    rest_seconds: numberValue(formData, "rest_seconds"),
    duration_seconds: numberValue(formData, "duration_seconds"),
    side: optionalText(formData, "side"),
    notes: optionalText(formData, "notes"),
    group_label: optionalText(formData, "group_label"),
    sort_order: numberValue(formData, "sort_order") || 0
  });
  refreshBuilder();
}

async function moveWorkoutExercise(formData: FormData) {
  "use server";
  await adminClient()
    .from("workout_exercises")
    .update({ sort_order: numberValue(formData, "sort_order") || 0 })
    .eq("id", text(formData, "id"));
  refreshBuilder();
}

async function deleteWorkoutExercise(formData: FormData) {
  "use server";
  await adminClient().from("workout_exercises").delete().eq("id", text(formData, "id"));
  refreshBuilder();
}

async function updateWorkoutExercise(formData: FormData) {
  "use server";
  await adminClient()
    .from("workout_exercises")
    .update({
      title: text(formData, "title"),
      demo_video_url: optionalText(formData, "demo_video_url"),
      sets: numberValue(formData, "sets"),
      reps: optionalText(formData, "reps"),
      load: optionalText(formData, "load"),
      rpe: numberValue(formData, "rpe"),
      tempo: optionalText(formData, "tempo"),
      rest_seconds: numberValue(formData, "rest_seconds"),
      duration_seconds: numberValue(formData, "duration_seconds"),
      side: optionalText(formData, "side"),
      instructions: optionalText(formData, "instructions"),
      coaching_cues: optionalText(formData, "coaching_cues"),
      substitutions: optionalText(formData, "substitutions"),
      notes: optionalText(formData, "notes"),
      group_label: optionalText(formData, "group_label"),
      sort_order: numberValue(formData, "sort_order") || 0
    })
    .eq("id", text(formData, "id"));
  refreshBuilder();
}

async function duplicateWorkoutExercise(formData: FormData) {
  "use server";
  const supabase = adminClient();
  const { data } = await supabase.from("workout_exercises").select("*").eq("id", text(formData, "id")).single();
  if (data) {
    const { id, created_at, ...copy } = data;
    await supabase.from("workout_exercises").insert({
      ...copy,
      title: `${data.title} copy`,
      sort_order: Number(data.sort_order || 0) + 1
    });
  }
  refreshBuilder();
}

async function duplicateWeek(formData: FormData) {
  "use server";
  const supabase = adminClient();
  const weekId = text(formData, "week_id");
  const { data: week } = await supabase.from("program_weeks").select("*").eq("id", weekId).single();
  if (!week) return;

  const { data: newWeek } = await supabase.from("program_weeks").insert({
    program_id: week.program_id,
    week_number: Number(week.week_number || 0) + 1,
    title: `${week.title} copy`,
    description: week.description,
    focus: week.focus,
    sort_order: Number(week.sort_order || 0) + 1
  }).select("id").single();

  if (!newWeek) return;

  const { data: workouts } = await supabase.from("workouts").select("*").eq("week_id", weekId);
  for (const workout of workouts ?? []) {
    const { id: oldWorkoutId, week_id, created_at, ...workoutCopy } = workout;
    const { data: newWorkout } = await supabase.from("workouts").insert({
      ...workoutCopy,
      week_id: newWeek.id,
      title: `${workout.title} copy`
    }).select("id").single();

    if (!newWorkout) continue;

    const { data: blocks } = await supabase.from("workout_blocks").select("*").eq("workout_id", oldWorkoutId);
    for (const block of blocks ?? []) {
      const { id: oldBlockId, workout_id, created_at, ...blockCopy } = block;
      const { data: newBlock } = await supabase.from("workout_blocks").insert({
        ...blockCopy,
        workout_id: newWorkout.id
      }).select("id").single();

      if (!newBlock) continue;

      const { data: exercises } = await supabase.from("workout_exercises").select("*").eq("workout_block_id", oldBlockId);
      for (const exercise of exercises ?? []) {
        const { id, workout_block_id, created_at, ...exerciseCopy } = exercise;
        await supabase.from("workout_exercises").insert({
          ...exerciseCopy,
          workout_block_id: newBlock.id
        });
      }
    }
  }
  refreshBuilder();
}

async function duplicateWorkout(formData: FormData) {
  "use server";
  const supabase = adminClient();
  const workoutId = text(formData, "workout_id");
  const { data: workout } = await supabase.from("workouts").select("*").eq("id", workoutId).single();
  if (!workout) return;

  const { id, ...workoutCopy } = workout;
  const { data: newWorkout } = await supabase.from("workouts").insert({
    ...workoutCopy,
    title: `${workout.title} copy`,
    sort_order: Number(workout.sort_order || 0) + 1
  }).select("id").single();

  if (!newWorkout) return;

  const { data: blocks } = await supabase.from("workout_blocks").select("*").eq("workout_id", workoutId);
  for (const block of blocks ?? []) {
    const { id: oldBlockId, workout_id, created_at, ...blockCopy } = block;
    const { data: newBlock } = await supabase.from("workout_blocks").insert({
      ...blockCopy,
      workout_id: newWorkout.id
    }).select("id").single();

    if (newBlock) {
      const { data: exercises } = await supabase.from("workout_exercises").select("*").eq("workout_block_id", oldBlockId);
      for (const exercise of exercises ?? []) {
        const { id, workout_block_id, created_at, ...exerciseCopy } = exercise;
        await supabase.from("workout_exercises").insert({
          ...exerciseCopy,
          workout_block_id: newBlock.id
        });
      }
    }
  }
  refreshBuilder();
}

async function saveWorkoutAsTemplate(formData: FormData) {
  "use server";
  await adminClient()
    .from("workouts")
    .update({ is_template: true, template_name: text(formData, "template_name") || "Workout Template" })
    .eq("id", text(formData, "workout_id"));
  refreshBuilder();
}

async function assignProgram(formData: FormData) {
  "use server";
  await adminClient().from("program_assignments").upsert({
    program_id: text(formData, "program_id"),
    user_id: text(formData, "user_id"),
    start_date: text(formData, "start_date"),
    end_date: optionalText(formData, "end_date"),
    status: text(formData, "status") || "active",
    current_week: numberValue(formData, "current_week") || 1,
    current_day: numberValue(formData, "current_day") || 1
  }, { onConflict: "program_id,user_id" });
  refreshBuilder();
}

async function safeSelect<T>(query: PromiseLike<{ data: T | null; error: any }>, fallback: T) {
  try {
    const { data, error } = await query;
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

async function getAdminData() {
  const supabase = adminClient();
  const authUsers = await supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }));

  const [programs, weeks, workouts, blocks, library, workoutExercises, assignments, logs, habits, lessons, communities] = await Promise.all([
    safeSelect(supabase.from("workout_programs").select("*").order("created_at", { ascending: false }), []),
    safeSelect(supabase.from("program_weeks").select("*, workout_programs(title)").order("week_number", { ascending: true }), []),
    safeSelect(supabase.from("workouts").select("*, program_weeks(title, week_number, workout_programs(title))").order("day_number", { ascending: true }), []),
    safeSelect(supabase.from("workout_blocks").select("*, workouts(title, program_weeks(title, workout_programs(title)))").order("sort_order", { ascending: true }), []),
    safeSelect(supabase.from("exercise_library").select("*").order("name", { ascending: true }), []),
    safeSelect(supabase.from("workout_exercises").select("*, workout_blocks(title, type, workouts(title))").order("sort_order", { ascending: true }), []),
    safeSelect(supabase.from("program_assignments").select("*, workout_programs(title)").order("created_at", { ascending: false }), []),
    safeSelect(supabase.from("workout_logs").select("*, workouts(title)").order("completed_at", { ascending: false }).limit(25), []),
    safeSelect(supabase.from("habits").select("*").order("created_at", { ascending: false }), []),
    safeSelect(supabase.from("classroom_lessons").select("*").order("sort_order", { ascending: true }), []),
    safeSelect(supabase.from("communities").select("*").order("created_at", { ascending: false }), [])
  ]);

  return {
    programs: programs as DbRow[],
    weeks: weeks as DbRow[],
    workouts: workouts as DbRow[],
    blocks: blocks as DbRow[],
    library: library as DbRow[],
    workoutExercises: workoutExercises as DbRow[],
    assignments: assignments as DbRow[],
    logs: logs as DbRow[],
    habits: habits as DbRow[],
    lessons: lessons as DbRow[],
    communities: communities as DbRow[],
    users: authUsers.data.users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email
    }))
  };
}

function programLabel(program: DbRow) {
  return `${program.title} (${program.duration_weeks || 12} weeks)`;
}

export default async function AdminPage() {
  const data = await getAdminData();
  const selectedProgram = data.programs[0];
  const selectedProgramWeeks = selectedProgram
    ? data.weeks.filter((week) => week.program_id === selectedProgram.id)
    : data.weeks;
  const selectedWeek = selectedProgramWeeks[0];
  const selectedWorkouts = selectedWeek
    ? data.workouts.filter((workout) => workout.week_id === selectedWeek.id)
    : data.workouts;
  const selectedWorkout = selectedWorkouts[0];
  const selectedBlocks = selectedWorkout
    ? data.blocks.filter((block) => block.workout_id === selectedWorkout.id)
    : data.blocks;

  return (
    <AppShell>
      <div className="admin-workspace">
      <div className="admin-hero">
        <div>
          <p className="eyebrow">Admin control center</p>
          <h1>Program builder</h1>
          <p className="lead">Build structured coaching programs, prescribe exercises, assign clients, and review progress from one focused workspace.</p>
        </div>
        <div className="admin-metrics" aria-label="Builder overview">
          <div>
            <strong>{data.programs.length}</strong>
            <span>Programs</span>
          </div>
          <div>
            <strong>{data.weeks.length}</strong>
            <span>Weeks</span>
          </div>
          <div>
            <strong>{data.workouts.length}</strong>
            <span>Workouts</span>
          </div>
          <div>
            <strong>{data.library.length}</strong>
            <span>Exercises</span>
          </div>
        </div>
      </div>

      <nav className="builder-tabs" aria-label="Admin sections">
        <a href="#builder">Builder</a>
        <a href="#library">Exercise Library</a>
        <a href="#content">Habits + Content</a>
        <a href="#assignments">Assignments</a>
        <a href="#progress">Progress</a>
      </nav>

      <section id="builder" className="builder-board">
        <article className="builder-column">
          <div className="section-header compact">
            <div>
              <p className="eyebrow">Programs</p>
              <h2>Structure</h2>
            </div>
            <span>{data.programs.length}</span>
          </div>

          <form className="form compact-form" action={createProgram}>
            <input name="title" placeholder="Program title" required />
            <textarea name="description" placeholder="Goal and promise" rows={3} />
            <div className="form-grid">
              <input name="duration_weeks" type="number" defaultValue={12} />
              <input name="level" placeholder="Level" />
            </div>
            <input name="cover_image_url" placeholder="Cover image URL" />
            <label className="check-row"><input name="is_published" type="checkbox" defaultChecked /> Published</label>
            <button className="button" type="submit">Create Program</button>
          </form>

          <div className="builder-list">
            {data.programs.map((program) => (
              <div className="builder-item active" key={program.id}>
                <strong>{program.title}</strong>
                <span>{program.duration_weeks || 12} weeks · {program.level}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="builder-column">
          <div className="section-header compact">
            <div>
              <p className="eyebrow">Weeks</p>
              <h2>Plan</h2>
            </div>
            <span>{data.weeks.length}</span>
          </div>

          <form className="form compact-form" action={createWeek}>
            <select name="program_id" required>
              <option value="">Choose program</option>
              {data.programs.map((program) => <option value={program.id} key={program.id}>{programLabel(program)}</option>)}
            </select>
            <div className="form-grid">
              <input name="week_number" type="number" defaultValue={1} />
              <input name="sort_order" type="number" defaultValue={0} />
            </div>
            <input name="title" placeholder="Week title" required />
            <input name="focus" placeholder="Focus, e.g. Strength foundation" />
            <textarea name="description" placeholder="Week notes" rows={2} />
            <button className="button" type="submit">Add Week</button>
          </form>

          <div className="builder-list">
            {selectedProgramWeeks.map((week) => (
              <div className="builder-item" key={week.id}>
                <strong>Week {week.week_number}: {week.title}</strong>
                <span>{week.focus || week.workout_programs?.title}</span>
                <form action={duplicateWeek}>
                  <input type="hidden" name="week_id" value={week.id} />
                  <button className="mini-button" type="submit">Duplicate week</button>
                </form>
              </div>
            ))}
          </div>
        </article>

        <article className="builder-column wide">
          <div className="section-header compact">
            <div>
              <p className="eyebrow">Workouts + Exercises</p>
              <h2>Prescription</h2>
            </div>
            <span>{selectedWorkouts.length} workouts</span>
          </div>

          <form className="form compact-form" action={createWorkout}>
            <select name="week_id" required>
              <option value="">Choose week</option>
              {data.weeks.map((week) => (
                <option value={week.id} key={week.id}>{week.workout_programs?.title} / Week {week.week_number}: {week.title}</option>
              ))}
            </select>
            <div className="form-grid">
              <input name="title" placeholder="Workout title" required />
              <input name="day_number" type="number" placeholder="Day" defaultValue={1} />
              <input name="estimated_minutes" type="number" placeholder="Minutes" />
              <input name="sort_order" type="number" placeholder="Order" defaultValue={0} />
            </div>
            <input name="video_url" placeholder="Overview video URL" />
            <textarea name="description" placeholder="Workout overview" rows={2} />
            <textarea name="notes" placeholder="Coach notes" rows={2} />
            <button className="button" type="submit">Add Workout</button>
          </form>

          <div className="workout-row">
            {selectedWorkouts.map((workout) => (
              <div className="workout-pill" key={workout.id}>
                <strong>Day {workout.day_number}</strong>
                <span>{workout.title}</span>
                <form action={duplicateWorkout}>
                  <input type="hidden" name="workout_id" value={workout.id} />
                  <button className="mini-button" type="submit">Duplicate</button>
                </form>
                <form action={saveWorkoutAsTemplate}>
                  <input type="hidden" name="workout_id" value={workout.id} />
                  <input name="template_name" placeholder="Template name" />
                  <button className="mini-button" type="submit">Save template</button>
                </form>
              </div>
            ))}
          </div>

          <div className="block-builder">
            <form className="form compact-form" action={createWorkoutBlock}>
              <h3>Add workout block</h3>
              <select name="workout_id" required>
                <option value="">Choose workout</option>
                {data.workouts.map((workout) => (
                  <option value={workout.id} key={workout.id}>{workout.program_weeks?.workout_programs?.title} / {workout.title}</option>
                ))}
              </select>
              <div className="form-grid">
                <select name="type" defaultValue="strength">
                  {blockTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
                <input name="title" placeholder="Block title" required />
                <input name="rounds" type="number" placeholder="Rounds" />
                <input name="work_seconds" type="number" placeholder="Work seconds" />
                <input name="rest_seconds" type="number" placeholder="Rest seconds" />
                <input name="time_cap_minutes" type="number" placeholder="Time cap" />
                <input name="sort_order" type="number" placeholder="Order" defaultValue={0} />
              </div>
              <textarea name="instructions" placeholder="Block instructions" rows={2} />
              <button className="button" type="submit">Add Block</button>
            </form>

            <form className="form compact-form" action={addWorkoutExercise}>
              <h3>Add exercise to block</h3>
              <select name="workout_block_id" required>
                <option value="">Choose block</option>
                {data.blocks.map((block) => (
                  <option value={block.id} key={block.id}>{block.workouts?.title} / {block.title}</option>
                ))}
              </select>
              <select name="exercise_id">
                <option value="">Choose from library or type manually</option>
                {data.library.map((exercise) => <option value={exercise.id} key={exercise.id}>{exercise.name}</option>)}
              </select>
              <input name="title" placeholder="Override exercise title" />
              <input name="demo_video_url" placeholder="Override demo video URL" />
              <div className="form-grid four">
                <input name="sets" type="number" placeholder="Sets" />
                <input name="reps" placeholder="Reps" />
                <input name="load" placeholder="Load/weight" />
                <input name="rpe" type="number" step="0.5" placeholder="RPE" />
                <input name="tempo" placeholder="Tempo" />
                <input name="rest_seconds" type="number" placeholder="Rest" />
                <input name="duration_seconds" type="number" placeholder="Duration" />
                <select name="side" defaultValue="">
                  <option value="">Side</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both</option>
                </select>
                <input name="group_label" placeholder="Superset label, e.g. A1" />
                <input name="sort_order" type="number" placeholder="Order" defaultValue={0} />
              </div>
              <textarea name="instructions" placeholder="Workout-specific instructions" rows={2} />
              <textarea name="coaching_cues" placeholder="Workout-specific coaching cues" rows={2} />
              <textarea name="substitutions" placeholder="Substitutions" rows={2} />
              <textarea name="notes" placeholder="Admin note" rows={2} />
              <button className="button" type="submit">Add Exercise Card</button>
            </form>
          </div>

          <div className="exercise-card-list">
            {selectedBlocks.map((block) => (
              <details className="exercise-block" open key={block.id}>
                <summary>
                  <strong>{block.title}</strong>
                  <span>{blockTypes.find(([value]) => value === block.type)?.[1] || block.type}</span>
                </summary>
                {data.workoutExercises
                  .filter((exercise) => exercise.workout_block_id === block.id)
                  .map((exercise) => (
                    <article className="exercise-card" key={exercise.id}>
                      <div>
                        <p className="eyebrow">{exercise.group_label || "Exercise"}</p>
                        <h3>{exercise.title}</h3>
                        <p>{exercise.sets || "-"} sets · {exercise.reps || "-"} reps · {exercise.load || "Bodyweight"} · RPE {exercise.rpe || "-"}</p>
                        <p>Tempo {exercise.tempo || "-"} · Rest {exercise.rest_seconds || "-"} sec</p>
                        {exercise.demo_video_url ? <a href={exercise.demo_video_url}>Demo video</a> : null}
                      </div>
                      <details>
                        <summary>Edit prescription</summary>
                        <form className="form compact-form" action={updateWorkoutExercise}>
                          <input type="hidden" name="id" value={exercise.id} />
                          <input name="title" defaultValue={exercise.title || ""} placeholder="Exercise title" required />
                          <input name="demo_video_url" defaultValue={exercise.demo_video_url || ""} placeholder="Demo video URL" />
                          <div className="form-grid four">
                            <input name="sets" type="number" defaultValue={exercise.sets || ""} placeholder="Sets" />
                            <input name="reps" defaultValue={exercise.reps || ""} placeholder="Reps" />
                            <input name="load" defaultValue={exercise.load || ""} placeholder="Load/weight" />
                            <input name="rpe" type="number" step="0.5" defaultValue={exercise.rpe || ""} placeholder="RPE" />
                            <input name="tempo" defaultValue={exercise.tempo || ""} placeholder="Tempo" />
                            <input name="rest_seconds" type="number" defaultValue={exercise.rest_seconds || ""} placeholder="Rest seconds" />
                            <input name="duration_seconds" type="number" defaultValue={exercise.duration_seconds || ""} placeholder="Duration seconds" />
                            <select name="side" defaultValue={exercise.side || ""}>
                              <option value="">Side</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                              <option value="both">Both</option>
                            </select>
                            <input name="group_label" defaultValue={exercise.group_label || ""} placeholder="Superset/circuit label" />
                            <input name="sort_order" type="number" defaultValue={exercise.sort_order || 0} placeholder="Order" />
                          </div>
                          <textarea name="instructions" defaultValue={exercise.instructions || ""} placeholder="Instructions" rows={2} />
                          <textarea name="coaching_cues" defaultValue={exercise.coaching_cues || ""} placeholder="Coaching cues" rows={2} />
                          <textarea name="substitutions" defaultValue={exercise.substitutions || ""} placeholder="Substitutions" rows={2} />
                          <textarea name="notes" defaultValue={exercise.notes || ""} placeholder="Coach note" rows={2} />
                          <button className="button" type="submit">Save Exercise</button>
                        </form>
                      </details>
                      <div className="card-actions">
                        <form action={moveWorkoutExercise}>
                          <input type="hidden" name="id" value={exercise.id} />
                          <input type="hidden" name="sort_order" value={Number(exercise.sort_order || 0) - 1} />
                          <button className="mini-button" type="submit">Move up</button>
                        </form>
                        <form action={moveWorkoutExercise}>
                          <input type="hidden" name="id" value={exercise.id} />
                          <input type="hidden" name="sort_order" value={Number(exercise.sort_order || 0) + 1} />
                          <button className="mini-button" type="submit">Move down</button>
                        </form>
                        <form action={duplicateWorkoutExercise}>
                          <input type="hidden" name="id" value={exercise.id} />
                          <button className="mini-button" type="submit">Duplicate</button>
                        </form>
                        <form action={updateWorkoutExercise}>
                          <input type="hidden" name="id" value={exercise.id} />
                          <input type="hidden" name="title" value={exercise.title || "Exercise"} />
                          <input type="hidden" name="demo_video_url" value={exercise.demo_video_url || ""} />
                          <input type="hidden" name="sets" value={exercise.sets || ""} />
                          <input type="hidden" name="reps" value={exercise.reps || ""} />
                          <input type="hidden" name="load" value={exercise.load || ""} />
                          <input type="hidden" name="rpe" value={exercise.rpe || ""} />
                          <input type="hidden" name="tempo" value={exercise.tempo || ""} />
                          <input type="hidden" name="rest_seconds" value={exercise.rest_seconds || ""} />
                          <input type="hidden" name="duration_seconds" value={exercise.duration_seconds || ""} />
                          <input type="hidden" name="side" value={exercise.side || ""} />
                          <input type="hidden" name="instructions" value={exercise.instructions || ""} />
                          <input type="hidden" name="coaching_cues" value={exercise.coaching_cues || ""} />
                          <input type="hidden" name="substitutions" value={exercise.substitutions || ""} />
                          <input type="hidden" name="notes" value={exercise.notes || ""} />
                          <input type="hidden" name="group_label" value={exercise.group_label || "A1"} />
                          <input type="hidden" name="sort_order" value={exercise.sort_order || 0} />
                          <button className="mini-button" type="submit">Add to superset</button>
                        </form>
                        <form action={deleteWorkoutExercise}>
                          <input type="hidden" name="id" value={exercise.id} />
                          <button className="mini-button danger" type="submit">Delete</button>
                        </form>
                      </div>
                    </article>
                  ))}
              </details>
            ))}
          </div>
        </article>
      </section>

      <section id="library" className="card admin-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Exercise Library</p>
            <h2>Reusable exercise database</h2>
          </div>
          <span>{data.library.length} exercises</span>
        </div>
        <form className="form admin-form" action={createLibraryExercise}>
          <div className="form-grid four">
            <input name="name" placeholder="Exercise name" required />
            <input name="category" placeholder="Category" />
            <input name="muscle_group" placeholder="Muscle group" />
            <input name="equipment" placeholder="Equipment" />
            <input name="difficulty" placeholder="Difficulty" />
            <input name="demo_video_url" placeholder="Demo video URL" />
            <input name="thumbnail_url" placeholder="Thumbnail URL" />
          </div>
          <textarea name="instructions" placeholder="Instructions" rows={3} />
          <textarea name="coaching_cues" placeholder="Coaching cues" rows={3} />
          <textarea name="common_mistakes" placeholder="Common mistakes" rows={3} />
          <div className="form-grid">
            <textarea name="regression" placeholder="Regression" rows={3} />
            <textarea name="progression" placeholder="Progression" rows={3} />
          </div>
          <textarea name="substitutions" placeholder="Substitutions" rows={3} />
          <button className="button" type="submit">Add Exercise to Library</button>
        </form>
      </section>

      <section id="content" className="content-admin-grid">
        <article className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Habits</p>
              <h2>Add habit</h2>
            </div>
            <span>{data.habits.length} habits</span>
          </div>
          <form className="form admin-form" action={createHabit}>
            <input name="title" placeholder="Habit title, e.g. 8,000 steps" required />
            <textarea name="description" placeholder="Why this habit matters" rows={3} />
            <div className="form-grid">
              <select name="frequency" defaultValue="daily">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <input name="target_value" type="number" step="0.1" placeholder="Target value" />
              <input name="target_unit" placeholder="Target unit, e.g. steps, oz, minutes" />
            </div>
            <label className="check-row"><input name="is_active" type="checkbox" defaultChecked /> Active</label>
            <button className="button" type="submit">Add Habit</button>
          </form>
          <div className="mini-list">
            {data.habits.slice(0, 5).map((habit) => (
              <div key={habit.id}>
                <strong>{habit.title}</strong>
                <span>{habit.frequency} · {habit.target_value || "-"} {habit.target_unit || ""}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Classroom</p>
              <h2>Add lesson</h2>
            </div>
            <span>{data.lessons.length} lessons</span>
          </div>
          <form className="form admin-form" action={createClassroomLesson}>
            <input name="title" placeholder="Lesson title" required />
            <div className="form-grid">
              <input name="category" placeholder="Category, e.g. Mobility" required />
              <input name="sort_order" type="number" placeholder="Order" defaultValue={0} />
            </div>
            <input name="video_url" placeholder="Video URL" />
            <input name="thumbnail_url" placeholder="Thumbnail URL" />
            <textarea name="description" placeholder="Lesson summary" rows={3} />
            <label className="check-row"><input name="is_published" type="checkbox" defaultChecked /> Published</label>
            <button className="button" type="submit">Add Lesson</button>
          </form>
          <div className="mini-list">
            {data.lessons.slice(0, 5).map((lesson) => (
              <div key={lesson.id}>
                <strong>{lesson.title}</strong>
                <span>{lesson.category} · {lesson.is_published ? "published" : "draft"}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Community</p>
              <h2>Add community</h2>
            </div>
            <span>{data.communities.length} communities</span>
          </div>
          <form className="form admin-form" action={createCommunity}>
            <input name="name" placeholder="Community name" required />
            <select name="visibility" defaultValue="members">
              <option value="members">Members</option>
              <option value="private">Private</option>
              <option value="company">Company</option>
              <option value="cohort">Cohort</option>
            </select>
            <textarea name="description" placeholder="Who this community is for" rows={3} />
            <button className="button" type="submit">Add Community</button>
          </form>
          <div className="mini-list">
            {data.communities.slice(0, 5).map((community) => (
              <div key={community.id}>
                <strong>{community.name}</strong>
                <span>{community.visibility}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="assignments" className="grid two">
        <article className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Assignments</p>
              <h2>Assign programs</h2>
            </div>
            <span>{data.assignments.length} active records</span>
          </div>
          <form className="form admin-form" action={assignProgram}>
            <select name="program_id" required>
              <option value="">Choose program</option>
              {data.programs.map((program) => <option value={program.id} key={program.id}>{program.title}</option>)}
            </select>
            <select name="user_id" required>
              <option value="">Choose client</option>
              {data.users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}
            </select>
            <div className="form-grid">
              <input name="start_date" type="date" required />
              <input name="end_date" type="date" />
              <input name="current_week" type="number" defaultValue={1} />
              <input name="current_day" type="number" defaultValue={1} />
            </div>
            <select name="status" defaultValue="active">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="button" type="submit">Assign Program</button>
          </form>
        </article>

        <article id="progress" className="card admin-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Coach View</p>
              <h2>Progress snapshot</h2>
            </div>
            <span>{data.logs.length} logs</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Workout</th>
                <th>Status</th>
                <th>Score</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.workouts?.title || "Workout"}</td>
                  <td>{log.status}</td>
                  <td>{log.score || "-"}</td>
                  <td>{new Date(log.completed_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.logs.length === 0 ? (
                <tr><td colSpan={4}>No workout logs yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </article>
      </section>
      </div>
    </AppShell>
  );
}
