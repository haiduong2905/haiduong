var express = require('express');
var router = express.Router();

router.use('/dashboard', require('./dashboard'));
router.use('/items', require('./items'));
router.use('/', require('./home'));

module.exports = router;