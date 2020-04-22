var mailTemplateForm = $("#mailTemplateForm");
$(document).ready(function () {
	var index = null;
	var submitUrl = null;

	layform.render(null, 'searchMailTemplateForm');

	var mailTemplateTable = LayTableUtil.render({
		elem: '#mailTemplate'
		, cols: [[ //表头
			{field: 'mailTemplateId', title: '邮件模板编号'}
			, {field: 'mailTemplateNote', title: '邮件模板说明'}
            , {field: 'mailTemplateSubject', title: '邮件模板主题'}
			, {field: 'mailType', title: '邮件类型', templet: function (d) { return d.mailTypeText}}
			, {fixed: 'right', align: 'center', toolbar: '#mailTemplateOperation', width: 220}

		]]
		, url: messageCenterApiUrl.mailTemplate.list
		, page: true
		, id: 'mailTemplateTable'
	});

	//监听工具条
	laytable.on('tool(mailTemplate)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			openLayerForMail('查看邮件模板', 'detail', data);
		} else if (obj.event === 'del') {
			layer.confirm('是否删除模板编号为"' + data.mailTemplateId + '"的这行吗？', function (index) {
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.mailTemplate.delete + data.mailTemplateId);
				if (result) {
					LayerUtil.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(mailTemplateTable, 'mailTemplateSearchForm');
				}
			});
		} else if (obj.event === 'edit') {
			openLayerForMail('编辑邮件模板', 'edit', data);

		}
	});

	$('#reloadMailTemplate').click(function () {
		LayTableUtil.reload(mailTemplateTable, 'mailTemplateSearchForm');
	});
	// SearchForm绑定回车事件
	$("#mailTemplateSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadMailTemplate').click();
		}
	});

	$('#addMailTemplateBtn').click(function(){
		openLayerForMail('新建邮件模板', 'add');
	});

	function openLayerForMail(title, method, data) {
        openRightWin('mailTemplateDetailWin');
        $('#mailTemplateDetailWinTitle').text(title);
		if (method == "add") {
			submitUrl = messageCenterApiUrl.mailTemplate.add;
			$("#mailTemplateSubmitBtn").show();
		} else if (method == "edit") {
            $("#mailTemplateId").prop("readonly", "readonly");
			submitUrl = messageCenterApiUrl.mailTemplate.modify;
			$("#mailTemplateSubmitBtn").show();
			loadMailTemplateFormData(data);
		} else if (method == "detail") {
            submitUrl = "";
			loadMailTemplateFormData(data);
			$("#mailTemplateSubmitBtn").hide();
			mailTemplateForm.find("input,select").prop("disabled", "disabled");
		}

		layform.render(null, 'mailTemplateForm');
	}

	//监听提交
	layform.on('submit(mailTemplateSubmit)', function (data) {
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(data.field));
		if (result) {
			closeMailTemplateDetailWin();
			layer.msg("操作成功");
			LayTableUtil.refresh(mailTemplateTable, 'mailTemplateSearchForm');
		}
		return false;
	});

	function loadMailTemplateFormData(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.mailTemplate.get + data.mailTemplateId);
		if (result) {
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = mailTemplateForm.find(selector);
				elt.val("" + v);
			});
		}

	}

    $('.mask').click(function () {
        closeMailTemplateDetailWin();
    });

    $('#mailTemplateSubmitBtn').click(function () {
        $('#mailTemplateSubmit').click();
    });

    var mailTemplateContent = $('#mailTemplateContent').xheditor({
        tools: 'full',
        skin: 'default',
        height:600,
        upMultiple: true,
        upImgUrl: "#",
        upImgExt: "jpg,jpeg,gif,bmp,png",
        onUpload: insertUploadMailTemplate,
        html5Upload: false
    });

});

//xhEditor编辑器图片上传回调函数
function insertUploadMailTemplate(msg) {
    var _msg = msg.toString();
    var _picture_name = _msg.substring(_msg.lastIndexOf("/") + 1);
    var _picture_path = SubstringMailTemplate(_msg);
    var _str = "<input type='checkbox' name='_pictures' value='" + _picture_path + "' checked='checked' onclick='return false'/><label>" + _picture_name + "</label><br/>";
    $("#xh_editor").append(_msg);
    $("#uploadList").append(_str);
}
//处理服务器返回到回调函数的字符串内容,格式是JSON的数据格式.
function SubstringMailTemplate(s) {
    return s.substring(s.substring(0, s.lastIndexOf("/")).lastIndexOf("/"), s.length);
}

function closeMailTemplateDetailWin() {
    mailTemplateForm[0].reset();
    mailTemplateForm.find("input,select").removeAttr("disabled");
    closeRightWin('mailTemplateDetailWin');
}

