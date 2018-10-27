var express = require('express');
var router = express.Router();
const util = require('util');

const systemConfigs = require(__path_config + 'system');
const Notify = require(__path_config + 'notify');
const UsersModel = require(__path_models + 'users');
const GroupsModel = require(__path_models + 'groups');
const UtilsHelpers = require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');
const ValidateUsers = require(__path_validates + 'users');
const linkIndex = '/' + systemConfigs.prefixAdmin + '/users/';

const pageTitleIndex = 'Users Managment';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';

const folderView = __path_views + 'pages/users/'; // Khai báo folder view của mỗi phần quản lý

/* GET users listing. */
router.get('(/status/:status)?', async(req, res, next) => {
    let params = {}; // Chứa tất cả các tham số cần lấy ra để sử dụng
    params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
    params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');
    params.groupID = ParamsHelpers.getParam(req.session, 'group_id', '');
    params.pagination = { // Cấu hình số lượng trang, số lượng phần tử/trang, trang hiện tại
        totalItems: 1,
        totalItemsPerPage: 5, // Số lượng phần tử trên 1 trang
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)), // Đặt trang hiện tại là 1, // Trang mặc định
        pageRanges: 3 // Số lượng trang hiển thị trên Pagination
    };
    let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, 'users');
    let groupsItems = [];
    await GroupsModel.listItemsInSelectBox(params, null).then((items) => { //Lấy tên và ID của group đưa về users
        groupsItems = items;
        groupsItems.unshift({ _id: 'allvalue', name: 'All group' });
    });

    await UsersModel.countItems(params, null).then((data) => { // Đếm số phần tử có trong dữ liệu trả về 
        params.pagination.totalItems = data;
    });

    UsersModel.listItems(params, options = null).then((items) => {
        res.render(`${folderView}list`, {
            pageTitle: pageTitleIndex,
            items,
            statusFilter,
            groupsItems,
            params
        });
    });

});


// Change Status
router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    UsersModel.changeStatus(id, currentStatus, { task: 'update-one' }).then((result) => {
        req.flash('success', Notify.CHANGE_STATUS_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Change Status - Multi
router.post('/change-status/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    UsersModel.changeStatus(req.body.cid, currentStatus, { task: 'update-multi' }).then((result) => {
        req.flash('success', util.format(Notify.CHANGE_STATUS_MULTI_SUCCESS, result.n), false); // Sử dụng module util của NodeJS để thay thế giá trị %d trong file notify
        res.redirect(linkIndex);
    });

});

// Change Ordering
router.post('/change-ordering', (req, res, next) => {
    let cids = req.body.cid;
    let orderings = req.body.ordering;
    UsersModel.changeOrdering(cids, orderings, null).then((result) => {
        req.flash('success', util.format(Notify.CHANGE_ORDERING_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    });
});

// Delete users
router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    UsersModel.deleteItems(id, { task: 'delete-one' }).then((result) => {
        req.flash('success', Notify.DELETE_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Delete users - Multi
router.post('/delete', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    UsersModel.deleteItems(req.body.cid, { task: 'delete-multi' }).then((result) => {
        req.flash('success', util.format(Notify.DELETE_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    });
});

// FORM Add users
router.get('/form(/:id)?', async(req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    let item = {
        name: '',
        ordering: 0,
        status: 'novalue',
        group_id: '', // Gán trong trường hợp thêm mới để tránh lỗi
        group_name: '' // Gán trong trường hợp thêm mới để tránh lỗi
    };
    let errors = null;
    let groupsItems = [];
    await GroupsModel.listItemsInSelectBox().then((items) => { //Lấy tên và ID của group đưa về users
        groupsItems = items;
        groupsItems.unshift({ _id: 'novalue', name: 'Choose Group' });
    })

    if (id === '') { // Thêm mới phần tử
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors, groupsItems });
    } else { // Edit phần tử
        UsersModel.getItems(id).then((item) => {
            item.group_id = item.group.id;
            item.group_name = item.group.name;
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors, groupsItems });
        })
    }
});
// Post add + EDIT + Validate
router.post('/save', async(req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    ValidateUsers.validator(req);

    let item = Object.assign(req.body); // Copy thuộc tính của body(form) vào biến users
    let errors = req.validationErrors();
    let taskCurrent = (typeof item !== "undefined" && item.id !== '') ? 'edit' : 'add'; // Đặt biến cờ để phân trường hợp Edit hay Add

    if (errors) {
        let pageTitle = (taskCurrent == 'add') ? pageTitleAdd : pageTitleEdit;
        let groupsItems = [];
        await GroupsModel.listItemsInSelectBox().then((items) => { //Lấy tên và ID của group đưa về users
            groupsItems = items;
            groupsItems.unshift({ _id: 'novalue', name: 'Choose Group' });
        })
        res.render(`${folderView}form`, { pageTitle, item, errors, groupsItems });
    } else {
        let message = (taskCurrent == 'add') ? Notify.ADD_SUCCESS : Notify.EDIT_SUCCESS;
        UsersModel.saveItems(item, { task: taskCurrent }).then((result) => {
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

// Filter Group
router.get('/filter-group/:group_id', (req, res, next) => {
    req.session.group_id = ParamsHelpers.getParam(req.params, 'group_id', '');
    res.redirect(linkIndex);
});


module.exports = router;