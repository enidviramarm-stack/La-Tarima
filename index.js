const mongoose = require('mongoose')
const app = require('./app')

mongoose.connect('mongodb://127.0.0.1:27017/La_Tarima')
  .then(() => {
    console.log('Database connected successfully')

    app.listen(app.get('port'), () => {
      console.log(`Server running at http://localhost:${app.get('port')}`)
    })
  })
  .catch(err => {
    console.error('Database connection error:', err.message)
  })