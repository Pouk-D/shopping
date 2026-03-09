const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('./models/Category');
const Product = require('./models/Product');

const categories = [
  { name: 'Electronics' },
  { name: 'Clothing' },
  { name: 'Home & Kitchen' },
  { name: 'Sports' },
  { name: 'Books' }
];

const products = (catMap) => [
  // Electronics
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound. Perfect for work, travel, and music lovers.',
    price: 149.99,
    stock: 45,
    category: catMap['Electronics'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80'
    ]
  },
  {
    name: 'Smart Watch Pro',
    description: 'Feature-packed smartwatch with health tracking, GPS, sleep monitoring, and 7-day battery. Water resistant up to 50 meters.',
    price: 249.99,
    stock: 30,
    category: catMap['Electronics'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80'
    ]
  },
  {
    name: 'Mechanical Keyboard RGB',
    description: 'Tactile mechanical keyboard with customizable RGB backlighting, full N-key rollover, and durable PBT keycaps. Built for gamers and typists.',
    price: 89.99,
    stock: 60,
    category: catMap['Electronics'],
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
      'https://images.unsplash.com/photo-1595044426077-d36d9236d44a?w=600&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
    ]
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: '360° surround sound speaker with 20-hour playtime, IPX7 waterproof rating, and built-in microphone. Ideal for outdoor adventures.',
    price: 59.99,
    stock: 80,
    category: catMap['Electronics'],
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc0d6?w=600&q=80'
    ]
  },

  // Clothing
  {
    name: 'Classic Cotton T-Shirt',
    description: '100% organic cotton t-shirt with a relaxed fit. Available in multiple colors, pre-shrunk, and machine washable. A wardrobe essential.',
    price: 24.99,
    stock: 200,
    category: catMap['Clothing'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&q=80',
      'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80'
    ]
  },
  {
    name: 'Slim Fit Chino Pants',
    description: 'Versatile slim-fit chinos crafted from stretch cotton blend. Perfect for casual or semi-formal occasions. Wrinkle-resistant fabric.',
    price: 49.99,
    stock: 120,
    category: catMap['Clothing'],
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'
    ]
  },
  {
    name: 'Lightweight Running Jacket',
    description: 'Wind and water resistant running jacket with reflective strips, zippered pockets, and packable design. Keeps you moving in any weather.',
    price: 79.99,
    stock: 55,
    category: catMap['Clothing'],
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
      'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
      'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80'
    ]
  },

  // Home & Kitchen
  {
    name: 'Stainless Steel Coffee Maker',
    description: 'Brew rich, bold coffee with this programmable 12-cup coffee maker. Features a built-in grinder, keep-warm plate, and auto-shutoff.',
    price: 119.99,
    stock: 35,
    category: catMap['Home & Kitchen'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
      'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&q=80'
    ]
  },
  {
    name: 'Non-Stick Cookware Set (10-piece)',
    description: 'Complete 10-piece non-stick cookware set with aluminum core for even heat distribution. Dishwasher safe and compatible with all stovetops.',
    price: 99.99,
    stock: 25,
    category: catMap['Home & Kitchen'],
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80',
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80'
    ]
  },
  {
    name: 'Bamboo Cutting Board Set',
    description: 'Set of 3 premium bamboo cutting boards in different sizes. Naturally antibacterial, knife-friendly, and eco-friendly. Easy-grip handles.',
    price: 34.99,
    stock: 90,
    category: catMap['Home & Kitchen'],
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
      'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&q=80',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
      'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?w=600&q=80'
    ]
  },

  // Sports
  {
    name: 'Yoga Mat Premium',
    description: 'Extra-thick 6mm non-slip yoga mat with alignment lines. Made from eco-friendly TPE material. Includes carrying strap. Perfect for yoga, pilates, and stretching.',
    price: 39.99,
    stock: 100,
    category: catMap['Sports'],
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80'
    ]
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells ranging from 5 to 52.5 lbs per dumbbell. Quick-change weight selector. Replaces 15 sets of weights.',
    price: 299.99,
    stock: 15,
    category: catMap['Sports'],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=600&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80'
    ]
  },
  {
    name: 'Trail Running Shoes',
    description: 'Lightweight trail running shoes with aggressive grip outsole, breathable mesh upper, and cushioned midsole. Built for off-road performance.',
    price: 109.99,
    stock: 70,
    category: catMap['Sports'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80'
    ]
  },

  // Books
  {
    name: 'The Art of Clean Code',
    description: 'A practical guide to writing readable, maintainable, and efficient code. Covers best practices, design patterns, and real-world refactoring examples.',
    price: 34.99,
    stock: 150,
    category: catMap['Books'],
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80'
    ]
  },
  {
    name: 'Atomic Habits',
    description: 'An easy and proven way to build good habits and break bad ones. James Clear reveals practical strategies for forming habits that stick.',
    price: 18.99,
    stock: 200,
    category: catMap['Books'],
    image: 'https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?w=600&q=80',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
      'https://images.unsplash.com/photo-1521056787327-239cf0ecc833?w=600&q=80'
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    const insertedCats = await Category.insertMany(categories);
    const catMap = {};
    insertedCats.forEach(c => { catMap[c.name] = c._id; });
    console.log(`Inserted ${insertedCats.length} categories`);

    const insertedProducts = await Product.insertMany(products(catMap));
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
