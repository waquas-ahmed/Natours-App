const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!! SHutting down....')
    console.log(`${err.name} ${err.message}`);
    process.exit(1);
})

dotenv.config({ path: './config.env' });  // environement variable importing logic
const app = require('./app');
// console.log('1')
// console.log(process.env)

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD); // connection string

// mongoose.connect(process.env.DATABASE_LOCAL, { // local database
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connection successful!!');
});


const port = process.env.PORT || 8000;
// console.log('2ssasa');
const server = app.listen(port, (req, res) => {
    console.log(`Server has started on port ${port}`);
});
// console.log('3ss');

process.on('unhandledRejection', err => {
    console.log('errorInDB', `${err.name}  `, err.message);
    console.log('UNHANDLED REJECTION!! Shutting down....');
    server.close(() => {
        process.exit(1);
    });
});
// console.log(x)
