import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Upload, Loader, AlertCircle } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [apiError, setApiError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Constants
  const productTypes = ['T-Shirts', 'Hoodies', 'Caps', 'Mugs', 'Bottles', 'Tote Bags', 'Stickers'];
  const printTypes = ['Screen Printing', 'DTF Printing', 'Sublimation', 'Embroidery', 'UV Printing'];
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Grey', 'Navy', 'Yellow'];

  // State for arrays (managed outside react-hook-form for cleaner UI check boxes)
  const [selectedPrintTypes, setSelectedPrintTypes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: '',
      stockQuantity: '',
      SKU: '',
      productType: 'T-Shirts',
    },
  });

  // Fetch initial details
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        // Fetch Categories
        const catRes = await api.get('/products/categories');
        if (catRes?.success) {
          setCategories(catRes.data.categories);
        }

        // If Edit Mode, fetch product info
        if (isEditMode) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes?.success) {
            const prod = prodRes.data.product;
            setValue('name', prod.name);
            setValue('description', prod.description);
            setValue('category', prod.category?._id || prod.category);
            setValue('price', prod.price);
            setValue('stockQuantity', prod.stockQuantity);
            setValue('SKU', prod.SKU);
            setValue('productType', prod.productType);
            
            setSelectedPrintTypes(prod.printType || []);
            setSelectedSizes(prod.availableSizes || []);
            setSelectedColors(prod.availableColors || []);

            if (prod.images?.[0]) {
              setImagePreview(prod.images[0]);
            }
          }
        }
      } catch (err) {
        setApiError(err.message || 'Failed to load initial data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitData();
  }, [id, isEditMode, setValue]);

  // Checkbox handlers
  const toggleArrayItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.createObjectURL = (f) => URL.createObjectURL(f);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setApiError('');

    if (selectedPrintTypes.length === 0) {
      setApiError('At least one print type must be selected.');
      return;
    }

    try {
      // Build FormData for multipart uploads
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('stockQuantity', data.stockQuantity);
      formData.append('SKU', data.SKU);
      formData.append('productType', data.productType);
      
      // Stringify array data fields
      formData.append('printType', JSON.stringify(selectedPrintTypes));
      formData.append('availableSizes', JSON.stringify(selectedSizes));
      formData.append('availableColors', JSON.stringify(selectedColors));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      let response;
      if (isEditMode) {
        response = await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response?.success) {
        navigate('/admin/products');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to save product.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Header */}
      <div className="flex items-center space-x-4">
        <a
          href="/admin/products"
          className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isEditMode ? 'Update product details and variations.' : 'Configure a new product template.'}
          </p>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Image Upload Column */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Product Image
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-50 min-h-60 relative overflow-hidden group">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer text-white bg-slate-900/80 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-950">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-500">
                    <label className="cursor-pointer font-semibold text-indigo-600 hover:underline">
                      Upload file
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">PNG, JPG, SVG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Form details Column */}
          <div className="md:col-span-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Product name is required' })}
                  placeholder="Custom Printed Premium Hoodie"
                  className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="SKU" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  SKU Code
                </label>
                <input
                  id="SKU"
                  type="text"
                  {...register('SKU', { required: 'SKU is required' })}
                  placeholder="HD-BLK-001"
                  className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs font-mono"
                />
                {errors.SKU && (
                  <p className="mt-1 text-xs text-red-600">{errors.SKU.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Description is required' })}
                placeholder="Product specifications, customization restrictions, material quality..."
                className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="productType" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Product Type
                </label>
                <select
                  id="productType"
                  {...register('productType')}
                  className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs bg-white"
                >
                  {productTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Price ($)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { required: 'Price is required' })}
                  placeholder="29.99"
                  className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stockQuantity" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Stock quantity
                </label>
                <input
                  id="stockQuantity"
                  type="number"
                  {...register('stockQuantity', { required: 'Stock is required' })}
                  placeholder="100"
                  className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs"
                />
                {errors.stockQuantity && (
                  <p className="mt-1 text-xs text-red-600">{errors.stockQuantity.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Variations selections */}
        <div className="border-t border-slate-100 pt-6 space-y-6">
          {/* Print Types */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Available Print Types
            </label>
            <div className="flex flex-wrap gap-3">
              {printTypes.map((type) => {
                const checked = selectedPrintTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleArrayItem(type, selectedPrintTypes, setSelectedPrintTypes)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      checked 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Available Sizes (Optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {sizeOptions.map((size) => {
                const checked = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleArrayItem(size, selectedSizes, setSelectedSizes)}
                    className={`w-12 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                      checked 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Available Colors (Optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => {
                const checked = selectedColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleArrayItem(color, selectedColors, setSelectedColors)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                      checked 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-slate-100 pt-6 flex justify-end space-x-3">
          <a
            href="/admin/products"
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center"
          >
            {isSubmitting && <Loader className="h-4 w-4 animate-spin mr-2" />}
            {isEditMode ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
