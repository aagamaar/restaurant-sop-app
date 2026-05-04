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
    setStatus("Saving checklist...");

    try {
      const shareCode = generateShareCode();
      const title = file.name.replace(/\.pdf$/i, "");

      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: title,
          share_code: shareCode,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        setStatus(`Error: ${error.message}`);
        setIsUploading(false);
        return;
      }

      console.log("Checklist created:", data);
      router.push(`/c/${shareCode}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      setStatus("Something went wrong. Check the console.");
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload your SOP
        </h1>
        <p className="text-gray-600 mb-8">
          Drop in your existing SOP PDF. We&apos;ll turn it into a checklist.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block mx-auto text-sm text-gray-700"
            />
          </div>

          {status && <p className="text-sm text-gray-600">{status}</p>}

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Saving..." : "Upload PDF"}
          </button>
        </form>
      </div>
    </main>
  );
}
