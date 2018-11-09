var express = require('express');
var router = express.Router();

const folderView = __path_views_frontend + 'pages/';
const layoutFE = __path_views_frontend + 'frontend';

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render(`${folderView}home/index`, {
        layout: layoutFE,
        carousel_slide: true
    });
});
/* GET Product page. */
router.get('/product', function(req, res, next) {
    res.render(`${folderView}product/product`, {
        layout: layoutFE,
        carousel_slide: false
    });
});
/* GET Product page. */
router.get('/detail', function(req, res, next) {
    res.render(`${folderView}detail/detail`, {
        layout: layoutFE,
        carousel_slide: false
    });
});
module.exports = router;