var smsTemplateForm = $("#smsTemplateForm");
$(document).ready(function () {
	var index = null;
	var submitUrl = null;

	layform.render(null, 'searchSmsTemplateForm');

	var smsTemplateTable = LayTableUtil.render({
		elem: '#smsTemplate'
		, cols: [[ //表头
			{field: 'smsTemplateId', title: '短信模板编号'}
			, {field: 'smsTemplateNote', title: '短信模板说明'}
			, {field: 'smsTemplateContent', title: '短信模板内容', width:500}
			, {field: 'smsChannel', title: '短信通道', templet: function (d) { return d.smsChannelText}}
			, {fixed: 'right', align: 'center', toolbar: '#smsTemplateOperation', width: 220}

		]]
		, url: messageCenterApiUrl.smsTemplate.list
		, page: true
		, id: 'smsTemplateTable'
	});

	//监听工具条
	laytable.on('tool(smsTemplate)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			openLayerForSms('查看', 'detail', data);
		} else if (obj.event === 'del') {
			layer.confirm('是否删除模板编号为"' + data.smsTemplateId + '"的这行吗？', function (index) {
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.smsTemplate.delete + data.smsTemplateId);
				if (result) {
					LayerUtil.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(smsTemplateTable, 'smsTemplateSearchForm');
				}
			});
		} else if (obj.event === 'edit') {
			openLayerForSms('编辑', 'edit', data);

		}
	});

	$('#reloadSmsTemplate').click(function () {
		LayTableUtil.reload(smsTemplateTable, 'smsTemplateSearchForm');
	});
	// SearchForm绑定回车事件
	$("#smsTemplateSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadSmsTemplate').click();
		}
	});

	$('#addSmsTemplateBtn').click(function(){
		openLayerForSms('新建', 'add');
	});

	function openLayerForSms(title, method, data) {
		if (method == "add") {
			submitUrl = messageCenterApiUrl.smsTemplate.add;
			$("#smsTemplateSubmit").show();
            $("#smsTemplateReset").show();
		} else if (method == "edit") {
			submitUrl = messageCenterApiUrl.smsTemplate.modify;
            $("#smsTemplateId").prop("readonly", "readonly");
            $("#smsTemplateSubmit").show();
            $("#smsTemplateReset").show();
			loadSmsTemplateFormData(data);
		} else if (method == "detail") {
			loadSmsTemplateFormData(data);
			$("#smsTemplateSubmit").hide();
            $("#smsTemplateReset").hide();
			smsTemplateForm.find("input,select").prop("disabled", "disabled");
		}

		index = LayerUtil.open(title, smsTemplateForm, '550px', null, 'smsTemplateForm', null, true);

		layform.render(null, 'smsTemplateForm');
	}

	//监听提交
	layform.on('submit(smsTemplateSubmit)', function (data) {
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, DataDeal.formToJsonStr('smsTemplateForm'));
		if (result) {
			LayerUtil.close(index);
			layer.msg("操作成功");
			LayTableUtil.refresh(smsTemplateTable, 'smsTemplateSearchForm');
		}
		return false;
	});

	function loadSmsTemplateFormData(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.smsTemplate.get + data.smsTemplateId);
		if (result) {
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = smsTemplateForm.find(selector);
				elt.val("" + v);
			});
		}

	}
});