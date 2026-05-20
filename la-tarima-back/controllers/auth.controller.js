const Staff = require('../models/staff')

exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(422).json({ message: 'Email y contraseña son obligatorios' })
  }

  const validPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (password !== validPassword) {
    return res.status(401).json({ message: 'Contraseña incorrecta' })
  }

  try {
    const staff = await Staff.findOne({ email: email.toLowerCase(), active: true })

    if (!staff) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    if (staff.role !== 'manager') {
      return res.status(401).json({ message: 'Solo el gerente puede iniciar sesión' })
    }

    const user = {
      user_id: staff.user_id,
      name: staff.fullname,
      email: staff.email,
      role: staff.role
    }

    res.json({
      token: `tarima-${staff.user_id}`,
      user
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al procesar el inicio de sesión',
      error: error.message
    })
  }
}
