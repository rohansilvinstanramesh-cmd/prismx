import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash, DownloadSimple } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    product: '',
    amount: '',
    region: '',
    status: 'completed',
    customerId: '',
  });

  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, []);

  const fetchSales = async () => {
    try {
      const { data } = await api.get('/sales');
      setSales(data);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSale) {
        await api.put(`/sales/${editingSale._id}`, formData);
        toast.success('Sale updated successfully');
      } else {
        await api.post('/sales', formData);
        toast.success('Sale created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      customerName: sale.customerName,
      product: sale.product,
      amount: sale.amount,
      region: sale.region,
      status: sale.status,
      customerId: sale.customerId || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await api.delete(`/sales/${id}`);
        toast.success('Sale deleted successfully');
        fetchSales();
      } catch (error) {
        toast.error('Failed to delete sale');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      product: '',
      amount: '',
      region: '',
      status: 'completed',
      customerId: '',
    });
    setEditingSale(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="sales-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Sales</h1>
          <p className="text-zinc-400 text-base">Manage your sales records</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`${process.env.REACT_APP_BACKEND_URL}/api/reports/sales/csv`}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            data-testid="export-csv-button"
          >
            <DownloadSimple size={20} />
            Export CSV
          </a>
          <a
            href={`${process.env.REACT_APP_BACKEND_URL}/api/reports/sales/pdf`}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            data-testid="export-pdf-button"
          >
            <DownloadSimple size={20} />
            Export PDF
          </a>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:brightness-110" data-testid="add-sale-button">
              <Plus size={20} weight="bold" className="mr-2" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">
                {editingSale ? 'Edit Sale' : 'Create New Sale'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  required
                  data-testid="customer-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Product</label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  required
                  data-testid="product-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  required
                  data-testid="amount-input"
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600" data-testid="submit-sale-button">
                  {editingSale ? 'Update' : 'Create'} Sale
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

      <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="sales-table">
            <thead className="bg-zinc-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Region</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-zinc-800/50 transition-colors" data-testid="sale-row">
                  <td className="px-6 py-4 text-sm text-white">{sale.customerName}</td>
                  <td className="px-6 py-4 text-sm text-white">{sale.product}</td>
                  <td className="px-6 py-4 text-sm font-mono text-emerald-400">${sale.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{sale.region}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{sale.agentName}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                        data-testid="edit-sale-button"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(sale._id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        data-testid="delete-sale-button"
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

export default Sales;