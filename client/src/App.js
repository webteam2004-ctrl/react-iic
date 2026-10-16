import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Public Lazy Page Components
const Home = React.lazy(() => import('./pages/home'));
const Calender = React.lazy(() => import('./pages/calender/calender'));
const Contact = React.lazy(() => import('./pages/contact/contact'));
const Events = React.lazy(() => import('./pages/events/events'));
const Gallery = React.lazy(() => import('./pages/gallery/gallery'));
const Teams = React.lazy(() => import('./pages/teams/teams'));
const About = React.lazy(() => import('./pages/about/about'));
const IdeaHub = React.lazy(() => import('./pages/ideabank/ideabank'));
const AdminLogin = React.lazy(() => import('./pages/adminLogin/AdminLogin'));
const AdminChallenges = React.lazy(() => import('./pages/AdminChallenges/AdminChallenges'));
const PageNotFound = React.lazy(() => import('./pages/PageNotFound'));

// Admin Dashboard Components
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminEvents = React.lazy(() => import('./pages/admin/AdminEvents'));
const AdminCalendar = React.lazy(() => import('./pages/admin/AdminCalendar'));
const AdminGallery = React.lazy(() => import('./pages/admin/AdminGallery'));
const AdminPipeline = React.lazy(() => import('./pages/admin/AdminPipeline'));
const AdminTeams = React.lazy(() => import('./pages/admin/AdminTeams'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminIdeaHub = React.lazy(() => import('./pages/admin/AdminIdeaHub'));
const AdminAccessDenied = React.lazy(() => import('./pages/admin/AdminAccessDenied'));
const ManageHome = React.lazy(() => import('./pages/admin/ManageHome'));
const AdminContactMessages = React.lazy(() => import('./pages/admin/AdminContactMessages'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense
            fallback={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                  color: '#312e81',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              >
                Loading IIC Portal...
              </div>
            }
          >
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/calender" element={<Calender />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/ideahub" element={<IdeaHub />} />
              <Route path="/ideabank" element={<IdeaHub />} />
              <Route path="/idea" element={<IdeaHub />} />
              <Route path="/about" element={<About />} />

              {/* Authentication Routes */}
              <Route path="/admin-portal-login" element={<AdminLogin />} />
              <Route path="/admin/login" element={<Navigate to="/admin-portal-login" replace />} />

              {/* Legacy SIH Challenge Admin Review Portal Route */}
              <Route
                path="/admin-challenges"
                element={
                  <ProtectedRoute>
                    <AdminChallenges />
                  </ProtectedRoute>
                }
              />

              {/* Modern IIC Admin Dashboard Routes (Protected with RBAC) */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Navigate to="events" replace />} />

                <Route
                  path="events"
                  element={
                    <AdminProtectedRoute requiredModule="events" requiredAction="read">
                      <AdminEvents />
                    </AdminProtectedRoute>
                  }
                />

                <Route
                  path="calendar"
                  element={
                    <AdminProtectedRoute requiredModule="calendar" requiredAction="read">
                      <AdminCalendar />
                    </AdminProtectedRoute>
                  }
                />

                <Route
                  path="gallery"
                  element={
                    <AdminProtectedRoute requiredModule="gallery" requiredAction="read">
                      <AdminGallery />
                    </AdminProtectedRoute>
                  }
                />

                <Route
                  path="pipeline"
                  element={
                    <AdminProtectedRoute requiredModule="events" requiredAction="read">
                      <AdminPipeline />
                    </AdminProtectedRoute>
                  }
                />

                <Route
                  path="ideahub"
                  element={
                    <AdminProtectedRoute requiredModule="idea_hub" requiredAction="read">
                      <AdminIdeaHub />
                    </AdminProtectedRoute>
                  }
                />

                <Route
                  path="teams"
                  element={
                    <AdminProtectedRoute requiredModule="teams" requiredAction="read">
                      <AdminTeams />
                    </AdminProtectedRoute>
                  }
                />

                <Route
                  path="contact-messages"
                  element={
                    <AdminProtectedRoute requiredModule="contact_messages" requiredAction="read">
                      <AdminContactMessages />
                    </AdminProtectedRoute>
                  }
                />

                {/* Super Admin Restricted User Management */}
                <Route
                  path="users"
                  element={
                    <AdminProtectedRoute requiredRole="super_admin">
                      <AdminUsers />
                    </AdminProtectedRoute>
                  }
                />

                <Route path="access-denied" element={<AdminAccessDenied />} />
              </Route>

              <Route
                path="/managehome"
                element={
                  <AdminProtectedRoute requiredModule="manage_home" requiredAction="read">
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <AdminProtectedRoute requiredModule="manage_home" requiredAction="read">
                      <ManageHome />
                    </AdminProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
