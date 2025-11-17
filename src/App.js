import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Route, BrowserRouter as Router, Routes, useSearchParams } from "react-router-dom";
import './i18n'; // 👈 import your i18n setup
import { setupIPhoneDetection } from './utils/iphoneFix';

import AdminAddInstructor from './AdminAddInstructor';
import AdminAddProduct from "./AdminAddProduct";
import CO2ePortalAdminAuditToolkit from './AdminAuditToolkit/AdminAuditToolkit';
import AdminCourseUpload from './AdminCourseUpload';
import AdminDirectoryUpload from './AdminDirectoryUpload';
import AdminFeaturedListing from './AdminFeaturedListing';
import AdminManageGuide from "./AdminManageGuide";
import AdminManageUser from "./AdminManageUser";
import AdminRoute from "./AdminRoute";
import AdminServiceImages from './AdminServiceImages';
import CO2ePortalAuditToolkit from './AuditToolkit/AuditToolkit';
import Blog2 from "./Blog2/Blog2";
import BlogDetails from "./Blog2/BlogDetails";
import NewsDetails from "./Blog2/NewsDetails";
import BlogDashboard from "./BlogDashboard/BlogDashboard";
import BuyCourses from './BuyCourses';
import { CartProvider } from "./CartContext";
import Contact from './Contact';
import Courses from './Courses';
import Dashboard from "./Dashboard/Dashboard";
import DirectoryListing from './DirectoryListing';
import Home from "./Home/Home";
import { LoadingProvider, useLoading } from "./LoadingContext";
import Login from "./Login/Login";
import NewsDashboard from "./NewsDashboard/NewsDashboard";
import Plan from "./Plan/Plan";
import Product from "./Product/Product";
import ResetPassword from './ResetPassword';
import Services from "./Services/Services";
import Signup from "./Signup/Signup";
import Slots from './Slots';
import Trading from "./Trading/Trading";
import GSAPProvider from './components/GSAPProvider';
import IPhoneTest from './components/IPhoneTest';
import LoadingSpinner from "./components/LoadingSpinner";

const redirectRoutes = {
  subscription: "/pricing",
  product: "/products",
};

function SuccessRedirect() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    const redirectURL = redirectRoutes[type] || "/";
    setTimeout(() => {
      window.location.href = redirectURL;
    }, 3000);
  }, []);
  return <div style={{ textAlign: 'center', marginTop: 100 }}><h1>Payment Successful!</h1><p>Redirecting...</p></div>;
}

function CancelRedirect() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    const redirectURL = redirectRoutes[type] || "/";
    setTimeout(() => {
      window.location.href = redirectURL;
    }, 3000);
  }, []);
  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>Payment Cancelled</h1>
      <p>Your payment was cancelled. Redirecting back to pricing...</p>
    </div>
  );
}

function AppContent() {
  const { i18n } = useTranslation();
  const { isLoading, loadingMessage } = useLoading();

  // Setup iPhone Safari detection on app startup
  useEffect(() => {
    // Only setup iPhone detection if not on login page
    const isLoginPage = window.location.pathname === '/login';
    if (!isLoginPage) {
      setupIPhoneDetection();
    }
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Router>
      {/* 🌍 Language Switcher UI */}

      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/trade" element={<Trading />} />
          <Route path="/service" element={<Services />} />
          <Route path="/news" element={<Blog2 />} />
          <Route path="/pricing" element={<Plan />} />
          <Route path="/products" element={<Product />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/news/:id" element={<NewsDetails />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/upload-courses" element={<AdminCourseUpload />} />
          <Route path="/courses" element={<Courses />} />
          
          <Route path="/success" element={<SuccessRedirect />} />
          <Route path="/buy-courses" element={<BuyCourses />} />
          <Route path="/directory" element={<DirectoryListing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cancel" element={<CancelRedirect />} />
          <Route path="/iphone-test" element={<IPhoneTest />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/audit-toolkit" element={ <CO2ePortalAuditToolkit /> }/>


          {/* Admin Routes */}
          {/* <Route path="/admin/featured-listing" element={<AdminFeaturedListing />} /> */}
          <Route path="/admin/add-instructor" element={<AdminRoute><AdminAddInstructor /></AdminRoute>} />
          <Route path="/admin/add-product" element={<AdminRoute><AdminAddProduct /></AdminRoute>} />
          <Route path="/admin/audit-toolkit" element={<AdminRoute><CO2ePortalAdminAuditToolkit /></AdminRoute>} />
          <Route path="/admin/manage-user" element={<AdminRoute><AdminManageUser /></AdminRoute>} />
          <Route path="/admin/manage-guide" element={<AdminRoute><AdminManageGuide /></AdminRoute>} />
          <Route path="/admin/directory-upload" element={<AdminRoute><AdminDirectoryUpload /></AdminRoute>} />
          <Route path="/admin/featured-listing" element={<AdminRoute><AdminFeaturedListing /></AdminRoute>} />
          <Route path="/admin/service-images" element={<AdminRoute><AdminServiceImages /></AdminRoute>} />
          <Route path="/slots" element={<Slots />} />

          
          <Route
            path="/Articles"
            element={<AdminRoute><Dashboard /></AdminRoute>}
          />
          <Route
            path="/AddNews"
            element={<AdminRoute><NewsDashboard /></AdminRoute>}
          />
          <Route
            path="/AddBlog"
            element={<AdminRoute><BlogDashboard /></AdminRoute>}
          />
        </Routes>
      </CartProvider>

      {/* Global Loading Spinner */}
      {isLoading && <LoadingSpinner message={loadingMessage} />}
    </Router>
  );
}

function App() {
  return (
    <GSAPProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </GSAPProvider>
  );
}

export default App;
