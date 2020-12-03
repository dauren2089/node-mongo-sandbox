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

Создаем простую модель в user.js
```js
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
    }
})

module.exports = model('User', userSchema)
```

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

Важно отметить, что в данных примерах используется оформление - materialize. 

Для инициализации подключенных табов от materialize(bootstrap) необходимо подключить js-script в файле app.js:
```js
M.Tabs.init(document.querySelectorAll('.tabs'));
```

#### Устанавливаем необходимые модули
Установка Express-session
```sh
$ npm i express-session
```

Установка Connect-mongodb-session
```sh
$ npm i connect-mongodb-session
```

Установка bcrypt:
```sh
$ npm i bcrypt
```

Установка csurf:
```sh
$ npm i csurf
```

Установка connect-flash:
```sh
$ npm i connect-flash
```


#### Создание Роутов на ExpressJS

В главном файле /index.js добавляем импорты и регистрируем роут.
```js
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const authRoute = require('./routes/auth');

app.use('/auth', authRoute);

//Далее основные маршруты
//и Запуск сервера
```

Далее создаем новый Роут (/routes/auth.js) для страниц /login и /logout:
```js
const {Router} = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const router = Router()

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

Создаем роут для проверки авторизации пользователя в (/routes/auth.js):
```js
router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body
    const candidate = await User.findOne({ email })
    //  Проверяем введенный пароль с сохраненных паролем
    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)

      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        // Воспользуемся методом .save для ожидания завершения всех операции session
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        res.redirect('/auth/login#login')
      }
    } else {
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})
````

Для регистрации добавляем новый роут в файле /routes/auth.js
```js
router.post('/register', async (req, res) => {
  try {
    // получаем от reg.body необходимые параметры
    const {email, password, repeat, name} = req.body
    // проверяем если такой email в базе
    const candidate = await User.findOne({ email })
    if (candidate) {
        // если есть перенаправляем
        res.redirect('/auth/login#register')
    } else {
        // Хэшируем пароль пользователя
      const hashPassword = await bcrypt.hash(password, 10)
      //если нет то создаем нового пользователя
      const user = new User({
        email, name, password: hashPassword, cart: {items: []}
      })
      await user.save()
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})
```

#### Подключение Сессии

Сессии необходимы для хранения данных пользователя при использовании сайта.

Создаем новый middleware (/middleware/vars.js) для добавления в ответы POST заголовка с информацией о авторизации.
```js
module.exports = function(req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated
  next()
}
```

В главном файле index.js добавляем импорты и регистрируем middleware отвечающим за хранения сессий.
```js
const session = require('express-session')

const varMiddleware = require('./middleware/variables')

app.use(session({
  secret: 'some secret value',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  resave: false,
  saveUninitialized: false,
  store
}));

app.use(varMiddleware);
//Далее идут основные маршруты
```


#### Сохранения локальных сессий в MongoDB

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

////Далее идут основные маршруты
```

Теперь после авторизации, вся сессия пользователя будет сохранена в MongoDB.

#### Защита роутов middleware

Для защиты от перехода не авторизованных пользователей по заданным ссылкам применим middleware, который будет проверят при переходе на страницу авторизацию пользователя.
Для этого создаем новый файл auth.js в папке /middleware
```js
// Middleware для проверки авторизации
module.exports = function(req, res, next) {
  // если параметр => req.session.isAuthenticated не true,
  // значит пользователь не вошел в систему.
  if (!req.session.isAuthenticated) {
    // перенаправляем в страницу авторизации
    return res.redirect('/auth/login')
  }
  // прошел проверку, все ОК!  
  next()
}
```

Далее необходимо добавить эту проверку в каждом роуте для каждой страницы:
Пример, роут Add.js -добавляем в роуте для добавления курсов Проверку авторизации:
```js
// импорт middleware Auth
const auth = require('../middleware/auth');

//в роуте нужно добавить параметр "auth" после указания адреса.
router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Добавить курс',
    isAdd: true
  })
})
```
#### Защита от CSRF-атаки
Эффективным и общепринятым на сегодня способом защиты от CSRF-Атаки является токен. Под токеном имеется в виду случайный набор байт, который сервер передает клиенту, а клиент возвращает серверу.

Защита сводится к проверке токена, который сгенерировал сервер, и токена, который прислал пользователь.

Ипортируем и подключаем в /index.js файле модуль csurf 
```js
const csrf = require('csurf')

app.use(csrf())
````

в файле /middleware/var.js добавляем переменную окружения csrf:
```js
module.exports = function(req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated
  res.locals.csrf = req.csrfToken()
  next()
}
````

Добавляем CSURF токен во всех формах страниц:
```html
<input type="hidden" name="_csrf" value="{{csrf}}">

или 

```html
<input type="hidden" name="_csrf" value="{{@root.csrf}}">
```

