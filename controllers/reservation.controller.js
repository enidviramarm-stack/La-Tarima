const Reservation = require('../models/reservation')
const Table = require('../models/table')

/**
 * CREATE RESERVATION
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

    // Validaciones básicas de negocio
    if (!reservation_id || !table_id || !date || !startTime || !endTime || !peopleCount) {
      return res.status(400).json({
        message: 'Campos obligatorios faltantes'
      })
    }

    // Validar cliente o invitado
    if (!clientRef && !guest) {
      return res.status(400).json({
        message: 'Debe existir clientRef o guest'
      })
    }

    // Validar orden horario
    if (startTime >= endTime) {
      return res.status(400).json({
        message: 'La hora de inicio debe ser menor a la hora de fin'
      })
    }

    // Validar mesa existente
    const table = await Table.findOne({ table_id })
    if (!table) {
      return res.status(404).json({
        message: 'Mesa no existente'
      })
    }

    // Validar capacidad
    if (peopleCount > table.capacity) {
      return res.status(400).json({
        message: 'La cantidad de personas excede la capacidad de la mesa'
      })
    }

    // 🔥 Evitar doble reserva (regla crítica)
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
 * READ ALL RESERVATIONS
 */
exports.getAll = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1, startTime: 1 })
    res.json(reservations)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener reservas',
      error: error.message
    })
  }
}

/**
 * READ RESERVATION BY ID
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
 * UPDATE RESERVATION
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
 * DELETE / CANCEL RESERVATION
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