const util = require('util');
const Notify = require(__path_config + 'notify');
const option = {
    name: { min: 3, max: 50 },
    slug: {},
    price: {},
    ordering: { min: 1, max: 100 },
    status: { value: 'novalue' },
    caterogy: { value: 'allvalue' },
    infomation: { min: 5 }
}

module.exports = {
    validator: (req) => {
      
        // Name
        req.checkBody('name', util.format(Notify.ERROR_NAME, option.name.min, option.name.max))
            .isLength({ min: option.name.min, max: option.name.max });

        // Slug
        req.checkBody('slug', util.format(Notify.ERROR_SLUG))
            .notEmpty();

        // Price
        req.checkBody('price', util.format(Notify.ERROR_PRICE))
            .notEmpty();

        // Ordering
        req.checkBody('ordering', util.format(Notify.ERROR_ORDERING, option.ordering.min, option.ordering.max))
            .isInt({ min: option.ordering.min, max: option.ordering.max });

        // Status
        req.checkBody('status', util.format(Notify.ERROR_STATUS))
            .isNotEqual(option.status.value);

        // Category
        req.checkBody('category_id', util.format(Notify.ERROR_CATEGORY))
            .isNotEqual(option.caterogy.value);


        // Infomation
        req.checkBody('infomation', util.format(Notify.ERROR_INFOMATION, option.infomation.min))
            .isLength({ min: option.infomation.min });
    }
}