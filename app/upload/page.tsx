"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus(`Selected: ${selected.name}`);
    }
  };

  const generateShareCode = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a PDF first.");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: send PDF to our parse API
      setStatus("Reading your PDF...");
      const formData = new FormData();
      formData.append("file", file);

      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!parseResponse.ok) {
        const err = await parseResponse.json();
        setStatus(`Error: ${err.error ?? "Failed to parse PDF"}`);
        setIsUploading(false);
        return;
      }

      const { tasks } = await parseResponse.json();

      // Step 2: create the checklist
      setStatus(`Found ${tasks.length} tasks. Saving checklist...`);
      const shareCode = generateShareCode();
      const title = file.name.replace(/\.pdf$/i, "");

      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .insert({ title, share_code: shareCode })
        .select()
        .single();

      if (checklistError || !checklist) {
        setStatus(`Error saving checklist: ${checklistError?.message}`);
        setIsUploading(false);
        return;
      }

      // Step 3: save all the tasks
      const tasksToInsert = tasks.map(
        (t: {
          title: string;
          frequency: string;
          section: string;
          order_index: number;
        }) => ({
          checklist_id: checklist.id,
          title: t.title,
          frequency: t.frequency,
          section: t.section,
          order_index: t.order_index,
        }),
      );

      const { error: tasksError } = await supabase
        .from("tasks")
        .insert(tasksToInsert);

      if (tasksError) {
        setStatus(`Error saving tasks: ${tasksError.message}`);
        setIsUploading(false);
        return;
      }

      // Step 4: redirect to the share link page
      router.push(`/c/${shareCode}`);
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("Something went wrong. Check the console.");
      setIsUploading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Upload your SOP
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Drop in your existing SOP PDF. We&apos;ll turn it into a checklist
          using AI.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              border: "2px dashed #d1d5db",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ display: "block", margin: "0 auto", fontSize: "14px" }}
            />
          </div>

          {status && (
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "16px",
              }}
            >
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={isUploading || !file}
            style={{
              width: "100%",
              backgroundColor: isUploading || !file ? "#9ca3af" : "#111827",
              color: "#ffffff",
              padding: "12px 16px",
              borderRadius: "8px",
              fontWeight: 500,
              border: "none",
              cursor: isUploading || !file ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {isUploading ? "Processing..." : "Upload PDF"}
          </button>
        </form>
      </div>
    </main>
  );
}
