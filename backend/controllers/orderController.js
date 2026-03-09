const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items required' });
    }

    const ids = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } });

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 404 });
      if (product.stock < item.quantity) {
        throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { statusCode: 400 });
      }
      totalAmount += product.price * item.quantity;
      return { product: product._id, quantity: item.quantity, price: product.price };
    });

    // Decrement stock
    await Promise.all(
      items.map(item =>
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
      )
    );

    const order = await Order.create({ user: req.user._id, items: orderItems, totalAmount });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image price')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .populate('updated_by', 'name')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updated_by: req.user._id },
      { new: true, runValidators: true }
    ).populate('updated_by', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
