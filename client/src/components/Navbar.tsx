import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserRole, isLoggedIn, logout } from '../utils/auth';

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Update auth state whenever the component renders
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setRole(getUserRole());
  }); // Remove dependency array to run on every render

  // Alternative: Update auth state on route changes
  // useEffect(() => {
  //   setLoggedIn(isLoggedIn());
  //   setRole(getUserRole());
  // }, [navigate]); // Run when navigation occurs

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setRole(null);
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl hover:text-blue-200 transition duration-200">
          Art Vibe
        </Link>
        
        <div className="space-x-6 flex items-center">
          <Link to="/" className="hover:text-blue-200 transition duration-200 font-medium">
            Home
          </Link>

          {!loggedIn ? (
            <>
              <Link 
                to="/login" 
                className="hover:text-blue-200 transition duration-200 font-medium"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition duration-200 font-medium"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Dashboard Links based on role */}
              {role === 'admin' && (
                <Link 
                  to="/admin-dashboard" 
                  className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium"
                >
                  Admin Dashboard
                </Link>
              )}
              {role === 'vendor' && (
                <Link 
                  to="/vendor-dashboard" 
                  className="bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-200 font-medium"
                >
                  Vendor Dashboard
                </Link>
              )}
              {role === 'user' && (
                <Link 
                  to="/user-dashboard" 
                  className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                >
                  User Dashboard
                </Link>
              )}

              {/* User role indicator */}
              <span className="text-blue-200 font-medium capitalize">
                ({role})
              </span>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}