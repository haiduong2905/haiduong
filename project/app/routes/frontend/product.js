var express = require('express');
var router = express.Router();
const collection = 'items';

const ItemsModel = require(__path_schemas + collection);
const ParamsHelpers = require(__path_helpers + 'params');
const UtilsHelpers = require(__path_helpers + 'utils');

const folderView = __path_views_frontend + 'pages/';
const layoutFE = __path_views_frontend + 'frontend';


/* GET product page. */
router.get('/(:slug)?', (req, res, next) => {
    ItemsModel
        .find()
        //.sort({ ordering: 'asc' }) // Sort theo ordering
        // .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
        // .limit(pagination.totalItemsPerPage) // Lấy ra tổng số phần tử / 1 trang
        .then((items) => {
            res.render(`${folderView}product/index`, {
                layout: layoutFE,
                carousel_slide: false,
                items
            });
        });
});
router.get('/(:may-anh)?', (req, res, next) => {
    let currentProduct = ParamsHelpers.getParam(req.params, 'category.name', 'Máy ảnh');
    ItemsModel
        .find({ 'category.name': currentProduct })
        //.sort({ ordering: 'asc' }) // Sort theo ordering
        // .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
        // .limit(pagination.totalItemsPerPage) // Lấy ra tổng số phần tử / 1 trang
        .then((items) => {
            res.render(`${folderView}product/index`, {
                layout: layoutFE,
                carousel_slide: false,
                items
            });
        });
});

router.get('/(:the-nho-va-usb)?', (req, res, next) => {
    let currentProduct = ParamsHelpers.getParam(req.params, 'category.name', 'Thẻ nhớ và USB');
    ItemsModel
        .find({ 'category.name': currentProduct })
        //.sort({ ordering: 'asc' }) // Sort theo ordering
        // .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
        // .limit(pagination.totalItemsPerPage) // Lấy ra tổng số phần tử / 1 trang
        .then((items) => {
            res.render(`${folderView}product/index`, {
                layout: layoutFE,
                carousel_slide: false,
                items
            });
        });
});

router.get('/(:dien-thoai-di-dong)?', (req, res, next) => {
    let currentProduct = ParamsHelpers.getParam(req.params, 'category.name', 'Điện thoại di động');
    ItemsModel
        .find({ 'category.name': currentProduct })
        //.sort({ ordering: 'asc' }) // Sort theo ordering
        // .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
        // .limit(pagination.totalItemsPerPage) // Lấy ra tổng số phần tử / 1 trang
        .then((items) => {
            res.render(`${folderView}product/index`, {
                layout: layoutFE,
                carousel_slide: false,
                items
            });
        });
});
module.exports = router;