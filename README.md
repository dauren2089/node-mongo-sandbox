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
````

### Создание Роутов

Основной роут перенаправления на главную страницу.
```js
// импортируем Router для маршрутов
const { Router } = require('express');
const router = Router();
// импортируем модель курсов
const Course = require('../models/course');

// Маршрут GET '/', который выводит главную страницу
router.get('/', async (req, res) => {
    //метод .find находит все объекты в БД
    const courses = await Course.find()
        .populate('userId', 'email name')

    res.render('main', {
        title: 'Главная страница',
        isHome: true,
        courses
    })
})

// экспортируем маршрут
module.exports = router;
```