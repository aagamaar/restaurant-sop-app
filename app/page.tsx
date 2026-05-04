import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Restaurant SOP App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Turn your SOP PDFs into daily checklists your managers actually tick
          off.
        </p>
        <Link
          href="/upload"
          className="inline-block bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Upload your first SOP
        </Link>
        <p className="text-sm text-gray-500 mt-8">
          Built for Indian restaurants. Free for small operators.
        </p>
      </div>
    </main>
  );
}
