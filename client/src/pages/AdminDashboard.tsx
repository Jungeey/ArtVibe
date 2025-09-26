import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation to category page
import api from '../services/api'; // Axios instance with baseURL
import { toast } from 'react-toastify';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  businessName?: string;
  businessLicense?: string;
  verificationStatus: string;
  vendorVerified?: boolean;
}

const tabs = ['pending', 'verified', 'suspended'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const token = localStorage.getItem('token');

  const fetchVendors = async (status: string) => {
    try {
      const res = await api.get(`/admin/vendors/${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error fetching vendors');
    }
  };

  useEffect(() => {
    fetchVendors(activeTab);
  }, [activeTab]);

  const handleAction = async (id: string, action: 'verify' | 'suspend' | 'reactivate') => {
    try {
      await api.patch(`/admin/vendor/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Vendor ${action}d successfully`);
      fetchVendors(activeTab);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Error performing ${action}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Manage Categories */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link
          to="/admin/categories"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Manage Categories
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Vendors Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Business Name</th>
              <th className="border px-4 py-2">License</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No vendors found
                </td>
              </tr>
            )}
            {vendors.map(vendor => (
              <tr key={vendor._id}>
                <td className="border px-4 py-2">{vendor.name}</td>
                <td className="border px-4 py-2">{vendor.email}</td>
                <td className="border px-4 py-2">{vendor.businessName || '-'}</td>
                <td className="border px-4 py-2">{vendor.businessLicense || '-'}</td>
                <td className="border px-4 py-2 capitalize">{vendor.verificationStatus}</td>
                <td className="border px-4 py-2 space-x-2">
                  {activeTab === 'pending' && (
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleAction(vendor._id, 'verify')}
                    >
                      Verify
                    </button>
                  )}
                  {activeTab !== 'suspended' && (
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleAction(vendor._id, 'suspend')}
                    >
                      Suspend
                    </button>
                  )}
                  {activeTab === 'suspended' && (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => handleAction(vendor._id, 'reactivate')}
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
