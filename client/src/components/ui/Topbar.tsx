
import { Link } from "react-router-dom";
import { LogOut, ShieldCheck, Menu, X } from 'lucide-react';

interface TopbarProps {
  onLogout: () => void;
  onToggleMenu?: () => void;
  mobileMenuOpen?: boolean;
  userName?: string;
  userRole?: string;
}

const ROLE_LABEL: Record<string, string> = {
  SUPER: 'Super Admin',
  EDITOR: 'Content Editor',
  BOOKING: 'Booking Manager',
};

export function Topbar({
  onLogout,
  onToggleMenu,
  mobileMenuOpen,
  userName,
  userRole,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e6eee8] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          {onToggleMenu && (
            <button
              onClick={onToggleMenu}
              className="lg:hidden p-2 rounded-button hover:bg-neutral-light"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <Link
            to="/admin"
            className="flex items-center gap-3 font-heading font-bold text-primary text-lg"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <ShieldCheck size={18} />
            </span>
            <span className="hidden sm:inline">Visit Aikbukak</span>
            <span className="hidden text-sm font-medium text-neutral-mid md:inline">
              / Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-button bg-neutral-light">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-neutral-dark">
                  {userName}
                </p>
                <p className="text-[10px] text-neutral-mid">
                  {ROLE_LABEL[userRole ?? ''] ?? userRole}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-button px-3 py-2 text-sm font-semibold text-neutral-mid hover:bg-neutral-light hover:text-neutral-dark"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
