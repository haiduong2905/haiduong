let createFilterStatus = async(currentStatus, collection) => {
    const Model = require(__path_schemas + collection);
    let statusFilter = [
        { name: "All", value: "all", count: 1, class: "default" },
        { name: "Active", value: "active", count: 2, class: "default" },
        { name: "Inactive", value: "inactive", count: 3, class: "default" }
    ];
    // statusFilter.forEach((item, index) => {
    for (index = 0; index < statusFilter.length; index++) {
        let item = statusFilter[index];
        let condition = (item.value !== "all") ? { status: item.value } : {};
        if (item.value === currentStatus) statusFilter[index].class = 'success';
        // console.log(item.value);
        await Model.countDocuments(condition).then((data) => {
            statusFilter[index].count = data;
            // console.log('data:' + data);
        });
    }
    return statusFilter;
}

module.exports = {
    createFilterStatus: createFilterStatus
}