"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function DebugPage() {
  const [user, setUser] = useState<any>(null);
  const [cookies, setCookies] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEverything();
  }, []);

  const checkEverything = async () => {
    try {
      // Check user
      const {
        data: { user },
        error,
      } = await supabaseBrowser.auth.getUser();
      console.log("Client-side user check:", { user, error });
      setUser(user);

      // Check session
      const {
        data: { session },
        error: sessionError,
      } = await supabaseBrowser.auth.getSession();
      console.log("Client-side session check:", { session, sessionError });

      // Check cookies
      const allCookies = document.cookie;
      setCookies(allCookies);
      console.log("All cookies:", allCookies);

      // Check specific Supabase cookies
      const supabaseCookies = allCookies
        .split(";")
        .filter((cookie) => cookie.trim().includes("sb-"));
      console.log("Supabase cookies:", supabaseCookies);
    } catch (error) {
      console.error("Debug error:", error);
    } finally {
      setLoading(false);
    }
  };

  const forceLogin = async () => {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email: "accountant1@example.com",
      password: "password123",
    });
    console.log("Force login result:", { data, error });

    // Wait a bit for cookies to be set
    setTimeout(() => {
      checkEverything();
    }, 1000);
  };

  const forceLogout = async () => {
    const { error } = await supabaseBrowser.auth.signOut();
    console.log("Force logout result:", error);
    checkEverything();
  };

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User State</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Cookies */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Cookies</h2>
          <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {cookies.split(";").map((cookie, i) => (
              <div
                key={i}
                className={
                  cookie.includes("sb-") ? "text-blue-600 font-bold" : ""
                }
              >
                {cookie.trim()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-x-4">
        <button
          onClick={forceLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Force Login
        </button>

        <button
          onClick={forceLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Force Logout
        </button>

        <button
          onClick={checkEverything}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refresh Debug
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Try Go Home
        </button>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">How to Debug:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2">
          <li>Open Developer Tools (F12) → Console</li>
          <li>Click "Force Login" and check console logs</li>
          <li>Look for Supabase cookies (highlighted in blue)</li>
          <li>Click "Try Go Home" to test middleware</li>
          <li>Check console for middleware logs</li>
        </ol>
      </div>
    </div>
  );
}
