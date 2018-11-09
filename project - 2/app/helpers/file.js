const multer = require('multer');
const randomstring = require("randomstring");
const path = require('path');
const fs = require('fs');
const Notify = require(__path_config + 'notify');

let uploadFile = (field, folderDes = 'users', fileNameLength = 10, fileSizeMb = 1, fileExtension = 'jpg|jpeg|png|gif') => {
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __path_uploads + folderDes + '/') // Vị trí lưu ảnh
        },
        filename: (req, file, cb) => {
            cb(null, randomstring.generate(fileNameLength) + path.extname(file.originalname));
        }
    })

    var upload = multer({ // Lưu ảnh
        storage: storage,
        limits: {
            fileSize: fileSizeMb * 1024 * 1024, //Giới hạn kích thước ảnh 2mb
        },
        fileFilter: (req, file, cb) => {
            // if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            //     return cb(new Error('Chỉ được upload file *.jpg, *.jpeg, *.png, *.gif'));
            // }
            // cb(null, true);
            const fileType = new RegExp(fileExtension);
            const extName = fileType.test(path.extname(file.originalname).toLowerCase());
            const mimeType = fileType.test(file.mimetype);
            if (extName && mimeType) {
                return cb(null, true)
            } else {
                cb(Notify.ERROR_FILE_EXTENSION);
            }
        }
    }).single(field);
    return upload;
}

let removeFile = (folder, fileName) => {
    if (fileName != '' && fileName != undefined) {
        let path = folder + fileName;
        if (fs.existsSync(path)) {
            fs.unlink(path, (err) => {
                if (err) throw err;
            });
        }
    }
}

module.exports = {
    upload: uploadFile,
    remove: removeFile
}