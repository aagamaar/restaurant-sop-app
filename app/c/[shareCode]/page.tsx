import { supabase } from "@/lib/supabase";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  const { data: checklist, error } = await supabase
    .from("checklists")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  if (error || !checklist) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Checklist not found
          </h1>
          <p className="text-gray-600">
            We couldn&apos;t find a checklist with code {shareCode}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-xl w-full">
        <div className="mb-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checklist created
          </h1>
          <p className="text-gray-600">{checklist.title}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Share this link with your manager:
          </p>
          <p className="font-mono text-sm bg-white border border-gray-300 rounded px-3 py-2 break-all">
            localhost:3000/c/{checklist.share_code}
          </p>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Tasks and tick interface coming next.
        </p>
      </div>
    </main>
  );
}
