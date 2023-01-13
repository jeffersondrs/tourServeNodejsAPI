/* eslint-disable no-console *//* eslint-disable prettier/prettier */
const fs = require('fs');
const mongoose = require('mongoose'); 
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const { isPromise } = require('util/types');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace( // replace is a method that replaces a string with another string
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, { // connect to the database
  useNewUrlParser: true,
}).then(con => {
  console.log(`DB connection successful: ${con.connection.host}`); // connection.host is the hostname of the database
})

// READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// IMPORT DATA INTO DB

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
    };

    // DELETE ALL DATA FROM DB

    const deleteData = async () => {
        try {
            await Tour.deleteMany();
            console.log('Data successfully deleted!');
            process.exit();
        } catch (err) {
            console.log(err);
        }
        process.exit();
    }
 
    if (process.argv[2] === '--import') {
        importData();
    } else if (process.argv[2] === '--delete') {
        deleteData();
    } else {
        console.log('Please provide a valid argument');
    }

 console.log(process.argv);