const express = require('express');
const router = express.Router();
const util = require('util');
const multer = require('multer');
const randomstring = require("randomstring");
const path = require('path');
const fs = require('fs');

const collection = 'category';


const systemConfigs = require(__path_config + 'system');
const Notify = require(__path_config + 'notify');
const CategoryModel = require(__path_schemas + collection);
const UtilsHelpers = require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');
const ValidateCategry = require(__path_validates + collection);
const StringHelpers = require(__path_helpers + 'string');
const linkIndex = '/' + systemConfigs.prefixAdmin + '/' + collection + '/';

const pageTitleIndex = 'Management Category';
const pageTitleAdd = pageTitleIndex + ' - Add New';
const pageTitleEdit = pageTitleIndex + ' - Edit';

const folderView = __path_views_backend + 'pages/' + collection + '/'; // Khai báo folder view của mỗi phần quản lý


/* GET users listing. */
router.get('(/status/:status)?', async(req, res, next) => {
    let objWhere = {};
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    let statusFilter = await UtilsHelpers.createFilterStatus(currentStatus, collection);
    let pagination = { // Cấu hình số lượng trang, số lượng phần tử/trang, trang hiện tại
        totalItems: 1,
        totalItemsPerPage: 3, // Số lượng phần tử trên 1 trang
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)), // Đặt trang hiện tại là 1, // Trang mặc định
        pageRanges: 3 // Số lượng trang hiển thị trên Pagination
    };
    if (currentStatus !== 'all') objWhere.status = currentStatus;

    await CategoryModel.countDocuments(objWhere).then((data) => { // Đếm số phần tử có trong dữ liệu trả về 
        pagination.totalItems = data;
    });
    CategoryModel
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
                currentStatus
            });
        });

});

// Change Status
router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    // Đổi status active <-> inactive
    let status = (currentStatus === 'active') ? 'inactive' : 'active';
    CategoryModel.updateOne({ _id: id }, { status: status }, (err, result) => {
        req.flash('success', Notify.CHANGE_STATUS_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Delete item
router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    // Đổi status active <-> inactive
    CategoryModel.deleteOne({ _id: id }, (err, result) => {
        req.flash('success', Notify.DELETE_SUCCESS, false);
        res.redirect(linkIndex);
    });
});

// Add items
router.get('/form(/:id)?', async(req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    let item = {
        name: '',
        status: 'novalue',
        ordering: 0,
        category: '',
        infomation: '',
        category_id: '', // Gán trong trường hợp thêm mới để tránh lỗi
        category_name: '' // Gán trong trường hợp thêm mới để tránh lỗi
    };
    let errors = null;
    let categoryItems = [];
    await CategoryModel.find({}, { _id: 1, name: 1 }).then((items) => { //Lấy tên và ID của category đưa về items
        categoryItems = items;
        categoryItems.unshift({ _id: 'novalue', name: 'Choose Category' });
    })

    if (id === '') { // Thêm mới
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors, categoryItems });
    } else { // Edit
        CategoryModel.findById(id, (err, item) => {

            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors, categoryItems });
        })
    }
    // res.redirect(linkIndex);
});
// Post add
router.post('/save', (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    ValidateCategry.validator(req);
    let item = Object.assign(req.body); // Copy thuộc tính của body(form) vào biến item
    let errors = req.validationErrors();

    if (typeof item !== "undefined" && item.id !== '') { // Trường hợp Edit item
        if (errors) { //Có lỗi
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors });
        } else {
            CategoryModel.updateOne({ _id: item.id }, {
                ordering: parseInt(item.ordering),
                name: item.name,
                slug: StringHelpers.createAlias(item.slug),
                status: item.status,
                category: item.category,
                infomation: item.infomation
            }, (err, result) => {
                req.flash('success', Notify.EDIT_SUCCESS, false);
                res.redirect(linkIndex);
            });
        }
    } else { // Trường hợp Add item
        if (errors !== false) { //Có lỗi
            res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors });
        } else {
            new CategoryModel(item).save().then(() => {
                req.flash('success', Notify.ADD_SUCCESS, false);
                res.redirect(linkIndex);
            })
        }
    }
});
module.exports = router;