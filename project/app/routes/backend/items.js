var express = require('express');
var router = express.Router();
const util = require('util');

const systemConfigs = require(__path_config + 'system');
const Notify = require(__path_config + 'notify');
const ItemsModel = require(__path_schemas + 'items');
const UtilsHelpers = require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');
const ValidateItems = require(__path_validates + 'items');
const linkIndex = '/' + systemConfigs.prefixAdmin + '/items/';

const pageTitleIndex = 'Items Managment';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';

const folderView = __path_views + 'pages/items/'; // Khai báo folder view của mỗi phần quản lý



/* GET users listing. */
router.get('(/status/:status)?', async(req, res, next) => {
    let objWhere = {};
    let keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    let statusFilter = await UtilsHelpers.createFilterStatus(currentStatus);
    let pagination = { // Cấu hình số lượng trang, số lượng phần tử/trang, trang hiện tại
        totalItems: 1,
        totalItemsPerPage: 3, // Số lượng phần tử trên 1 trang
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)), // Đặt trang hiện tại là 1, // Trang mặc định
        pageRanges: 3 // Số lượng trang hiển thị trên Pagination
    };

    // if (currentStatus === 'all') {
    //     if (keyword !== "") objWhere = { name: new RegExp(keyword, 'i') };
    // } else {
    //     objWhere = { status: currentStatus, name: new RegExp(keyword, 'i') }
    // }

    if (currentStatus !== 'all') objWhere.status = currentStatus;
    if (keyword !== '') objWhere.name = new RegExp(keyword, 'i');

    await ItemsModel.countDocuments(objWhere).then((data) => { // Đếm số phần tử có trong dữ liệu trả về 
        pagination.totalItems = data;
    });

    ItemsModel
        .find(objWhere)
        .sort({ ordering: 'asc' }) // Sort theo ordering
        .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
        .limit(pagination.totalItemsPerPage) // Lấy ra tổng số phần tử / 1 trang
        .then((items) => {
            res.render(`${folderView}list`, {
                pageTitle: pageTitleIndex,
                items,
                statusFilter,
                pagination,
                currentStatus,
                keyword
            });
        });

});


// Change Status
router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    // Đổi status active <-> inactive
    let status = (currentStatus === 'active') ? 'inactive' : 'active';
    ItemsModel.updateOne({ _id: id }, { status: status }, (err, result) => {
        req.flash('success', Notify.CHANGE_STATUS_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Change Status - Multi
router.post('/change-status/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    ItemsModel.updateMany({ _id: { $in: req.body.cid } }, { status: currentStatus }, (err, result) => {
        req.flash('success', util.format(Notify.CHANGE_STATUS_MULTI_SUCCESS, result.n), false); // Sử dụng module util của NodeJS để thay thế giá trị %d trong file notify
        res.redirect(linkIndex);
    });

});

// Change Ordering
router.post('/change-ordering', (req, res, next) => {
    let cids = req.body.cid;
    let orderings = req.body.ordering;

    if (Array.isArray(cids)) { // Multi items
        cids.forEach((item, index) => {
            ItemsModel.updateOne({ _id: item }, { ordering: parseInt(orderings[index]) }, (err, result) => {
                req.flash('success', util.format(Notify.CHANGE_ORDERING_MULTI_SUCCESS, result.n), false);
            });
        })
    } else { // 1 item
        ItemsModel.updateOne({ _id: cids }, { ordering: parseInt(orderings) }, (err, result) => {
            req.flash('success', Notify.CHANGE_ORDERING_SUCCESS, false);
        });
    }

    res.redirect(linkIndex);
});

// Delete item
router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    // Đổi status active <-> inactive
    ItemsModel.deleteOne({ _id: id }, (err, result) => {
        req.flash('success', Notify.DELETE_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Delete item - Multi
router.post('/delete', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    // Đổi status active <-> inactive
    ItemsModel.deleteMany({ _id: { $in: req.body.cid } }, (err, result) => {
        req.flash('success', util.format(Notify.DELETE_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    });
});

// Add items
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
        ItemsModel.findById(id, (err, item) => {
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors });
        })
    }
    // res.redirect(linkIndex);
});
// Post add
router.post('/save', (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    ValidateItems.validator(req);
    let item = Object.assign(req.body); // Copy thuộc tính của body(form) vào biến item
    let errors = req.validationErrors();

    if (typeof item !== "undefined" && item.id !== '') { // Trường hợp Edit item
        if (errors) { //Có lỗi
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors });

        } else {
            ItemsModel.updateOne({ _id: item.id }, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status
            }, (err, result) => {
                req.flash('success', Notify.EDIT_SUCCESS, false);
                res.redirect(linkIndex);
            });
        }
    } else { // Trường hợp Add item
        if (errors !== false) { //Có lỗi
            res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors });
        } else {
            new ItemsModel(item).save().then(() => {
                req.flash('success', Notify.ADD_SUCCESS, false);
                res.redirect(linkIndex);
            })
        }
    }


});
module.exports = router;