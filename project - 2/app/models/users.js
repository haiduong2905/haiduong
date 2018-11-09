const collection = 'users';
const UsersModel = require(__path_schemas + collection);
const FileHelper = require(__path_helpers + 'file');
const uploadFolder = 'public/uploads/' + collection + '/';

module.exports = {
    listItems: (params, options = null) => { // Options : Thêm lựa chọn nếu có trường hợp tương tự
        let objWhere = {};
        let sort = {};
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');

        sort[params.sortField] = params.sortType;
        if (params.groupID !== 'allvalue' && params.groupID !== '') objWhere['group.id'] = params.groupID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return UsersModel
            .find(objWhere)
            .select('name avatar status ordering created modified group.name')
            .sort(sort) // Sort theo ordering
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
            .limit(params.pagination.totalItemsPerPage); // Lấy ra tổng số phần tử / 1 trang
    },
    listItemsInSelectBox: (params, options = null) => {
        return UsersModel.find({}, { _id: 1, name: 1 });
    },
    getItems: (id, options = null) => {
        return UsersModel.findById(id); // Lấy item theo id
    },
    countItems: (params, options = null) => {
        let objWhere = {};
        if (params.groupID !== 'allvalue' && params.groupID !== '') objWhere['group.id'] = params.groupID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return UsersModel.countDocuments(params.objWhere);
    },
    changeStatus: (id, currentStatus, options = null) => {
        // Đổi status active <-> inactive
        let status = (currentStatus === 'active') ? 'inactive' : 'active';
        let data = { // bổ sung các thuộc tính chỉnh sửa: bởi ai, khi nào?
            modified: {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
        }
        if (options.task == 'update-one') {
            data.status = status;
            return UsersModel.updateOne({ _id: id }, data);
        }
        if (options.task == 'update-multi') {
            data.status = currentStatus;
            return UsersModel.updateMany({ _id: { $in: id } }, data);
        }
    },
    changeOrdering: async(cids, orderings, options = null) => {
        let data = {
            ordering: parseInt(orderings),
            modified: {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
        }
        if (Array.isArray(cids)) {
            for (let index = 0; index < cids.length; index++) {
                data.ordering = parseInt(orderings[index]);
                await UsersModel.updateOne({ _id: cids[index] }, data);
            }
            return Promise.resolve("Success");
        } else {
            return UsersModel.updateOne({ _id: cids }, data)
        }
    },
    deleteItems: async(id, options = null) => {
        if (options.task == 'delete-one') {

            await UsersModel.findById(id).then((item) => {
                FileHelper.remove(uploadFolder, item.avatar);
            });
            return UsersModel.deleteOne({ _id: id });
        }
        if (options.task == 'delete-multi') {
            if (Array.isArray(id)) {
                for (let index = 0; index < id.length; index++) {
                    await UsersModel.findById(id[index]).then((item) => {
                        FileHelper.remove(uploadFolder, item.avatar);
                    });
                }
            } else {
                await UsersModel.findById(id).then((item) => {
                    FileHelper.remove(uploadFolder, item.avatar);
                });
            }
            return UsersModel.deleteMany({ _id: { $in: id } });
        }
    },
    saveItems: (item, options = null) => {
        if (options.task == 'add') {
            item.created = {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
            item.group = {
                id: item.group_id,
                name: item.group_name
            }
            return new UsersModel(item).save();
        }

        if (options.task == 'edit') {
            return UsersModel.updateOne({ _id: item.id }, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                content: item.content,
                avatar: item.avatar,
                group: {
                    id: item.group_id,
                    name: item.group_name
                },
                modified: { // bổ sung các thuộc tính chỉnh sửa: bởi ai, khi nào?
                    user_id: 0,
                    user_name: 'admin',
                    time: Date.now()
                }
            });
        }
        if (options.task == 'change-group-name') {
            return UsersModel.updateMany({ 'group.id': item.id }, {
                group: {
                    id: item.id,
                    name: item.name
                }
            });

        }
    }
}