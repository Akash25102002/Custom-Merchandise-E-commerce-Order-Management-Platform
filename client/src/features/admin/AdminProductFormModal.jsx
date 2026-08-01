import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../api/axios';

export const AdminProductFormModal = ({ isOpen, onClose, productToEdit, onSaveSuccess }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [printTypes, setPrintTypes] = useState(['DTF', 'Screen Printing']);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setSku(productToEdit.sku || '');
      setBasePrice(productToEdit.basePrice || '');
      setStockQuantity(productToEdit.stockQuantity || 100);
      setCategory(productToEdit.category?._id || productToEdit.category || '');
      setDescription(productToEdit.description || '');
      setImagePreview(productToEdit.images?.[0] || '');
      setPrintTypes(productToEdit.printTypes || ['DTF']);
    } else {
      setName('');
      setSku(`SKU-${Date.now().toString().slice(-5)}`);
      setBasePrice('499');
      setStockQuantity('100');
      setDescription('');
      setImagePreview('');
      setPrintTypes(['DTF', 'Screen Printing']);
    }
  }, [productToEdit, isOpen]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(files);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sku', sku);
      formData.append('basePrice', basePrice);
      formData.append('stockQuantity', stockQuantity);
      formData.append('description', description);
      if (category) formData.append('category', category);

      printTypes.forEach((pt) => formData.append('printTypes', pt));
      images.forEach((img) => formData.append('images', img));

      if (productToEdit) {
        await api.put(`/products/${productToEdit._id || productToEdit.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product. Please check input parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Merchandise Product' : 'Add New Base Merchandise'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-print-red-light border border-print-red/30 text-print-red text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vintage Heavy Cotton Tee"
            required
          />

          <Input
            label="SKU Code"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="TEE-COT-001"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Base Price (₹)"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="499"
            required
          />

          <Input
            label="Stock Quantity"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="100"
            required
          />
        </div>

        {/* Category & Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-canvas border border-warm-grey-light text-xs font-bold text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ink"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Description</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of fabric GSM, fit, and print area specifications..."
            className="w-full bg-canvas border border-warm-grey-light rounded-xl p-3 text-xs font-bold text-ink placeholder-warm-grey/60 focus:outline-none focus:ring-2 focus:ring-ink"
            required
          />
        </div>

        {/* Image Upload Preview */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Product Images</label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-warm-grey-light bg-canvas shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="flex-1 flex items-center justify-center p-4 border-2 border-dashed border-warm-grey-light hover:border-ink rounded-xl cursor-pointer bg-canvas transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-warm-grey">
                <Upload className="w-4 h-4 text-ink" />
                <span>Upload Product Image Files</span>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-warm-grey-light">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {productToEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminProductFormModal;
