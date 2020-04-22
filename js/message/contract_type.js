var contractTypeForm = $("#addContractTypeForm");
$(document).ready(function () {
	var index = null;
	var submitUrl = null;

	layform.render(null, 'searchContractTypeForm');

	var contracTypeTable = LayTableUtil.render({
		elem: '#contractType'
		, cols: [[ //表头
            {field: 'contractTypeCode', title: '合同类型编码', width: 120}
			,{field: 'contractTypeName', title: '合同类型名称', width: 200}
			, {field: 'bizButtons', title: '业务按钮'}
			, {field: 'contractScope', title: '作用域', width: 120}
			, {field: 'contractTypeStatus', title: '状态', fixed: 'right', width:100, templet: '#contractTypeStatusTpl'}
			, {fixed: 'right', align: 'center', toolbar: '#contractTypeOperation', width: 220}

		]]
		, url: messageCenterApiUrl.contractType.list
		, page: true
		, id: 'contractTypeTable'
	});

	//监听工具条
	laytable.on('tool(contractType)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			openLayerForContract('查看', 'detail', data);
		} else if (obj.event === 'edit') {
			openLayerForContract('编辑', 'edit', data);

		}
	});

	layform.on('switch(contractTypeStatusTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"contractTypeCode": data.value, "contractTypeStatus": 'online'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.contractType.status, JSON.stringify(param));
			if (res) {
				layer.tips("已上线", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"contractTypeCode": data.value, "contractTypeStatus": 'offline'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.contractType.status, JSON.stringify(param));
			if (res) {
				layer.tips("已下线", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('radio(contractTypeStatusFilter)', function(data){
		$("#addContractTypeStatus").val(data.value);
	});

	$('#reloadContractType').click(function () {
		LayTableUtil.reload(contracTypeTable, 'contracTypeSearchForm');
	});
	// SearchForm绑定回车事件
	$("#contracTypeSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadContractType').click();
		}
	});

	$('#addContractTypeBtn').click(function(){
		openLayerForContract('新建', 'add');
	});

	function openLayerForContract(title, method, data) {
		if (method == "add") {
			submitUrl = messageCenterApiUrl.contractType.add;
			$("#contractTypeSubmit").show();
		} else if (method == "edit") {
			submitUrl = messageCenterApiUrl.contractType.modify;
			$("#contractTypeSubmit").show();
			loadContractTypeFormData(data);
		} else if (method == "detail") {
			loadContractTypeFormData(data);
			$("#contractTypeSubmit").hide();
			contractTypeForm.find("input,select").prop("disabled", "disabled");
		}

		index = LayerUtil.open(title, $('#addContractTypeForm'), '500px', null, 'addContractTypeForm', null, true);

		layform.render(null, 'addContractTypeForm');
	}

	//监听提交
	layform.on('submit(contractTypeSubmit)', function (data) {
		var data = {};
		var context = $('#addContractTypeForm').serializeArray();
		$.each(context, function() {
			data[this.name] = this.value;
		});
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(data));
		if (result) {
			LayerUtil.close(index);
			layer.msg("操作成功");
			LayTableUtil.refresh(contracTypeTable, 'contracTypeSearchForm');
		}
		return false;
	});

	function loadContractTypeFormData(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.contractType.get + data.contractTypeCode);
		if (result) {
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = contractTypeForm.find(selector);
				elt.val("" + v);
			});
			if (result.data.contractTypeStatus == 'online') {
				contractTypeForm.find("[name='contractTypeStatusTemp'][title='正常']").prop("checked", true);
			} else {
				contractTypeForm.find("[name='contractTypeStatusTemp'][title='停用']").prop("checked", true);
			}
		}
	}
});