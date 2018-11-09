const util = require('util');
const Notify = require(__path_config + 'notify');
const option = {
    name: { min: 1, max: 20 },
    ordering: { min: 1, max: 100 },
    status: { value: 'novalue' },
    special: { value: 'novalue' },
    group: { value: 'allvalue' },
    content: { min: 5, max: 200 }
}

module.exports = {
    validator: (req, errUpload, taskCurrent) => {
        // Name
        req.checkBody('name', util.format(Notify.ERROR_NAME, option.name.min, option.name.max))
            .isLength({ min: option.name.min, max: option.name.max });
        // Ordering
        req.checkBody('ordering', util.format(Notify.ERROR_ORDERING, option.ordering.min, option.ordering.max))
            .isInt({ min: option.ordering.min, max: option.ordering.max });
        // Status
        req.checkBody('status', util.format(Notify.ERROR_STATUS))
            .isNotEqual(option.status.value);
        // Special
        req.checkBody('special', util.format(Notify.ERROR_STATUS))
            .isNotEqual(option.special.value);
        // Content
        req.checkBody('content', util.format(Notify.ERROR_CONTENT, option.content.min, option.content.max))
            .isLength({ min: option.content.min, max: option.content.max });
        // Group Choose
        req.checkBody('group_id', util.format(Notify.ERROR_GROUP))
            .isNotEqual(option.group.value);
        // Upload
        let errors = req.validationErrors() !== false ? req.validationErrors() : [];
        if (errUpload) {
            if (errUpload.code == 'LIMIT_FILE_SIZE') {
                errUpload = Notify.ERROR_FILE_LIMIT;
            }
            errors.push({ param: 'avatar', msg: errUpload });
        } else {
            if (req.file == undefined && taskCurrent == 'add') {
                errors.push({ param: 'avatar', msg: Notify.ERROR_FILE_REQUIRE });
            }
        }
        return errors;
    }
}