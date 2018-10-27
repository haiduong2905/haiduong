const mongoose = require('mongoose');

const databaseConfigs = require(__path_config + 'database');
var schema = new mongoose.Schema({
    name: String,
    status: String,
    ordering: Number

});

module.exports = mongoose.model(`${databaseConfigs.collection_items}`, schema);