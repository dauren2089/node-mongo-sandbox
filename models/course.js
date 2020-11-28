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
    img: String,
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // }
})

// экспортируем модель
module.exports = model('Course', courseSchema)