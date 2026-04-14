const Staff = require('../models/staff')

/**
 * CREATE STAFF
 */
exports.create = async (req, res) => {
  try {
    const { user_id, fullName, role } = req.body

    if (!user_id || !fullName || !role) {
      return res.status(400).json({
        message: 'user_id, fullName y role son obligatorios'
      })
    }

    const exists = await Staff.findOne({ user_id })
    if (exists) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese user_id'
      })
    }

    const staff = new Staff(req.body)
    await staff.save()

    res.status(201).json(staff)
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear usuario',
      error: error.message
    })
  }
}

/**
 * READ ALL STAFF
 */
exports.getAll = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ fullName: 1 })
    res.json(staff)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener personal',
      error: error.message
    })
  }
}

/**
 * READ STAFF BY ID
 */
exports.getById = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      user_id: req.params.user_id
    })

    if (!staff) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      })
    }

    res.json(staff)
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar usuario',
      error: error.message
    })
  }
}

/**
 * UPDATE STAFF
 */
exports.update = async (req, res) => {
  try {
    // Proteger identificador
    if (req.body.user_id) {
      return res.status(400).json({
        message: 'No se puede modificar el user_id'
      })
    }

    const staff = await Staff.findOneAndUpdate(
      { user_id: req.params.user_id },
      req.body,
      { new: true }
    )

    if (!staff) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      })
    }

    res.json(staff)
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar usuario',
      error: error.message
    })
  }
}

/**
 * DELETE STAFF
 */
exports.remove = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({
      user_id: req.params.user_id
    })

    if (!staff) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      })
    }

    res.json({
      message: 'Usuario eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar usuario',
      error: error.message
    })
  }
}