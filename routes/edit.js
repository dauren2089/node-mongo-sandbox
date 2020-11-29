const { Router } = require('express');
const router = Router();
const Course = require('../models/course');

router.get('/:id', async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    const editCourse = await Course.findById(req.params.id).lean()
    console.log(req.params)
    // console.log(req.params.id)
    console.log(editCourse);

    // отрисовка страницы course-edit с параметрами title, course
    res.render('course-edit', {
        title: `Редактировать ${editCourse.title}`,
        editCourse
    });
});

router.post('/', async (req, res) => {
    console.log(req.body.id, req.body._id)
    const id = req.body.id
    // const { id } = req.body
    // delete req.body.id
    // метод findByIdAndUpdate() находит выбранный курс по ID и обновляет содержимое курса
    const course = await Course.findByIdAndUpdate(id, req.body);
    console.log("Updated!")
    res.redirect('/')
});

router.post('/delete', async (req, res) => {
    res.render('index');
})

module.exports = router;