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
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { isLoggedIn, getUserRole } from "./utils/auth";

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
            <Route path="/" element={
                <h1 className="text-3xl font-bold">Welcome to Art Vibe</h1>
              }
            />

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* User Dashboard - accessible to all logged-in users */}
            <Route path="/user-dashboard" element={<UserDashboard />} />

            {/* Vendor Dashboard - only for vendors */}
            <Route path="/vendor-dashboard" element={ <ProtectedRoute requiredRole="vendor"> <VendorDashboard /> </ProtectedRoute> } />

            {/* Admin Dashboard - only for admins */}
            <Route path="/admin-dashboard" element={ <ProtectedRoute requiredRole="admin"> <AdminDashboard /> </ProtectedRoute> } />
            
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
