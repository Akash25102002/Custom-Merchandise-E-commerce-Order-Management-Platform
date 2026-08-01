import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockProducts = [
  {
    _id: 'prod_1',
    name: 'Premium Unisex Cotton Crewneck T-Shirt',
    category: 't-shirt',
    basePrice: 499,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    colorsCount: 4,
  },
  {
    _id: 'prod_2',
    name: 'Heavyweight Fleece Pullover Hoodie',
    category: 'hoodie',
    basePrice: 1299,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
    colorsCount: 3,
  },
  {
    _id: 'prod_3',
    name: 'Custom Matte Ceramic Coffee Mug (11oz)',
    category: 'mug',
    basePrice: 299,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    colorsCount: 2,
  },
  {
    _id: 'prod_4',
    name: 'Gallery Framed Canvas Wall Art',
    category: 'canvas',
    basePrice: 899,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
    colorsCount: 1,
  },
];

export const ProductCatalogPage = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Premium Merchandise Apparel & Gifts
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Customizable Merchandise Catalog
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm">
          Select any base merchandise product below to launch our interactive 2D Canvas Customizer Tool. Upload artwork, position print logos, add custom typography, and place orders.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockProducts.map((p) => (
          <Card key={p._id} className="flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-sky-400 border border-slate-800">
                  {p.category}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base line-clamp-1">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.colorsCount} Color Options</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Starts at</span>
                <p className="text-lg font-extrabold text-white">₹{p.basePrice}</p>
              </div>
              <Link to={`/customizer?product=${p._id}`}>
                <Button size="sm" icon={Sparkles}>
                  Customize
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalogPage;
