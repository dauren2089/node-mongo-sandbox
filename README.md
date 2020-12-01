## Практика по MongoDB

Перед началом необходимо подготовить структуру проекта. Создать папки (Routes, Models, Views) в директории, для разделения и хранения скриптов зависимости от назначения.

В папке Routes будут храниться файлы которые будут отвечать за маршрутизацию.
В Views будут храниться файлы страниц. и в папке Models будут храниться файлы моделей объектов.

### Установка mongoose
Для установки mongoose:
```sh
npm i --save mongoose
```

### Подключение к Mongo
В app.js прописываем след. код подключения к БД:
```js
const mongoose = require('mongoose');
//файл с ключами от БД
const urlKey = require('/urlKey.json');

// подключаемся к БД
mongoose.connect(urlKey, {useNewUrlParser: true, useUnifiedTopology: true})
````
### Создание Модели
Создаем простую модели в course.js
```js
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
    img: String
})

// экспортируем модель
module.exports = model('Course', courseSchema)
````

### Создание Роутов

Основной роут перенаправления на главную страницу.
```js
// импортируем Router для маршрутов
const { Router } = require('express');
const router = Router();
// импортируем модель курсов
const Course = require('../models/course');

// Маршрут GET '/', который выводит главную страницу
router.get('/', async (req, res) => {
    //метод .find находит все объекты в БД
    const courses = await Course.find()
        .populate('userId', 'email name')

    res.render('main', {
        title: 'Главная страница',
        isHome: true,
        courses
    })
})

// экспортируем маршрут
module.exports = router;
```

## Авторизация

Шаблоны авторизации на сайте на node.js

#### Создание страниц авторизации

Создаем отдельную папку в Views с названием Auth. Внутри создаем файл с названием login.handlebars:

```html
<section class="auth">
    <div class="row">
        <div class="col s12">
            <ul class="tabs">
                <li class="tab col s6">
                    <a href="#login" class="link active">Войти</a>
                </li>
                <li class="tab col s6">
                    <a href="#register" class="link">Регистрация</a>
                </li>
            </ul>
        </div>
        <div id="login" class="col s6 offset-s3">
            <h3>Войти в систему</h3>

            <form action="/auth/login" method="POST">
                <div class="input-field">
                    <input id="email" name="email" type="email" class="validate" required>
                    <label for="email">email</label>
                    <span class="helper-text" data-error="Введите email"></span>
                </div>

                <div class="input-field">
                    <input id="password" name="password" type="password" class="validate" required min="1">
                    <label for="password">Пароль</label>
                    <span class="helper-text" data-error="Введите пароль"></span>
                </div>
                <button class="btn btn-primary" type="submit">Войти</button>
            </form>
        </div>
        <div id="register" class="col s6 offset-s3">
        <h3>Зарегистрироваться в систему</h3>

            <form action="/auth/register" method="POST">
                <div class="input-field">
                    <input id="remail" name="email" type="email" class="validate" required>
                    <label for="remail">email</label>
                    <span class="helper-text" data-error="Введите email"></span>
                </div>

                <div class="input-field">
                    <input id="rpassword" name="password" type="password" class="validate" required min="1">
                    <label for="rpassword">Пароль</label>
                    <span class="helper-text" data-error="Введите пароль"></span>
                </div>

                <div class="input-field">
                    <input id="confirm" name="confirm" type="password" class="validate" required min="1">
                    <label for="confirm">Повторите Пароль</label>
                    <span class="helper-text" data-error="Повторите пароль"></span>
                </div>

                <button class="btn btn-primary" type="submit">Зарегистрироваться</button>
            </form>
        </div>
    </div>
</section>
```
Страница будет служит для авторизации пользователей, где пользователи будут иметь возможность залогиниться или зарегистрироваться в систему.

В навигационной панели (navbar.handlebars) добавляем ссылки на страницу авторизации:
```html
{{#if isLogin}}
<li class="active"><a href="/auth/login">Войти</a></li>
{{else}}
<li><a href="/auth/login">Войти</a></li>
{{/if}} 
```
Важно отметить, что в данных примерах используется оформление - materialize. 

Для инициализации подключенных табов от materialize(bootstrap) необходимо подключить js-script в файле app.js:
```js
M.Tabs.init(document.querySelectorAll('.tabs'));
```

#### Создание Роутов на ExpressJS

