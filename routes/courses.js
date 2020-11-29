const {Router} = require('express')
const Course = require('../models/course')
const router = Router();
// маршрут для страницы Courses
router.get('/', async (req, res) => {
    const courses = await Course.find().lean()
    res.render('courses', {
        title: 'Courses list',
        isCourses: true,
        courses
    });
});

// Маршрут для редактирования курса
router.get('/:id/edit', async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    // const course = await Course.getById(req.params.id)
    // Заменяем метод .getById() на встроенный в Mongoose метод .findById()
    // который находит выбранный курс по ID
    const editCourse = await Course.findById(req.params.id).lean()
    // console.log(req.params)
    // console.log(req.params.id)
    console.log(editCourse);

    // отрисовка страницы course-edit с параметрами title, course
    res.render('course-edit', {
        title: `Редактировать ${editCourse.title}`,
        editCourse
    });
});

module.exports = router;