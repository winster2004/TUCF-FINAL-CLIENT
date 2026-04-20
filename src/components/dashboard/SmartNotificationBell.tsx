import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../../contexts/AuthContext';
import { readDashboardData, type CalendarTask } from '../../lib/dashboardStore';

interface SmartNotificationBellProps {
  user: User | null;
}

interface TaskWithStatus extends CalendarTask {
  targetTime: Date;
  diffMs: number;
}

const parseTaskTime = (task: CalendarTask) => {
  const match = task.time.trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? '0');
  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  if (task.period === 'PM' && hours < 12) {
    hours += 12;
  }

  if (task.period === 'AM' && hours === 12) {
    hours = 0;
  }

  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  return target;
};

const formatDuration = (diffMs: number) => {
  const absoluteMinutes = Math.max(1, Math.round(Math.abs(diffMs) / 60000));
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
};

const SmartNotificationBell: React.FC<SmartNotificationBellProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [now, setNow] = useState(() => new Date());
  const isSubscribed = user?.role === 'SUBSCRIBED';

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !isSubscribed) {
      setTasks([]);
      return;
    }

    const refreshTasks = () => {
      setTasks(readDashboardData({ id: user.id, email: user.email }).calendarTasks);
    };

    refreshTasks();
    window.addEventListener('dashboard-data-changed', refreshTasks);
    window.addEventListener('storage', refreshTasks);

    return () => {
      window.removeEventListener('dashboard-data-changed', refreshTasks);
      window.removeEventListener('storage', refreshTasks);
    };
  }, [isSubscribed, user]);

  const todayTasks = useMemo<TaskWithStatus[]>(() => {
    return tasks
      .filter((task) => task.dateLabel.toLowerCase() === 'today')
      .map((task) => {
        const targetTime = parseTaskTime(task) ?? now;
        return {
          ...task,
          targetTime,
          diffMs: targetTime.getTime() - now.getTime(),
        };
      })
      .sort((first, second) => first.targetTime.getTime() - second.targetTime.getTime());
  }, [now, tasks]);

  const upcomingTasks = todayTasks.filter((task) => task.diffMs >= 0);
  const missedTasks = todayTasks.filter((task) => task.diffMs < 0);
  const pendingCount = upcomingTasks.length;
  const highlightedTask =
    upcomingTasks[0] ?? [...missedTasks].sort((first, second) => second.targetTime.getTime() - first.targetTime.getTime())[0];
  const otherTasks = highlightedTask
    ? todayTasks.filter((task) => task.id !== highlightedTask.id)
    : todayTasks;

  if (!isSubscribed) {
    return (
      <Link to="/upgrade" className="smart-bell smart-bell-locked" aria-label="Upgrade to unlock notifications">
        <Bell className="h-5 w-5" />
        <Lock className="smart-bell-lock" />
        <span className="smart-bell-tooltip">Upgrade to unlock this feature</span>
      </Link>
    );
  }

  return (
    <div className="smart-bell-wrap">
      <button
        type="button"
        className="smart-bell"
        aria-label="Calendar notifications"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {pendingCount > 0 ? <span className="smart-bell-badge">{pendingCount}</span> : null}
      </button>

      {isOpen ? (
        <div className="smart-bell-panel">
          <div className="smart-bell-panel-head">
            <span>Calendar Alerts</span>
            <strong>{pendingCount} pending today</strong>
          </div>

          {todayTasks.length === 0 ? (
            <div className="smart-bell-empty">No tasks for today 🎉</div>
          ) : (
            <>
              {highlightedTask ? (
                <div className={`smart-bell-next ${highlightedTask.diffMs < 0 ? 'missed' : ''}`}>
                  <span>{highlightedTask.diffMs < 0 ? 'Missed' : 'Next task'}</span>
                  <h3>{highlightedTask.task}</h3>
                  <p>
                    {highlightedTask.diffMs < 0
                      ? `${formatDuration(highlightedTask.diffMs)} ago`
                      : `in ${formatDuration(highlightedTask.diffMs)}`}
                  </p>
                </div>
              ) : null}

              <div className="smart-bell-list">
                {otherTasks.length > 0 ? (
                  otherTasks.map((task) => (
                    <div key={task.id} className="smart-bell-item">
                      <Clock className="h-4 w-4" />
                      <div>
                        <strong>{task.task}</strong>
                        <span>
                          {task.time} {task.period}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nothing else scheduled today.</p>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SmartNotificationBell;
