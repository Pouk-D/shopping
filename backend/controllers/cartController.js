const Product = require('../models/Product');

// Cart is stored client-side (localStorage). Backend validates and provides product info.

exports.validateCart = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items required' });
    }

    const ids = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } }).populate('category', 'name');

    const validated = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) return { error: `Product ${item.productId} not found` };
      if (product.stock < item.quantity) {
        return { error: `Insufficient stock for ${product.name}` };
      }
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        subtotal: product.price * item.quantity
      };
    });

    const errors = validated.filter(i => i.error);
    if (errors.length > 0) return res.status(400).json({ errors });

    const total = validated.reduce((sum, i) => sum + i.subtotal, 0);
    res.json({ items: validated, total });
  } catch (err) {
    next(err);
  }
};
