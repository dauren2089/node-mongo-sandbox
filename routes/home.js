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

//Марштрут для страницы Course
router.get('/course/:id', async (req, res) => {
    // console.log("Params: ", req.params)
    try {
        const course = await Course.findById(req.params.id).lean()
        // console.log("Course: ", course)
        res.render('course', {
            title: 'Главная страница',
            isHome: true,
            course
        })
    } catch (e) {
        console.log(e)
    }
});

// экспортируем маршрут
module.exports = router;