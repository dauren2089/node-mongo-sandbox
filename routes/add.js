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
    // Создаем новый модель course c объектами title, price и img.
    // к которые будут брать значения с REQ.BODY.OBJECT переданные c формы.
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img
    })

    try {
        // сохраняем модель в БД
        await course.save();
        // перенаправляем в главную страницу.
        res.redirect('/');
    } catch (e) {
        console.log(e)
    }

})

module.exports = router;