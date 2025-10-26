import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import "./App.css";
import "./Base.css";
import { useAuth } from "./contexts/AuthContext";

// Auth Components
import Login from "./auth/Login";
import Register from "./auth/Register";

// Layout and Core Components
import Layout from "./Layout";
import Loading from "./components/Loading";
import BottomBar from "./components/BottomBar";
import StoreFront from './pages/StoreFront';

// Import bottom bar pages
import HomePage from './pages/HomePage';
import Create from './pages/Create';
import Automation from './pages/Automation';
import FlowBuilder from './pages/FlowBuilder';
import Collab from './pages/Collaboration';
import WhoAreYou from './pages/WhoAreYou';
import BioLink from './pages/BioLink';
import PublicBioLink from './pages/PublicBioLink';
import Affiliate from './pages/Affiliate';
import UGCContent from './pages/UGCContent';
import Events from './pages/Events';
import Campaigns from './pages/Campaigns';
import Profile from './User/Profile';
import PaymentSuccess from './pages/PaymentSuccess';

// Brand Components
import BrandLogin from './Brand/BrandLogin';
import BrandLayout from './Brand/BrandLayout';
import { BrandProvider } from './Brand/BrandContext';
import BrandHome from './Brand/BrandHome';
import BrandInbox from './Brand/BrandInbox';
import CreatorProfile from './Brand/CreatorProfile';

// Brand Pages
import Analytics from './pages/Analytics';
import Collaborations from './pages/Collaborations';
import Finance from './pages/Finance';
import Growth from './pages/Growth';

// Legal Documents
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import DataDeletionPolicy from './pages/DataDeletionPolicy';

function RouteContent() {
  const { pageId, subPageId } = useParams();
 
}

function App() {
  const { isAuthenticated, user, token, logout } = useAuth();

  // Private route guard
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };



  console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  console.log('All env variables:', import.meta.env);
  console.log("hi there");



  return (
    <Router>
      <div className="app">
        <main className="container">
          <Routes>
            {/* Authentication Routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Register />
                )
              }
            />

            {/* Protected Routes with BottomBar */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <HomePage />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/StoreFront"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <StoreFront />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/Create"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <Create />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/Automation"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <Automation />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/FlowBuilder"
              element={
                <PrivateRoute>
                  <Layout onLogout={logout}>
                    <FlowBuilder />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/Collab"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <Collab />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/Affiliate"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <Affiliate />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/UGC"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <UGCContent />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/Events"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <Events />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/Campaigns"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <Campaigns />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <Profile />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />


            {/* Dynamic Route Content with BottomBar */}
            <Route
              path="/:pageId/:subPageId"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <RouteContent />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            {/* BioLink Routes */}
            <Route
              path="/biolink"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <BioLink />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            {/* Public BioLink View */}
            <Route path="/p/:username" element={<PublicBioLink />} />
            
            {/* Payment Success Route */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            
            {/* Legal Documents Routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/data-deletion-policy" element={<DataDeletionPolicy />} />
            
            <Route
              path="/biolink/:subPageId"
              element={
                <PrivateRoute>
                  <>
                    <Layout onLogout={logout}>
                      <BioLink />
                    </Layout>
                    <BottomBar />
                  </>
                </PrivateRoute>
              }
            />

            {/* Brand Login Route */}
            <Route
              path="/brand/login"
              element={<BrandLogin />}
            />

            {/* Brand Dashboard Routes */}
            <Route
              path="/brand"
              element={
                <BrandProvider>
                  <BrandLayout />
                </BrandProvider>
              }
            >
              <Route index element={<BrandHome />} />
              <Route path="home" element={<BrandHome />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="collaborations" element={<Collaborations />} />
              <Route path="finance" element={<Finance />} />
              <Route path="inbox" element={<BrandInbox />} />
              <Route path="growth" element={<Growth />} />
              <Route path="creator-profile" element={<CreatorProfile />} />
            </Route>

            {/* Brand Dashboard Default Route */}
            <Route 
              path="/brand-login" 
              element={<Navigate to="/brand/login" replace />}
            />

            {/* 404 Redirect */}
            <Route 
              path="*" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;