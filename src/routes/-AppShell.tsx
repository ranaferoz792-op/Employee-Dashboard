import { Link, Outlet } from "@tanstack/react-router";
import { navItems } from "./-pagePaths";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-900 p-4">
          <div className="mb-8 px-2 text-lg font-semibold">Employee Dashboard</div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                activeOptions={{ exact: true }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-8 border-t border-slate-800 pt-4">
            <Link
              to="/"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Sign out
            </Link>
          </div>
        </aside>

        <main className="min-h-screen bg-slate-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
