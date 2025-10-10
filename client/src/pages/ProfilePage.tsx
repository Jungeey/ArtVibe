import React, { useState } from 'react';
import UserProfileForm from '../components/UserProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { getUser, VendorVerificationStatus } from '../utils/auth';
import type { User } from '../utils/auth'; 
import { toast } from 'react-toastify';

// Define a more complete user type for this component
interface AppUser extends User {
  verificationStatus?: 'pending' | 'approved' | 'suspended';
  vendorVerified?: boolean;
  businessName?: string;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'orders'>('profile');
  const currentUser = getUser() as AppUser | null; // Cast to our extended type

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'password', name: 'Password', icon: '🔒' },
    { id: 'orders', name: 'Orders', icon: '📦' },
  ];

  const handleProfileUpdate = (userData: any) => {
    console.log('Profile updated:', userData);
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChangeSuccess = () => {
    toast.success('Password changed successfully!');
  };

  const handlePasswordChangeCancel = () => {
    setActiveTab('profile');
  };

  // Get verification status for vendors only - FIXED VERSION
  const getVerificationStatus = () => {

    console.log('Current user:', currentUser);
    if (currentUser?.role !== 'vendor') {
      return null;
    }
    
    // Now safely access verificationStatus since we know it's a vendor
    const status = VendorVerificationStatus();
    console.log('Vendor verification status:', status);
    
    switch (status) {
      case 'approved':
        return { status: 'approved', display: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'pending':
        return { status: 'pending', display: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'rejected':
        return { status: 'rejected', display: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'suspended':
        return { status: 'suspended', display: 'Suspended', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      default:
        return { status: 'pending', display: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
  };

  const verificationInfo = getVerificationStatus();
  const isVendor = currentUser?.role === 'vendor';
  const isAdmin = currentUser?.role === 'admin';

  // Safe user data access
  const userName = currentUser?.name || 'User';
  const userEmail = currentUser?.email || 'No email';
  const userRole = currentUser?.role || 'user';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userName}! Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <span className="text-lg mr-3">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* User Info Card */}
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">
                      {userInitial}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-600">{userEmail}</p>
                    <p className={`text-xs capitalize mt-1 bg-white px-2 py-1 rounded-full inline-block ${
                      isAdmin 
                        ? 'text-purple-600 border border-purple-200'
                        : isVendor
                        ? 'text-orange-600 border border-orange-200'
                        : 'text-blue-600 border border-blue-200'
                    }`}>
                      {userRole} Account
                    </p>
                  </div>
                </div>
                
                {/* Vendor-specific status - ONLY FOR VENDORS */}
                {isVendor && verificationInfo && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Verification Status:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${verificationInfo.color}`}>
                          {verificationInfo.display}
                        </span>
                      </div>
                      
                      {/* Vendor verification badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Verified Vendor:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                          currentUser?.vendorVerified
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {currentUser?.vendorVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin badge - ONLY FOR ADMINS */}
                {isAdmin && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Admin Access:</span>
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full border border-purple-200">
                        Full Access
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
              </div>

              {/* Role-specific quick actions */}
              <div className="mt-4 space-y-2">
                {isVendor && (
                  <button
                    onClick={() => window.location.href = '/vendor-dashboard'}
                    className="w-full bg-orange-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-600 transition duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">🏪</span>
                    Vendor Dashboard
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => window.location.href = '/admin-dashboard'}
                    className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-600 transition duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">⚙️</span>
                    Admin Panel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                      <p className="text-gray-600 mt-1">
                        {isVendor 
                          ? 'Manage your vendor profile and business information' 
                          : isAdmin
                          ? 'Manage your administrator profile'
                          : 'Manage your personal information'
                        }
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isVendor ? 'bg-orange-100' : isAdmin ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <span className={`text-lg ${
                        isVendor ? 'text-orange-600' : isAdmin ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {isVendor ? '🏪' : isAdmin ? '⚙️' : '👤'}
                      </span>
                    </div>
                  </div>
                  <UserProfileForm onUpdate={handleProfileUpdate} />
                </div>

                {/* Vendor-specific information */}
                {isVendor && verificationInfo && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Vendor Account Information
                    </h3>
                    <p className="text-orange-700 text-sm">
                      {verificationInfo.status === 'approved' 
                        ? '✅ Your vendor account is approved and active. You can now list products and manage orders.'
                        : verificationInfo.status === 'pending'
                        ? '⏳ Your vendor application is being reviewed. You will be notified once approved.'
                        : verificationInfo.status === 'rejected'
                        ? '❌ Your vendor application was rejected. Please contact support for more information.'
                        : '📝 Complete your vendor profile to get started with selling on our platform.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                      <p className="text-gray-600 mt-1">Secure your account with a new password</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">🔒</span>
                    </div>
                  </div>
                  <ChangePasswordForm 
                    onSuccess={handlePasswordChangeSuccess}
                    onCancel={handlePasswordChangeCancel}
                  />
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                      <p className="text-gray-600 mt-1">
                        {isVendor ? 'View and manage customer orders' : 'View and manage your purchases'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-lg">📦</span>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📦</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {isVendor 
                        ? 'You haven\'t received any orders yet. Start by adding products to your store.'
                        : 'You haven\'t placed any orders yet. Start shopping to see your order history here.'
                      }
                    </p>
                    <button
                      onClick={() => window.location.href = isVendor ? '/vendor-dashboard' : '/products'}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                    >
                      {isVendor ? 'Manage Products' : 'Start Shopping'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;