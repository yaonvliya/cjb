var faqForm = $('#addFaqForm');
$(document).ready(function () {
	var submitUrl = null;

	layform.render(null, 'searchFaqForm');

	var faqTable = LayTableUtil.render({
		elem: '#faq'
		,cols: [[ //表头
			{field: 'faqTitle', title: '问题标题'}
			,{field: 'faqModule', title: '问题模块', templet: function (d) {return d.faqModule.message}}
			,{field: 'faqType', title: '问题类型', sort: true}
			,{field: 'sortValue', title: '显示顺序', width: 100, sort: true}
			,{field: 'indexSwitch', title: '是否首页展示', fixed: 'right', width:160, templet: '#faqIndexSwitchTpl'}
			,{field: 'faqStatus', title: '问题状态', fixed: 'right', width:120, templet: '#faqStatusTpl'}
			,{fixed: 'right', align:'center', toolbar: '#faqOperation', width: 220}
		]]
		, url: messageCenterApiUrl.faq.list
		, page: true
		, id: 'faqTable'
	});

	//监听工具条
	laytable.on('tool(faq)', function(obj){
		var data = obj.data;
		if(obj.event === 'detail'){
			openRightWinForFaq('问题详情', 'detail', data);
		} else if(obj.event === 'del'){
			layer.confirm('是否删除标题为"' + data.faqTitle + '"的这行吗？', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.faq.delete + data.faqId);
				if(result){
					layer.close(index);
					layer.msg("刪除成功");
					closeFaqModelFrame();
					LayTableUtil.reload(faqTable, 'searchFaqList');
				}
			});
		} else if(obj.event === 'edit'){
			openRightWinForFaq('编辑问题', 'edit', data);

		}
	});

	layform.on('checkbox(faqIndexSwitchTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"faqId": data.value, "indexSwitch": true};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.faq.indexSwitch, JSON.stringify(param));
			if (res) {
				layer.tips("展示", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"faqId": data.value, "indexSwitch": false};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.faq.indexSwitch, JSON.stringify(param));
			if (res) {
				layer.tips("不展示", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('switch(faqStatusTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"faqId": data.value, "faqStatus": 'online'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.faq.status, JSON.stringify(param));
			if (res) {
				layer.tips("已上线", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"faqId": data.value, "faqStatus": 'offline'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.faq.status, JSON.stringify(param));
			if (res) {
				layer.tips("已下线", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('radio(faqStatusFilter)', function(data){
		$("#addFaqStatus").val(data.value);
	});

	layform.on('select(faqModuleFilter)', function (data) {
		var module = data.value;
		if(module){
			loadFaqTypes(module);
		}
	});

	layform.on('select(faqTypeNameFilter)', function (data) {
		var module = data.value;
		faqForm.find('[name="faqTypeId"]').val(module);
		faqForm.find('[name="faqType"]').val(SelectUtil.getSelectedText("addFaqTypeName"));
		if(!module){
			layer.msg("请选择问题类型。");
		}
	});

	layform.on('radio(faqIndexSwitchFilter)', function(data){
		$("#addFaqIndexSwitch").val(data.value);
	});

	$('#reloadFaq').click(function () {
		LayTableUtil.reload(faqTable, 'searchFaqList');
	});
	// SearchForm绑定回车事件
	$("#searchFaqList").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadFaq').click();
		}
	});

	$('#addFaqBtn').click(function(){
		openRightWinForFaq('新建问题', 'add');
	});

	$('#addFaqTitle').keyup(function () {
		$(this).next().text(($(this).val().length) + '/30');
	});

	function openRightWinForFaq(title, method, data){
		openRightWin('addFaq');
		$('#addModalFaqTitle').text(title);
		if(method=="add"){
			submitUrl = messageCenterApiUrl.faq.add;
			$("#faqSubmit").show();
		} else if(method=="edit"){
			submitUrl = messageCenterApiUrl.faq.modify;
			$("#faqSubmit").show();
			loadFaqFormData(data);
		} else if(method=="detail"){
			loadFaqFormData(data);
			$("#faqSubmit").hide();
			faqForm.find('input,select').prop("disabled", "disabled");
		}

		layform.render(null, 'addFaqForm');
	}

	//监听提交
	layform.on('submit(addFaqSubmit)', function(data){
		var formData = new FormData();
		$.each(data.field, function (i, item) {
			formData.append(i, item);
		});
		var result = AjaxUtil.ajaxFormData(submitUrl, formData);
		if (result.code == "20000") {
			layer.msg('操作成功', {
				time: 1000 //1秒关闭
			}, function () {
				closeFaqModelFrame();
				LayTableUtil.reload(faqTable, 'searchFaqList');
			});
		} else if(result.code == "40404" || result.code == "40405"){
			CookieUtil.clearAllCookie();
			window.location.href = $_GLOBAL.basePath() + '/login';
		} else {
			layer.msg(result.message);
		}
		return false;
	});

	$('#faqSubmit').click(function () {
		$('#faqSubmitBtn').click();
	});

	$('.mask').click(function () {
		closeFaqModelFrame();
	});

	$('#faqAnswer').xheditor({
		tools: 'full',
		skin: 'default',
		height:300,
		upMultiple: true,
		upImgUrl: "#",
		upImgExt: "jpg,jpeg,gif,bmp,png",
		onUpload: insertUploadFaq,
		html5Upload: false
	});

	function loadFaqFormData(data) {
		$('#addFaqTitle').next().text((data.faqTitle).length + '/30');
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.faq.get + data.faqId);
		if(result){
			var resultData = result.data;
			layui.each(resultData, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = faqForm.find(selector);
				elt.val("" + v);
			});

			loadFaqTypes(resultData.faqModule.code);
			$('#addFaqModule').val(resultData.faqModule.code);
			$('#addFaqTypeName').val(resultData.faqTypeId);
			$('#addFaqStatus').val(resultData.faqStatus.code);

			if(result.data.indexSwitch){
				faqForm.find("[name='indexSwitchTemp'][title='是']").prop("checked", true);
			} else {
				faqForm.find("[name='indexSwitchTemp'][title='否']").prop("checked", true);
			}

			if (result.data.faqStatus.code == 'online') {
				faqForm.find("[name='faqStatusTemp'][title='正常']").prop("checked", true);
			} else {
				faqForm.find("[name='faqStatusTemp'][title='停用']").prop("checked", true);
			}
		}



	}
});

