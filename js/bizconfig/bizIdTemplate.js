var submitUrl = null;
var formData = null;

$(document).ready(function () {

	layform.render(null, "bizIdTemplateForm");

	var tableIns = LayTableUtil.render({
		elem: '#bizIdTemplate'
		, cols: [[ //表头
			{field: 'bidCode', title: 'ID编码', sort: true}
            , {field: 'bidDesc', title: 'ID描述'}
            , {field: 'prefixType', title: '前缀类型', templet: function(d){
            	return d.prefixType.message;
			}}
            , {field: 'prefixStaticValue', title: '前缀字符串值'}
            , {field: 'bidLength', title: '长度'}
            , {field: 'fillVal', title: '填充值'}
            , {field: 'initVal', title: '初始值'}
            , {field: 'resetPolicy', title: '重置策略', templet: function(d){
                return d.resetPolicy.message;
            }}
			, {field: 'resetMaxVal', title: '重置最大阈值'}
            , {field: 'generatedFlag', title: '是否已产生流水号', templet: function(d){
                return d.generatedFlag ? '是' : '否';
            }}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#bizIdTemplateBar', width: 160}

		]]
		, url: bizConfigAPI.bizIdTemplate.search
		, page: true
		, id: 'bizIdTemplateTable'

	});

	//监听工具条
	laytable.on('tool(bizIdTemplate)', function (obj) {
		var data = obj.data;
		if (obj.event === 'edit') {
			submitUrl = bizConfigAPI.bizIdTemplate.edit;

			$("#bizIdTemplateForm")[0].reset();

            $("#bizIdTemplateForm").find('[name="bidCode"]').attr('readonly', true);

			LayerUtil.open("编辑业务ID模板", $("#bizIdTemplateForm"), "520px");

			var result = AjaxUtil.ajaxPost(bizConfigAPI.bizIdTemplate.get, JSON.stringify({"bidCode": data.bidCode}));
			if (result) {
				formData = result.data;
				loadSimpleFormData("#bizIdTemplateForm", formData);
                $("#bizIdTemplateForm").find('[name="prefixType"]').val(formData.prefixType.code);
                $("#bizIdTemplateForm").find('[name="resetPolicy"]').val(formData.resetPolicy.code);
			}
		} else if (obj.event === 'del') {
			layer.confirm('真的删除行么', {title: '提示'}, function (index) {
				var result = AjaxUtil.ajaxPost(bizConfigAPI.bizIdTemplate.delete, JSON.stringify({"bidCode": data.bidCode}));
				if (result) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.refresh(tableIns, "bizIdTemplateSearchForm");
				}
			});
		}

	});

	layform.on('submit(bizIdTemplateFormSubmit)', function (data) {
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close();
			layer.msg("操作成功");
			LayTableUtil.refresh(tableIns, "bizIdTemplateSearchForm");
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});

    layform.on(('select(prefixType)'), function(data){
		if(data.value == "dynamic_date"){
            $("#bizIdTemplateForm").find('[name="prefixStaticValue"]').val("");
            $("#bizIdTemplateForm").find('[name="prefixStaticValue"]').attr("disabled", "disabled");
            $("#bizIdTemplateForm").find('[name="prefixStaticValue"]').removeAttr("lay-verify");
		}else {
            $("#bizIdTemplateForm").find('[name="prefixStaticValue"]').removeAttr("disabled");
            $("#bizIdTemplateForm").find('[name="prefixStaticValue"]').attr("lay-verify", "required");
		}
    });

	layform.on(('select(resetPolicy)'), function(data){
        if(data.value == "max_value_mode"){
            $("#bizIdTemplateForm").find('[name="resetMaxVal"]').removeAttr("disabled");
            $("#bizIdTemplateForm").find('[name="resetMaxVal"]').attr("lay-verify", "required");
        }else {
            $("#bizIdTemplateForm").find('[name="resetMaxVal"]').val("");
            $("#bizIdTemplateForm").find('[name="resetMaxVal"]').attr("disabled", "disabled");
            $("#bizIdTemplateForm").find('[name="resetMaxVal"]').removeAttr("lay-verify");
        }
	});

	$('#bizIdTemplateAdd').on('click', function () {
		formData = null;
		submitUrl = bizConfigAPI.bizIdTemplate.add;

		$("#bizIdTemplateForm")[0].reset();

        $("#bizIdTemplateForm").find('[name="bidCode"]').attr('readonly', false);

		LayerUtil.open("新增业务ID模板", $("#bizIdTemplateForm"), "520px");

	});

	$('#bizIdTemplateSearch').on('click', function () {
		LayTableUtil.reload(tableIns, "bizIdTemplateSearchForm");
	});
	// SearchForm绑定回车事件
	$("#bizIdTemplateSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#bizIdTemplateSearch').click();
		}
	});

	$('#bizIdTemplateFromReset').on('click', function () {
		if (formData == null) {
			$("#bizIdTemplateForm")[0].reset();
		} else {
			loadSimpleFormData("#bizIdTemplateForm", formData);
            $("#bizIdTemplateForm").find('[name="prefixType"]').val(formData.prefixType.code);
            $("#bizIdTemplateForm").find('[name="resetPolicy"]').val(formData.resetPolicy.code);
            layform.render(null, "bizIdTemplateForm");
		}
	});

});

function loadSimpleFormData(elem, data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = $(elem).find(selector);
		elt.val(v);
	});
}
