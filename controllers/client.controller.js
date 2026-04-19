const Client = require('../models/client')

/**
 * CREATE CLIENT (POST)
 */
exports.create = async (req, res) => {
  try {
    const { fullname, docID } = req.body

    if (!fullname || !docID) {
      return res.status(400).json({
        message: 'fullname y docID son obligatorios'
      })
    }

    const exists = await Client.findOne({ docID })
    if (exists) {
      return res.status(409).json({
        message: 'Ya existe un cliente con ese documento'
      })
    }

    const client = new Client(req.body)
    await client.save()

    res.status(201).json(client)
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el cliente',
      error: error.message
    })
  }
}

/**
 * READ ALL + FILTERS (GET)
 */
exports.getAll = async (req, res) => {
  try {
    const filters = {}

    if (req.query.docID) filters.docID = req.query.docID
    if (req.query.phone) filters.phone = req.query.phone
    if (req.query.email) filters.email = req.query.email

    // Búsquedas parciales (texto)
    if (req.query.fullname) {
      filters.fullname = { $regex: req.query.fullname, $options: 'i' }
    }

    if (req.query.address) {
      filters.address = { $regex: req.query.address, $options: 'i' }
    }

    if (req.query.notes) {
      filters.notes = { $regex: req.query.notes, $options: 'i' }
    }

    const clients = await Client.find(filters).sort({ fullname: 1 })
    res.json(clients)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener clientes',
      error: error.message
    })
  }
}

/**
 * READ ONE (GET by docID)
 */
exports.getByDoc = async (req, res) => {
  try {
    const client = await Client.findOne({ docID: req.params.docID })

    if (!client) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      })
    }

    res.json(client)
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar cliente',
      error: error.message
    })
  }
}

/**
 * UPDATE FULL (PUT)
 */
exports.update = async (req, res) => {
  try {
    if (req.body.docID) {
      return res.status(400).json({
        message: 'No se puede modificar el docID'
      })
    }

    const client = await Client.findOneAndUpdate(
      { docID: req.params.docID },
      req.body,
      { new: true }
    )

    if (!client) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      })
    }

    res.json(client)
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar cliente',
      error: error.message
    })
  }
}

/**
 * DELETE CLIENT
 */
exports.remove = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      docID: req.params.docID
    })

    if (!client) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      })
    }

    res.json({
      message: 'Cliente eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar cliente',
      error: error.message
    })
  }
}
