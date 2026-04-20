import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import TrialFlow from "./components/TrialFlow";
import TrialTimer from "./components/TrialTimer";
import { usePlanState } from "./hooks/usePlanState";
import { isFeatureUnlocked } from "./lib/plan";
import { AuthProvider } from "./contexts/AuthContext";
import { initializeTheme } from "./lib/theme";
import "./App.css";
import "./Card.css";

const RoleDashboard = lazy(() => import("./pages/RoleDashboard"));
const JobSearch = lazy(() => import("./pages/JobSearch"));
const ATSScoring = lazy(() => import("./pages/ATSScoring"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Roadmaps = lazy(() => import("./pages/Roadmaps"));
const CoverLetterGenerator = lazy(() => import("./pages/CoverLetterGenerator"));
const InterviewPrep = lazy(() => import("./pages/InterviewPrep"));
const RoadmapGenerator = lazy(() => import("./pages/RoadmapGenerator"));
const ChatbotAssistant = lazy(() => import("./pages/ChatbotAssistant"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Landing = lazy(() => import("./pages/Landing"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Checkout = lazy(() => import("./pages/Checkout"));

function LockedRoute({
  children,
  onBlocked,
  path,
}: {
  children: React.ReactNode;
  onBlocked: () => void;
  path: string;
}) {
  const plan = usePlanState();
  const unlocked = isFeatureUnlocked(path, plan);

  useEffect(() => {
    if (!unlocked) {
      onBlocked();
    }
  }, [onBlocked, unlocked]);

  if (!unlocked) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function ProtectedAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-root">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`app-main ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [trialStep, setTrialStep] = useState(0);
  const [showUpgradeToast, setShowUpgradeToast] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);

  const showLockedRouteToast = () => {
    setShowUpgradeToast(true);
    window.setTimeout(() => setShowUpgradeToast(false), 3000);
  };

  return (
    <Router>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="loading-shell">
              <div className="loading-spinner"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Landing onRequestDemo={() => setTrialStep(1)} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/checkout" element={<Checkout />} />

            <Route
              element={
                <ProtectedRoute>
                  <ProtectedAppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<RoleDashboard />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route
                path="/ats"
                element={
                  <LockedRoute onBlocked={showLockedRouteToast} path="/ats">
                    <ATSScoring />
                  </LockedRoute>
                }
              />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route
                path="/roadmaps"
                element={
                  <LockedRoute onBlocked={showLockedRouteToast} path="/roadmaps">
                    <Roadmaps />
                  </LockedRoute>
                }
              />
              <Route path="/cover-letter" element={<CoverLetterGenerator />} />
              <Route path="/interview-prep" element={<InterviewPrep />} />
              <Route
                path="/roadmap-generator"
                element={
                  <LockedRoute onBlocked={showLockedRouteToast} path="/roadmap-generator">
                    <RoadmapGenerator />
                  </LockedRoute>
                }
              />
              <Route
                path="/resume-builder"
                element={
                  <LockedRoute onBlocked={showLockedRouteToast} path="/resume-builder">
                    <ResumeBuilder />
                  </LockedRoute>
                }
              />
              <Route path="/ai-assistant" element={<ChatbotAssistant />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <TrialFlow trialStep={trialStep} setTrialStep={setTrialStep} />
          <TrialTimer />

          {showUpgradeToast ? (
            <div
              style={{
                position: "fixed",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#2a1a12",
                borderLeft: "3px solid #f97316",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "13px",
                color: "#ffffff",
                zIndex: 9999,
                animation: "toast-in 200ms ease-out, toast-out 200ms ease-in 2800ms forwards",
              }}
            >
              ⚡ Upgrade to Pro to access this feature
            </div>
          ) : null}
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
