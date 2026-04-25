"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bardales2025";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-bark-800 border border-terra/30 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-2xl mx-auto mb-4 shadow-lg shadow-terra/30">
            IB
          </div>
          <h1 className="font-display text-3xl tracking-wide">Panel Admin</h1>
          <p className="text-sand-muted text-sm mt-1">Inmobiliaria Bardales</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-bark-700 border border-white/10 rounded-xl text-sand placeholder-sand-muted/50 focus:outline-none focus:border-terra/60"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold tracking-wide shadow-lg shadow-terra/30 hover:shadow-terra/50 transition-shadow"
          >
            Ingresar al Panel
          </button>
        </form>
      </div>
    </div>
  );
}
