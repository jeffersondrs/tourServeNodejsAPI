const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, tell us your name'],
    unique: true,
    trim: true,
    maxLength: [40, 'A tour name must have less or equal 40 characters'],
    minLength: [10, 'A tour name must have less or equal 40 characters'],
  },
  email: {
    type: 'string',
    require: [true, 'A email is needed'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide a valid e-mail'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please, provide a password.'],
    maxLength: [8, 'Your passrowd need 8 characters'],
    minLength: [8, 'Your passrowd need 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password!'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'The Password are not the same!',
    },
  },
});

userSchema.pre('save', async function (next) {
  if(! this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next()
});

const User = mongoose.model('User', userSchema);

module.exports = User;
