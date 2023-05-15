const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tours = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connection successful!!');
});


// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// adding data to the database
const importData = async () => {
    try {
        // await Tours.create(tours);
        await User.create(users, { validateBeforeSave: false });
        // await Review.create(reviews);
        console.log('Data loaded successfully!');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

// deleting data from the database
const deleteAllData = async () => {
    try {
        // await Tours.deleteMany();
        await User.deleteMany();
        // await Review.deleteMany();
        console.log('Data deleted successfully!');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData()
}
if (process.argv[2] === '--delete') {
    deleteAllData()
}