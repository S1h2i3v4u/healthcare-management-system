import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  LayoutDashboard,
  CalendarDays,
  History,
  FileText,
  Bell,
  LogOut,
  Users,
  Building2,
  ScrollText,
  Stethoscope,
  Menu,
  X,
  CalendarClock,
  UserCog,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { getUnreadNotificationCount } from '@/api/notificationApi';
import { LogoMark } from '@/features/shared/LogoMark';

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
};

const NAV_ITEMS: Record<string, NavItem[]> = {
  /* ============================================================
     PATIENT
     ============================================================ */

  PATIENT: [
    {
      to: '/patient/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/patient/find-doctors',
      label: 'Find Doctors',
      icon: Stethoscope,
    },
    {
      to: '/patient/appointments',
      label: 'Appointments',
      icon: CalendarDays,
    },
    {
      to: '/patient/medical-history',
      label: 'History',
      icon: History,
    },
    {
      to: '/patient/prescriptions',
      label: 'Prescriptions',
      icon: FileText,
    },
  ],

  /* ============================================================
     DOCTOR
     ============================================================ */

  DOCTOR: [
    {
      to: '/doctor/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/doctor/appointments',
      label: 'Appointments',
      icon: CalendarDays,
    },
    {
      to: '/doctor/patients',
      label: 'Patients',
      icon: Users,
    },
    {
      to: '/doctor/schedule',
      label: 'Schedule',
      icon: CalendarClock,
    },
    {
      to: '/doctor/profile',
      label: 'Profile',
      icon: UserCog,
    },
  ],

  /* ============================================================
     ADMIN
     ============================================================ */

  ADMIN: [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/appointments',
      label: 'Appointments',
      icon: CalendarDays,
    },
    {
      to: '/admin/patients',
      label: 'Patients',
      icon: Users,
    },
    {
      to: '/admin/doctors',
      label: 'Doctors',
      icon: Stethoscope,
    },
    {
      to: '/admin/hospitals',
      label: 'Hospitals',
      icon: Building2,
    },
    {
      to: '/admin/audit-logs',
      label: 'Audit Logs',
      icon: ScrollText,
    },
  ],
};

