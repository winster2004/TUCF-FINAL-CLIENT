import React, { useState } from 'react';
import { Map, Code, Database, Globe, CheckCircle, Play, ExternalLink, BookOpen } from 'lucide-react';

type RoadmapKey = 'frontend' | 'backend' | 'dsa';

interface ResourceItem {
  title: string;
  platform: string;
  label: string;
  url: string;
}

const Roadmaps: React.FC = () => {
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapKey>('frontend');
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});

  const roadmaps = {
    frontend: {
      title: 'Frontend Development',
      icon: Globe,
      color: 'orange',
      sections: [
        {
          title: 'HTML & CSS Basics',
          items: [
            'HTML Structure & Semantics',
            'CSS Selectors & Properties',
            'Flexbox & Grid Layout',
            'Responsive Design',
            'CSS Animations',
          ],
        },
        {
          title: 'JavaScript Fundamentals',
          items: [
            'Variables & Data Types',
            'Functions & Scope',
            'DOM Manipulation',
            'Event Handling',
            'Async JavaScript',
          ],
        },
        {
          title: 'React.js',
          items: ['Components & JSX', 'State & Props', 'Hooks', 'Context API', 'React Router'],
        },
        {
          title: 'Advanced Topics',
          items: [
            'TypeScript',
            'State Management (Redux)',
            'Testing (Jest, RTL)',
            'Build Tools (Webpack, Vite)',
            'Performance Optimization',
          ],
        },
      ],
    },
    backend: {
      title: 'Backend Development',
      icon: Database,
      color: 'orange',
      sections: [
        {
          title: 'Server Fundamentals',
          items: [
            'HTTP Protocol',
            'RESTful APIs',
            'Authentication & Authorization',
            'Security Best Practices',
            'API Documentation',
          ],
        },
        {
          title: 'Node.js & Express',
          items: ['Node.js Runtime', 'Express Framework', 'Middleware', 'Route Handling', 'Error Handling'],
        },
        {
          title: 'Databases',
          items: ['SQL Basics', 'MongoDB', 'Database Design', 'ORMs & ODMs', 'Database Optimization'],
        },
        {
          title: 'DevOps & Deployment',
          items: [
            'Docker Basics',
            'CI/CD Pipelines',
            'Cloud Platforms (AWS)',
            'Monitoring & Logging',
            'Scaling Applications',
          ],
        },
      ],
    },
    dsa: {
      title: 'Data Structures & Algorithms',
      icon: Code,
      color: 'orange',
      sections: [
        {
          title: 'Basic Data Structures',
          items: [
            'Arrays & Strings',
            'Linked Lists',
            'Stacks & Queues',
            'Hash Tables',
            'Trees & Binary Trees',
          ],
        },
        {
          title: 'Advanced Data Structures',
          items: ['Binary Search Trees', 'Heaps', 'Graphs', 'Tries', 'Disjoint Set Union'],
        },
        {
          title: 'Algorithms',
          items: [
            'Sorting Algorithms',
            'Searching Algorithms',
            'Two Pointers',
            'Sliding Window',
            'Recursion & Backtracking',
          ],
        },
        {
          title: 'Advanced Algorithms',
          items: [
            'Dynamic Programming',
            'Graph Algorithms',
            'Greedy Algorithms',
            'String Algorithms',
            'Mathematical Algorithms',
          ],
        },
      ],
    },
  };

  const dsaSheets = [
    {
      name: 'Striver A2Z DSA Sheet',
      problems: 191,
      url: 'https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z',
      difficulty: 'Beginner to Advanced',
    },
    {
      name: 'LeetCode Top 150',
      problems: 150,
      url: 'https://leetcode.com/studyplan/top-interview-150/',
      difficulty: 'Interview Focused',
    },
    {
      name: 'NeetCode 150',
      problems: 150,
      url: 'https://neetcode.io/practice/practice/neetcode150',
      difficulty: 'System Design + Coding',
    },
    {
      name: 'GFG Must Do Problems',
      problems: 450,
      url: 'https://www.geeksforgeeks.org/courses/gfg-160-series',
      difficulty: 'All Levels',
    },
  ];

  // Recommended resources are grouped by roadmap key so frontend/backend/dsa never mix.
  const resources: Record<RoadmapKey, ResourceItem[]> = {
    frontend: [
      {
        title: 'JavaScript Complete Course',
        platform: 'Course',
        label: 'Frontend fundamentals',
        url: 'https://www.udemy.com/topic/javascript/',
      },
      {
        title: 'React Official Documentation',
        platform: 'Documentation',
        label: 'Self-paced guide',
        url: 'https://react.dev/learn',
      },
      {
        title: 'Advanced CSS & Sass',
        platform: 'Course',
        label: 'Styling and layout',
        url: 'https://www.udemy.com/course/advanced-css-and-sass/',
      },
      {
        title: 'Frontend System Design',
        platform: 'Course',
        label: 'Architecture and scaling',
        url: 'https://www.udemy.com/course/frontend-system-design/',
      },
    ],
    backend: [
      {
        title: 'Node.js, Express & MongoDB Bootcamp',
        platform: 'Course',
        label: 'API and database stack',
        url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/',
      },
      {
        title: 'Backend Engineering with Node.js',
        platform: 'Course',
        label: 'Backend foundations',
        url: 'https://www.udemy.com/courses/search/?q=backend%20engineering%20nodejs',
      },
      {
        title: 'Microservices with Node.js',
        platform: 'Course',
        label: 'Distributed services',
        url: 'https://www.udemy.com/course/microservices-with-node-js-and-react/',
      },
      {
        title: 'REST API Design',
        platform: 'Course',
        label: 'API design patterns',
        url: 'https://www.udemy.com/course/rest-api-design/',
      },
    ],
    dsa: [
      {
        title: 'Data Structures & Algorithms Masterclass',
        platform: 'Course',
        label: 'Core DSA foundations',
        url: 'https://www.udemy.com/course/datastructurescncpp/',
      },
      {
        title: 'Master the Coding Interview',
        platform: 'Course',
        label: 'Interview-focused practice',
        url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/',
      },
      {
        title: 'Java DSA Course',
        platform: 'Course',
        label: 'Java problem solving',
        url: 'https://www.udemy.com/course/java-data-structures-and-algorithms/',
      },
      {
        title: 'Python DSA Course',
        platform: 'Course',
        label: 'Python algorithms track',
        url: 'https://www.udemy.com/course/data-structures-and-algorithms-python/',
      },
    ],
  };

  const toggleProgress = (item: string) => {
    setProgress((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const getCompletionPercentage = (roadmapKey: RoadmapKey) => {
    const roadmap = roadmaps[roadmapKey];
    const totalItems = roadmap.sections.reduce((acc, section) => acc + section.items.length, 0);
    const completedItems = roadmap.sections.reduce(
      (acc, section) => acc + section.items.filter((item) => progress[item]).length,
      0,
    );
    return Math.round((completedItems / totalItems) * 100);
  };

  const currentRoadmap = roadmaps[selectedRoadmap];
  const Icon = currentRoadmap.icon;
  // Conditional rendering based on selected roadmap ensures only the matching courses appear.
  const currentResources = resources[selectedRoadmap];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Learning Roadmaps
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Structured learning paths for your career growth
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="tucf-card" style={{ padding: '16px' }}>
            <h2 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
              Choose Roadmap
            </h2>
            <div className="space-y-2">
              {(Object.entries(roadmaps) as [RoadmapKey, (typeof roadmaps)[RoadmapKey]][]).map(([key, roadmap]) => {
                const RoadmapIcon = roadmap.icon;
                const isSelected = selectedRoadmap === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRoadmap(key)}
                    className={`w-full rounded-lg p-3 text-left transition-all ${
                      isSelected ? 'text-white' : ''
                    } flex items-center space-x-3`}
                    style={
                      isSelected
                        ? { background: 'rgba(255,122,0,0.15)', color: 'var(--accent)' }
                        : { color: 'var(--text-secondary)' }
                    }
                  >
                    <RoadmapIcon className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{roadmap.title}</p>
                      <p
                        className="text-xs"
                        style={{ color: isSelected ? 'var(--accent)' : 'var(--text-secondary)' }}
                      >
                        {getCompletionPercentage(key)}% complete
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tucf-card" style={{ padding: '16px' }}>
            <h2 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
              Progress
            </h2>
            <div className="space-y-3">
              {(Object.entries(roadmaps) as [RoadmapKey, (typeof roadmaps)[RoadmapKey]][]).map(([key, roadmap]) => {
                const percentage = getCompletionPercentage(key);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>{roadmap.title}</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="tucf-progress-track mt-1">
                      <div className="tucf-progress-fill transition-all" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="tucf-card">
            <div className="mb-6 flex flex-wrap items-center space-x-3">
              <div className="rounded-lg p-3" style={{ background: 'rgba(255,122,0,0.14)' }}>
                <Icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {currentRoadmap.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {getCompletionPercentage(selectedRoadmap)}% Complete •{' '}
                  {currentRoadmap.sections.reduce((acc, section) => acc + section.items.length, 0)} Topics
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {currentRoadmap.sections.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  className="border-l-4 pl-4"
                  style={{ borderLeftColor: 'var(--border)' }}
                >
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex cursor-pointer items-center space-x-3 rounded-lg p-2"
                        style={{ background: '#0f0f0f' }}
                        onClick={() => toggleProgress(item)}
                      >
                        <button
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            progress[item]
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-[#303030] hover:border-orange-500'
                          }`}
                        >
                          {progress[item] && <CheckCircle className="h-3 w-3 text-white" />}
                        </button>
                        <span
                          className={`text-sm ${progress[item] ? 'line-through' : ''}`}
                          style={{ color: progress[item] ? '#6b7280' : 'var(--text-secondary)' }}
                        >
                          {item}
                        </span>
                        <div className="flex-1"></div>
                        <button className="transition-colors" style={{ color: 'var(--accent)' }}>
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedRoadmap === 'dsa' && (
            <div className="tucf-card">
              <h2
                className="mb-4 flex items-center text-xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <BookOpen className="mr-2 h-5 w-5" style={{ color: 'var(--accent)' }} />
                Popular DSA Sheets
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {dsaSheets.map((sheet, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-4 transition-colors"
                    style={{ background: '#0f0f0f', border: '1px solid var(--border)' }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {sheet.name}
                      </h3>
                      <a
                        href={sheet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${sheet.name}`}
                        className="transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {sheet.problems} problems
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {sheet.difficulty}
                    </p>
                    <a
                      href={sheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tucf-btn-primary mt-3 flex w-full items-center justify-center rounded-md py-2 text-sm text-white transition-colors"
                    >
                      Start Practicing
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tucf-card">
            <h2
              className="mb-4 flex items-center text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              <Play className="mr-2 h-5 w-5" style={{ color: 'var(--accent)' }} />
              Recommended Resources
            </h2>
            <div className="space-y-3">
              {currentResources.map((resource) => (
                // Proper anchor behavior opens the resource in a new tab and keeps the dashboard session intact.
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#0f0f0f', borderColor: 'var(--border)' }}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                      {resource.title}
                    </h3>
                    <div
                      className="mt-1 flex flex-wrap items-center gap-3 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span
                        className="rounded px-2 py-1 text-xs transition-colors group-hover:bg-[rgba(255,122,0,0.18)]"
                        style={{ background: 'rgba(255,122,0,0.12)', color: 'var(--accent)' }}
                      >
                        {resource.platform}
                      </span>
                      <span>{resource.label}</span>
                    </div>
                  </div>
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
                    style={{ background: 'rgba(255,122,0,0.08)', color: 'var(--accent)' }}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;
