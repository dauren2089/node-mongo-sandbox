## Подключение отправки сообщений и уведомлений

### Отправка уведомлений через connect-flash
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
// Транпортер для отправки писем
const api_key = keys.MAILGUN_API_KEY;
const domain = keys.YOUR_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

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

Добавляем в модель User поля: resetToken и resetTokenExp для хранения токенов.
```js
    resetToken: String,
    resetTokenExp: Date
```

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

Подготавливаем сообщение для отправителя для восстановления пароля /emails/reset.hbs:
```html
const keys = require('../keys')

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject:  'Восстановление пароля',
        html: `
            <h3>Восстановление пароля</h3>
            <p>Для восстановления пароля перейдите по следующей ссылке:</p>
            <hr />
            <p><a href="${keys.BASE_URL}/auth/password/${token}" target="_blank">Восстановить пароль</a></p>
            <hr />
            <a href="${keys.BASE_URL}" target="_blank">Перейти в Магазин </a>
        ` 
    }
}
```
оно будет отправлятся при запросу пользователя о смене пароля
```js
// Route для проверки и отправки данных при восстановлении пароля
router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                console.log(err)
            }
            // Генерируем токен
            const token = buffer.toString('hex')
            // Проверяем email
            const candidate = await User.findOne({ email: req.body.email })

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()

                // отправляем сообщение на email пользователя
                await mailgun.messages().send(resetPass(candidate.email, token), function (error, body) {
                    console.log(body);
                });
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Пользователя с таким email не существует')
                res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        Sentry.captureException(e);
    }
})
```

Создаем страницу для ввода нового пароля:

```html
<section class="courses">
    <div class="row">
        <div class="col s6 offset-s3">
            {{#if error}}
                <p class="alert">{{error}}</p>
            {{/if}}

            <h2>Обновление пароля</h2>
            <p>Введите новый пароль.</p>

            <form action="/auth/password" method="POST">
                <div class="input-field">
                    <input id="rpassword" name="password" type="password" class="validate" required>
                    <label for="rpassword">Пароль</label>
                    <span class="helper-text" data-error="Введите новый пароль"></span>
                </div>

                <div class="input-field">
                    <input id="confirm" name="confirm" type="password" class="validate" required>
                    <label for="confirm">Пароль еще раз</label>
                    <span class="helper-text" data-error="Введите новый пароль"></span>
                </div>
                <input type="hidden" name="_csrf" value="{{csrf}}">
                <input type="hidden" name="userId" value="{{userId}}">
                <input type="hidden" name="token" value="{{token}}">

                <button class="btn btn-primary" type="submit">Сохранить</button>
            </form>
        </div>
    </div>
</section>
```

Роут для отображения страницы ввода нового пароля. Также валидации полученного токена.
```js
// Route для отображения страницы обновления пароля
router.get('/password/:token', async (req, res) => {

    // Проверка наличия в параметрах токена
    if (!req.params.token) {
        req.flash('loginError', 'Время жизни токена истекло')
        return res.redirect('/auth/login')
    }
    try {
        // Проверка валидности токена и времени жизни токена в БД
        const candidate = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })
        // Проверка наличия user
        if (!candidate) {
            req.flash('loginError', 'Время жизни токена истекло')
            return res.redirect('/auth/login')
        } else {
            // console.log("Token: ", req.params.token)
            res.render('auth/newpass', {
                title: 'Обновление пароля',
                error: req.flash('error'),
                userId: candidate._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e)
    }
})
```

Роут для проверки userId и валидации токена. Далее отправка данных в mongoDB
```js
// Route для обновления пароля
router.post('/password', async (req, res) => {
    const { userId, token, password, confirm } = req.body
    // console.log(req.body)
    // обработка ошибок в NODEJS
    try {
        // Проверка валидности токена и времени жизни токена в БД
        const candidate = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })
        // console.log('USER: ', candidate)

        if(candidate) {
            // const hashPassword = await bcrypt.hash(password, 10)
            // console.log('PaSS: ', hashPassword)
            // candidate.password = hashPassword
            candidate.password = await bcrypt.hash(req.body.password, 10)
            candidate.resetToken = undefined
            candidate.resetTokenExp = undefined
            await candidate.save();
            res.redirect('/auth/login')

        } else {
            req.flash('loginError', 'Время жизни токена истекло')
            res.redirect('/auth/login');
        }

    } catch(e) {
        console.log(e)
    }
})
```
