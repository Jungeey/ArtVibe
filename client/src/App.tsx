import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminCategoryPage from "./components/AdminCategoryPage";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { isLoggedIn, getUserRole } from "./utils/auth";
import HomePage from "./pages/HomePage";

// Optional future vendor pages (import later if needed)
// import VendorProductEdit from "./pages/VendorProductEdit";
// import VendorOrderPage from "./pages/VendorOrders";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string;
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6">
          <Routes>
            {/* Home */}
          <Route path="/" element={<HomePage />} />


            {/* Auth */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* User */}
            <Route path="/user-dashboard" element={<UserDashboard />} />

            {/* Vendor */}
            <Route
              path="/vendor-dashboard"
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Vendor future routes (for expansion) */}
            {/*
            <Route
              path="/vendor/products/edit/:id"
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorProductEdit />
                </ProtectedRoute>
              }
            />
            */}

            {/* Admin */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCategoryPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
