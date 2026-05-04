"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  title: string;
  section: string;
  frequency: string;
};

export default function TaskList({
  tasks,
  completedTaskIds,
}: {
  tasks: Task[];
  completedTaskIds: string[];
}) {
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(completedTaskIds),
  );
  const [busy, setBusy] = useState<string | null>(null);

  const handleToggle = async (taskId: string) => {
    if (busy) return;
    setBusy(taskId);

    const isCurrentlyCompleted = completed.has(taskId);

    if (isCurrentlyCompleted) {
      const today = new Date().toISOString().slice(0, 10);
      await supabase
        .from("completions")
        .delete()
        .eq("task_id", taskId)
        .gte("ticked_at", `${today}T00:00:00`)
        .lte("ticked_at", `${today}T23:59:59`);
      const next = new Set(completed);
      next.delete(taskId);
      setCompleted(next);
    } else {
      await supabase.from("completions").insert({ task_id: taskId });
      const next = new Set(completed);
      next.add(taskId);
      setCompleted(next);
    }

    setBusy(null);
  };

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {tasks.map((task) => {
        const isDone = completed.has(task.id);
        return (
          <li
            key={task.id}
            onClick={() => handleToggle(task.id)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              marginBottom: "8px",
              borderRadius: "8px",
              border: isDone ? "2px solid #22c55e" : "1px solid #e5e7eb",
              backgroundColor: isDone ? "#f0fdf4" : "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                border: isDone ? "2px solid #16a34a" : "2px solid #d1d5db",
                backgroundColor: isDone ? "#16a34a" : "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "2px",
              }}
            >
              {isDone && (
                <span
                  style={{
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  ✓
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: isDone ? "#6b7280" : "#111827",
                  textDecoration: isDone ? "line-through" : "none",
                }}
              >
                {task.title}
              </p>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                {task.section} · {task.frequency.replace(/_/g, " ")}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
