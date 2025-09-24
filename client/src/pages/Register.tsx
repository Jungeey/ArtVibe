import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import api from '../services/api';

type Role = 'user' | 'vendor';

export default function Register() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
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
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name & Email */}
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <span
            className="absolute right-2 top-2 text-gray-500 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <span
            className="absolute right-2 top-2 text-gray-500 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </span>
        </div>

        {/* Phone & Address */}
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Role selection */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
        </select>

        {/* Vendor-specific fields */}
        {form.role === 'vendor' && (
          <>
            <input
              name="businessName"
              placeholder="Business Name"
              value={form.businessName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="businessLicense"
              placeholder="Business License"
              value={form.businessLicense}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="website"
              placeholder="Website"
              value={form.website}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="instagram"
              placeholder="Instagram"
              value={form.instagram}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="facebook"
              placeholder="Facebook"
              value={form.facebook}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="twitter"
              placeholder="Twitter"
              value={form.twitter}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="businessDescription"
              placeholder="Business Description"
              value={form.businessDescription}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="taxId"
              placeholder="Tax ID"
              value={form.taxId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
