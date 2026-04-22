import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ToastViewport from "./ToastViewport";

const DashboardShell = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f4f8fb_52%,_#edf7f0_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#081224_52%,_#0f172a_100%)] lg:flex">
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
