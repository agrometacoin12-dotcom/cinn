import { UserProfile, UserRole } from "../types";
import { ShieldCheck, Ticket, Sparkles, User, RefreshCw, Film } from "lucide-react";

interface NavbarProps {
  user: UserProfile;
  onChangeRole: (role: UserRole) => void;
  ticketCount: number;
}

export default function Navbar({ user, onChangeRole, ticketCount }: NavbarProps) {
  return (
    <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-4 md:px-10 py-4 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-black tracking-tighter italic text-white text-sm uppercase">
          CT
        </div>
        <div>
          <span className="font-display font-black tracking-tight text-lg text-white uppercase flex items-center gap-1">
            CINNE<span className="font-light text-zinc-400">Temple</span>
          </span>
          <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase leading-none">
            Pay-Per-View Premium
          </p>
        </div>
      </div>

      {/* Center navigation indicator */}
      <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-zinc-400 font-medium tracking-wider">
        <div className="flex items-center gap-2 bg-zinc-950 border border-white/5 px-3 py-1.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>100% SECURE DIRECT PAYOUTS</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 border border-white/5 px-3 py-1.5 rounded-md">
          <span>90% CREATOR ROYALTY RATIO</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Ticket Indicator */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight">
          <Ticket className="w-4 h-4 text-red-500" />
          <span>{ticketCount} Tickets</span>
        </div>

        {/* User profile with role select */}
        <div className="flex items-center gap-3 bg-zinc-950/80 border border-white/5 p-1.5 pl-3 rounded-xl">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-zinc-200 leading-none">{user.name}</p>
            <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{user.email}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={user.role}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-zinc-900 border border-white/10 text-red-500 font-mono text-[11px] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              <option value="admin">🎥 Admin/Filmmaker</option>
              <option value="tester">🧪 Early Tester</option>
              <option value="viewer">🎟️ Regular Viewer</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

