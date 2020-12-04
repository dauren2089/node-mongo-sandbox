// Модель для пользователя
const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExp: Date
    // cart: {
    //     items: [
    //         {
    //             count: {
    //                 type: Number,
    //                 required: true,
    //                 default: 1
    //             },
    //             courseId: {
    //                 type: Schema.Types.ObjectId,
    //                 ref: 'Course',
    //                 required: true
    //             }
    //         }
    //     ]
    // }
})

module.exports = model('User', userSchema)