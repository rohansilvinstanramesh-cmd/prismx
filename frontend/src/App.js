import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import GeoMap from './pages/GeoMap';
import AIAdvisor from './pages/AIAdvisor';
import Forecast from './pages/Forecast';
import Targets from './pages/Targets';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import NotificationCenter from './components/NotificationCenter';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#09090B]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/60 border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500 font-medium">PRISMX ANALYTICS</h2>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">System Active</span>
            </div>
          </div>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Sales />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Customers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/geo"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GeoMap />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-advisor"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AIAdvisor />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forecast"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Forecast />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/targets"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Targets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#27272a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;