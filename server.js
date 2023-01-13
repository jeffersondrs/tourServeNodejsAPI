/* eslint-disable no-console */ /* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncoughtException', (err) => {
  console.log('Uncought exception, shuting down...');
  console.log(err.name, err.message);
});

// mongoose is a library that allows us to connect to mongodb
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  // replace is a method that replaces a string with another string
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', true);
mongoose
  .connect(DB, {
    // connect to the database
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log(`DB connection successful: ${con.connection.host}`); // connection.host is the hostname of the database
  });

const port = process.env.PORT || 4000;
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}`);
  console.log(port);
});

process.on('unhanmdledRejection', (err) => {
  console.log('Rejection, shuting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
