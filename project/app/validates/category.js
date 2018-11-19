const util = require('util');
const Notify = require(__path_config + 'notify');
const option = {
    name: { min: 3, max: 20 },
    ordering: { min: 1, max: 100 },
    status: { value: 'novalue' },
    slug: { min: 3, max: 20 },
    content: { min: 5 }
}

module.exports = {
    validator: (req) => {
        // Name
        req.checkBody('name', util.format(Notify.ERROR_NAME, option.name.min, option.name.max))
            .isLength({ min: option.name.min, max: option.name.max });
        // Ordering
        req.checkBody('ordering', util.format(Notify.ERROR_ORDERING, option.ordering.min, option.ordering.max))
            .isInt({ min: option.ordering.min, max: option.ordering.max });
        // Status
        req.checkBody('status', util.format(Notify.ERROR_STATUS))
            .isNotEqual(option.status.value);
        // Slug
        req.checkBody('slug', util.format(Notify.ERROR_SLUG))
            .notEmpty();
        // Content
        req.checkBody('content', util.format(Notify.ERROR_CONTENT, option.content.min))
            .isLength({ min: option.content.min });
    }
}