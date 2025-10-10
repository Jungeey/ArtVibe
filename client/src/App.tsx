import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserDashboard from "./pages/ProfilePage";
import AdminCategoryPage from "./components/AdminCategoryPage";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { isLoggedIn, getUserRole } from "./utils/auth";
import ProductPage from "./pages/ProductPage";
import PurchasePage from "./pages/PurchasePage";
import ProductDetailPage from "./components/ProductDetailPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
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
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/purchase/:id" element={<PurchasePage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/faqs" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutUs />} />

              {/* Auth */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* User */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Vendor */}
              <Route
                path="/vendor-dashboard"
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />

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

              <Route path="/payment/success" element={<PaymentSuccess />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;