var productTypeForm = $("#addProductTypeForm");
$(document).ready(function () {
	var index = null;
	var submitUrl = null;

	var productTypeTable = LayTableUtil.render({
		elem: '#productType'
		, cols: [[ //表头
			{field: 'productTypeName', title: '产品类型名称'}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#productTypeOperation', width: 300}

		]]
		, url: bizConfigAPI.productType.list
		, page: false
		, id: 'productTypeTable'
	});

	//监听工具条
	laytable.on('tool(productType)', function (obj) {
		var data = obj.data;
		if (obj.event === 'delete') {
            layer.confirm('是否删除名称为"' + data.productTypeName + '"的这行吗？', function (index) {
                var params = {productTypeId: data.productTypeId};
                var result = AjaxUtil.ajaxPostWithLoading(bizConfigAPI.productType.delete, JSON.stringify(params));
                if (result) {
                    layer.close(index);
                    layer.msg("刪除成功");
                    productTypeTable.reload();
                }
            });
		}
	});

	$('#addProductTypeBtn').click(function(){
		openLayerForProduct('新建', 'add');
	});

	function openLayerForProduct(title, method, data) {
		if (method == "add") {
			submitUrl = bizConfigAPI.productType.add;
			$("#productTypeSubmit").show();
		} else if (method == "edit") {
			submitUrl = bizConfigAPI.productType.edit;
			$("#productTypeSubmit").show();
			loadProductTypeFormData(data);
		} else if (method == "detail") {
			loadProductTypeFormData(data);
			$("#productTypeSubmit").hide();
			productTypeForm.find("input,select").prop("disabled", "disabled");
		}

		index = LayerUtil.open(title, $('#addProductTypeForm'), '500px', null, 'addProductTypeForm', null, true);

		layform.render(null, 'addProductTypeForm');
	}

	//监听提交
	layform.on('submit(productTypeSubmit)', function (data) {
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close(index);
			layer.msg("操作成功");
            productTypeTable.reload();
		}
		return false;
	});

});