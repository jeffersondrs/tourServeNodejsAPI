/* eslint-disable no-console */ /* eslint-disable prettier/prettier */

const slugify = require('slugify');
const mongoose = require('mongoose'); // mongoose is a library that allows us to connect to mongodb
const validator = require('validator')

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal 40 characters'],
      minLength: [10, 'A tour name must have less or equal 40 characters']
      // validate: [validator.isAlpha, 'Nome só pode conter letras, por favor tente novamente!'] isAlpha problem spaces too;
    },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points current doc on NEW document creation
        return val < this.price; 
        },
        message: `Desconto ({VALUE}) superior ao valor da viagem `
      }
    },

    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 3,
      min: [1, 'Rating must above 1.0'],
      max: [5, 'Rating must above 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
      },
      message: 'Difficult is either: easy, medium, difficult',
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now() },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationMonths').get(function () {
  return this.duration / 30;
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// document middleware: runs before .save() and create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.post('save', function(doc, next) {
//     let documento = JSON.stringify(doc);
//     next()
// })

// query middleware

tourSchema.pre(/^find/, function (next) {
  // /^find/ = sintaxe function
  //    tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  next();
});

// AGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
