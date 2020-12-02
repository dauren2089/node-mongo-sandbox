const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');

// Import function exported by newly installed node modules.
// const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype->access');

const homeRoutes = require('./routes/home');
const editRoutes = require('./routes/edit');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const authRoutes = require('./routes/auth');
// const User = require('./models/user')
const varMiddleware = require('./middleware/variables')

const url = require('./credentials')
const app = express();
const hbs = handlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
    // // ...implement newly added insecure prototype access
    // handlebars: allowInsecurePrototypeAccess(Handlebars)
});

const store = new MongoDBStore({
    collection: 'sessions',
    uri: url.mongo.uri
})

store.on('error', function(error) {
    console.log(error);
});

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: 'some secret value',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    resave: false,
    saveUninitialized: false,
    store
}));

// основные middlewares
app.use(csrf())
app.use(flash())
app.use(varMiddleware);

// Основные маршруты
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/edit', editRoutes);
// app.use('/card', cardRoutes)
// app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3000
// обработка страниц 404
app.use(function (req, res){
    // res.type('text/plain');
    res.status(404);
    // res.send('404 - Не найдено!');
    res.render('404')
});
// Функция для запуска сервера
async function startServer() {
    try {
        await mongoose.connect(url.mongo.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })

        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

startServer()