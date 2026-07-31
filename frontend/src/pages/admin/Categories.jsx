import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { Trash2, Plus, AlertCircle, Loader } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', description: '' },
  });

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      if (response?.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      setSubmitError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    setSubmitError('');
    setApiSuccess('');
    try {
      const response = await api.post('/products/categories', data);
      if (response?.success) {
        setCategories((prev) => [...prev, response.data.category]);
        setApiSuccess('Category created successfully!');
        reset();
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to create category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setSubmitError('');
    setApiSuccess('');
    try {
      const response = await api.delete(`/products/categories/${id}`);
      if (response?.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        setApiSuccess('Category deleted successfully!');
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Details */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
        <p className="mt-1 text-sm text-slate-500">Create, organize, and inspect product categories for the storefront.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Category Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-indigo-600" />
            Add New Category
          </h2>

          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {apiSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg text-xs">
              {apiSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Category Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Category name is required' })}
                placeholder="e.g., Apparel"
                className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                placeholder="Brief description about the products in this category..."
                className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-medium text-lg">No categories found</p>
              <p className="text-sm mt-1">Start by creating a new category in the form on the left.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="relative px-6 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-slate-500 max-w-sm truncate mt-0.5">{category.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
