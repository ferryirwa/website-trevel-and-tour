
import { NavLink } from "react-router-dom";
import { type LucideIcon } from "lucide-react";

interface SidebarProps {
  routes: { path: string; label: string; icon: LucideIcon | string }[];
  currentPath: string;
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ routes, currentPath, mobile, onNavigate }: SidebarProps) {
  return (
    <aside
      className={
        mobile
          ? "w-72 shrink-0 text-white"
          : "hidden w-72 shrink-0 border-r border-white/10 bg-[#0F172A] text-white lg:block"
      }
    >
      <div className={mobile ? "p-5" : "sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto p-5"}>
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 mb-4">
          Operations
        </p>
        <nav className="space-y-1">
          {routes.map((route) => {
            const isActive =
              route.path === "/admin"
                ? currentPath === "/admin"
                : currentPath === route.path ||
                  currentPath.startsWith(route.path + "/");
            const Icon = route.icon;

            return (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-primary shadow-lg shadow-black/20"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {typeof Icon === "string" ? (
                  <span className="text-base">{Icon}</span>
                ) : (
                  <Icon
                    size={18}
                    className={isActive ? "text-primary" : "text-white/70"}
                  />
                )}
                <span>{route.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="px-3 text-[10px] text-white/40">
            Visit Aikbukak · Admin v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
