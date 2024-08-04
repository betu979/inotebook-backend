const connectToMongo = require('./db')
const express = require('express');
const app = express();

connectToMongo()


const port = 5000;
const cors = require('cors')
app.use(cors())
app.use(express.json())

//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});