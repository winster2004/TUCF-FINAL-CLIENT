import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Download,
  FilePenLine,
  FileText,
  Globe,
  Map,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Upload,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TrialTimer from '../components/TrialTimer';
import { getStoredPlan } from '../lib/plan';
import {
  type CalendarTask,
  createTaskId,
  downloadStoredResume,
  fileToDataUrl,
  readDashboardData,
  updateDashboardData,
  type DashboardTask,
  type StoredResumeFile,
  type UserDashboardData,
} from '../lib/dashboardStore';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

interface TaskDraft {
  title: string;
  description: string;
  dueDate: string;
}

interface CalendarDraft {
  time: string;
  period: 'AM' | 'PM';
  task: string;
}

interface CalendarNotificationTask extends CalendarTask {
  targetTime: Date;
  diffMs: number;
}

const emptyDraft: TaskDraft = {
  title: '',
  description: '',
  dueDate: '',
};
const emptyCalendarDraft: CalendarDraft = {
  time: '',
  period: 'AM',
  task: '',
};

const moduleLinks = [
  {
    title: 'Roadmaps',
    description: 'Explore guided career paths',
    to: '/roadmaps',
    icon: Map,
    accentClass: 'cyan',
  },
  {
    title: 'Roadmap Planner',
    description: 'Generate your custom learning plan',
    to: '/roadmap-generator',
    icon: Sparkles,
    accentClass: 'purple',
  },
  {
    title: 'Interview Guide',
    description: 'Practice questions and prep',
    to: '/interview-prep',
    icon: Target,
    accentClass: 'orange',
  },
  {
    title: 'AI Chat Bot',
    description: 'Ask career questions instantly',
    to: '/ai-assistant',
    icon: FileText,
    accentClass: 'purple',
  },
  {
    title: 'CV Generator',
    description: 'Write supporting docs faster',
    to: '/cover-letter',
    icon: FilePenLine,
    accentClass: 'orange',
  },
  {
    title: 'Portfolio Builder',
    description: 'Publish your projects neatly',
    to: '/portfolio',
    icon: Globe,
    accentClass: 'cyan',
  },
];

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

const getCalendarAccentClass = (accentClass: string) => {
  if (accentClass === 'cyan') {
    return 'bg-[#8ed8df]';
  }

  if (accentClass === 'purple') {
    return 'bg-[#7a3f93]';
  }

  return 'bg-[#ff8a58]';
};

const parseCalendarTaskTime = (task: CalendarTask) => {
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

  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);
  return targetTime;
};

