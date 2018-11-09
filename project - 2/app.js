/* Module của Express */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const flash = require('express-flash-notification'); // Thư viện hiển thị thông báo
const cookieParser = require('cookie-parser');
const session = require('express-session');
const validator = require('express-validator'); // Thư viện validator
const moment = require('moment'); // Thư viện định dạng thời gian

/* Module của bên thứ 3 */
var expressLayouts = require('express-ejs-layouts');

/* Define Path : Định nghĩa lại vị trí các thư mục */
const pathConfigs = require('./path');
global.__base = __dirname + '/'; // console.log(__base); In ra đường dẫn hiện tại của thư mục dự án
global.__path_app = __base + pathConfigs.folder_app + '/';
global.__path_config = __path_app + pathConfigs.folder_config + '/';
global.__path_helpers = __path_app + pathConfigs.folder_helpers + '/';
global.__path_routes = __path_app + pathConfigs.folder_routes + '/';
global.__path_schemas = __path_app + pathConfigs.folder_schemas + '/';
global.__path_models = __path_app + pathConfigs.folder_models + '/';
global.__path_validates = __path_app + pathConfigs.folder_validates + '/';

global.__path_views = __path_app + pathConfigs.folder_views + '/';
global.__path_views_admin = __path_views + pathConfigs.foler_module_admin + '/';
global.__path_views_blog = __path_views + pathConfigs.foler_module_blog + '/';



global.__path_public = __base + pathConfigs.folder_public + '/';

global.__path_uploads = __path_public + pathConfigs.folder_uploads + '/';

/* Module tự viết*/
const systemConfigs = require(__path_config + 'system');
const databaseConfigs = require(__path_config + 'database');


// Kết nối mongodb
var mongoose = require('mongoose');
mongoose.connect(`mongodb://${databaseConfigs.username}:${databaseConfigs.password}@ds125381.mlab.com:25381/${databaseConfigs.database}`, { useNewUrlParser: true });


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', __path_views_admin + 'backend');

// app.use(logger('dev')); Bỏ log các load khi npm start
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(flash(app, {
    viewName: __path_views_admin + 'elements/notify'
}));

app.use(validator({
    // xây dựng các Validator riêng để sủ dụng, TH này sử dụng check active và inactive nên cần 2 giá trị value1 và value2
    customValidators: {
        isNotEqual: (value1, value2) => {
            return value1 !== value2;
        }
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Local variable 
app.locals.systemConfigs = systemConfigs;
app.locals.moment = moment;

//Setup Router
app.use(`/${systemConfigs.prefixAdmin}/`, require(__path_routes + 'backend/index'));
app.use(`/${systemConfigs.prefixBlog}/`, require(__path_routes + 'frontend/index'));
app.use('/', require(__path_routes + 'frontend/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render(__path_views_admin + 'pages/error', { pageTitle: 'Page Not Found' });
});

module.exports = app;