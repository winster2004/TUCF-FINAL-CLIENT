import React from 'react';
import { Bell, CalendarDays, Lock } from 'lucide-react';
import type { CalendarTask } from '../../lib/dashboardStore';

interface DashboardCalendarRailProps {
  calendarTasks: CalendarTask[];
  summary?: string;
  readOnly?: boolean;
}

const getCalendarTaskMeta = (taskName: string) => {
  const normalized = taskName.toLowerCase();

  if (normalized.includes('resume')) {
    return 'Resume review';
  }

  if (normalized.includes('portfolio')) {
    return 'Design';
  }

  if (normalized.includes('keyword')) {
    return 'Research';
  }

  if (normalized.includes('mock') || normalized.includes('interview')) {
    return 'Interview prep';
  }

  if (normalized.includes('ats')) {
    return 'ATS analysis';
  }

  return 'Scheduled task';
};

const getCalendarAccentClass = (accentClass: CalendarTask['accentClass']) => {
  if (accentClass === 'cyan') {
    return 'bg-[#8ed8df]';
  }

  if (accentClass === 'purple') {
    return 'bg-[#7a3f93]';
  }

  return 'bg-[#ff8a58]';
};

const DashboardCalendarRail: React.FC<DashboardCalendarRailProps> = ({
  calendarTasks,
  summary = 'Upcoming preparation reminders',
  readOnly = false,
}) => {
  const calendarGroups = Array.from(new Set(calendarTasks.map((item) => item.dateLabel))).map((dateLabel) => ({
    date: dateLabel,
    items: calendarTasks.filter((item) => item.dateLabel === dateLabel),
  }));

  return (
    <aside className="dashboard-calendar-rail">
      <div className="dashboard-calendar-top">
        <h2>Calendar</h2>
        <div className="dashboard-calendar-actions">
          {readOnly ? (
            <span className="dashboard-locked-chip">
              <Lock size={14} />
              View only
            </span>
          ) : null}
          <button className="dashboard-icon-button light" type="button" aria-label="Notifications" disabled={readOnly}>
            <Bell size={16} />
          </button>
        </div>
      </div>

      <div className="dashboard-calendar-summary">
        <CalendarDays size={18} />
        <span>{summary}</span>
      </div>

      <div className="dashboard-calendar-list">
        {calendarGroups.map((day) => (
          <section key={day.date} className="dashboard-calendar-day">
            <div className="dashboard-calendar-day-header">
              <span>{day.date}</span>
              <button type="button" aria-label="More options" disabled={readOnly}>
                ...
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {day.items.map((item) => (
                <div
                  key={item.id}
                  className="group flex w-full items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-20 shrink-0 pt-0.5 text-sm font-semibold leading-5 text-[#2f2140] dark:text-white">
                    {item.time} {item.period}
                  </div>

                  <div className="min-w-0 flex flex-1 items-center gap-3">
                    <div
                      className={`h-full min-h-[44px] w-[3px] shrink-0 rounded-full ${getCalendarAccentClass(
                        item.accentClass,
                      )}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-xs leading-5 text-[#9f9aa8] break-words dark:text-gray-400">
                        {getCalendarTaskMeta(item.task)}
                      </p>
                      <h3 className="m-0 text-sm font-medium leading-5 text-[#332245] break-words dark:text-white">
                        {item.task}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
};

export default DashboardCalendarRail;
