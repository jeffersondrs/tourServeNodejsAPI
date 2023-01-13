/* eslint-disable prettier/prettier */
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
// eslint-disable-next-line prettier/prettier
const AppError = require('./src/util/appError');
const globalErrorHendler = require('./src/controllers/errorController');
const tourRouter = require('./src/routes/tourRoutes');
const userRouter = require('./src/routes/userRoutes');

const app = express();
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Rota ${req.originalUrl} não pode ser encontrada nesse servidor`
    )
  );
});

app.use(globalErrorHendler);

module.exports = app;
