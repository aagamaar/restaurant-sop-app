"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus(`Selected: ${selected.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a PDF first.");
      return;
    }
    setStatus("Uploading... (not really, this is a placeholder for now)");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload your SOP
        </h1>
        <p className="text-gray-600 mb-8">
          Drop in your existing SOP PDF. We'll turn it into a checklist.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block mx-auto text-sm text-gray-700"
            />
          </div>

          {status && <p className="text-sm text-gray-600">{status}</p>}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Upload PDF
          </button>
        </form>
      </div>
    </main>
  );
}
