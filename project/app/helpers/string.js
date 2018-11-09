let createAlias = (value) => {
    var str = value;
    str = str.toLowerCase();
    str = str.replace(/á|à|ã|ạ|ả|â|ấ|ầ|ẫ|ậ|ẩ|ă|ắ|ằ|ẵ|ặ|ẳ/g, "a");
    str = str.replace(/đ/g, "d");
    str = str.replace(/è|é|ẽ|ẹ|ẻ|ê|ề|ế|ễ|ệ|ể/g, "e");
    str = str.replace(/ì|í|ĩ|ị|ỉ/g, "i");
    str = str.replace(/ô|ồ|ố|ỗ|ộ|ổ|ơ|ờ|ớ|ở|ỡ|ợ/g, "o");
    str = str.replace(/ù|ú|ũ|ũ|ụ|ư|ừ|ứ|ử|ữ|ự/g, "u");
    str = str.replace(/ỳ|ý|ỹ|ỵ|ỷ/g, "y");
    str = str.replace(/\~|!|@|\#|\$|%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\}|\[|\]|`|\\|\||\/|\?|\.|\:|\;|\'|\"|\<|\>/g, " ");
    str = str.replace(/ *? /g, "-");
    str = str.trim();
    return str;
}

module.exports = {
    createAlias: createAlias
}