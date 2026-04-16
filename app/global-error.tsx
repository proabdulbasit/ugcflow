'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-2xl font-bold mb-4">A critical error occurred</h2>
          <button 
            onClick={() => reset()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Restart App
          </button>
        </div>
      </body>
    </html>
  );
}