export function Navbar() {
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  /* ============================================================
     NOTIFICATIONS
     ============================================================ */

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
    enabled: !!user,
  });

  /* ============================================================
     AUTH CHECK
     ============================================================ */

  if (!user) {
    return null;
  }

  const items = NAV_ITEMS[user.role] ?? [];

  /* ============================================================
     LOGOUT
     ============================================================ */

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* ============================================================
     USER INITIALS
     ============================================================ */

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header
      className="
        sticky
        top-0
        z-40
        bg-cream/90
        backdrop-blur-xl
        border-b
        border-line
      "
    >
      <div
        className="
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          h-16
          flex
          items-center
        "
      >
        {/* ========================================================
            LEFT SIDE
            ======================================================== */}

        <div className="flex items-center min-w-0 flex-1">

          {/* ======================================================
              HEALTHCARE BRAND
              ====================================================== */}

          <Link
            to="/"
            className="
              healthcare-brand
              group
              flex
              items-center
              gap-2.5
              shrink-0
              mr-4
              sm:mr-5
              pr-4
              sm:pr-5
              border-r
              border-[#e5ddd1]
            "
            aria-label="Healthcare home"
          >
            {/* Logo */}

            <div
              className="
                healthcare-logo-container
                relative
                w-10
                h-10
                flex
                items-center
                justify-center
                rounded-[15px]
                bg-[#fffdf8]
                border
                border-[#e7dfd2]
                shrink-0
              "
            >
              {/* Soft glow */}

              <span
                className="
                  healthcare-logo-glow
                  absolute
                  inset-0
                  rounded-[15px]
                  pointer-events-none
                "
              />

              {/* Main logo */}

              <LogoMark
                className="
                  relative
                  z-10
                  w-7
                  h-7
                  text-[#143530]
                "
              />

              {/* Status dot */}

              <span
                className="
                  healthcare-logo-status
                  absolute
                  -top-1
                  -right-1
                  z-20
                  w-3
                  h-3
                  rounded-full
                  bg-[#FDBA8C]
                  border-2
                  border-[#f6f2e9]
                "
              />
            </div>

            {/* Brand name */}

            <div className="flex flex-col justify-center shrink-0">
              <span
                className="
                  healthcare-brand-name
                  font-display
                  text-[20px]
                  leading-none
                  tracking-[-0.02em]
                  text-[#243238]
                "
              >
                Healthcare
              </span>

              <span
                className="
                  hidden
                  lg:block
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#8b9698]
                  mt-1
                "
              >
                Care made clearer
              </span>
            </div>
          </Link>

          {/* ======================================================
              DESKTOP NAVIGATION
              ====================================================== */}

          <nav
            className="
              hidden
              md:flex
              items-center
              gap-0.5
              min-w-0
              flex-1
            "
          >
            {items.map((item) => {
              const isActive =
                location.pathname.startsWith(item.to);

              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex
                    items-center
                    gap-1.5
                    px-2.5
                    py-2
                    rounded-full
                    text-sm
                    font-medium
                    whitespace-nowrap
                    shrink-0
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 shadow-[0_2px_8px_rgba(20,102,94,0.06)]'
                        : 'text-ink-400 hover:text-ink-600 hover:bg-cream-200/60'
                    }
                  `}
                >
                  <Icon
                    className="w-4 h-4 shrink-0"
                    strokeWidth={1.75}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ========================================================
            RIGHT SIDE
            ======================================================== */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            shrink-0
            ml-3
          "
        >
          {/* ======================================================
              NOTIFICATIONS
              ====================================================== */}

          <Link
            to="/notifications"
            className="
              relative
              p-2
              rounded-full
              text-ink-400
              hover:text-ink-600
              hover:bg-cream-200/60
              transition-colors
              shrink-0
            "
            aria-label="Notifications"
          >
            <Bell
              className="w-5 h-5"
              strokeWidth={1.75}
            />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  top-1
                  right-1
                  w-2
                  h-2
                  rounded-full
                  bg-danger-500
                  ring-2
                  ring-cream
                "
              />
            )}
          </Link>

          {/* ======================================================
              DESKTOP USER
              ====================================================== */}

          <div
            className="
              hidden
              sm:flex
              items-center
              gap-2
              pl-3
              border-l
              border-line
              shrink-0
            "
          >
            <div
              className="
                w-8
                h-8
                rounded-full
                bg-teal-50
                flex
                items-center
                justify-center
                text-teal-600
                text-xs
                font-display
                shrink-0
              "
            >
              {initials}
            </div>

            <span
              className="
                text-sm
                text-ink-600
                max-w-[110px]
                truncate
              "
            >
              {user.fullName}
            </span>
          </div>

          {/* ======================================================
              LOGOUT
              ====================================================== */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              p-2
              rounded-full
              text-ink-400
              hover:text-danger-700
              hover:bg-danger-50
              transition-colors
              shrink-0
            "
            title="Log out"
            aria-label="Log out"
          >
            <LogOut
              className="w-[18px] h-[18px]"
              strokeWidth={1.75}
            />
          </button>

          {/* ======================================================
              MOBILE MENU
              ====================================================== */}

          <button
            type="button"
            className="
              md:hidden
              p-2
              rounded-full
              text-ink-600
              hover:bg-cream-200/60
              shrink-0
            "
            onClick={() =>
              setMobileOpen((open) => !open)
            }
            aria-label={
              mobileOpen
                ? 'Close menu'
                : 'Open menu'
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ============================================================
          MOBILE NAVIGATION
          ============================================================ */}

      {mobileOpen && (
        <nav
          className="
            md:hidden
            border-t
            border-line
            bg-cream
            px-4
            py-3
            space-y-1
          "
        >
          {/* MOBILE USER */}

          <div
            className="
              flex
              items-center
              gap-2.5
              px-3
              py-2
              mb-2
              border-b
              border-line
              pb-3
            "
          >
            <div
              className="
                w-8
                h-8
                rounded-full
                bg-teal-50
                flex
                items-center
                justify-center
                text-teal-600
                text-xs
                font-display
                shrink-0
              "
            >
              {initials}
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-medium
                  text-ink-600
                  truncate
                "
              >
                {user.fullName}
              </p>

              <p
                className="
                  text-xs
                  text-ink-400
                  capitalize
                "
              >
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>

          {/* MOBILE NAV ITEMS */}

          {items.map((item) => {
            const isActive =
              location.pathname.startsWith(item.to);

            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex
                  items-center
                  gap-2.5
                  px-3
                  py-2.5
                  rounded-xl
                  text-sm
                  font-medium
                  transition-colors
                  ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-ink-600 hover:bg-cream-200/60'
                  }
                `}
              >
                <Icon
                  className="w-4 h-4"
                  strokeWidth={1.75}
                />

                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export default Navbar;