"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteClientClient } from "@/lib/clients-client";

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onDelete?: () => void;
}

export function DeleteClientButton({ 
  clientId, 
  clientName, 
  variant = "outline", 
  size = "sm",
  onDelete
}: DeleteClientButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteClientClient(clientId);
      if (onDelete) {
        onDelete(); // Call the callback to refresh the client list
      } else {
        router.refresh(); // Fallback to page refresh
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Помилка при видаленні клієнта. Спробуйте ще раз.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Підтвердити видалення
          </h3>
          <p className="text-gray-600 mb-6">
            Ви впевнені, що хочете видалити клієнта <strong>{clientName}</strong>? 
            Цю дію неможливо скасувати.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Видалення..." : "Видалити"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      Видалити
    </Button>
  );
}