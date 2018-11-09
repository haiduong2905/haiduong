var express = require('express');
var router = express.Router();
const folderView = __path_views_admin + 'pages/dashboard/';

router.get('/', function(req, res, next) {
    res.render(`${folderView}dashboard`, { pageTitle: 'Dashboard Page' });
});

module.exports = router;