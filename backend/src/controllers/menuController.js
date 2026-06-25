const MenuItem = require('../models/MenuItem');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { deleteImage } = require('../config/cloudinary');

// ─── Public: Get Menu ─────────────────────────────────────────────────────────

exports.getMenu = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  const { category, search, available } = req.query;

  const filter = { restaurantId };
  // By default we return EVERY item (available + sold out) so the customer site
  // can show out-of-stock dishes with a "Sold Out" badge instead of hiding them
  // outright. Pass available=true to fetch only orderable items (e.g. for an
  // "Add to Cart" autocomplete).
  if (available === 'true') filter.isAvailable = true;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const items = await MenuItem.find(filter).sort({ isAvailable: -1, sortOrder: 1, isBestSeller: -1, name: 1 });

  // Group by category
  const categories = [...new Set(items.map((i) => i.category))];

  res.status(200).json({
    success: true,
    data: { items, categories, total: items.length },
  });
});

// ─── Public: Get Categories ───────────────────────────────────────────────────

exports.getCategories = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.restaurantId;

  const categories = await MenuItem.distinct('category', {
    restaurantId,
    isAvailable: true,
  });

  res.status(200).json({ success: true, data: { categories } });
});

// ─── Dashboard: Get All Items (including unavailable) ────────────────────────

exports.getAllItems = catchAsync(async (req, res, next) => {
  const items = await MenuItem.find({ restaurantId: req.restaurant._id }).sort({
    sortOrder: 1,
    category: 1,
    name: 1,
  });

  res.status(200).json({ success: true, data: { items, total: items.length } });
});

// ─── Dashboard: Add Item ──────────────────────────────────────────────────────

exports.addItem = catchAsync(async (req, res, next) => {
  const {
    name, description, price, mrp, category,
    isVeg, isBestSeller, isFeatured, spiceLevel,
    tags, sortOrder, prepTimeMinutes,
  } = req.body;

  const itemData = {
    restaurantId: req.restaurant._id,
    name,
    description,
    price: parseFloat(price),
    mrp: mrp ? parseFloat(mrp) : undefined,
    category,
    isVeg: isVeg === 'true' || isVeg === true,
    isBestSeller: isBestSeller === 'true' || isBestSeller === true,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    spiceLevel,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    sortOrder: sortOrder ? parseInt(sortOrder) : 0,
    prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes) : 20,
  };

  if (req.file) {
    itemData.imageUrl = req.file.path;
    itemData.cloudinaryId = req.file.filename;
  }

  const item = await MenuItem.create(itemData);

  res.status(201).json({
    success: true,
    message: 'Menu item added successfully',
    data: { item },
  });
});

// ─── Dashboard: Update Item ───────────────────────────────────────────────────

exports.updateItem = catchAsync(async (req, res, next) => {
  const item = await MenuItem.findOne({
    _id: req.params.id,
    restaurantId: req.restaurant._id,
  });

  if (!item) return next(new AppError('Menu item not found', 404));

  const {
    name, description, price, mrp, category,
    isVeg, isBestSeller, isFeatured, spiceLevel,
    tags, sortOrder, prepTimeMinutes, isAvailable,
  } = req.body;

  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = parseFloat(price);
  if (mrp !== undefined) item.mrp = mrp ? parseFloat(mrp) : undefined;
  if (category !== undefined) item.category = category;
  if (isVeg !== undefined) item.isVeg = isVeg === 'true' || isVeg === true;
  if (isBestSeller !== undefined) item.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
  if (isFeatured !== undefined) item.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (spiceLevel !== undefined) item.spiceLevel = spiceLevel;
  if (tags !== undefined) item.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
  if (sortOrder !== undefined) item.sortOrder = parseInt(sortOrder);
  if (prepTimeMinutes !== undefined) item.prepTimeMinutes = parseInt(prepTimeMinutes);
  if (isAvailable !== undefined) item.isAvailable = isAvailable === 'true' || isAvailable === true;

  if (req.file) {
    // Delete old image
    if (item.cloudinaryId) await deleteImage(item.cloudinaryId);
    item.imageUrl = req.file.path;
    item.cloudinaryId = req.file.filename;
  }

  await item.save();

  res.status(200).json({
    success: true,
    message: 'Menu item updated',
    data: { item },
  });
});

// ─── Dashboard: Toggle Availability ──────────────────────────────────────────

exports.toggleAvailability = catchAsync(async (req, res, next) => {
  const item = await MenuItem.findOne({
    _id: req.params.id,
    restaurantId: req.restaurant._id,
  });

  if (!item) return next(new AppError('Menu item not found', 404));

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.status(200).json({
    success: true,
    message: `Item marked as ${item.isAvailable ? 'available' : 'unavailable'}`,
    data: { item },
  });
});

// ─── Dashboard: Delete Item ───────────────────────────────────────────────────

exports.deleteItem = catchAsync(async (req, res, next) => {
  const item = await MenuItem.findOne({
    _id: req.params.id,
    restaurantId: req.restaurant._id,
  });

  if (!item) return next(new AppError('Menu item not found', 404));

  if (item.cloudinaryId) await deleteImage(item.cloudinaryId);
  await item.deleteOne();

  res.status(200).json({ success: true, message: 'Menu item deleted' });
});
