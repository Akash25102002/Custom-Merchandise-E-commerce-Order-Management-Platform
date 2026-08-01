const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// Recalculates cart totals live on every read or mutation
const calculateLiveCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST Tax
  const shippingEstimate = subtotal > 1499 || subtotal === 0 ? 0 : 99; // Free shipping > ₹1499
  const grandTotal = subtotal + tax + shippingEstimate;

  return { subtotal, tax, shippingEstimate, grandTotal };
};

const getCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  if (dbStore.isMongoConnected()) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name images basePrice sku availableSizes availableColors printTypes');

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    } else {
      // Recalculate live totals against database values
      cart.items.forEach((item) => {
        if (item.product && item.product.basePrice) {
          item.unitPrice = item.product.basePrice;
          item.lineTotal = item.unitPrice * item.quantity;
        }
      });
      cart.recalculateTotals();
      await cart.save();
    }

    return res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } else {
    // In-memory Fallback Store
    let userCart = dbStore.orders.get(`cart_${userId}`);
    if (!userCart) {
      userCart = {
        _id: `cart_${userId}`,
        user: userId,
        items: [],
        subtotal: 0,
        tax: 0,
        shippingEstimate: 0,
        grandTotal: 0,
      };
    }

    // Recalculate live
    userCart.items.forEach((item) => {
      item.lineTotal = item.unitPrice * item.quantity;
    });

    const totals = calculateLiveCartTotals(userCart.items);
    Object.assign(userCart, totals);
    dbStore.orders.set(`cart_${userId}`, userCart);

    return res.status(200).json({
      status: 'success',
      data: { cart: userCart },
    });
  }
});

const addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { productId, size, color, quantity = 1, printType, printLocation = 'front', designImageUrl = '' } = req.body;

  // 1. Fetch Product and Validate existence
  let product = null;
  if (dbStore.isMongoConnected()) {
    product = await Product.findById(productId);
  } else {
    product = dbStore.products.get(productId) || Array.from(dbStore.products.values()).find((p) => p._id === productId || p.id === productId);
  }

  if (!product || product.isActive === false) {
    return next(new AppError('Product not available or out of stock', 404));
  }

  // 2. Server-side validation: Check size against product's availableSizes
  if (product.availableSizes && product.availableSizes.length > 0 && !product.availableSizes.includes(size)) {
    return next(new AppError(`Invalid size "${size}". Available options: ${product.availableSizes.join(', ')}`, 400));
  }

  // 3. Server-side validation: Check color against product's availableColors
  if (product.availableColors && product.availableColors.length > 0) {
    const validColor = product.availableColors.find((c) => c.name.toLowerCase() === color.name.toLowerCase());
    if (!validColor) {
      return next(new AppError(`Invalid color "${color.name}". Available options: ${product.availableColors.map((c) => c.name).join(', ')}`, 400));
    }
  }

  // 4. Server-side validation: Check printType against product's printTypes
  if (product.printTypes && product.printTypes.length > 0 && !product.printTypes.includes(printType)) {
    return next(new AppError(`Invalid print type "${printType}". Available options: ${product.printTypes.join(', ')}`, 400));
  }

  // 5. Server-side price assignment (never trust client-sent price!)
  const unitPrice = product.basePrice;
  const lineTotal = unitPrice * Number(quantity);

  if (dbStore.isMongoConnected()) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if matching customized item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color.name === color.name &&
        item.printType === printType &&
        item.printLocation === printLocation &&
        item.designImageUrl === designImageUrl
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      cart.items[existingIndex].lineTotal = cart.items[existingIndex].quantity * unitPrice;
    } else {
      cart.items.push({
        product: productId,
        size,
        color,
        quantity: Number(quantity),
        printType,
        printLocation,
        designImageUrl,
        unitPrice,
        lineTotal,
      });
    }

    cart.recalculateTotals();
    await cart.save();
    await cart.populate('items.product', 'name images basePrice sku');

    return res.status(200).json({
      status: 'success',
      message: 'Item added to cart successfully',
      data: { cart },
    });
  } else {
    // In-memory fallback
    let userCart = dbStore.orders.get(`cart_${userId}`) || {
      _id: `cart_${userId}`,
      user: userId,
      items: [],
    };

    const existingIndex = userCart.items.findIndex(
      (item) =>
        (item.product._id === productId || item.product === productId) &&
        item.size === size &&
        item.color.name === color.name &&
        item.printType === printType &&
        item.printLocation === printLocation &&
        item.designImageUrl === designImageUrl
    );

    if (existingIndex > -1) {
      userCart.items[existingIndex].quantity += Number(quantity);
      userCart.items[existingIndex].lineTotal = userCart.items[existingIndex].quantity * unitPrice;
    } else {
      const newItemId = 'item_' + Date.now();
      userCart.items.push({
        _id: newItemId,
        id: newItemId,
        product,
        size,
        color,
        quantity: Number(quantity),
        printType,
        printLocation,
        designImageUrl,
        unitPrice,
        lineTotal,
      });
    }

    const totals = calculateLiveCartTotals(userCart.items);
    Object.assign(userCart, totals);
    dbStore.orders.set(`cart_${userId}`, userCart);

    return res.status(200).json({
      status: 'success',
      message: 'Item added to cart successfully',
      data: { cart: userCart },
    });
  }
});

