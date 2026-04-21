import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ToastViewport from "./ToastViewport";

const DashboardShell = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eff4ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] lg:flex">
      <Sidebar />
      <ToastViewport />

      <div className="min-w-0 flex-1">
        <Navbar user={user} onLogout={onLogout} />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
