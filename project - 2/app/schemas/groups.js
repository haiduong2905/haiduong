const mongoose = require('mongoose');

const databaseConfigs = require(__path_config + 'database');
var schema = new mongoose.Schema({
    name: String,
    status: String,
    ordering: Number,
    content: String,
    group_acp: String,
    created: {
        user_id: Number,
        user_name: String,
        time: Date
    },
    modified: {
        user_id: Number,
        user_name: String,
        time: Date
    }
});

module.exports = mongoose.model(`${databaseConfigs.collection_groups}`, schema);