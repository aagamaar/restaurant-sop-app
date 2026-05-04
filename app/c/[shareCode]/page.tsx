import { supabase } from "@/lib/supabase";
import TaskList from "./TaskList";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  if (checklistError || !checklist) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "24px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "16px",
            }}
          >
            Checklist not found
          </h1>
          <p style={{ color: "#6b7280" }}>
            We couldn&apos;t find a checklist with code {shareCode}.
          </p>
        </div>
      </main>
    );
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("checklist_id", checklist.id)
    .order("order_index", { ascending: true });

  const today = new Date().toISOString().slice(0, 10);
  const taskIds = tasks?.map((t) => t.id) ?? [];
  const { data: completions } = await supabase
    .from("completions")
    .select("*")
    .in("task_id", taskIds)
    .gte("ticked_at", `${today}T00:00:00`)
    .lte("ticked_at", `${today}T23:59:59`);

  const completedTaskIds = completions?.map((c) => c.task_id) ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        backgroundColor: "#ffffff",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
            }}
          >
            {checklist.title}
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Today&apos;s checklist · {tasks?.length ?? 0} tasks
          </p>
        </div>

        <TaskList tasks={tasks ?? []} completedTaskIds={completedTaskIds} />
      </div>
    </main>
  );
}