Также токен можно передать ввиде параметра в форме
```html
<button class="btn btm-small js-remove" 
    data-id="{{id}}" 
    data-csrf="{{@root.csrf}}">
    Удалить
</button>
``` 

и обработать в Vanilla JS

```js
const $card = document.querySelector('#card')
if ($card) {
  $card.addEventListener('click', event => {
    if (event.target.classList.contains('js-remove')) {
      const id = event.target.dataset.id
      const csrf = event.target.dataset.csrf
      
      fetch('/card/remove/' + id, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf
        },
      }).then(res => res.json())
        .then(card => {
          if (card.courses.length) {
            const html = card.courses.map(c => {
              return `
              <tr>
                <td>${c.title}</td>
                <td>${c.count}</td>
                <td>
                  <button class="btn btm-small js-remove" data-id="${c.id}">Удалить</button>
                </td>
              </tr>
              `
            }).join('')
            $card.querySelector('tbody').innerHTML = html
            $card.querySelector('.price').textContent = toCurrency(card.price)
          } else {
            $card.innerHTML = '<p>Корзина пуста</p>'
          }
        })
    }
  })
} 
````

#### Подключение сообщений
После установки connect-flash, в /index.js импортируем и подключаем connect-flash:
```js
const flash = require('connect-flash')

app.use(flash())
````

Далее в  роутах добавляем отправку сообщений: "req.flash('error', 'сообщение')"
```js

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    //включаем в рендеринг сообщение
    error: req.flash('error')
  })
})

router.post('/register', async (req, res) => {
  try {
    const {email, password, repeat, name} = req.body
    const candidate = await User.findOne({ email })

    if (candidate) {
      //добавляем отправку сообщений об ошибке
      req.flash('error', 'Пользователь с таким email уже существует')
      res.redirect('/auth/login#register')
    } else {
      const hashPassword = await bcrypt.hash(password, 10)
      const user = new User({
        email, name, password: hashPassword, cart: {items: []}
      })
      await user.save()
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})
```

Также добавляем в html файлы необходимые обработчики сообщений:
```html
  {{#if error}}
    <p class="alert">{{error}}</p>
  {{/if}}
```

## Подключение Обработчика ошибок SENTRY.io

Устанавливаем:
```sh
$ npm install --save @sentry/node @sentry/tracing
```

Настраиваем Sentry в index.js:
```js
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

Sentry.init({
    dsn: "https://fde71a2ff3a14c06ac7277794185ed82@o486174.ingest.sentry.io/5542517",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});
```

Протестировать обработчик можно вставив следующий код в файл:
```js
const transaction = Sentry.startTransaction({
  op: "test",
  name: "My First Test Transaction",
});

setTimeout(() => {
  try {
    foo();
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);
```

Теперь необходимо добавить следующий обработчик ошибок во все необходимые места в коде:
```js
try {
  // ...
} catch (e) {
  Sentry.captureException(e);
}
```

## Отправка писем через MailGun

Подключаем почтовый сервис по отправке писем. Почтовый сервис будем использоваеть Mailgun.

После регистрации на сервисе, необходимо получить API-key, настроить DOMAIN и сохранить его в файле credentials:

```js
module.exports = {
  MAILGUN_API_KEY: `API-key`,
  DOMAIN: 'domain'
}
```

Далее установим необходимые модули:
```sh
$ npm i mailgun-js
```

Инициализируем транспортер для отправки писем:
```js
const credentials = require('../credentials')
var mailgun = require('mailgun-js')({apiKey: MAILGUN_API_KEY, domain: DOMAIN});
```

Для отправки писем добавляем следующий код в необходимое место:
```js
const data = {
  from: 'Excited User <me@samples.mailgun.org>',
  to: 'bar@example.com, YOU@YOUR_DOMAIN_NAME',
  subject: 'Hello',
  text: 'Testing some Mailgun awesomness!'
};

mg.messages().send(data, (err, body) => {
  if (err) {
    console.log(`Error: ${err}`);
  }
  else {
    console.log(`Response: ${body}`);
  }
});
```

#### Восстановление пароля

Создаем страницу для восстановление пароля /views/auth/reset.hbs:
```html
<section class="courses">
    <div class="row">
        <div class="col s6 offset-s3">  
            {{#if error}}
            <p class="alert">{{error}}</p>
            {{/if}}

            <h1>Забыли пароль?</h1>
            <form action="/auth/reset" method="POST">
            <div class="input-field">
                <input id="email" name="email" type="email" class="validate" required>
                <label for="email">Email</label>
                <span class="helper-text" data-error="Введите email"></span>
            </div>

            <input type="hidden" name="_csrf" value="{{csrf}}">

            <button class="btn btn-primary" type="submit">Сбросить</button>
            </form>
        </div>
    </div>
</section>
````

Добавляем необходиый Роут для отображения страницы сброса пароля в /routes/auth.js:

```js
router.get('/reset', (req, res) => {
  res.render('reset', {
    title: 'Восстановление пароля',
    error: req.flash('error')
  })
})
```
