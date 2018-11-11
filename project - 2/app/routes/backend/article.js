var express = require('express');
var router = express.Router();
const util = require('util');

const collection = 'article';

const systemConfigs = require(__path_config + 'system');
const Notify = require(__path_config + 'notify');
const ArticleModel = require(__path_models + collection);
const CategoryModel = require(__path_models + 'category');
const UtilsHelpers = require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');
const FileHelper = require(__path_helpers + 'file');
const ValidateArticle = require(__path_validates + collection);
const linkIndex = '/' + systemConfigs.prefixAdmin + '/' + collection + '/';

const pageTitleIndex = 'Article Managment';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';
const pageTitleUpload = pageTitleIndex + ' - Upload';
const UploadThumb = FileHelper.upload('thumb', collection); // Khai báo các giá trị upload

const folderView = __path_views_admin + 'pages/' + collection + '/'; // Khai báo folder view của mỗi phần quản lý

/* GET article listing. */
router.get('(/status/:status)?', async(req, res, next) => {
    let params = {}; // Chứa tất cả các tham số cần lấy ra để sử dụng
    params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
    params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');
    params.categoryID = ParamsHelpers.getParam(req.session, 'category_id', '');
    params.pagination = { // Cấu hình số lượng trang, số lượng phần tử/trang, trang hiện tại
        totalItems: 1,
        totalItemsPerPage: 5, // Số lượng phần tử trên 1 trang
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)), // Đặt trang hiện tại là 1, // Trang mặc định
        pageRanges: 3 // Số lượng trang hiển thị trên Pagination
    };
    let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, collection);
    let categoryItems = [];
    await CategoryModel.listItemsInSelectBox(params, null).then((items) => { //Lấy tên và ID của category đưa về article
        categoryItems = items;
        categoryItems.unshift({ _id: 'allvalue', name: 'All Category' });
    });

    await ArticleModel.countItems(params, null).then((data) => { // Đếm số phần tử có trong dữ liệu trả về 
        params.pagination.totalItems = data;
    });

    ArticleModel.listItems(params, options = null).then((items) => {
        res.render(`${folderView}list`, {
            pageTitle: pageTitleIndex,
            items,
            statusFilter,
            categoryItems,
            params
        });
    });

});


// Change Status One
router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    ArticleModel.changeStatus(id, currentStatus, { task: 'update-one' }).then((result) => {
        req.flash('success', Notify.CHANGE_STATUS_SUCCESS, false);
        res.redirect(linkIndex);
    });
});
// Change Special One
router.get('/change-special/:id/:special', (req, res, next) => {
    let currentSpecial = ParamsHelpers.getParam(req.params, 'special', 'normal');
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    ArticleModel.changeSpecial(id, currentSpecial, { task: 'update-one' }).then((result) => {
        req.flash('success', Notify.CHANGE_SPECIAL_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Change Status - Multi
router.post('/change-status/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    ArticleModel.changeStatus(req.body.cid, currentStatus, { task: 'update-multi' }).then((result) => {
        req.flash('success', util.format(Notify.CHANGE_STATUS_MULTI_SUCCESS, result.n), false); // Sử dụng module util của NodeJS để thay thế giá trị %d trong file notify
        res.redirect(linkIndex);
    });

});

// Change Ordering
router.post('/change-ordering', (req, res, next) => {
    let cids = req.body.cid;
    let orderings = req.body.ordering;
    ArticleModel.changeOrdering(cids, orderings, null).then((result) => {
        req.flash('success', util.format(Notify.CHANGE_ORDERING_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    });
});

// Delete article
router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    ArticleModel.deleteItems(id, { task: 'delete-one' }).then((result) => {
        req.flash('success', Notify.DELETE_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Delete article - Multi
router.post('/delete', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    ArticleModel.deleteItems(req.body.cid, { task: 'delete-multi' }).then((result) => {
        req.flash('success', util.format(Notify.DELETE_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    });
});

// FORM Add article
router.get('/form(/:id)?', async(req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    let item = {
        name: '',
        ordering: 0,
        status: 'novalue',
        special: 'novalue',
        category_id: '', // Gán trong trường hợp thêm mới để tránh lỗi
        category_name: '' // Gán trong trường hợp thêm mới để tránh lỗi
    };
    let errors = null;
    let categoryItems = [];
    await CategoryModel.listItemsInSelectBox().then((items) => { //Lấy tên và ID của category đưa về article
        categoryItems = items;
        categoryItems.unshift({ _id: 'novalue', name: 'Choose Category' });
    })

    if (id === '') { // Thêm mới phần tử
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors, categoryItems });
    } else { // Edit phần tử
        ArticleModel.getItems(id).then((item) => {
            item.category_id = item.category.id;
            item.category_name = item.category.name;
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors, categoryItems });
        })
    }
});
// Post add + EDIT + Validate
router.post('/save', async(req, res, next) => {
    UploadThumb(req, res, async(errUpload) => {
        req.body = JSON.parse(JSON.stringify(req.body));
        let item = Object.assign(req.body); // Copy thuộc tính của body(form) vào biến article
        let taskCurrent = (typeof item !== "undefined" && item.id !== '') ? 'edit' : 'add'; // Đặt biến cờ để phân trường hợp Edit hay Add
        let errors = ValidateArticle.validator(req, errUpload, taskCurrent); // Lấy lỗi upload
        if (errors.length > 0) {
            let pageTitle = (taskCurrent == 'add') ? pageTitleAdd : pageTitleEdit;
            if (req.file != undefined) FileHelper.remove('public/uploads/' + collection + '/', req.file.filename); // Xóa đi file ảnh upload lỗi
            let categoryItems = [];
            await CategoryModel.listItemsInSelectBox().then((items) => { //Lấy tên và ID của category đưa về article
                categoryItems = items;
                categoryItems.unshift({ _id: 'novalue', name: 'Choose Category' });
            })
            if (taskCurrent == 'edit') item.thumb = item.image_old;
            res.render(`${folderView}form`, { pageTitle, item, errors, categoryItems });
        } else {
            let message = (taskCurrent == 'add') ? Notify.ADD_SUCCESS : Notify.EDIT_SUCCESS;
            if (req.file == undefined) { // ko upload lại hình
                item.thumb = item.image_old; // giữ nguyên tên
            } else {
                item.thumb = req.file.filename;
                if (taskCurrent == 'edit') FileHelper.remove('public/uploads/' + collection + '/', item.image_old); // Xóa hình cũ
            }
            ArticleModel.saveItems(item, { task: taskCurrent }).then((result) => {
                req.flash('success', message, false);
                res.redirect(linkIndex);
            })
        }
    });
});

// Sort
router.get('/sort/:sort_field/:sort_type', (req, res, next) => {
    req.session.sort_field = ParamsHelpers.getParam(req.params, 'sort_field', 'ordering');
    req.session.sort_type = ParamsHelpers.getParam(req.params, 'sort_type', 'asc');
    res.redirect(linkIndex);
});

// Filter category
router.get('/filter-category/:category_id', (req, res, next) => {
    req.session.category_id = ParamsHelpers.getParam(req.params, 'category_id', '');
    res.redirect(linkIndex);
});

module.exports = router;