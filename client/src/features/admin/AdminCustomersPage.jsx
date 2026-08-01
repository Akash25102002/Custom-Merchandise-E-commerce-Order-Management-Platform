import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import api from '../../api/axios';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data.data.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <div className="w-10 h-10 border-4 border-print-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-warm-grey">Loading Customer Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Registered Customers Directory</h1>
          <p className="text-sm text-warm-grey">Manage and review registered merchandise customer accounts.</p>
        </div>
        <Badge variant="info">{customers.length} Customers Registered</Badge>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-warm-grey-light overflow-hidden shadow-sm">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-warm-grey">No registered customer accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead className="bg-canvas text-xs uppercase font-extrabold text-warm-grey border-b border-warm-grey-light">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-grey-light">
                {customers.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4 font-extrabold text-ink flex items-center gap-3">
                      <img
                        src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={c.name}
                        className="w-9 h-9 rounded-full object-cover border border-warm-grey-light"
                      />
                      <span>{c.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-ink">{c.email}</td>
                    <td className="px-6 py-4 text-xs font-mono text-warm-grey">{c.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success" className="capitalize">{c.role}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-warm-grey">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
