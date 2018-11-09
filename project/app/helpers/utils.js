let createFilterStatus = async(currentStatus, collection) => {
    const ItemsModel = require(__path_schemas + collection);
    let statusFilter = [
        { name: "All", value: "all", count: 1, class: "default" },
        { name: "Active", value: "active", count: 2, class: "default" },
        { name: "Inactive", value: "inactive", count: 3, class: "default" }
    ];
    for (index = 0; index < statusFilter.length; index++) {
        let item = statusFilter[index];
        let condition = (item.value !== "all") ? { status: item.value } : {};
        if (item.value === currentStatus) statusFilter[index].class = 'success';
        await ItemsModel.countDocuments(condition).then((data) => {
            statusFilter[index].count = data;
        });
    }
    return statusFilter;
}

module.exports = {
    createFilterStatus: createFilterStatus
}