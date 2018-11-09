$(document).ready(function() {
    // Replace the <textarea id="editor1"> with a CKEditor
    // instance, using default configuration.
    if ($('textarea#editor').length) {
        CKEDITOR.replace('editor');
    }

    var ckbAll = $(".cbAll");
    var fmAdmin = $("#zt-form");

    //call active menu
    activeMenu();

    //check selectbox
    change_form_action("#zt-form .slbAction", "#zt-form", "#btn-action");

    //check all
    ckbAll.click(function() {
        $('input:checkbox').not(this).prop('checked', this.checked);
        if ($(this).is(':checked')) {
            $('.ordering').attr("name", "ordering");
        } else {
            $('.ordering').removeAttr("name");
        }
    });
    // hiden notify
    hiddenNotify(".close-btn");

    setTimeout(function() {
        $(".close-btn").parent().css({ 'display': 'none' })
    }, 7000);
    //click checkbox
    $("input[name=cid]").click(function() {
        if ($(this).is(':checked')) {
            $(this).parents("tr").find('.ordering').attr("name", "ordering");
        } else {
            $(this).parents("tr").find('.ordering').removeAttr("name");
        }
    });

    // CONFIRM DELETE
    $('a.btn-delete').on('click', () => {
        if (!confirm("Bạn muốn xóa không?")) return false;
    });

    //active menu function
    function activeMenu() {
        var arrPathname = window.location.pathname.split('/');
        var pattern = (typeof arrPathname[2] !== 'undefined') ? arrPathname[2] : '';

        if (pattern != '') {
            $('#side-menu li a').each(function(index) {
                var subject = $(this).attr("href");
                if (subject != "#" && subject.search(pattern) > 0) {
                    $(this).closest("li").addClass("active");
                    if ($(this).parents("ul").length > 1) {
                        $("#side-menu ul").addClass('in').css("height", "auto");
                        $("#side-menu ul").parent().addClass('active');
                    }
                    return;
                }
            });
        } else {
            $('#side-menu li').first().addClass("active");
        }
    }

    //
    function change_form_action(slb_selector, form_selector, id_btn_action) {

        var optValue;
        var isDelete = false;
        var pattenCheckDelete = new RegExp("delete", "i");

        $(slb_selector).on("change", function() {
            optValue = $(this).val();
            optValue.test
            if (optValue !== "") {
                $(id_btn_action).removeAttr('disabled');
            } else {
                $(id_btn_action).attr('disabled', 'disabled');
            }
            $(form_selector).attr("action", optValue);
        });

        $(form_selector + " .btnAction").on("click", function() {
            isDelete = pattenCheckDelete.test($(slb_selector).val());
            if (isDelete) {
                var confirmDelete = confirm('Are you really want to delete?');
                if (confirmDelete === false) {
                    return;
                }
            }

            var numberOfChecked = $(form_selector + ' input[name="cid"]:checked').length;
            if (numberOfChecked == 0) {
                alert("Please choose some items");
                return;
            } else {
                var flag = false;
                var str = $(slb_selector + " option:selected").attr('data-comfirm');
                if (str != undefined) {

                    //Kiểm tra giá trị trả về khi user nhấn nút trên popup
                    flag = confirm(str);
                    if (flag == false) {
                        return flag;
                    } else {
                        $(form_selector).submit();
                    }

                } else {
                    if (optValue != undefined) {
                        $(form_selector).submit();
                    }
                }
            }

        });
    }

    // hidden parent (hidden message notify)
    function hiddenNotify(close_btn_selector) {
        $(close_btn_selector).on('click', function() {
            $(this).parent().css({ 'display': 'none' });
        })
    }
    // Lấy giá trị Category truyền vào input hidden để Submit cùng form sau đó lưu vào category_name
    $('select[name="category_id"]').change(function() {
            $('input[name="category_name"]').val($(this).find("option:selected").text());
        })
        // Slug 
    function change_alias(alias) {
        var str = alias;
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

    $('input#name_slug').keyup(function() {
        $('input[name="slug"]').val(change_alias($(this).val()));
    });

    // Validate form : Đưa input upload xuống dưới cùng để lưu lại các giá trị validate ở trên
    $('form[name=form-upload]').submit(function(event) {
        let avatar = $(this).find("input[name=avatar]");
        $(this).find("input[name=avatar]").remove();
        $(this).append(avatar).css({ 'display': 'none' });
    });
});