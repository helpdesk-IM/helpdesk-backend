const productModel = require('../models/products.model')
const moduleModel = require('../models/productModules.model')

const createProducts = async (req, res) => {
  try {
    const { name, productType } = req.body;

    // Check if product already exists
    const existingProduct = await productModel.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists" });
    }

    // Generate a unique productId
    const lastProduct = await productModel.findOne().sort({ createdAt: -1 });
    let newProductNumber = "PROD-001";

    if (lastProduct && lastProduct.productId) {
      const lastNumber = parseInt(lastProduct.productId.split("-")[1], 10);
      newProductNumber = `PROD-${String(lastNumber + 1).padStart(3, "0")}`;
    }

    const newProduct = new productModel({
      name,
      productType,
      productId: newProductNumber,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
    
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate key error: Product already exists." });
    }
    res.status(500).json({ error: error.message });
  }
};

const createProductModule = async (req, res) => {
  try {
    const { productId, modulePath } = req.body;

    if (!productId || !modulePath || !Array.isArray(modulePath)) {
      return res.status(400).json({ error: "Invalid request data" });
    }
    
    // Assign unique IDs to paths and sections
    const updatedModules = modulePath.map((module, modIndex) => ({
      path: module.path.map((p, pathIndex) => ({
        pathName: p.pathName,
        section: p.section.map((s, secIndex) => ({
          sectionName: s.sectionName,
        })),
      })),
    }));

    // Create a new product module document
    const newProductModule = new moduleModel({
      productId,
      modules: updatedModules,
    });

    await newProductModule.save();
    res.status(201).json(newProductModule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const allProducts = await productModel
      .find()
      .populate("models"); // No need for strictPopulate(false)

    res.status(200).json(allProducts); // Use 200 for GET requests
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate ID

const generateSequentialId = async (prefix, field) => {
  const lastEntry = await moduleModel.findOne().sort({ [`modules.path.${field}`]: -1 });

  if (!lastEntry) {
    return `${prefix}-001`;
  }

  const lastId = lastEntry.modules?.[0]?.path?.[0]?.[field];
  if (!lastId) {
    return `${prefix}-001`;
  }

  const lastNumber = parseInt(lastId.split("-")[1], 10);
  return `${prefix}-${String(lastNumber + 1).padStart(3, "0")}`;
};

const updateProductModule = async (req, res) => {
  try {
    const { productId, pathId, pathName, sectionId, sectionName } = req.body;

    // Find the product module by productId
    let productModule = await moduleModel.findOne({ productId });

    if (!productModule) {
      return res.status(404).json({ error: "Product module not found" });
    }

    let pathExists = false;
    let sectionExists = false;

    // Iterate through modules to find the correct path
    for (let module of productModule.modules) {
      for (let path of module.path) {
        if (path.pathId === pathId) {
          pathExists = true;

          // Update pathName if provided
          if (pathName) {
            path.pathName = pathName;
          }

          // If sectionId is provided, check if section exists
          if (sectionName) {
            let sectionIndex = path.section.findIndex(
              (section) => section.sectionId === sectionId
            );

            if (sectionIndex !== -1) {
              // Update existing section
              path.section[sectionIndex].sectionName = sectionName;
              sectionExists = true;
            } else {
              // Generate a new sectionId sequentially and add new section
              const newSectionId = await generateSequentialId("SEC", "sectionId");
              path.section.push({ sectionId: newSectionId, sectionName });
            }
          }
        }
      }
    }

    // If path does not exist, create a new one with auto-generated pathId
    if (!pathExists) {
      const newPathId = await generateSequentialId("PATH", "pathId");
      productModule.modules.push({
        path: [
          {
            pathId: newPathId,
            pathName,
            section: sectionName
              ? [{ sectionId: await generateSequentialId("SEC", "sectionId"), sectionName }]
              : [],
          },
        ],
      });
    }

    await productModule.save();
    res.status(200).json({ message: "Product module updated successfully", productModule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProductModule = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find and delete the product module
    const deletedModule = await moduleModel.findOneAndDelete({ productId });
    const deletedproduct = await productModel.findOneAndDelete({ productId });

    if (!deletedModule) {
      return res.status(404).json({ error: "Product module not found" });
    }

    res.status(200).json({ message: "Product module deleted successfully" }, deletedModule, deletedproduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { updateProductModule };


const generateId = (prefix, count) => `${prefix}-${String(count + 1).padStart(3, "0")}`;

module.exports = { createProducts, createProductModule, getAllProducts, updateProductModule, deleteProductModule }