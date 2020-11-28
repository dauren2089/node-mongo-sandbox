const { Router } = require('express');
const router = Router();

const Course = require('../models/course');

router.get('/:id', async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    const course = await Course.findById(req.params.id)

    res.render('edit', {
        title: `Edit Course ${course.title}`,
        isEdit: true,
        course
    });
});

module.exports = router