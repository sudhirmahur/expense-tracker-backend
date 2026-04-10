const Category = require("../models/category.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// CREATE
exports.createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return errorResponse(res, 400, "Name and type are required");
    }

    const category = await Category.create({
      name: name.trim().toLowerCase(),
      type,
    });

    return successResponse(res, 201, "Category created", { category });
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 400, "Category already exists");
    }
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,     // income / expense
      search,   // name search
    } = req.query;

    // 🔢 Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // 🔍 Filter object
    const filter = {};

    // ✅ Type filter (income / expense)
    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    // ✅ Search by name
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // 📦 Query
    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      Category.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Categories fetched successfully", {
      categories,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};
// GET BY ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return errorResponse(res, 404, "Category not found");
    }

    return successResponse(res, 200, "Category fetched", { category });
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return errorResponse(res, 404, "Category not found");
    }

    return successResponse(res, 200, "Category updated", { category });
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 400, "Category already exists");
    }
    next(err);
  }
};

// DELETE
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return errorResponse(res, 404, "Category not found");
    }

    return successResponse(res, 200, "Category deleted");
  } catch (err) {
    next(err);
  }
};