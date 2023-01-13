/* eslint-disable no-console */ /* eslint-disable prettier/prettier */
const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../util/apiFeatures');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAvarage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    const dataObj = JSON.stringify(tours);
    fs.writeFileSync(`${__dirname}/../dev-data/data/banco.json`, dataObj);

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  });

exports.getTour = catchAsync(async (req, res, next) => {
  
    const tour = await Tour.findById(req.params.id);

    if(!tour){
      return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404))
    }
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour },
    });
    console.log(req.params.id);
  });

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  const dataObj = JSON.stringify(tours);
  fs.writeFileSync(`${__dirname}/../dev-data/data/banco.json`, dataObj);

  res.status(201).json({ status: 'success', data: { tour: newTour } });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  
    const tour = await Tour.findByIdAndDelete(req.params.id);
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    const dataObj = JSON.stringify(tours);
    fs.writeFileSync(`${__dirname}/../dev-data/data/banco.json`, dataObj);

    if(!tour){
      return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404))
    }

    res.status(204).json({ status: 'success', data: null });
  
});
exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    const dataObj = JSON.stringify(tours);
    fs.writeFileSync(`${__dirname}/../dev-data/data/banco.json`, dataObj);

    if(!tour){
      return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404))
    }

    res.status(200).json({ status: 'success', data: { tour } });
  });
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'MEDIUM' } }
      // }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
});
exports.getMonthlyPan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // gte = >=great or igual
            $lte: new Date(`${year}-12-31`), // lte = <= less or igual
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 6,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  });