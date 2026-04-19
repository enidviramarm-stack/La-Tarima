const router = require('express').Router()
const controller = require('../controllers/reservation.controller')

/**
 * Rutas para reservas
 * POST /reservations: Crear nueva reserva
 * GET /reservations: Listar todas las reservas
 * GET /reservations/:reservation_id: Obtener reserva por ID
 * PUT /reservations/:reservation_id: Actualizar reserva completa
 * PATCH /reservations/:reservation_id: Actualizar parcialmente (status, notes, etc.)
 * DELETE /reservations/:reservation_id: Cancelar reserva (lógica)
 */
router.post('/', controller.create)

router.get('/', controller.getAll)

router.get('/:reservation_id', controller.getById)

router.put('/:reservation_id', controller.update)

/**
 * PATCH modificación parcial (status, notes, channel, etc.)
  * Permite modificar cualquier campo puntual sin necesidad de enviar todo el objeto
 */
router.patch('/:reservation_id', controller.updatePartial)

/**
 * DELETE = cancelación lógica
 */
router.delete('/:reservation_id', controller.remove)

module.exports = router
