const connectToMongo = require('./db')
const express = require('express');

connectToMongo()


const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});