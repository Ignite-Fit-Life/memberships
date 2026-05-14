import { AppShell } from "@/components/AppShell";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

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

async function logWorkout(formData: FormData) {
  "use server";
  const auth = await createServerSupabaseClient();
  const {
    data: { user }
  } = await auth.auth.getUser();

  if (!user) return;

  const supabase = adminClient();
  const workoutId = text(formData, "workout_id");
  const assignmentId = text(formData, "program_assignment_id") || null;

  const { data: workoutLog } = await supabase
    .from("workout_logs")
    .insert({
      user_id: user.id,
      workout_id: workoutId,
      program_assignment_id: assignmentId,
      status: text(formData, "status") || "completed",
      score: text(formData, "score") || null,
      duration_minutes: Number(formData.get("duration_minutes") || 0) || null,
      notes: text(formData, "notes") || null
    })
    .select("id")
    .single();

  if (!workoutLog) return;

  const setRows: Row[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("actual_reps__")) continue;
    const [, exerciseId, setNumber] = key.split("__");
    setRows.push({
      workout_log_id: workoutLog.id,
      workout_exercise_id: exerciseId,
      set_number: Number(setNumber),
      actual_reps: String(value || ""),
      actual_load: text(formData, `actual_load__${exerciseId}__${setNumber}`),
      rpe: Number(formData.get(`actual_rpe__${exerciseId}__${setNumber}`) || 0) || null,
      completed: formData.get(`completed__${exerciseId}__${setNumber}`) === "on",
      notes: text(formData, `set_notes__${exerciseId}__${setNumber}`)
    });
  }

  if (setRows.length) {
    await supabase.from("set_logs").insert(setRows);
  }

  revalidatePath("/workouts");
  revalidatePath("/admin");
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

async function getWorkoutData() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user }
  } = await auth.auth.getUser();

  if (!user) {
    return { user: null, assignments: [], programs: [], weeks: [], workouts: [], blocks: [], exercises: [], logs: [] };
  }

  const supabase = adminClient();
  const assignments = await safeSelect(
    supabase
      .from("program_assignments")
      .select("*, workout_programs(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    []
  ) as Row[];

  const assignedProgramIds = assignments.map((assignment) => assignment.program_id);
  const programs = assignedProgramIds.length
    ? assignments.map((assignment) => assignment.workout_programs).filter(Boolean)
    : await safeSelect(
      supabase.from("workout_programs").select("*").eq("is_published", true).order("created_at", { ascending: false }),
      []
    ) as Row[];

  const programIds = programs.map((program) => program.id);
  const weeks = programIds.length
    ? await safeSelect(
      supabase.from("program_weeks").select("*").in("program_id", programIds).order("week_number", { ascending: true }),
      []
    ) as Row[]
    : [];

  const weekIds = weeks.map((week) => week.id);
  const workouts = weekIds.length
    ? await safeSelect(
      supabase.from("workouts").select("*").in("week_id", weekIds).order("day_number", { ascending: true }),
      []
    ) as Row[]
    : [];

  const workoutIds = workouts.map((workout) => workout.id);
  const blocks = workoutIds.length
    ? await safeSelect(
      supabase.from("workout_blocks").select("*").in("workout_id", workoutIds).order("sort_order", { ascending: true }),
      []
    ) as Row[]
    : [];

  const blockIds = blocks.map((block) => block.id);
  const exercises = blockIds.length
    ? await safeSelect(
      supabase.from("workout_exercises").select("*").in("workout_block_id", blockIds).order("sort_order", { ascending: true }),
      []
    ) as Row[]
    : [];

  const logs = await safeSelect(
    supabase.from("workout_logs").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(20),
    []
  ) as Row[];

  return { user, assignments, programs, weeks, workouts, blocks, exercises, logs };
}

function blockTypeLabel(type: string) {
  return {
    strength: "Strength",
    superset: "Superset",
    circuit: "Circuit",
    amrap: "AMRAP",
    emom: "EMOM",
    mobility: "Mobility",
    hiit: "HIIT",
    note: "Coach Note"
  }[type] || type;
}

function setNumbers(count: number | null | undefined) {
  return Array.from({ length: Math.max(Number(count || 1), 1) }, (_, index) => index + 1);
}

