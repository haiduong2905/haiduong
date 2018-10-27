const util = require('util');
const Notify = require(__path_config + 'notify');
const option = {
    name: { min: 1, max: 20 },
    ordering: { min: 1, max: 100 },
    status: { value: 'novalue' }
}

module.exports = {
    validator: (req) => {
        // Name
        req.checkBody('name', util.format(Notify.ERROR_NAME, option.name.min, option.name.max))
            .isLength({ min: option.name.min, max: option.name.max });
        req.checkBody('ordering', util.format(Notify.ERROR_ORDERING, option.ordering.min, option.ordering.max))
            .isInt({ min: option.ordering.min, max: option.ordering.max });
        req.checkBody('status', util.format(Notify.ERROR_STATUS))
            .isNotEqual(option.status.value);
    }
}