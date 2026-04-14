const Product = require('../models/product')

/**
 * CREATE PRODUCT
 */
exports.create = async (req, res) => {
  try {
    const { Product_id, name, category, basePrice } = req.body

    if (!Product_id || !name || !category || basePrice == null) {
      return res.status(400).json({
        message: 'Product_id, name, category y basePrice son obligatorios'
      })
    }

    const exists = await Product.findOne({ Product_id })
    if (exists) {
      return res.status(409).json({
        message: 'Ya existe un producto con ese Product_id'
      })
    }

    const product = new Product(req.body)
    await product.save()

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el producto',
      error: error.message
    })
  }
}

/**
 * READ ALL PRODUCTS
 */
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener productos',
      error: error.message
    })
  }
}

/**
 * READ PRODUCT BY ID
 */
exports.getById = async (req, res) => {
  try {
    const product = await Product.findOne({
      Product_id: req.params.Product_id
    })

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar producto',
      error: error.message
    })
  }
}

/**
 * UPDATE PRODUCT
 */
exports.update = async (req, res) => {
  try {
    // No permitir cambiar el Product_id
    if (req.body.Product_id) {
      return res.status(400).json({
        message: 'No se puede modificar el Product_id'
      })
    }

    const product = await Product.findOneAndUpdate(
      { Product_id: req.params.Product_id },
      req.body,
      { new: true }
    )

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar producto',
      error: error.message
    })
  }
}

/**
 * DELETE PRODUCT
 */
exports.remove = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      Product_id: req.params.Product_id
    })

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    res.json({
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar producto',
      error: error.message
    })
  }
}