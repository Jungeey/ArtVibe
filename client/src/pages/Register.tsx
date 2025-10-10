import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

type Role = 'user' | 'vendor';

export default function Register() {
  const [searchParams] = useSearchParams(); // Add this line
  const roleParam = searchParams.get('role'); // Get the role parameter from URL

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as Role,
    phone: '',
    address: '',
    businessName: '',
    businessLicense: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    businessDescription: '',
    taxId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add this useEffect to handle URL parameter
  useEffect(() => {
    if (roleParam === 'vendor') {
      setForm(prev => ({ ...prev, role: 'vendor' }));
    }
  }, [roleParam]); // This will run when the component mounts and when roleParam changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Base payload
      const basePayload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
      };

      let payload: any;

      if (form.role === 'user') {
        payload = { ...basePayload, role: 'user' as Role };
      } else {
        payload = {
          ...basePayload,
          role: 'vendor' as Role,
          businessName: form.businessName,
          businessLicense: form.businessLicense,
          website: form.website,
          socialMedia: {
            instagram: form.instagram,
            facebook: form.facebook,
            twitter: form.twitter,
          },
          businessDescription: form.businessDescription,
          taxId: form.taxId,
        };
      }

      const res = await api.post('/auth/register', payload);
      localStorage.setItem('token', res.data.token);
      alert('Registration successful!');
      // Redirect to appropriate dashboard based on role
      window.location.href = form.role === 'vendor' ? '/vendor-dashboard' : '/';
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ 
    name, 
    placeholder, 
    type = 'text', 
    icon: Icon,
    required = false 
  }: { 
    name: string; 
    placeholder: string; 
    type?: string;
    icon?: React.ComponentType<any>;
    required?: boolean;
  }) => (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={form[name as keyof typeof form] as string}
        onChange={handleChange}
        className={`w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 placeholder-gray-400 ${
          Icon ? 'pl-10 pr-4' : 'px-4'
        }`}
        required={required}
        disabled={loading}
      />
    </div>
  );

  const PasswordField = ({ 
    name, 
    placeholder, 
    showPassword: show, 
    onToggle,
    required = false 
  }: { 
    name: string; 
    placeholder: string; 
    showPassword: boolean; 
    onToggle: () => void;
    required?: boolean;
  }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        value={form[name as keyof typeof form] as string}
        onChange={handleChange}
        className="w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 placeholder-gray-400 pl-10 pr-12"
        required={required}
        disabled={loading}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
        disabled={loading}
      >
        {show ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-amber-600 mb-2">Art Vibe</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-gray-600">
            Join our community of art lovers and creators
          </p>
          {/* Optional: Show a message when vendor registration link is used */}
          {roleParam === 'vendor' && (
            <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
              <p className="text-amber-800 font-medium">
                🎨 Welcome! You're registering as a vendor to sell your amazing creations.
              </p>
            </div>
          )}
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'user' })}
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                    form.role === 'user'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-amber-300 text-gray-600'
                  }`}
                >
                  <UserIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Art Lover</div>
                  <div className="text-xs mt-1">Buy amazing artworks</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'vendor' })}
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                    form.role === 'vendor'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-amber-300 text-gray-600'
                  }`}
                >
                  <BuildingStorefrontIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Artist/Vendor</div>
                  <div className="text-xs mt-1">Sell your creations</div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="name"
                placeholder="Full Name"
                icon={UserIcon}
                required
              />
              <InputField
                name="email"
                placeholder="Email Address"
                type="email"
                icon={EnvelopeIcon}
                required
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordField
                name="password"
                placeholder="Password"
                showPassword={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                required
              />
              <PasswordField
                name="confirmPassword"
                placeholder="Confirm Password"
                showPassword={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="phone"
                placeholder="Phone Number"
                icon={PhoneIcon}
              />
              <InputField
                name="address"
                placeholder="Address"
                icon={MapPinIcon}
              />
            </div>

            {/* Vendor-Specific Fields */}
            {form.role === 'vendor' && (
              <div className="space-y-6 border-t pt-6 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    name="businessName"
                    placeholder="Business Name"
                    icon={BuildingStorefrontIcon}
                    required
                  />
                  <InputField
                    name="businessLicense"
                    placeholder="Business License Number"
                    icon={DocumentTextIcon}
                    required
                  />
                </div>

                <InputField
                  name="website"
                  placeholder="Website (optional)"
                  icon={GlobeAltIcon}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    name="businessDescription"
                    placeholder="Tell us about your business and the art you create..."
                    value={form.businessDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 placeholder-gray-400 resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    name="instagram"
                    placeholder="Instagram"
                    icon={HashtagIcon}
                  />
                  <InputField
                    name="facebook"
                    placeholder="Facebook"
                    icon={HashtagIcon}
                  />
                  <InputField
                    name="twitter"
                    placeholder="Twitter"
                    icon={HashtagIcon}
                  />
                </div>

                <InputField
                  name="taxId"
                  placeholder="Tax ID (optional)"
                  icon={DocumentTextIcon}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-amber-400 disabled:cursor-not-allowed font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                `Create ${form.role === 'vendor' ? 'Vendor' : 'User'} Account`
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-amber-600 hover:text-amber-700 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Links */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}