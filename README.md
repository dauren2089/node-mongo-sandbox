## Практика по MongoDB

Перед началом необходимо подготовить структуру проекта. Создать папки (Routes, Models, Views) в директории, для разделения и хранения скриптов зависимости от назначения.

В папке Routes будут храниться файлы которые будут отвечать за маршрутизацию.
В Views будут храниться файлы страниц. и в папке Models будут храниться файлы моделей объектов.

### Установка mongoose
Для установки mongoose:
```sh
npm i --save mongoose
```

### Подключение к Mongo
В app.js прописываем след. код подключения к БД:
```js
const mongoose = require('mongoose');
//файл с ключами от БД
const urlKey = require('/urlKey.json');

// подключаемся к БД
mongoose.connect(urlKey, {useNewUrlParser: true, useUnifiedTopology: true})
````
### Создание Модели
Создаем простую модели в course.js
```js
// Подключаем модели mongoose
const { Schema, model } = require('mongoose');

// Создаем схему
// Описываем свойства данной модели в схе
const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: String
})
// экспортируем модель
module.exports = model('Course', courseSchema)
```

## Отрисовка данных

Для начало создаем входной файл app.js:
```js
// Импортируем зависимости
const mongoose = require('mongoose');
//  Импортируем основные роуты
const homeRoutes = require('./routes/home');
const editRoutes = require('./routes/edit');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');

// Настраиваем основные маршруты
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/edit', editRoutes);

// middleware для обработки страниц ошибок 404
app.use(function (req, res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Не найдено!');
});

// Функция для запуска сервера
async function startServer() {
    try {
        //соединяемся с сервером MongoDB, url.mongo.uri -  url ключ для подключения к MongoDB
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
```

### Отображение всех курсов из mongoDB 

Создаем страницу  index.hbs, где будут отображаться данные:
```html
{{#if courses.length}}
    {{#each courses}}
        <div class="row">
            <div class="col s6 offset-s3">
                <div class="card">
                    <div class="card-image">
                        <img src="{{img}}" alt="{{title}}">
                    </div>
                    <div class="card-content">
                        <span class="card-title">{{title}}</span>
                        <p class="price">{{price}}</p>
                    </div>
                    <div class="card-action actions">
                        <a href="/course/{{_id}}" target="_blank">Открыть курс</a>
                        <a href="/edit/{{_id}}?allow=true">Редактировать</a>
                    </div>
                </div>
            </div>
        </div>
    {{/each}}
{{else}}
    <p>Курсов пока нет</p>
{{/if}}
```

### Создание Роутов

Основной роут перенаправления на главную страницу.
```js
// импортируем Router для маршрутов
const { Router } = require('express');
const router = Router();
// импортируем модель курсов
const Course = require('../models/course');

// Маршрут '/', который выводит главную страницу
router.get('/',  async (req, res) => {
    //метод .find находит все объекты в mongoDB, метод .lean выводит только основные параметры.
    const courses = await Course.find().lean()
    // рендерим главную страницы с полученными данными (courses) из БД
    res.render('index', {
        title: 'Главная страница',
        isHome: true,
        courses
    })
});

// экспортируем маршрут
module.exports = router;
```

## Добавление данных в MongoDB

Основная формы для отправки данных add.hbs
```html
<h1>Добавить новый курс</h1>

<form action="/add" method="POST">
    <div class="input-field">
        <input id="title" name="title" type="text" class="validate" required>
        <label for="title">Название курса</label>
        <span class="helper-text" data-error="Введите название"></span>
    </div>

    <div class="input-field">
        <input id="price" name="price" type="number" class="validate" required min="1">
        <label for="price">Цена курса</label>
        <span class="helper-text" data-error="Введите цену"></span>
    </div>

    <div class="input-field">
        <input id="img" name="img" type="text" class="validate" required>
        <label for="img">URL картинки</label>
        <span class="helper-text" data-error="Введите url картинки"></span>
    </div>

    <button class="btn btn-primary">Добавить курс</button>
</form>
```

Route для добавления новых данных в mongoDB

```js
const { Router } = require('express');
const router = Router();
const Course = require('../models/course');

router.get('/', (req, res) => {
    res.render('add', {
        title: 'Add new Course',
        isAdd: true
    });
});

router.post('/', async (req, res) => {
    // Создаем новую модель course c объектами title, price и img.
    // к которые будут брать значения с REQ.BODY.OBJECT переданные c формы.
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img
    });

    try {
        // сохраняем модель в БД
        await course.save();
        // перенаправляем на главную страницу.
        res.redirect('/');
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;
```

## Редактирование Данных
Создаем страницу .hbs, где будут редактироваться данные:
```html
<h1>Редактировать</h1>

<form action="/edit" method="POST" class="course-form">
    <div class="input-field">
        <input id="title" name="title" type="text" class="validate" required value="{{editCourse.title}}">
        <label for="title">Название курса</label>
        <span class="helper-text" data-error="Введите название"></span>
    </div>

    <div class="input-field">
        <input id="price" name="price" type="number" class="validate" required min="1"  value="{{editCourse.price}}">
        <label for="price">Цена курса</label>
        <span class="helper-text" data-error="Введите цену"></span>
    </div>

    <div class="input-field">
        <input id="img" name="img" type="text" class="validate" required  value="{{editCourse.img}}">
        <label for="img">URL картинки</label>
        <span class="helper-text" data-error="Введите url картинки"></span>
    </div>

    <input type="hidden" name="id" value="{{editCourse._id}}">

    <button class="btn waves-effect waves-light"><i class="material-icons right">Редактировать курс</i></button>
    <button type="submit" formaction="/edit/delete" class="btn red">Удалить курс</button>
</form>
```
Основной роут для отображения страницы для Редактирование данных из mongoDB (edit.js):
```js
// Маршрут который прослушивает адрес /edit/:id
router.get('/:id', async (req, res) => {
    // метод .findById() = находит объекты по id из mongoDB
    // req.params = получает значения из переданной адресной строки, где req.params.id == localhost/edit/:id
    const editCourse = await Course.findById(req.params.id).lean()

    // отрисовка страницы edit с данными title, course
    res.render('course-edit', {
        title: `Редактировать ${editCourse.title}`,
        editCourse
    });
});
// экспортируем маршрут
module.exports = router;
```

Роут для сохранения отредактированных данных
```js
router.post('/', async (req, res) => {
    const id = req.body.id

    // метод findByIdAndUpdate() находит выбранный курс по ID и обновляет содержимое курса
    const course = await Course.findByIdAndUpdate(id, req.body);

    res.redirect('/')
});
```

