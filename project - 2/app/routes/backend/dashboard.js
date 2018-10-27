var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render(__path_views + 'pages/dashboard/index', { pageTitle: 'Dashboard Page' });
});

module.exports = router;