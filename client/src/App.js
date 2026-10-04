import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
// Lazy load page components
const Home = React.lazy(() => import('./pages/home'));
const Calender = React.lazy(() => import('./pages/calender/calender'));
const Contact = React.lazy(() => import('./pages/contact/contact'));
const Events = React.lazy(() => import('./pages/events/events'));
const Gallery = React.lazy(() => import('./pages/gallery/gallery'));
const Teams = React.lazy(() => import('./pages/teams/teams'));
const About = React.lazy(() => import('./pages/about/about'));
const IdeaHub = React.lazy(() => import('./pages/ideabank/ideabank'));
const AdminLogin = React.lazy(() => import('./pages/adminLogin/AdminLogin'));
const AdminChallenges = React.lazy(() =>
  import('./pages/AdminChallenges/AdminChallenges')
);
const PageNotFound = React.lazy(() => import('./pages/PageNotFound'));

function App() {
  return (
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
                color: '#2E2A8F',
                fontSize: '1.2rem',
                fontWeight: 600
              }}
            >
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calender" element={<Calender />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/ideahub" element={<IdeaHub />} />
            <Route path="/ideabank" element={<IdeaHub />} />
            <Route path="/idea" element={<IdeaHub />} />
            <Route
              path="/admin-portal-login"
              element={<AdminLogin />}
            />

            {/* SIH Challenge Admin Review Portal */}
            <Route
              path="/admin-challenges"
              element={
                <ProtectedRoute>
                  <AdminChallenges />
                </ProtectedRoute>
              }
            />

            <Route path="/about" element={<About />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;