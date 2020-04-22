var announcementForm = $("#announcementForm");
$(document).ready(function () {
	var submitUrl = null;

	layform.render(null, 'searchAnnocementForm');

	var announcementTable = LayTableUtil.render({
		elem: '#announcement'
		,cols: [[
			{field: 'ancTitle', title: '公告标题'}
			,{field: 'rowAddTime', title: '创建时间', width: 200, sort: true, templet: function (d) {return DateUtils.longToDateString(d.rowAddTime)}}
			,{field: 'topSwitch', title: '是否置顶', fixed: 'right', align: 'center', width: 150, templet: '#announcementTopSwitchStatusTpl'}
			,{field: 'showSwitch', title: '是否展示', fixed: 'right', align: 'center', width: 150, templet: '#announcementShowSwitchStatusTpl'}
			,{fixed: 'right', align:'center', toolbar: '#announcementOperation', width: 220}
		]]
		, url: messageCenterApiUrl.announcement.list
		, page: true
		, id: 'announcementTable'
	});

	layform.on('checkbox(announcementShowSwitchStatus)', function (data) {
		if (data.elem.checked) {
			var param = {"ancId": data.value, "showSwitch": true};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.announcement.showSwitch, JSON.stringify(param));
			if (res) {
				layer.tips("展示", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"ancId": data.value, "showSwitch": false};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.announcement.showSwitch, JSON.stringify(param));
			if (res) {
				layer.tips("不展示", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('checkbox(announcementTopSwitchStatus)', function (data) {
		if (data.elem.checked) {
			var param = {"ancId": data.value, "topSwitch": true};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.announcement.topSwitch, JSON.stringify(param));
			if (res) {
				layer.tips("置顶", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"ancId": data.value, "topSwitch": false};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.announcement.topSwitch, JSON.stringify(param));
			if (res) {
				layer.tips("不置顶", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('radio(announcementShowSwitchFilter)', function(data){
		$("#addAnnouncementShowSwitch").val(data.value);
	});

	layform.on('radio(announcementTopSwitchFilter)', function(data){
		$("#addAnnouncementTopSwitch").val(data.value);
	});

	//监听工具条
	laytable.on('tool(announcement)', function(obj){
		var data = obj.data;
		if(obj.event === 'detail'){
			openRightWinForAnnouncement('公告详情', 'detail', data);
		} else if(obj.event === 'del'){
			layer.confirm('是否删除标题为"' + data.ancTitle + '"的这行吗？', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.announcement.delete + data.ancId);
				if(result){
					layer.close(index);
					layer.msg("刪除成功");
					closeAnnouncementModelFrame();
					LayTableUtil.reload(announcementTable, 'annocementSearchForm');
				}
			});
		} else if(obj.event === 'edit'){
			openRightWinForAnnouncement('编辑公告', 'edit', data);

		}
	});

	$('#reloadAnnouncement').click(function () {
		LayTableUtil.reload(announcementTable, 'annocementSearchForm');
	});
	// SearchForm绑定回车事件
	$("#annocementSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadAnnouncement').click();
		}
	});

	$('#addAnnouncementBtn').click(function(){
		openRightWinForAnnouncement('新建公告', 'add');
	});

	$('#addAnnouncementAncTitle').keyup(function () {
		$(this).next().text(($(this).val().length) + '/30');
	});

	function openRightWinForAnnouncement(title, method, data){
		openRightWin('addAnnouncement');
		$('#announcementModalTitle').text(title);
		if(method=="add"){
			submitUrl = messageCenterApiUrl.announcement.add;
			$("#announcementSubmit").show();
		} else if(method=="edit"){
			submitUrl = messageCenterApiUrl.announcement.modify;
			$("#announcementSubmit").show();
			loadAnnouncementFormData(data);
		} else if(method=="detail"){
			loadAnnouncementFormData(data);
			$("#announcementSubmit").hide();
			announcementForm.find('input').prop("disabled", "disabled");
		}

		layform.render(null, 'announcementForm');
	}

	//监听提交
	layform.on('submit(announcementSubmit)', function(data){
		var formData = new FormData();
		$.each(data.field, function (i, item) {
			formData.append(i, item);
		});
		var result = AjaxUtil.ajaxFormData(submitUrl, formData);
		if (result.code == "20000") {
			layer.msg('操作成功', {
				time: 1000 //1秒关闭
			}, function () {
				closeAnnouncementModelFrame();
				LayTableUtil.reload(announcementTable, 'annocementSearchForm');
			});
		} else if(result.code == "40404" || result.code == "40405"){
			CookieUtil.clearAllCookie();
			window.location.href = $_GLOBAL.basePath() + '/login';
		} else {
			layer.msg(result.message);
		}
		return false;
	});

	$('#announcementSubmit').click(function () {
		$('#announcementSubmitBtn').click();
	});

	$('.mask').click(function () {
		closeAnnouncementModelFrame();
	});

	$('#announcementElm1').xheditor({
		tools: 'full',
		skin: 'default',
		height:300,
		upMultiple: true,
		upImgUrl: "#",
		upImgExt: "jpg,jpeg,gif,bmp,png",
		onUpload: insertUploadAnnouncement,
		html5Upload: false
	});

	function loadAnnouncementFormData(data) {
		$('#addAnnouncementAncTitle').next().text((data.ancTitle).length + '/30');
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.announcement.get + data.ancId);
		if(result){
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = announcementForm.find(selector);
				elt.val("" + v);
			});
			if(result.data.topSwitch){
				announcementForm.find("[name='topSwitchTemp'][title='是']").prop("checked", true);
			} else {
				announcementForm.find("[name='topSwitchTemp'][title='否']").prop("checked", true);
			}

			if(result.data.showSwitch){
				announcementForm.find("[name='showSwitchTemp'][title='是']").prop("checked", true);
			} else {
				announcementForm.find("[name='showSwitchTemp'][title='否']").prop("checked", true);
			}
		}
	}
});

//xhEditor编辑器图片上传回调函数
function insertUploadAnnouncement(msg) {
	var _msg = msg.toString();
	var _picture_name = _msg.substring(_msg.lastIndexOf("/") + 1);
	var _picture_path = SubstringAnnouncement(_msg);
	var _str = "<input type='checkbox' name='_pictures' value='" + _picture_path + "' checked='checked' onclick='return false'/><label>" + _picture_name + "</label><br/>";
	$("#xh_editor").append(_msg);
	$("#uploadList").append(_str);
}
//处理服务器返回到回调函数的字符串内容,格式是JSON的数据格式.
function SubstringAnnouncement(s) {
	return s.substring(s.substring(0, s.lastIndexOf("/")).lastIndexOf("/"), s.length);
}

function closeAnnouncementModelFrame() {
	$("#announcementSubmit").show();
	$('#addAnnouncementAncTitle').next().text('0/30');
	announcementForm[0].reset();
	announcementForm.find('input').removeAttr("disabled");
	closeRightWin('addAnnouncement');
}