import { getUserServer } from "@/lib/auth-server";
import { cookies } from "next/headers";

export default async function ServerDebugPage() {
  // Get all cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Get user server-side
  let user = null;
  let error = null;

  try {
    user = await getUserServer();
  } catch (e) {
    error = e;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">🔧 Server Debug Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Server User Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Server-side User</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify({ user, error: error?.message }, null, 2)}
          </pre>
        </div>

        {/* Server Cookies */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Server-side Cookies</h2>
          <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
            {allCookies.length === 0 ? (
              <div className="text-red-600">No cookies found</div>
            ) : (
              allCookies.map((cookie, i) => (
                <div
                  key={i}
                  className={
                    cookie.name.includes("sb-") ? "text-blue-600 font-bold" : ""
                  }
                >
                  <strong>{cookie.name}:</strong>{" "}
                  {cookie.value.substring(0, 50)}...
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Server Analysis:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ Total cookies found: {allCookies.length}</li>
            <li>
              ✓ Supabase cookies:{" "}
              {allCookies.filter((c) => c.name.includes("sb-")).length}
            </li>
            <li>✓ User authenticated: {user ? "✅ Yes" : "❌ No"}</li>
            <li>
              ✓ Server can access cookies:{" "}
              {allCookies.length > 0 ? "✅ Yes" : "❌ No"}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 space-x-4">
        <a
          href="/debug"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ← Client Debug
        </a>

        <a
          href="/login"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Login
        </a>

        <a
          href="/"
          className="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Try Home
        </a>
      </div>
    </div>
  );
}
