const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');


const testJwtRouter = require('./controllers/test-jwt.js');
const authRouter = require('./controllers/auth.js');
const userRouter = require('./controllers/users.js');
const hootsRouter = require('./controllers/hoots.js');

// MIDDLEWARE

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use('/auth', authRouter);
app.use('/test-jwt', testJwtRouter);
app.use('/users', userRouter);
app.use('/hoots', hootsRouter);


// Routes go here


app.listen(3000, () => {
  console.log('The express app is ready!');
});
