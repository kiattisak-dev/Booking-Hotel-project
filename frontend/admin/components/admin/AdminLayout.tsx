import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  LayoutDashboard,
  Bed,
  Package,
  Calendar,
  CreditCard,
  Menu,
  X,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Rooms", href: "/admin/rooms", icon: Bed },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
];

// breakpoint lg
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isDesktop;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const DESKTOP_OPEN = 256; // 16rem
  const DESKTOP_COLLAPSED = 64; // 4rem

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isDesktop && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.aside
          key="admin-sidebar"
          initial={false}
          animate={
            isDesktop
              ? { width: sidebarOpen ? DESKTOP_OPEN : DESKTOP_COLLAPSED }
              : { x: sidebarOpen ? 0 : -280, width: DESKTOP_OPEN }
          }
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className={cn(
            "bg-white shadow-lg lg:shadow-none z-50 lg:z-0",
            "fixed inset-y-0 left-0 lg:relative",
            "flex flex-col",
            isDesktop ? "" : "w-64"
          )}
          style={isDesktop ? undefined : { width: DESKTOP_OPEN }}
        >
          <div className="absolute right-[-12px] top-4 hidden lg:block">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="rounded-full bg-white border shadow-soft p-1.5"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <motion.span
                key={String(sidebarOpen)}
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </motion.span>
            </motion.button>
          </div>

          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4">
            <motion.div
              animate={{
                opacity: isDesktop ? (sidebarOpen ? 1 : 0) : 1,
              }}
              className={cn(
                "text-xl font-bold text-gray-900",
                isDesktop && !sidebarOpen && "pointer-events-none select-none"
              )}
            >
              Hotel Admin
            </motion.div>

            {!isDesktop && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 pb-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      title={item.name}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />

                      <motion.span
                        initial={false}
                        animate={{
                          opacity: isDesktop ? (sidebarOpen ? 1 : 0) : 1,
                          width: isDesktop
                            ? sidebarOpen
                              ? "auto"
                              : 0
                            : "auto",
                        }}
                        className={cn(
                          "truncate",
                          isDesktop && !sidebarOpen && "overflow-hidden"
                        )}
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-700" />
              </div>
              <motion.div
                initial={false}
                animate={{
                  opacity: isDesktop ? (sidebarOpen ? 1 : 0) : 1,
                  width: isDesktop ? (sidebarOpen ? "auto" : 0) : "auto",
                }}
                className={cn(
                  "flex-1 truncate",
                  isDesktop && !sidebarOpen && "overflow-hidden"
                )}
              >
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </motion.div>
            </div>
            <motion.div
              initial={false}
              animate={{
                opacity: isDesktop ? (sidebarOpen ? 1 : 0) : 1,
                height: isDesktop ? (sidebarOpen ? "auto" : 0) : "auto",
              }}
              className={cn(
                "mt-3",
                isDesktop && !sidebarOpen && "overflow-hidden"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span className={cn(isDesktop && !sidebarOpen && "hidden")}>
                  Logout
                </span>
              </Button>
            </motion.div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={router.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
