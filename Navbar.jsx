import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, ScrollText, Users, ShieldCheck, LogOut, Landmark } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItem =
  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-950/5 hover:text-ink-950";
const navItemActive = "bg-brand-500/10 text-brand-600 hover:bg-brand-500/10 hover:text-brand-600";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-ink-950/[0.06] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="icon-tile">
            <Landmark size={18} strokeWidth={2.25} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">MERN Bank</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={({ isActive }) => `${navItem} ${isActive ? navItemActive : ""}`}>
              <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink to="/transfer" className={({ isActive }) => `${navItem} ${isActive ? navItemActive : ""}`}>
              <ArrowLeftRight size={16} /> <span className="hidden sm:inline">Transfer</span>
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => `${navItem} ${isActive ? navItemActive : ""}`}>
              <ScrollText size={16} /> <span className="hidden sm:inline">Statement</span>
            </NavLink>
            <NavLink to="/beneficiaries" className={({ isActive }) => `${navItem} ${isActive ? navItemActive : ""}`}>
              <Users size={16} /> <span className="hidden sm:inline">Payees</span>
            </NavLink>
            {user.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `${navItem} ${isActive ? navItemActive : ""}`}>
                <ShieldCheck size={16} /> <span className="hidden sm:inline">Admin</span>
              </NavLink>
            )}
            <button onClick={handleLogout} className="btn-ghost ml-1">
              <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
