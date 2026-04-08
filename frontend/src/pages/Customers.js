import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash, DownloadSimple } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    region: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await api.get(`/reports/customers/${format}`, {
        responseType: 'blob',
      });
      
      const extension = format === 'excel' ? 'xlsx' : format;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_report.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Customers report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()} report`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', formData);
        toast.success('Customer created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      region: customer.region,
      status: customer.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      region: '',
      status: 'active',
    });
    setEditingCustomer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="customers-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Customers</h1>
          <p className="text-zinc-400 text-base">Manage your customer database</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload('csv')}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            data-testid="export-customers-csv"
          >
            <DownloadSimple size={20} />
            CSV
          </button>
          <button
            onClick={() => handleDownload('excel')}
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            data-testid="export-customers-excel"
          >
            <DownloadSimple size={20} />
            Excel
          </button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:brightness-110" data-testid="add-customer-button">
              <Plus size={20} weight="bold" className="mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">
                {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  required
                  data-testid="name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  required
                  data-testid="email-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  data-testid="phone-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  data-testid="company-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Region</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  required
                  data-testid="region-select"
                >
                  <option value="">Select Region</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="South America">South America</option>
                  <option value="Middle East">Middle East</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  data-testid="status-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600" data-testid="submit-customer-button">
                  {editingCustomer ? 'Update' : 'Create'} Customer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="customers-table">
            <thead className="bg-zinc-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Region</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Purchases</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-zinc-800/50 transition-colors" data-testid="customer-row">
                  <td className="px-6 py-4 text-sm text-white">{customer.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{customer.company || '-'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{customer.region}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      customer.status === 'prospect' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-emerald-400">
                    ${customer.totalPurchases?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                        data-testid="edit-customer-button"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        data-testid="delete-customer-button"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;