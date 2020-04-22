var bannerForm = $("#bannerForm");
$(document).ready(function () {
	var index = null;
	var submitUrl = null;

	layform.render(null, 'searchBannerForm');

	var bannerTable = LayTableUtil.render({
		elem: '#banner'
		, cols: [[ //表头
			{field: 'bannerDesc', title: '描述', width: 170}
			, {field: 'bannerImgUrl', title: '图片地址', templet: '#bannerImgUrlTpl'}
			, {field: 'bannerJumpUrl', title: '跳转地址', templet: '#bannerJumpUrlTpl'}
			, {field: 'bannerDomain', title: '所属域', width: 140, templet: function (d) { return d.bannerDomain.desc}}
			, {field: 'showIndex', title: '顺序', width: 60}
			, {field: 'bannerStatus', title: '状态', fixed: 'right', width:110, templet: '#bannerStatusTpl'}
			, {fixed: 'right', align: 'center', toolbar: '#bannerOperation', width: 220}

		]]
		, url: messageCenterApiUrl.banner.list
		, page: true
		, id: 'bannerTable'
	});

	//监听工具条
	laytable.on('tool(banner)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			openLayerForBanner('查看', 'detail', data);
		} else if (obj.event === 'del') {
			layer.confirm('是否删除描述为"' + data.bannerDesc + '"的这行吗？', function (index) {
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.banner.delete + data.bannerId);
				if (result) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(bannerTable, 'bannerSearchForm');
				}
			});
		} else if (obj.event === 'edit') {
			openLayerForBanner('编辑', 'edit', data);
		}
	});

	layform.on('switch(bannerStatusTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"bannerId": data.value, "bannerStatus": 'online'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.banner.status, JSON.stringify(param));
			if (res) {
				layer.tips("已上线", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"bannerId": data.value, "bannerStatus": 'offline'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.banner.status, JSON.stringify(param));
			if (res) {
				layer.tips("已下线", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('radio(bannerStatusFilter)', function(data){
		$("#addBannerStatus").val(data.value);
	});

	$('#reloadBanner').click(function () {
		LayTableUtil.reload(bannerTable, 'bannerSearchForm');
	});
	// SearchForm绑定回车事件
	$("#bannerSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadBanner').click();
		}
	});

	$('#addBannerBtn').click(function () {
		openLayerForBanner('新建', 'add');
	});

	function openLayerForBanner(title, method, data) {
		if (method == "add") {
			submitUrl = messageCenterApiUrl.banner.add;
			$("#bannerSubmit").show();
		} else if (method == "edit") {
			submitUrl = messageCenterApiUrl.banner.modify;
			$("#bannerSubmit").show();
			loadBannerFormData(data);
		} else if (method == "detail") {
			loadBannerFormData( data);
			$("#bannerSubmit").hide();
			bannerForm.find("input,select").prop("disabled", "disabled");
		}
		index = LayerUtil.open(title, bannerForm, '500px', null, 'bannerForm', null, true);

		layform.render(null, 'addBannerForm');
	}

	//监听提交
	layform.on('submit(bannerForm)', function (data) {
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(data.field));
		if (result) {
			layer.close(index);
			layer.msg("操作成功");
			LayTableUtil.reload(bannerTable, 'bannerSearchForm');
		}
		return false;
	});

	function loadBannerFormData(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.banner.get + data.bannerId);
		if (result) {
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = bannerForm.find(selector);
				elt.val("" + v);
			});
			if (result.data.bannerStatus == 'online') {
				bannerForm.find("[name='bannerStatusTemp'][title='正常']").prop("checked", true);
			} else {
				bannerForm.find("[name='bannerStatusTemp'][title='停用']").prop("checked", true);
			}
		}
	}
});