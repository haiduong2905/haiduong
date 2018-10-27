/*
http.createServer((req, res) => {
    fs.readFile('./home.html', (err, data) => {
        if (err) {
            res.writeHead(404);
            res.write("File not found");
        } else {
            res.write(data);
        };
        res.end();
    });

}).listen(config.port);
*/

//Viết lại đoạn code trên trong 1 function
/*
function onRequest(req, res) {
    const path = url.parse(req.url).pathname;
    if (path == "/") {
        fs.readFile('./views/home.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.write("File not found");
            } else {
                res.write(data);
            };
            res.end();
        });
    } else if (path == "/about") {
        fs.readFile('./views/about.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.write("File not found");
            } else {
                res.write(data);
            };
            res.end();
        })
    }
}
http.createServer(onRequest).listen(config.port);
*/

// Viết gọn lại function do cấu trúc if else giống nhau, cú pháp if else dc thay bằng switch ... case vì có rất nhiều trang web

const url = require('url');
const fs = require('fs');

function renderHTML(path, res) {
    fs.readFile(path, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.write("File not found");
        } else {
            res.write(data);
        };
        res.end();
    });
};

// Tạo trang file not found
function render404(res) {
    res.writeHead(404);
    res.write("File not found");
    res.end();
};

module.exports = {
    onRequest: function onRequest(req, res) {
        const path = url.parse(req.url).pathname;
        switch (path) {
            case '/':
                renderHTML('./views/home.html', res);
                break;
            case "/about":
                renderHTML('./views/about.html', res);
                break;
            default:
                render404(res);
                break;
        }
    }
};