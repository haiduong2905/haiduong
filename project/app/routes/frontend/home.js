var express = require('express');
var router = express.Router();
const collection = 'items';

const ItemsModel = require(__path_schemas + collection);
const ParamsHelpers = require(__path_helpers + 'params');
const UtilsHelpers = require(__path_helpers + 'utils');

const folderView = __path_views_frontend + 'pages/';
const layoutFE = __path_views_frontend + 'frontend';

/* GET home page. */
router.get('/', (req, res, next) => {
    ItemsModel
        .find()
        //.sort({ ordering: 'asc' }) // Sort theo ordering
        // .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
        // .limit(pagination.totalItemsPerPage) // Lấy ra tổng số phần tử / 1 trang
        .then((items) => {
            res.render(`${folderView}home/index`, {
                layout: layoutFE,
                carousel_slide: true,
                items,
            });
        });
        
});

module.exports = router;