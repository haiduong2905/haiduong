var express = require('express');
var router = express.Router();
const collection = 'items';
const mongoose = require('mongoose');

const ItemsModel = require(__path_schemas + collection);
const ParamsHelpers = require(__path_helpers + 'params');
const UtilsHelpers = require(__path_helpers + 'utils');

const folderView = __path_views_frontend + 'pages/';
const layoutFE = __path_views_frontend + 'frontend';


/* GET detail page. */
router.get('/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    ItemsModel
        .findById({ _id: new mongoose.Types.ObjectId(id) })
        .then((items) => {
            res.render(`${folderView}detail/index`, {
                layout: layoutFE,
                carousel_slide: false,
                items
            });
        });
});

module.exports = router;