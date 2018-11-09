var express = require('express');
var router = express.Router();
const util = require('util');

const systemConfigs = require(__path_config + 'system');
const Notify = require(__path_config + 'notify');
const ItemsModel = require(__path_models + 'items');
const UtilsHelpers = require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');
const ValidateItems = require(__path_validates + 'items');
const linkIndex = '/' + systemConfigs.prefixAdmin + '/items/';

const pageTitleIndex = 'Items Managment';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';

const folderView = __path_views_admin + 'pages/items/'; // Khai báo folder view của mỗi phần quản lý

/* GET users listing. */
router.get('(/status/:status)?', async(req, res, next) => {
    let params = {}; // Chứa tất cả các tham số cần lấy ra để sử dụng
    params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');

    params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
    params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');
    params.pagination = { // Cấu hình số lượng trang, số lượng phần tử/trang, trang hiện tại
        totalItems: 1,
        totalItemsPerPage: 5, // Số lượng phần tử trên 1 trang
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)), // Đặt trang hiện tại là 1, // Trang mặc định
        pageRanges: 3 // Số lượng trang hiển thị trên Pagination
    };
    let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, 'items');
    await ItemsModel.countItems(params).then((data) => { // Đếm số phần tử có trong dữ liệu trả về 
        params.pagination.totalItems = data;
    });
    ItemsModel.listItems(params).then((items) => {
        res.render(`${folderView}list`, {
            pageTitle: pageTitleIndex,
            items,
            statusFilter,
            params
        });
    });

});

// Change Status
router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    ItemsModel.changeStatus(id, currentStatus, { task: 'update-one' }).then((result) => {
        req.flash('success', Notify.CHANGE_STATUS_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Change Status - Multi
router.post('/change-status/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    ItemsModel.changeStatus(req.body.cid, currentStatus, { task: 'update-multi' }).then((result) => {
        req.flash('success', util.format(Notify.CHANGE_STATUS_MULTI_SUCCESS, result.n), false); // Sử dụng module util của NodeJS để thay thế giá trị %d trong file notify
        res.redirect(linkIndex);
    });

});

// Change Ordering
router.post('/change-ordering', (req, res, next) => {
    let cids = req.body.cid;
    let orderings = req.body.ordering;
    ItemsModel.changeOrdering(cids, orderings, null).then((result) => {
        req.flash('success', Notify.CHANGE_ORDERING_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Delete item - One
router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    // Đổi status active <-> inactive
    ItemsModel.deleteItems(id, { task: 'delete-one' }).then((result) => {
        req.flash('success', Notify.DELETE_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Delete item - Multi
router.post('/delete', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    // Đổi status active <-> inactive
    ItemsModel.deleteItems(req.body.cid, { task: 'delete-multi' }).then((result) => {
        req.flash('success', util.format(Notify.DELETE_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    });
});

// GET FORM Add, Edit
router.get('/form(/:id)?', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    let item = {
        name: '',
        ordering: 0,
        status: 'novalue'
    };
    let errors = null;
    if (id === '') { // Thêm mới
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors });
    } else { // Edit
        ItemsModel.getItems(id).then((item) => {
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors });
        })
    }
});
// POST ADD-EDIT
router.post('/save', (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    let item = Object.assign(req.body); // Copy thuộc tính của body(form) vào biến item
    let taskCurrent = (typeof item !== "undefined" && item.id !== '') ? 'edit' : 'add'; // Đặt biến cờ để phân trường hợp Edit hay Add
    let errors = ValidateItems.validator(req); // Lấy lỗi upload
    if (errors.length > 0) {
        let pageTitle = (taskCurrent == 'add') ? pageTitleAdd : pageTitleEdit;
        res.render(`${folderView}form`, { pageTitle: pageTitle, item, errors });
    } else {
        let message = (taskCurrent == 'add') ? Notify.ADD_SUCCESS : Notify.EDIT_SUCCESS;
        ItemsModel.saveItems(item, { task: taskCurrent }).then((result) => {
            req.flash('success', message, false);
            res.redirect(linkIndex);
        })
    }
});

// Sort
router.get('/sort/:sort_field/:sort_type', (req, res, next) => {
    req.session.sort_field = ParamsHelpers.getParam(req.params, 'sort_field', 'ordering');
    req.session.sort_type = ParamsHelpers.getParam(req.params, 'sort_type', 'asc');
    res.redirect(linkIndex);
});


module.exports = router;