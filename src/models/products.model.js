const mongoose = require('mongoose');

const PRODUCT_TYPES = ["website", "product", "dm", "seo"];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    productType: { type: String, required: true, enum: PRODUCT_TYPES },
    productId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

productSchema.virtual("models", {
  ref: "ProductModel", 
  localField: "productId",
  foreignField: "productId",
  justOne: false // Set to `true` if only one module is expected
});

productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
