var faqTypeForm = $('#faqTypeForm');
$(document).ready(function () {
	var submitUrl = null;
	var index = null;

	layform.render(null, 'searchFaqTypeForm');

	var faqTypeTable = LayTableUtil.render({
		elem: '#faqType'
		,cols: [[ //表头
			{field: 'faqTypeName', title: '问题类型名称'}
			,{field: 'faqModule', title: '问题模块', templet: function (d) {return d.faqModule.message}}
			,{field: 'sortValue', title: '显示顺序', sort: true}
			,{field: 'faqStatus', title: '问题类型状态', fixed: 'right', width: 120, templet: '#faqTypeStatusTpl'}
			,{fixed: 'right', align:'center', toolbar: '#faqTypeOperation', width: 220}
		]]
		, url: messageCenterApiUrl.faqType.list
		, page: true
		, id: 'faqTypeTable'
	});

	//监听工具条
	laytable.on('tool(faqType)', function(obj){
		var data = obj.data;
		if(obj.event === 'detail'){
			openLayerForFaqType('查看', 'detail', data);
		} else if(obj.event === 'del'){
			layer.confirm('是否删除标题为"' + data.faqTypeName + '"的这行吗？同时也会删除该问题类型下的所有问题。', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.faqType.delete + data.faqTypeId);
				if(result){
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(faqTypeTable, 'searchFaqTypeList');
				}
			});
		} else if(obj.event === 'edit'){
			openLayerForFaqType('编辑', 'edit', data);
		}
	});

	layform.on('switch(faqTypeStatusTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"faqTypeId": data.value, "faqTypeStatus": 'online'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.faqType.status, JSON.stringify(param));
			if (res) {
				layer.tips("已上线", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"faqTypeId": data.value, "faqTypeStatus": 'offline'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.faqType.status, JSON.stringify(param));
			if (res) {
				layer.tips("已下线", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('radio(faqTypeStatusFilter)', function(data){
		$("#addFaqTypeStatus").val(data.value);
	});

	$('#reloadFaqType').click(function () {
		LayTableUtil.reload(faqTypeTable, 'searchFaqTypeList');
	});
	// SearchForm绑定回车事件
	$("#searchFaqTypeList").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadFaqType').click();
		}
	});

	$('#addFaqTypeBtn').click(function(){
		openLayerForFaqType('新建', 'add');
	});

	function openLayerForFaqType(title, method, data){

		if(method=="add"){
			submitUrl = messageCenterApiUrl.faqType.add;
			$("#faqTypeSubmit").show();
		} else if(method=="edit"){
			submitUrl = messageCenterApiUrl.faqType.modify;
			$("#faqTypeSubmit").show();
			loadFaqTypeFormData(data);
		} else if(method=="detail"){
			loadFaqTypeFormData(data);
			$("#faqTypeSubmit").hide();
			faqTypeForm.find('input,select').prop("disabled", "disabled");
		}
		index = LayerUtil.open(title, faqTypeForm, '500px', null, 'faqTypeForm', null, true);

		layform.render(null, 'addFaqTypeForm');
	}

	//监听提交
	layform.on('submit(faqTypeFormSubmit)', function(data){
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(data.field));
		if (result) {
			layer.close(index);
			layer.msg("操作成功");
			LayTableUtil.refresh(faqTypeTable, 'searchFaqTypeList');
		}
		return false;
	});

	function loadFaqTypeFormData(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.faqType.get + data.faqTypeId);
		if(result){
			var resultData = result.data;
			layui.each(resultData, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = faqTypeForm.find(selector);
				elt.val("" + v);
			});
			faqTypeForm.find('[name="faqModule"]').val(resultData.faqModule.code);
			faqTypeForm.find('[name="faqTypeStatus"]').val(resultData.faqTypeStatus.code);

			if (result.data.faqTypeStatus.code == 'online') {
				faqTypeForm.find("[name='faqTypeStatusTemp'][title='正常']").prop("checked", true);
			} else {
				faqTypeForm.find("[name='faqTypeStatusTemp'][title='停用']").prop("checked", true);
			}
		}
	}
});