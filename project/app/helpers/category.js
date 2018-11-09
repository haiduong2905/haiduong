const CategoryModel = require(__path_schemas + 'category');
const StringHelpers = require(__path_helpers + 'string');
module.exports = {
    listItems: (params, options = null) => { // Options : Thêm lựa chọn nếu có trường hợp tương tự
        let objWhere = {};
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        let sort = {};
        sort[params.sortField] = params.sortType;
        return CategoryModel
            .find(objWhere)
            .select('name status ordering created modified slug')
            .sort(sort) // Sort theo ordering
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
            .limit(params.pagination.totalItemsPerPage); // Lấy ra tổng số phần tử / 1 trang
    },
    listItemsInSelectBox: (params, options = null) => {
        return CategoryModel.find({}, { _id: 1, name: 1 });
    },
    getItems: (id, options = null) => {
        return CategoryModel.findById(id);
    },
    countItems: (params, options = null) => {
        let objWhere = {};
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return CategoryModel.countDocuments(params.objWhere);
    },
    changeStatus: (id, currentStatus, options = null) => {
        // Đổi status active <-> inactive
        let status = (currentStatus === 'active') ? 'inactive' : 'active';
        let data = { // bổ sung các thuộc tính chỉnh sửa: bởi ai, khi nào?
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        if (options.task == 'update-one') {
            data.status = status;
            return CategoryModel.updateOne({ _id: id }, data);
        }
        if (options.task == 'update-multi') {
            data.status = currentStatus;
            return CategoryModel.updateMany({ _id: { $in: id } }, data);
        }
    },
    changeOrdering: async(cids, orderings, options = null) => {
        let data = {
            ordering: parseInt(orderings),
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        if (Array.isArray(cids)) {
            for (let index = 0; index < cids.length; index++) {
                data.ordering = parseInt(orderings[index]);
                await CategoryModel.updateOne({ _id: cids[index] }, data);
            }
            return Promise.resolve("Success");
        } else {
            return CategoryModel.updateOne({ _id: cids }, data)
        }
    },
    deleteItems: (id, options = null) => {
        if (options.task == 'delete-one') {
            return CategoryModel.deleteOne({ _id: id });
        }
        if (options.task == 'delete-multi') {
            return CategoryModel.deleteMany({ _id: { $in: id } });
        }
    },
    saveItems: (item, options = null) => {
        if (options.task == 'add') {
            item.created = {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
            item.slug = StringHelpers.createAlias(item.slug);
            return new CategoryModel(item).save();
        }

        if (options.task == 'edit') {
            return CategoryModel.updateOne({ _id: item.id }, {
                ordering: parseInt(item.ordering),
                name: item.name,
                slug: StringHelpers.createAlias(item.slug),
                status: item.status,
                content: item.content,
                modified: { // bổ sung các thuộc tính chỉnh sửa: bởi ai, khi nào?
                    user_id: 0,
                    user_name: "admin",
                    time: Date.now()
                }
            });
        }
    },
    changeGroupACP: (currentGroupACP, id, options = null) => {
        let group_acp = (currentGroupACP === 'yes') ? 'no' : 'yes';
        let data = { // bổ sung các thuộc tính chỉnh sửa: bởi ai, khi nào?
            group_acp: group_acp,
            modified: {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
        }
        return CategoryModel.updateOne({ _id: id }, data);
    }
}