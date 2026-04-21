const Reservation = require('../models/reservation')
const Table = require('../models/table')



/**
 * CHECK TABLE AVAILABILITY
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { table_id, date, startTime, endTime } = req.query

    if (!table_id || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: 'table_id, date, startTime y endTime son obligatorios'
      })
    }

    const conflict = await Reservation.findOne({
      table_id,
      date,
      status: { $ne: 'cancelada' },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    })

    if (conflict) {
      return res.json({
        table_id,
        date,
        startTime,
        endTime,
        available: false,
        reason: 'La mesa está reservada en ese horario'
      })
    }

    res.json({
      table_id,
      date,
      startTime,
      endTime,
      available: true
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al verificar disponibilidad',
      error: error.message
    })
  }
}


/**
 * CREATE RESERVATION (POST)
 */
exports.create = async (req, res) => {
  try {
    const {
      reservation_id,
      table_id,
      date,
      startTime,
      endTime,
      peopleCount,
      clientRef,
      guest
    } = req.body

    if (!reservation_id || !table_id || !date || !startTime || !endTime || !peopleCount) {
      return res.status(400).json({
        message: 'Campos obligatorios faltantes'
      })
    }

    if (!clientRef && !guest) {
      return res.status(400).json({
        message: 'Debe existir clientRef o guest'
      })
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message: 'La hora de inicio debe ser menor a la hora de fin'
      })
    }

    const table = await Table.findOne({ table_id })
    if (!table) {
      return res.status(404).json({ message: 'Mesa no existente' })
    }

    if (peopleCount > table.capacity) {
      return res.status(400).json({
        message: 'La cantidad de personas excede la capacidad de la mesa'
      })
    }

    const conflict = await Reservation.findOne({
      table_id,
      date,
      status: { $ne: 'cancelada' },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    })

    if (conflict) {
      return res.status(409).json({
        message: 'La mesa ya está reservada en ese horario'
      })
    }

    const reservation = new Reservation(req.body)
    await reservation.save()

    res.status(201).json(reservation)
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la reserva',
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

    // Filtros exactos por campo
    if (req.query.table_id) filters.table_id = req.query.table_id
    if (req.query.date) filters.date = req.query.date
    if (req.query.startTime) filters.startTime = req.query.startTime
    if (req.query.endTime) filters.endTime = req.query.endTime
    if (req.query.peopleCount) filters.peopleCount = Number(req.query.peopleCount)
    if (req.query.status) filters.status = req.query.status
    if (req.query.channel) filters.channel = req.query.channel

    // Filtro parcial para notes (búsqueda por texto)
    if (req.query.notes) {
      filters.notes = { $regex: req.query.notes, $options: 'i' }
    }

    const reservations = await Reservation.find(filters)
      .sort({ date: 1, startTime: 1 })

    res.json(reservations)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener reservas',
      error: error.message
    })
  }
}

/**
 * READ ONE (GET by reservation_id)
 */
exports.getById = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      reservation_id: req.params.reservation_id
    })

    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      })
    }

    res.json(reservation)
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar reserva',
      error: error.message
    })
  }
}

/**
 * UPDATE FULL (PUT)
 */
exports.update = async (req, res) => {
  try {
    if (req.body.reservation_id) {
      return res.status(400).json({
        message: 'No se puede modificar el reservation_id'
      })
    }

    const reservation = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.reservation_id },
      req.body,
      { new: true }
    )

    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      })
    }

    res.json(reservation)
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar reserva',
      error: error.message
    })
  }
}

/**
 * UPDATE PARTIAL (PATCH)
 * Permite modificar cualquier campo puntual (status, notes, channel, etc.)
 */
exports.updatePartial = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.reservation_id },
      req.body,
      { new: true }
    )

    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      })
    }

    res.json(reservation)
  } catch (error) {
    res.status(500).json({
      message: 'Error al modificar la reserva',
      error: error.message
    })
  }
}

/**
 * DELETE = cancelación lógica
 */
exports.remove = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { reservation_id: req.params.reservation_id },
      { status: 'cancelada' },
      { new: true }
    )

    if (!reservation) {
      return res.status(404).json({
        message: 'Reserva no encontrada'
      })
    }

    res.json({
      message: 'Reserva cancelada correctamente',
      reservation
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al cancelar reserva',
      error: error.message
    })
  }
}


