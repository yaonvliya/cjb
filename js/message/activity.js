var activityForm = $("#activityForm");
$(document).ready(function () {
	var submitUrl = null;

	layform.render(null, 'searchActivityForm');

	var activityTable = LayTableUtil.render({
		elem: '#activity'
		,cols: [[
			{field: 'activityName', title: '活动名称', width: 170}
			,{field: 'activityIndexUrl', title: '活动首页地址', width: 240, templet: '#activityIndexUrlTpl'}
			,{field: 'activityBannerUrl', title: '活动banner图片地址', width: 240, templet: '#activityBannerUrlTpl'}
			,{field: 'startTime', title: '开始时间', width: 170, sort: true, templet: function (d) { return DateUtils.longToDateString(d.startTime)}}
			,{field: 'finishTime', title: '结束时间', width: 170, sort: true, templet: function (d) { return DateUtils.longToDateString(d.finishTime)}}
			,{field: 'showIndex', title: '顺序', width:60}
			,{field: 'showSwitch', title: '活动列表展示与否 ', fixed: 'right', width:180, templet: '#activityShowSwitchTpl'}
			,{field: 'activityStatus', title: '状态', fixed: 'right', width:100, templet: '#activityStatusTpl'}
			,{fixed: 'right', align:'center', toolbar: '#activityOperation', width: 220}

		]]
		, url: messageCenterApiUrl.activity.list
		, page: true
		, id: 'activityTable'
	});

	//监听工具条
	laytable.on('tool(activity)', function(obj){
		var data = obj.data;
		if(obj.event === 'detail'){
			openRightWinForActivity('活动详情', 'detail', data);
		} else if(obj.event === 'del'){
			layer.confirm('真的删除行么', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.activity.delete + data.activityId);
				if(result){
					layer.close(index);
					layer.msg("刪除成功");
					closeActivityModelFrame();
					LayTableUtil.refresh(activityTable, 'activitySearchForm');
				}
			});
		} else if(obj.event === 'edit'){
			openRightWinForActivity('编辑活动', 'edit', data);

		}
	});

	layform.on('checkbox(activityShowSwitchTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"activityId": data.value, "showSwitch": true};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.activity.show, JSON.stringify(param));
			if (res) {
				layer.tips("展示", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"activityId": data.value, "showSwitch": false};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.activity.show, JSON.stringify(param));
			if (res) {
				layer.tips("不展示", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('switch(activityStatusTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"activityId": data.value, "activityStatus": 'online'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.activity.status, JSON.stringify(param));
			if (res) {
				layer.tips("已上线", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"activityId": data.value, "activityStatus": 'offline'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.activity.status, JSON.stringify(param));
			if (res) {
				layer.tips("已下线", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('radio(activityStatusFilter)', function(data){
		$("#addActivityStatus").val(data.value);
	});

	layform.on('radio(activityShowSwitchFilter)', function(data){
		$("#addActivityShowSwitch").val(data.value);
	});

	$('#reloadActivity').click(function () {
		LayTableUtil.reload(activityTable, 'activitySearchForm');
	});
	// SearchForm绑定回车事件
	$("#activitySearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadActivity').click();
		}
	});

	$('#addActivityBtn').click(function () {
		openRightWinForActivity('新建活动', 'add');
	});

	function openRightWinForActivity(title, method, data){
		openRightWin('addActivity');
		$('#addModalActivityTitle').text(title);
		if(method=="add"){
			submitUrl = messageCenterApiUrl.activity.add;
			$("#activitySubmit").show();
		} else if(method=="edit"){
			submitUrl = messageCenterApiUrl.activity.modify;
			$("#activitySubmit").show();
			loadFormDataForActivity( data);
		} else if(method=="detail"){
			loadFormDataForActivity(data);
			$("#activitySubmit").hide();
			activityForm.find("input,select").prop("disable", "disable");
		}

		layform.render(null, 'addActivityForm');
	}

	//监听提交
	layform.on('submit(activityFormSubmit)', function(data){
		var formData = new FormData();
		$.each(data.field, function (i, item) {
			formData.append(i, item);
		});
		formData.append("faqContent", $('#activityContent').val());
		var result = AjaxUtil.ajaxFormData(submitUrl, formData);
		if (result.code == "20000") {
			layer.msg('操作成功', {
				time: 1000 //1秒关闭
			}, function () {
				closeActivityModelFrame();
				LayTableUtil.reload(activityTable, 'activitySearchForm');
			});
		} else if(result.code == "40404" || result.code == "40405"){
			CookieUtil.clearAllCookie();
			window.location.href = $_GLOBAL.basePath() + '/login';
		} else {
			layer.msg(result.message);
		}
		return false;
	});

	$('#activitySubmit').click(function () {
		$('#activitySubmitBtn').click();
	});

	laydate.render({
		elem: '#addActivityStartTime'
		, type: 'datetime'
		, format: 'yyyy-MM-dd HH:mm:ss'
	});

	laydate.render({
		elem: '#addActivityFinishTimee'
		, type: 'datetime'
		, format: 'yyyy-MM-dd HH:mm:ss'
	});

	$("#addActivityFinishTimee").focus(function () {
		var time = $('#addActivityStartTime').val();
		$(this).attr("startTime", time)
	});

	$('.mask').click(function () {
		closeActivityModelFrame();
	});

	$('#activityContent').xheditor({
		tools: 'full',
		skin: 'default',
		height:300,
		upMultiple: true,
		upImgUrl: "#",
		upImgExt: "jpg,jpeg,gif,bmp,png",
		onUpload: insertUploadActivity,
		html5Upload: false
	});

	function loadFormDataForActivity(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.activity.get + data.activityId);
		if(result){
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = activityForm.find(selector);
				elt.val("" + v);
			});
			if(result.data.showSwitch){
				activityForm.find("[name='showSwitchTemp'][title='是']").prop("checked", true);
			} else {
				activityForm.find("[name='showSwitchTemp'][title='否']").prop("checked", true);
			}

			if (result.data.activityStatus == 'online') {
				activityForm.find("[name='activityStatusTemp'][title='正常']").prop("checked", true);
			} else {
				activityForm.find("[name='activityStatusTemp'][title='停用']").prop("checked", true);
			}
		}

	}
});

//xhEditor编辑器图片上传回调函数
function insertUploadActivity(msg) {
	var _msg = msg.toString();
	var _picture_name = _msg.substring(_msg.lastIndexOf("/") + 1);
	var _picture_path = SubstringActivity(_msg);
	var _str = "<input type='checkbox' name='_pictures' value='" + _picture_path + "' checked='checked' onclick='return false'/><label>" + _picture_name + "</label><br/>";
	$("#xh_editor").append(_msg);
	$("#uploadList").append(_str);
}
//处理服务器返回到回调函数的字符串内容,格式是JSON的数据格式.
function SubstringActivity(s) {
	return s.substring(s.substring(0, s.lastIndexOf("/")).lastIndexOf("/"), s.length);
}

function closeActivityModelFrame() {
	activityForm[0].reset();
	activityForm.find("input,select").removeAttr("disable");
	closeRightWin('addActivity');
}