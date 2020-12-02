const { Router } = require('express');
const router = Router();
const Course = require('../models/course');
const auth = require('../middleware/auth')

router.get('/:id', auth, async (req, res) => {
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

router.post('/', auth , async (req, res) => {
    console.log(req.body.id, req.body._id)
    const id = req.body.id
    // const { id } = req.body
    // delete req.body.id
    // метод findByIdAndUpdate() находит выбранный курс по ID и обновляет содержимое курса
    await Course.findByIdAndUpdate(id, req.body);
    console.log("Updated!")
    res.redirect('/')
});
router.post('/delete', auth, async (req, res) => {
    await Course.findByIdAndDelete(req.body.id, req.body);
    console.log("Deleted!")
    res.redirect('/');
})

module.exports = router;