const updateCartItem = catchAsync(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { itemId } = req.params;
  const { quantity, size, color, printType, printLocation } = req.body;

  if (dbStore.isMongoConnected()) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return next(new AppError('Cart item not found', 404));
    }

    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items.pull(itemId);
      } else {
        item.quantity = Number(quantity);
        item.lineTotal = item.unitPrice * item.quantity;
      }
    }
    if (size) item.size = size;
    if (color) item.color = color;
    if (printType) item.printType = printType;
    if (printLocation) item.printLocation = printLocation;

    cart.recalculateTotals();
    await cart.save();
    await cart.populate('items.product', 'name images basePrice sku');

    return res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } else {
    // In-memory fallback
    const userCart = dbStore.orders.get(`cart_${userId}`);
    if (!userCart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = userCart.items.findIndex((i) => i._id === itemId || i.id === itemId);
    if (itemIndex === -1) {
      return next(new AppError('Cart item not found', 404));
    }

    if (quantity !== undefined) {
      if (quantity <= 0) {
        userCart.items.splice(itemIndex, 1);
      } else {
        userCart.items[itemIndex].quantity = Number(quantity);
        userCart.items[itemIndex].lineTotal = userCart.items[itemIndex].unitPrice * Number(quantity);
      }
    }

    const totals = calculateLiveCartTotals(userCart.items);
    Object.assign(userCart, totals);
    dbStore.orders.set(`cart_${userId}`, userCart);

    return res.status(200).json({
      status: 'success',
      data: { cart: userCart },
    });
  }
});

const removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { itemId } = req.params;

  if (dbStore.isMongoConnected()) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items.pull(itemId);
      cart.recalculateTotals();
      await cart.save();
    }
    return res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: { cart },
    });
  } else {
    const userCart = dbStore.orders.get(`cart_${userId}`);
    if (userCart) {
      userCart.items = userCart.items.filter((i) => i._id !== itemId && i.id !== itemId);
      const totals = calculateLiveCartTotals(userCart.items);
      Object.assign(userCart, totals);
      dbStore.orders.set(`cart_${userId}`, userCart);
    }
    return res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: { cart: userCart },
    });
  }
});

const uploadArtwork = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please provide an artwork image file (PNG, SVG, JPG, WEBP)', 400));
  }

  const artworkUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    status: 'success',
    message: 'Artwork uploaded successfully',
    artworkUrl,
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  uploadArtwork,
};
