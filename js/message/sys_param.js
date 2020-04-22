var sysParamForm = $("#sysParamForm");
$(document).ready(function () {
	var index = null;
	var submitUrl = null;

	layform.render(null, 'searchSysParam');

	var sysParamTable = LayTableUtil.render({
		elem: '#sysParam'
		, cols: [[ //表头
			{field: 'paramKey', title: '参数key'}
			, {field: 'paramDesc', title: '参数描述'}
			, {field: 'paramValue', title: '参数值'}
			, {field: 'paramValueBefore', title: '更新之前的数据'}
			, {fixed: 'right', align: 'center', toolbar: '#sysParamOperation', width: 220}

		]]
		, url: messageCenterApiUrl.sysParam.list
		, page: true
		, id: 'sysParamTable'
	});

	//监听工具条
	laytable.on('tool(sysParam)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			openLayerForSysParam('查看', 'detail', data);
		}  else if (obj.event === 'del') {
			layer.confirm('是否删除参数key为"' + data.paramKey + '"的这行吗？', function (index) {
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.sysParam.delete + data.paramKey);
				if (result) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(sysParamTable, 'sysParamSearchForm');
				}
			});
		}  else if (obj.event === 'edit') {
			openLayerForSysParam('编辑', 'edit', data);

		}
	});

	$('#reloadSysParam').click(function () {
		LayTableUtil.reload(sysParamTable, 'sysParamSearchForm');
	});
	// SearchForm绑定回车事件
	$("#sysParamSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadSysParam').click();
		}
	});

	$('#addSysParamBtn').click(function(){
		openLayerForSysParam('新建', 'add');
	});

	function openLayerForSysParam(title, method, data) {
		if (method == "add") {
			submitUrl = messageCenterApiUrl.sysParam.add;
			$("#sysParamSubmit").show();
		} else if (method == "edit") {
			submitUrl = messageCenterApiUrl.sysParam.modify;
			$("#sysParamSubmit").show();
			loadSysParamFormData(data);
			sysParamForm.find("[name='paramKey']").prop("readonly", "readonly");
		} else if (method == "detail") {
			loadSysParamFormData(data);
			$("#sysParamSubmit").hide();
			sysParamForm.find("input").prop("disabled", "disabled");
		}

		index = LayerUtil.open(title, sysParamForm, '400px', null, 'sysParamForm', null, true);
	}

	//监听提交
	layform.on('submit(sysParamSubmit)', function (data) {
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close(index);
			layer.msg("操作成功");
			LayTableUtil.reload(sysParamTable, 'sysParamSearchForm');
		}
		return false;
	});

	function loadSysParamFormData(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.sysParam.get + data.paramKey);
		if (result) {
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = sysParamForm.find(selector);
				elt.val("" + v);
			});
		}
	}
});