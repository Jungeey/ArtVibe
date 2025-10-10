import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getUser, setAuthData } from '../utils/auth';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  businessName?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  businessDescription?: string;
  taxId?: string;
}

interface UserProfileFormProps {
  onUpdate?: (userData: any) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onUpdate }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    website: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    businessDescription: '',
    taxId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        businessName: userData.businessName || '',
        website: userData.website || '',
        socialMedia: {
          instagram: userData.socialMedia?.instagram || '',
          facebook: userData.socialMedia?.facebook || '',
          twitter: userData.socialMedia?.twitter || ''
        },
        businessDescription: userData.businessDescription || '',
        taxId: userData.taxId || ''
      });
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialMedia.')) {
      const socialMediaField = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialMediaField]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Prepare data for submission
      const submitData = {
        ...profile,
        // Remove empty social media fields
        socialMedia: Object.fromEntries(
          Object.entries(profile.socialMedia || {}).filter(([_, value]) => value.trim() !== '')
        )
      };

      const response = await api.put('/auth/profile', submitData);
      
      // Update local storage with new user data
      const updatedUser = {
        ...currentUser,
        ...response.data
      };
      setAuthData(localStorage.getItem('token')!, updatedUser);
      setCurrentUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isVendor = currentUser?.role === 'vendor';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          <p className="text-gray-600 mt-1">Update your personal and business information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Enter your email"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </div>

          {/* Vendor Information Section */}
          {isVendor && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={profile.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={profile.taxId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tax identification number"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={profile.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={profile.businessDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your business..."
                  />
                </div>
              </div>

              {/* Social Media Section */}
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="socialMedia.instagram"
                      name="socialMedia.instagram"
                      value={profile.socialMedia?.instagram || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialMedia.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      id="socialMedia.facebook"
                      name="socialMedia.facebook"
                      value={profile.socialMedia?.facebook || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="facebook.com/username"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="socialMedia.twitter"
                      name="socialMedia.twitter"
                      value={profile.socialMedia?.twitter || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={fetchUserProfile}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Current User Role Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-800 font-medium">
              Account Type: <span className="capitalize">{currentUser?.role}</span>
            </p>
            {isVendor && (
              <p className="text-blue-600 text-sm mt-1">
                Verification Status: <span className="capitalize">{currentUser?.verificationStatus || 'pending'}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;