export default async function WorkoutsPage() {
  const data = await getWorkoutData();

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Workouts</p>
          <h1>Your training plan.</h1>
          <p className="lead">Follow the target prescription, log each set, and track progress over time.</p>
        </div>
      </div>

      <section className="workout-dashboard">
        {data.programs.map((program) => {
          const assignment = data.assignments.find((item) => item.program_id === program.id);
          const weeks = data.weeks.filter((week) => week.program_id === program.id);

          return (
            <article className="program-view" key={program.id}>
              <div className="section-header">
                <div>
                  <p className="eyebrow">{assignment ? `Week ${assignment.current_week} · Day ${assignment.current_day}` : "Published program"}</p>
                  <h2>{program.title}</h2>
                  <p>{program.description}</p>
                </div>
                <span>{program.duration_weeks || 12} weeks · {program.level}</span>
              </div>

              {weeks.map((week) => {
                const workouts = data.workouts.filter((workout) => workout.week_id === week.id);
                return (
                  <details className="week-panel" open key={week.id}>
                    <summary>
                      <strong>Week {week.week_number}: {week.title}</strong>
                      <span>{week.focus || week.description}</span>
                    </summary>
                    <div className="workout-list">
                      {workouts.map((workout) => {
                        const blocks = data.blocks.filter((block) => block.workout_id === workout.id);
                        const latestLog = data.logs.find((log) => log.workout_id === workout.id);

                        return (
                          <article className="workout-card" key={workout.id}>
                            <div className="section-header compact">
                              <div>
                                <p className="eyebrow">Day {workout.day_number}</p>
                                <h3>{workout.title}</h3>
                                <p>{workout.description || workout.notes}</p>
                              </div>
                              <span>{latestLog ? `Last: ${new Date(latestLog.completed_at).toLocaleDateString()}` : "Not logged yet"}</span>
                            </div>

                            {blocks.map((block) => (
                              <details className="exercise-block" open key={block.id}>
                                <summary>
                                  <strong>{block.title}</strong>
                                  <span>{blockTypeLabel(block.type)} · {block.rounds ? `${block.rounds} rounds` : ""}</span>
                                </summary>
                                {data.exercises
                                  .filter((exercise) => exercise.workout_block_id === block.id)
                                  .map((exercise) => (
                                    <div className="client-exercise" key={exercise.id}>
                                      <div>
                                        <p className="eyebrow">{exercise.group_label || blockTypeLabel(block.type)}</p>
                                        <h3>{exercise.title}</h3>
                                        <p>
                                          Target: {exercise.sets || "-"} sets · {exercise.reps || "-"} reps · {exercise.load || "bodyweight"} · RPE {exercise.rpe || "-"}
                                        </p>
                                        <p>Tempo {exercise.tempo || "-"} · Rest {exercise.rest_seconds || block.rest_seconds || "-"} sec</p>
                                        {exercise.demo_video_url ? <a href={exercise.demo_video_url}>Watch demo</a> : null}
                                        {exercise.instructions ? <p>{exercise.instructions}</p> : null}
                                        {exercise.coaching_cues ? <p><strong>Cues:</strong> {exercise.coaching_cues}</p> : null}
                                      </div>
                                    </div>
                                  ))}
                              </details>
                            ))}

                            <form className="log-form" action={logWorkout}>
                              <input type="hidden" name="workout_id" value={workout.id} />
                              <input type="hidden" name="program_assignment_id" value={assignment?.id || ""} />
                              <div className="form-grid four">
                                <select name="status" defaultValue="completed">
                                  <option value="completed">Completed</option>
                                  <option value="partial">Partial</option>
                                  <option value="skipped">Skipped</option>
                                </select>
                                <input name="duration_minutes" type="number" placeholder="Minutes" />
                                <input name="score" placeholder="Rounds, time, or score" />
                              </div>

                              {blocks.flatMap((block) =>
                                data.exercises
                                  .filter((exercise) => exercise.workout_block_id === block.id)
                                  .map((exercise) => (
                                    <details className="set-log-panel" key={exercise.id}>
                                      <summary>{exercise.title} set log</summary>
                                      {setNumbers(exercise.sets).map((setNumber) => (
                                        <div className="set-log-row" key={setNumber}>
                                          <span>Set {setNumber}</span>
                                          <input name={`actual_reps__${exercise.id}__${setNumber}`} placeholder="Reps" />
                                          <input name={`actual_load__${exercise.id}__${setNumber}`} placeholder="Weight" />
                                          <input name={`actual_rpe__${exercise.id}__${setNumber}`} type="number" step="0.5" placeholder="RPE" />
                                          <input name={`set_notes__${exercise.id}__${setNumber}`} placeholder="Notes" />
                                          <label className="check-row">
                                            <input name={`completed__${exercise.id}__${setNumber}`} type="checkbox" defaultChecked /> Done
                                          </label>
                                        </div>
                                      ))}
                                    </details>
                                  ))
                              )}

                              <textarea name="notes" placeholder="Workout notes, wins, pain/discomfort, modifications" rows={3} />
                              <button className="button" type="submit">Mark Workout Complete</button>
                            </form>
                          </article>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </article>
          );
        })}

        {data.programs.length === 0 ? (
          <article className="card">
            <h3>No assigned programs yet</h3>
            <p>Your coach can assign a program from the Admin page.</p>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}
