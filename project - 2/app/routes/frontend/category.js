var express = require('express');
var router = express.Router();

const folderView = __path_views_blog + 'pages/category/';
const layoutBlog = __path_views_blog + 'frontend';
/* GET category page. */
router.get('/', function(req, res, next) {
    res.render(`${folderView}index`, {
        layout: layoutBlog,
        top_post: false
    });
});
module.exports = router;