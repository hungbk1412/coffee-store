const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');

const MONGODB_URI = 'mongodb://localhost:27017/coffee'
const app = express();

const authRoute = require('./routes/auth');
const orderRoute = require('./routes/order');

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
  ttl: 14 * 60 * 60
})


app.use(bodyParser.urlencoded( { extended: false } )); // x-www-form-urlencoded <form>
app.use(bodyParser.json({ extended: false }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.headers.origin) {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

// app.use(cors({
//   origin: ['http://localhost:3000'],
//   methods: ['GET', 'POST'],
//   credentials: true
// }))

app.use(session({
	secret : "hellohowareyou",
  resave: false,
  proxy: true,
  saveUninitialized: true,
  store: store,
	cookie: {
    secure: false,
		maxAge: 14*60*60*1000 // Expire in 14 hours
	}
}));

app.use('/api/auth', authRoute);
app.use('/api/order', orderRoute);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect(MONGODB_URI).then(result => {app.listen(5000);}).catch(err => console.log(err));