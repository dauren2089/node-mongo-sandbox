// импортируем Router для маршрутов
const { Router } = require('express');
const router = Router();
// импортируем модель курсов
const Course = require('../models/course');

// Маршрут '/', который выводит главную страницу
router.get('/',  async (req, res) => {
    //метод .find находит все объекты в БД
    // const courses = await Course.find().populate('userId', 'email name')
    const courses = await Course.find().lean()
    // console.log(courses)

    res.render('index', {
        title: 'Главная страница',
        isHome: true,
        courses
    })
});

// экспортируем маршрут
module.exports = router;