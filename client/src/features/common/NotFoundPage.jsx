import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-warm-grey-subtle text-ink border border-warm-grey-light flex items-center justify-center mx-auto shadow-md">
        <Compass className="w-8 h-8 text-ink animate-pulse" />
      </div>
      <div>
        <span className="text-xs font-bold text-warm-grey uppercase tracking-widest">Error 404</span>
        <h1 className="text-4xl font-extrabold text-ink mt-1">Page Not Found</h1>
        <p className="text-xs text-warm-grey max-w-sm mx-auto mt-2">
          The custom merchandise page or tracker resource you are looking for does not exist or has been relocated.
        </p>
      </div>
      <div className="flex gap-4 pt-2">
        <Link to="/shop">
          <Button size="md" variant="primary" icon={ShoppingBag}>
            Explore Catalog
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="md" icon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