//xhEditor编辑器图片上传回调函数
function insertUploadFaq(msg) {
	var _msg = msg.toString();
	var _picture_name = _msg.substring(_msg.lastIndexOf("/") + 1);
	var _picture_path = SubstringFaq(_msg);
	var _str = "<input type='checkbox' name='_pictures' value='" + _picture_path + "' checked='checked' onclick='return false'/><label>" + _picture_name + "</label><br/>";
	$("#xh_editor").append(_msg);
	$("#uploadList").append(_str);
}
//处理服务器返回到回调函数的字符串内容,格式是JSON的数据格式.
function SubstringFaq(s) {
	return s.substring(s.substring(0, s.lastIndexOf("/")).lastIndexOf("/"), s.length);
}

function loadFaqTypes(module) {
	var result = AjaxUtil.ajaxPostWithLoading(messageCenterApiUrl.faqType.types + module);
	if(result){
		SelectUtil.setSelectOpts(result.rows, "addFaqTypeName", "faqTypeId", "faqTypeName");
	}
	layform.render(null, 'addFaqForm');
}

function closeFaqModelFrame() {
	$("#faqSubmit").show();
	faqForm[0].reset();
	$('#addFaqTitle').next().text('0/30');
	faqForm.find('input,select').removeAttr("disabled");
	closeRightWin('addFaq');
}