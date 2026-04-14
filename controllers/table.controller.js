const Table = require('../models/table')

/**
 * CREATE TABLE
 */
exports.create = async (req, res) => {
  try {
    const { table_id, tableNumber, capacity, zone } = req.body

    if (!table_id || tableNumber == null || capacity == null || !zone) {
      return res.status(400).json({
        message: 'table_id, tableNumber, capacity y zone son obligatorios'
      })
    }

    const exists = await Table.findOne({ table_id })
    if (exists) {
      return res.status(409).json({
        message: 'Ya existe una mesa con ese table_id'
      })
    }

    const table = new Table(req.body)
    await table.save()

    res.status(201).json(table)
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la mesa',
      error: error.message
    })
  }
}

/**
 * READ ALL TABLES
 */
exports.getAll = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 })
    res.json(tables)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener mesas',
      error: error.message
    })
  }
}

/**
 * READ TABLE BY ID
 */
exports.getById = async (req, res) => {
  try {
    const table = await Table.findOne({
      table_id: req.params.table_id
    })

    if (!table) {
      return res.status(404).json({
        message: 'Mesa no encontrada'
      })
    }

    res.json(table)
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar mesa',
      error: error.message
    })
  }
}

/**
 * UPDATE TABLE
 */
exports.update = async (req, res) => {
  try {
    // Proteger identificador
    if (req.body.table_id) {
      return res.status(400).json({
        message: 'No se puede modificar el table_id'
      })
    }

    const table = await Table.findOneAndUpdate(
      { table_id: req.params.table_id },
      req.body,
      { new: true }
    )

    if (!table) {
      return res.status(404).json({
        message: 'Mesa no encontrada'
      })
    }

    res.json(table)
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar mesa',
      error: error.message
    })
  }
}

/**
 * DELETE TABLE
 */
exports.remove = async (req, res) => {
  try {
    const table = await Table.findOneAndDelete({
      table_id: req.params.table_id
    })

    if (!table) {
      return res.status(404).json({
        message: 'Mesa no encontrada'
      })
    }

    res.json({
      message: 'Mesa eliminada correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar mesa',
      error: error.message
    })
  }
}