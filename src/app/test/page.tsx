"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function TestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log("Current user:", user, "Error:", error);
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "accountant1@example.com",
        password: "password123",
      });
      console.log("Login result:", { data, error });
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const testLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      console.log("Logout result:", error);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Current User:</h2>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="space-x-4">
        <button
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Login
        </button>

        <button
          onClick={testLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Test Logout
        </button>

        <button
          onClick={checkUser}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Check User
        </button>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Check the browser console for detailed logs
        </p>
      </div>
    </div>
  );
}
