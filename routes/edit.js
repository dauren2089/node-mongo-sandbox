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
    // Создаем новый модель course c объектами title, price и img.
    // к которые будут брать значения с REQ.BODY.OBJECT переданные c формы.
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img
    });

    try {
        // сохраняем модель в БД
        await course.save();
        // перенаправляем в главную страницу.
        res.redirect('/');
    } catch (e) {
        console.log(e)
    }

});

router.post('/delete', async (req, res) => {
    res.render('index');
})
module.exports = router;