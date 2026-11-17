import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import logoUrl from "@/assets/spoplayer-logo.png";
import cosmosBg from "@/assets/wallpapers/cosmos.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const { signIn, signUp, continueAsGuest, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegister) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
    navigate("/");
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-6 overflow-hidden bg-black text-white select-none">
      {/* Background wallpaper with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={cosmosBg}
          alt="Wallpaper"
          className="w-full h-full object-cover opacity-35 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoUrl} alt="SpoPlayer" className="w-16 h-16 mb-3 drop-shadow-[0_0_20px_rgba(0,245,155,0.4)]" />
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            SpoPlayer <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary,#00f59b)] text-black">Android</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">Tu música favorita en cualquier lugar</p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-white/60 mb-1 block">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--accent-primary,#00f59b)] transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white/60 mb-1 block">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--accent-primary,#00f59b)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[var(--accent-primary,#00f59b)] text-black font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : isRegister ? "Registrarse" : "Iniciar sesión"}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-4 flex items-center justify-between w-full text-xs">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>

        <div className="w-full flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">o</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Guest access */}
        <button
          type="button"
          onClick={handleGuest}
          className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/90 font-semibold text-sm transition-all"
        >
          Continuar como invitado
        </button>
      </div>
    </div>
  );
}
