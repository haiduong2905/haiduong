const collection = 'article';
const ArticleModel = require(__path_schemas + collection);
const FileHelper = require(__path_helpers + 'file');
const uploadFolder = 'public/uploads/' + collection + '/';

module.exports = {
    listItems: (params, options = null) => { // Options : Thêm lựa chọn nếu có trường hợp tương tự
        let objWhere = {};
        let sort = {};
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');

        sort[params.sortField] = params.sortType;
        if (params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return ArticleModel
            .find(objWhere)
            .select('name thumb status special ordering created modified category.name')
            .sort(sort) // Sort theo ordering
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage) //Bắt đầu lấy từ phần tử nào cho 1 trang
            .limit(params.pagination.totalItemsPerPage); // Lấy ra tổng số phần tử / 1 trang
    },

    listItemsInSelectBox: (params, options = null) => {
        return ArticleModel.find({}, { _id: 1, name: 1 });
    },

    listItemsFrontEnd: (params = null, options = null) => {
        if (options.task == 'item-special') {
            return ArticleModel
                .find({ status: 'active', special: 'toppost' }) //đk: status để phòng trường hợp bài viết chưa xong để deploy
                .select('name created.user_name created.time category.name thumb')
                .limit(3)
                .sort({ ordering: 'asc' });
        } else if (options.task == 'item-news') {
            return ArticleModel
                .find({ status: 'active' }) //đk: status để phòng trường hợp bài viết chưa xong để deploy
                .select('name created.user_name created.time category.name thumb content')
                .limit(4)
                .sort({ 'created.time': 'desc' });
        }
    },

    getItems: (id, options = null) => {
        return ArticleModel.findById(id); // Lấy item theo id
    },

    countItems: (params, options = null) => {
        let objWhere = {};
        if (params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return ArticleModel.countDocuments(params.objWhere);
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
            return ArticleModel.updateOne({ _id: id }, data);
        }
        if (options.task == 'update-multi') {
            data.status = currentStatus;
            return ArticleModel.updateMany({ _id: { $in: id } }, data);
        }
    },

    changeSpecial: (id, currentSpecial, options = null) => {
        // Đổi status active <-> inactive
        let special = (currentSpecial === 'normal') ? 'toppost' : 'normal';
        let data = { // bổ sung các thuộc tính chỉnh sửa: bởi ai, khi nào?
            special: special,
            modified: {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
        }
        if (options.task == 'update-one') {
            data.special = special;
            return ArticleModel.updateOne({ _id: id }, data);
        }
        if (options.task == 'update-multi') {
            data.special = currentSpecial;
            return ArticleModel.updateMany({ _id: { $in: id } }, data);
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
                await ArticleModel.updateOne({ _id: cids[index] }, data);
            }
            return Promise.resolve("Success");
        } else {
            return ArticleModel.updateOne({ _id: cids }, data)
        }
    },

    deleteItems: async(id, options = null) => {
        if (options.task == 'delete-one') {

            await ArticleModel.findById(id).then((item) => {
                FileHelper.remove(uploadFolder, item.thumb);
            });
            return ArticleModel.deleteOne({ _id: id });
        }
        if (options.task == 'delete-multi') {
            if (Array.isArray(id)) {
                for (let index = 0; index < id.length; index++) {
                    await ArticleModel.findById(id[index]).then((item) => {
                        FileHelper.remove(uploadFolder, item.thumb);
                    });
                }
            } else {
                await ArticleModel.findById(id).then((item) => {
                    FileHelper.remove(uploadFolder, item.thumb);
                });
            }
            return ArticleModel.deleteMany({ _id: { $in: id } });
        }
    },

    saveItems: (item, options = null) => {
        if (options.task == 'add') {
            item.created = {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
            item.category = {
                id: item.category_id,
                name: item.category_name
            }
            return new ArticleModel(item).save();
        }

        if (options.task == 'edit') {
            return ArticleModel.updateOne({ _id: item.id }, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                special: item.special,
                content: item.content,
                thumb: item.thumb,
                category: {
                    id: item.category_id,
                    name: item.category_name
                },
                modified: { // bổ sung các thuộc tính chỉnh sửa: bởi ai, khi nào?
                    user_id: 0,
                    user_name: 'admin',
                    time: Date.now()
                }
            });
        }
        if (options.task == 'change-category-name') {
            return ArticleModel.updateMany({ 'category.id': item.id }, {
                category: {
                    id: item.id,
                    name: item.name
                }
            });

        }
    }
}