const formatCalendarTaskTimeLeft = (diffMs: number) => {
  const absoluteMinutes = Math.max(1, Math.round(Math.abs(diffMs) / 60000));
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  const value =
    hours > 0 && minutes > 0
      ? `${hours}h ${minutes}m`
      : hours > 0
        ? `${hours}h`
        : `${minutes}m`;

  return diffMs >= 0 ? `in ${value}` : `${value} ago`;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationNow, setNotificationNow] = useState(() => new Date());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingCalendarTaskId, setEditingCalendarTaskId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [calendarDraft, setCalendarDraft] = useState<CalendarDraft>(emptyCalendarDraft);

  useEffect(() => {
    if (!user) {
      return;
    }

    const refreshDashboardData = () => {
      setDashboardData(readDashboardData({ id: user.id, email: user.email }));
    };

    refreshDashboardData();
    window.addEventListener('dashboard-data-changed', refreshDashboardData);

    return () => {
      window.removeEventListener('dashboard-data-changed', refreshDashboardData);
    };
  }, [user]);

  useEffect(() => {
    const interval = window.setInterval(() => setNotificationNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const persistData = (updater: (current: UserDashboardData) => UserDashboardData) => {
    if (!user) {
      return;
    }

    const next = updateDashboardData({ id: user.id, email: user.email }, updater);
    setDashboardData(next);
  };

  const openCreateTaskModal = () => {
    setEditingTaskId(null);
    setDraft(emptyDraft);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: DashboardTask) => {
    setEditingTaskId(task.id);
    setDraft({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
    });
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTaskId(null);
    setDraft(emptyDraft);
  };

  const openCreateCalendarModal = () => {
    setEditingCalendarTaskId(null);
    setCalendarDraft(emptyCalendarDraft);
    setIsCalendarModalOpen(true);
  };

  const openEditCalendarModal = (task: CalendarTask) => {
    setEditingCalendarTaskId(task.id);
    setCalendarDraft({
      time: task.time,
      period: task.period,
      task: task.task,
    });
    setIsCalendarModalOpen(true);
  };

  const closeCalendarModal = () => {
    setIsCalendarModalOpen(false);
    setEditingCalendarTaskId(null);
    setCalendarDraft(emptyCalendarDraft);
  };

  const saveTask = () => {
    if (!draft.title.trim()) {
      return;
    }

    persistData((current) => {
      if (editingTaskId) {
        return {
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === editingTaskId
              ? {
                  ...task,
                  title: draft.title.trim(),
                  description: draft.description.trim(),
                  dueDate: draft.dueDate,
                }
              : task,
          ),
        };
      }

      return {
        ...current,
        tasks: [
          {
            id: createTaskId(),
            title: draft.title.trim(),
            description: draft.description.trim(),
            dueDate: draft.dueDate,
            completed: false,
            createdAt: new Date().toISOString(),
          },
          ...current.tasks,
        ],
      };
    });

    closeTaskModal();
  };

  const toggleTaskComplete = (taskId: string) => {
    persistData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }));
  };

  const deleteTask = (taskId: string) => {
    persistData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const saveCalendarTask = () => {
    if (!calendarDraft.time.trim() || !calendarDraft.task.trim()) {
      return;
    }

    persistData((current) => {
      if (editingCalendarTaskId) {
        return {
          ...current,
          calendarTasks: current.calendarTasks.map((item) =>
            item.id === editingCalendarTaskId
              ? {
                  ...item,
                  time: calendarDraft.time.trim(),
                  period: calendarDraft.period,
                  task: calendarDraft.task.trim(),
                }
              : item,
          ),
        };
      }

      return {
        ...current,
        calendarTasks: [
          {
            id: createTaskId(),
            time: calendarDraft.time.trim(),
            period: calendarDraft.period,
            task: calendarDraft.task.trim(),
            dateLabel: 'Today',
            accentClass: 'cyan',
          },
          ...current.calendarTasks,
        ],
      };
    });

    closeCalendarModal();
  };

  const deleteCalendarTask = (taskId: string) => {
    persistData((current) => ({
      ...current,
      calendarTasks: current.calendarTasks.filter((item) => item.id !== taskId),
    }));
  };

  const handleDashboardResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    const nextResume: StoredResumeFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl,
      uploadedAt: new Date().toISOString(),
    };

    persistData((current) => ({
      ...current,
      resume: nextResume,
    }));

    event.target.value = '';
  };

  const atsCards = useMemo(() => {
    const metrics = dashboardData?.atsMetrics;
    return [
      {
        title: 'ATS Score',
        value: metrics ? `${metrics.score}%` : '--',
        meta: metrics ? 'Latest resume analysis' : 'Run ATS checker to populate',
        colorClass: 'purple',
      },
      {
        title: 'Resume Strength',
        value: metrics ? `${metrics.resumeStrength}%` : '--',
        meta: metrics ? 'Average quality signal' : 'Saved per user account',
        colorClass: 'cyan',
      },
      {
        title: 'Keyword Match',
        value: metrics ? `${metrics.keywordMatch}%` : '--',
        meta: metrics ? 'Match against target job' : 'No analysis yet',
        colorClass: 'orange',
      },
    ];
  }, [dashboardData?.atsMetrics]);

  const tasks = dashboardData?.tasks ?? [];
  const calendarGroups = useMemo(() => {
    const items = dashboardData?.calendarTasks ?? [];
    return Array.from(new Set(items.map((item) => item.dateLabel))).map((dateLabel) => ({
      date: dateLabel,
      items: items.filter((item) => item.dateLabel === dateLabel),
    }));
  }, [dashboardData?.calendarTasks]);
  const todayCalendarTasks = useMemo<CalendarNotificationTask[]>(() => {
    const items = dashboardData?.calendarTasks ?? [];
    return items
      .filter((item) => item.dateLabel.toLowerCase() === 'today')
      .map((item) => {
        const targetTime = parseCalendarTaskTime(item) ?? notificationNow;
        return {
          ...item,
          targetTime,
          diffMs: targetTime.getTime() - notificationNow.getTime(),
        };
      })
      .sort((first, second) => first.targetTime.getTime() - second.targetTime.getTime());
  }, [dashboardData?.calendarTasks, notificationNow]);
  const upcomingCalendarTasks = todayCalendarTasks.filter((task) => task.diffMs >= 0);
  const missedCalendarTasks = todayCalendarTasks.filter((task) => task.diffMs < 0);
  const highlightedCalendarTask =
    upcomingCalendarTasks[0] ??
    [...missedCalendarTasks].sort((first, second) => second.targetTime.getTime() - first.targetTime.getTime())[0];
  const otherCalendarTasks = highlightedCalendarTask
    ? todayCalendarTasks.filter((task) => task.id !== highlightedCalendarTask.id)
    : todayCalendarTasks;
  const notificationCount = todayCalendarTasks.length;
  const firstName = user?.name?.split(' ')[0] || 'User';
  const plan = getStoredPlan();
  const trialActive = plan === 'trial_active' && localStorage.getItem('tucf_trial_active') === 'true';

  return (
    <div className="dashboard-page">
      {trialActive ? (
        <div
          style={{
            background: 'linear-gradient(90deg,#f97316,#ea580c)',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: '#ffffff',
            fontWeight: 500,
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span>⚡ Trial Active — dashboard fully unlocked</span>
          <TrialTimer inline={true} />
          <button
            type="button"
            onClick={() => navigate('/upgrade')}
            style={{
              background: '#ffffff',
              color: '#f97316',
              borderRadius: '6px',
              padding: '4px 12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Upgrade Now
          </button>
        </div>
      ) : null}

      <div className="dashboard-board">
        <section className="dashboard-main-panel dashboard-main-panel-full">
          <div className="dashboard-main-top">
            <div>
              <h1>Hello, {firstName}</h1>
              <p>{user?.email}</p>
            </div>

            <div className="dashboard-main-actions">
              <ThemeToggle />
              <button className="dashboard-icon-button" type="button" aria-label="Search">
                <Search size={18} />
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="dashboard-hidden-input"
                onChange={handleDashboardResumeUpload}
              />
              {dashboardData?.resume ? (
                <button
                  className="dashboard-primary-button"
                  type="button"
                  onClick={() => downloadStoredResume(dashboardData.resume!)}
                >
                  <Download size={16} />
                  Download Resume
                </button>
              ) : (
                <button
                  className="dashboard-primary-button"
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Upload Resume
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-project-grid">
            {atsCards.map((card) => (
              <article key={card.title} className={`dashboard-project-card ${card.colorClass}`}>
                <div className="dashboard-project-top">
                  <span className="dashboard-project-count">{card.value}</span>
                  <div className="dashboard-project-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <h3>{card.title}</h3>
                <p>{card.meta}</p>
                <div className="dashboard-project-progress">
                  <span
                    style={{
                      width:
                        card.value === '--' ? '18%' : `${Number.parseInt(card.value, 10) || 0}%`,
                    }}
                  ></span>
                </div>
              </article>
            ))}
          </div>

          <div className="dashboard-lower-grid">
            <div className="dashboard-section">
              <div className="dashboard-section-head">
                <h2>Tasks</h2>
                <button
                  className="dashboard-mini-action"
                  type="button"
                  aria-label="Add task"
                  onClick={openCreateTaskModal}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="dashboard-task-list">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <article key={task.id} className="dashboard-task-surface group relative overflow-hidden">
                      <span
                        className={`absolute inset-y-0 left-0 w-[6px] ${task.completed ? 'bg-[#8ed8df]' : 'bg-[#ff8a58]'}`}
                      ></span>

                      <div className="dashboard-task-row flex min-w-0 flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:pl-6">
                        <button
                          type="button"
                          onClick={() => toggleTaskComplete(task.id)}
                          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                          className="flex min-w-0 flex-1 items-start gap-4 text-left"
                        >
                          <span
                            className={`dashboard-task-toggle mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                              task.completed ? 'done' : ''
                            }`}
                          >
                            {task.completed ? <Plus size={12} /> : null}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="dashboard-task-title block truncate text-[1.05rem] font-semibold">
                              {task.title}
                            </span>
                            <span className="dashboard-task-description mt-1 block truncate text-sm">
                              {task.description || 'No description added yet.'}
                            </span>
                            <span className="dashboard-task-date-meta mt-2 block text-xs font-medium">
                              {task.dueDate ? `Due ${task.dueDate}` : 'No due date set'}
                            </span>
                          </span>
                        </button>

                        <div className="dashboard-task-row-actions flex flex-shrink-0 items-center justify-end gap-2 sm:justify-center">
                          <button
                            className="dashboard-task-action-button flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110"
                            type="button"
                            onClick={() => openEditTaskModal(task)}
                            aria-label="Edit task"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="dashboard-task-action-button danger flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110"
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            aria-label="Delete task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="dashboard-empty-card">
                    <p>No tasks yet for this user. Use the + button to create one.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-section-head">
                <h2>Statistics</h2>
              </div>
              <div className="dashboard-stat-grid">
                <div className="dashboard-stat-card">
                  <strong>{tasks.length}</strong>
                  <span>Total tasks</span>
                </div>
                <div className="dashboard-stat-card">
                  <strong>{tasks.filter((task) => task.completed).length}</strong>
                  <span>Completed tasks</span>
                </div>
                <div className="dashboard-stat-card">
                  <strong>{dashboardData?.resume ? 'Yes' : 'No'}</strong>
                  <span>Resume uploaded</span>
                </div>
                <div className="dashboard-plan-card">
                  <div className="dashboard-plan-copy">
                    <strong>{dashboardData?.atsMetrics?.score ?? '--'}</strong>
                    <span>{dashboardData?.atsMetrics ? '%' : ''}</span>
                    <h3>Latest ATS Result</h3>
                    <p>
                      {dashboardData?.atsMetrics
                        ? dashboardData.atsMetrics.resumeFileName
                        : 'Analyze a resume to see account-specific ATS data here.'}
                    </p>
                  </div>
                  <div className="dashboard-plan-illustration">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-head">
              <h2>All Modules</h2>
            </div>
            <div className="dashboard-module-grid">
              {moduleLinks.map((module) => {
                const Icon = module.icon;

                return (
                  <Link key={module.title} to={module.to} className={`dashboard-module-card ${module.accentClass}`}>
                    <div className="dashboard-module-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3>{module.title}</h3>
                      <p>{module.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="dashboard-calendar-rail">
          <div className="dashboard-calendar-top">
            <h2>Calendar</h2>
            <div className="dashboard-calendar-actions">
              <button
                className="dashboard-mini-action"
                type="button"
                aria-label="Add calendar task"
                onClick={openCreateCalendarModal}
              >
                <Plus size={16} />
              </button>
              <div className="dashboard-notification-wrap">
                <button
                  className="dashboard-icon-button light dashboard-notification-button"
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setIsNotificationOpen((current) => !current)}
                >
                  <Bell size={16} />
                  {notificationCount > 0 ? <span className="dashboard-notification-badge">{notificationCount}</span> : null}
                </button>

                {isNotificationOpen ? (
                  <div
                    className="dashboard-notification-panel"
                    style={{
                      width: '300px',
                      background: 'var(--bg-card, #1e1412)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      padding: 0,
                      overflow: 'hidden',
                      animation: 'notif-enter 200ms ease-out',
                    }}
                  >
                    <div
                      className="dashboard-notification-head"
                      style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>Notifications</span>
                      <span
                        style={{
                          background: '#f97316',
                          color: '#ffffff',
                          fontSize: '10px',
                          borderRadius: '999px',
                          padding: '2px 8px',
                          fontWeight: 700,
                        }}
                      >
                        {notificationCount}
                      </span>
                    </div>

                    {todayCalendarTasks.length === 0 ? (
                      <div
                        className="dashboard-notification-empty"
                        style={{
                          padding: '20px 16px',
                          color: 'rgba(255,255,255,0.35)',
                          fontSize: '13px',
                          textAlign: 'center',
                        }}
                      >
                        All caught up ✓
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              marginTop: '6px',
                              flexShrink: 0,
                              background: 'rgba(255,255,255,0.3)',
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#ffffff',
                                lineHeight: 1.5,
                                letterSpacing: '0.1px',
                                fontFamily: 'inherit',
                              }}
                            >
                              {upcomingCalendarTasks.length} tasks pending today
                            </div>
                          </div>
                        </div>

                        <div className="dashboard-notification-list">
                          {missedCalendarTasks.map((task) => (
                            <div
                              key={`missed-${task.id}`}
                              className="dashboard-notification-item"
                              style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  marginTop: '6px',
                                  flexShrink: 0,
                                  background: '#ef4444',
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    lineHeight: 1.5,
                                    letterSpacing: '0.1px',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  Missed: {task.task}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    color: 'rgba(255,255,255,0.6)',
                                    lineHeight: 1.5,
                                    marginTop: '3px',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  {formatCalendarTaskTimeLeft(task.diffMs)}
                                </div>
                              </div>
                            </div>
                          ))}

                          {upcomingCalendarTasks.map((task) => (
                            <div
                              key={`upcoming-${task.id}`}
                              className="dashboard-notification-item"
                              style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  marginTop: '6px',
                                  flexShrink: 0,
                                  background: '#f97316',
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    lineHeight: 1.5,
                                    letterSpacing: '0.1px',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  {task.time} {task.period} {task.task}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    color: 'rgba(255,255,255,0.6)',
                                    lineHeight: 1.5,
                                    marginTop: '3px',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  {formatCalendarTaskTimeLeft(task.diffMs)}
                                </div>
                              </div>
                            </div>
                          ))}

                          {highlightedCalendarTask && otherCalendarTasks.length === 0 ? (
                            <div
                              style={{
                                padding: '12px 16px',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  marginTop: '6px',
                                  flexShrink: 0,
                                  background: highlightedCalendarTask.diffMs < 0 ? '#ef4444' : '#f97316',
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    lineHeight: 1.5,
                                    letterSpacing: '0.1px',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  {highlightedCalendarTask.diffMs < 0
                                    ? `Missed: ${highlightedCalendarTask.task}`
                                    : `${highlightedCalendarTask.time} ${highlightedCalendarTask.period} ${highlightedCalendarTask.task}`}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    color: 'rgba(255,255,255,0.6)',
                                    lineHeight: 1.5,
                                    marginTop: '3px',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  {formatCalendarTaskTimeLeft(highlightedCalendarTask.diffMs)}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="dashboard-calendar-summary">
            <CalendarDays size={18} />
            <span>
              {dashboardData?.atsMetrics
                ? `Latest ATS analysis saved ${new Date(
                    dashboardData.atsMetrics.analyzedAt,
                  ).toLocaleDateString()}`
                : 'No ATS analysis saved yet'}
            </span>
          </div>

          <div className="dashboard-calendar-list">
            {calendarGroups.map((day) => (
              <section key={day.date} className="dashboard-calendar-day">
                <div className="dashboard-calendar-day-header">
                  <span>{day.date}</span>
                  <button type="button" aria-label="More options">
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

                      <div className="ml-2 flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#6a6078] transition-colors duration-200 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
                          aria-label="Edit calendar task"
                          onClick={() => openEditCalendarModal(item)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#6a6078] transition-colors duration-200 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
                          aria-label="Delete calendar task"
                          onClick={() => deleteCalendarTask(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>

      {isTaskModalOpen && (
        <div className="dashboard-modal-backdrop" onClick={closeTaskModal}>
          <div className="dashboard-task-modal" onClick={(event) => event.stopPropagation()}>
            <h2>{editingTaskId ? 'Edit Task' : 'Create Task'}</h2>
            <label>
              <span>Title</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Task title"
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                rows={4}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Task description"
              />
            </label>
            <label>
              <span>Due date</span>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </label>

            <div className="dashboard-task-modal-actions">
              <button type="button" className="dashboard-modal-secondary" onClick={closeTaskModal}>
                Cancel
              </button>
              <button type="button" className="dashboard-primary-button" onClick={saveTask}>
                {editingTaskId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalendarModalOpen && (
        <div className="dashboard-modal-backdrop" onClick={closeCalendarModal}>
          <div className="dashboard-task-modal" onClick={(event) => event.stopPropagation()}>
            <h2>{editingCalendarTaskId ? 'Edit Calendar Task' : 'Add Calendar Task'}</h2>
            <label>
              <span>Time</span>
              <input
                value={calendarDraft.time}
                onChange={(event) =>
                  setCalendarDraft((current) => ({ ...current, time: event.target.value }))
                }
                placeholder="09:30"
              />
            </label>
            <label>
              <span>AM / PM</span>
              <select
                value={calendarDraft.period}
                onChange={(event) =>
                  setCalendarDraft((current) => ({
                    ...current,
                    period: event.target.value as 'AM' | 'PM',
                  }))
                }
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </label>
            <label>
              <span>Task name</span>
              <input
                value={calendarDraft.task}
                onChange={(event) =>
                  setCalendarDraft((current) => ({ ...current, task: event.target.value }))
                }
                placeholder="Keyword targeting"
              />
            </label>

            <div className="dashboard-task-modal-actions">
              <button type="button" className="dashboard-modal-secondary" onClick={closeCalendarModal}>
                Cancel
              </button>
              <button type="button" className="dashboard-primary-button" onClick={saveCalendarTask}>
                {editingCalendarTaskId ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
