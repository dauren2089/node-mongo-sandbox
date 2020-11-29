const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');

// Import function exported by newly installed node modules.
// const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype->access');

const homeRoutes = require('./routes/home');
const editRoutes = require('./routes/edit');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');

const url = require('./credentials')

const app = express();

const hbs = handlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
    // // ...implement newly added insecure prototype access
    // handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
// Основные маршруты
app.use('/', homeRoutes);
// app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/edit', editRoutes);

// обработка страниц 404
app.use(function (req, res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Не найдено!');
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
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

startServer()