Далее создаем новый Роут (auth.js) для созданной страницы:
```js
const { Router } = require('express');
const router = Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true
    })
})

// Route для выхода из системы
router.get('logout', async (req, res) => {
    // вариант 1: указать isAuthenticated = false
    // req.session.isAuthenticated = false;
    
    // вариант 2: воспользоваться медотом .destroy, который уничтожает все данные сессии
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    }) 
});

module.exports = router;
````
Который отвечать за перенаправление на страницу авторизации.

В главном файле index.js добавляем импорты и регистрируем middleware отвечающим за роут.
```js
const authRoute = require('./routes/auth');

app.use('/auth', authRoute);

//Далее основные маршруты
//и Запуск сервера
```

#### Подключение Сессии

Сессии необходимы для хранения данных пользователя при использовании сайта.

Установка Express-session
```sh
npm i express-session
```

Создаем новый middleware (/middleware/vars.js) для добавления в ответы POST заголовка с информацией о авторизации.
```js
module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated

    next();
}
```

В главном файле index.js добавляем импорты и регистрируем middleware отвечающим за хранения сессий.
```js
const session = require('express-session');
const varMiddleware = require('./middleware/variables')

app.use(session({
  secret: 'some secret value',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(varMiddleware);
//Далее идут основные маршруты
```

Далее добавляем в (auth.js) новый роут для обработки POST запроса по адресу /auth/login
```js
router.post('/login', async (req, res) => {
    req.session.isAuthenticated = true
    res.redirect('/');
});
```

В navbar.html настраиваем разделяем ссылки для показа
```html
<nav>
  <div class="nav-wrapper">
    <a href="#" class="brand-logo">Приложение курсов</a>
    <ul id="nav-mobile" class="right hide-on-med-and-down">

      {{#if isAuth}}
        {{#if isAdd}}
          <li class="active"><a href="/add">Добавить курс</a></li>
        {{else}}
          <li><a href="/add">Добавить курс</a></li>
        {{/if}} 

        {{#if isCard}}
          <li class="active"><a href="/card">Корзина</a></li>
        {{else}}
          <li><a href="/card">Корзина</a></li>
        {{/if}}

        {{#if isOrder}}
          <li class="active"><a href="/orders">Заказы</a></li>
        {{else}}
          <li><a href="/orders">Заказы</a></li>
        {{/if}}
        <li><a href="/auth/logout">Выйти</a></li>
      {{else}}
        {{#if isLogin}}
          <li class="active"><a href="/auth/login">Войти</a></li>
        {{else}}
          <li><a href="/auth/login">Войти</a></li>
        {{/if}}
      {{/if}}

    </ul>
  </div>
</nav>
```

#### Сохранения локальных сессий в MongoDB
Установка Connect-mongodb-session
```sh
npm i connect-mongodb-session
```

```js
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collections: 'sessions'
});

store.on('error', function(error) {
  console.log(error);
});


app.use(session({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(varMiddleware);
////Далее идут основные маршруты
```

Теперь после операции авторизации, вся сессия пользователя будет сохранена в MongoDB.

#### Защита роутов middleware

Создаем новый файл auth.js в папке /middleware
```js
module.exports = function(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('auth/login');
    }
    next()
}
```

Который будет отвечать за проверку авторизации на страницах.

Далее необходимо добавить проверку в каждом роуте:
```js

const auth = require('../middleware/auth');

//в лююом роуте нужно добавить параметр "auth"
router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Добавить курс',
    isAdd: true
  })
})
```

#### Исправляем ошибки подключения .populate(mongoose)
Создаем новый файл user.js в папке /middleware
```js
const User = require('../models/user')

module.exports = async function (req, res, next) {
    if (!req.session.user) {
        return next()
    }

    req.user = await User.findById(req.session.user._id)
    next()
}
```
Данный middleware должен исправить ошибку подключения .populate

В файле index.js подключаем данный middleware
```js
const userMiddleware = require('./middleware/user');


app.use(userMiddleware);
```

#### Регистрация нового пользователя
Для регистрации добавляем новый роут в файле auth.js
```js
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirm, name } = req.body
    // console.log(email, password, confirm)

    const candidate = await User.findOne({ email})

    if (candidate) {
      res.redirect('/auth/login#login')
    } else {
      const user = new User({
        email, name, password, card: {items: []}
      })
      await user.save();
      res.redirect('/auth/login#login')
    }

  } catch(e){
    console.log(e)
  }
})
```
