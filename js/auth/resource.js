var submitUrl = null;
var formData = null;
var parentResourceIndex = null;
var resourceZTreeObj,
	resourceTreeSetting = {
		view: {
			selectedMulti: false,
			autoCancelSelected: false
		},
		data: {
			key: {
				name: "name" //就是返回数据中要显示的字段名称（默认为name）
			},
			simpleData: {
				enable: true,
				idKey: "id",// 节点id
				pIdKey: "pid",// 父节点id
				rootPId: ""//根节点id
			}
		},
		callback: {
			onClick: function (event, treeId, treeNode) {
				var resourceType = $("#auth-resource-resourceType").val();
				if (resourceType == "menuItem") {
					if (treeNode.type != "menuGroup") {
						layer.msg("上级资源必须为菜单组");
						return;
					}
				} else {
					if (treeNode.type != "menuItem") {
						layer.msg("上级资源必须为菜单");
						return;
					}
				}
				layer.close(parentResourceIndex);
				$("#parentResourceName").val(treeNode.name);
				$("#parentResourceId").val(treeNode.id);
			}
		}
	};


$(document).ready(function () {

	// layform.render(null, "auth-resource-form");
	layform.render("select");

	var tableIns = LayTableUtil.render({
		elem: '#auth-resource'
		, cols: [[ //表头
			{field: 'resourceName', title: '资源名称', sort: true}
			, {field: 'resourceType', title: '资源类型', templet: '#resourceTypeTpl'}
			, {field: 'resourceUrl', title: '资源URL'}
			, {field: 'resourceOrder', title: '资源排序', width: 120}
			, {field: 'resourceIcon', title: '资源图标', width: 120, align: 'center', templet: '#resourceIconTpl'}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#authResourceBar', width: 220}

		]]
		, url: authManageApiUrl.searchResource
		, page: true
		, id: 'authResourceTable'

	});

	$('#auth-resource-add').on('click', function () {
		formData = null;
		submitUrl = authManageApiUrl.addResource;

		$("#auth-resource-form")[0].reset();

		$("#auth-resource_resourceName").attr('readonly', false);

		LayerUtil.open("新增资源", $("#auth-resource-form"), "450px");

	});

	//监听工具条
	laytable.on('tool(auth-resource)', function (obj) {
		var data = obj.data;
		if (obj.event === 'edit') {
			submitUrl = authManageApiUrl.editResource;

			$("#auth-resource-form")[0].reset();

			LayerUtil.open("编辑资源", $("#auth-resource-form"), "450px");

			var result = AjaxUtil.ajaxPost(authManageApiUrl.getResource, JSON.stringify({"resourceId": data.resourceId}));
			if (result) {
				formData = result.data;
				loadSimpleFormData("#auth-resource-form", result.data);

                if (formData.resourceType == "menuGroup") {
                    $("#parentResourceName").attr("disabled", "disabled");
                    $("#parentResourceName").attr("placeholder", "");
                } else {
                    $("#parentResourceName").removeAttr("disabled");
                    $("#parentResourceName").attr("placeholder", "请选择上级资源");
                }
			}
		} else if (obj.event === 'del') {
			layer.confirm('真的删除行么', function (index) {
				var result = AjaxUtil.ajaxPost(authManageApiUrl.deleteResource, JSON.stringify({"resourceId": data.resourceId}));
				if (result) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(tableIns, "auth-resource-search-form");
				}
			});
		}
	});

	$('#auth-resource-search').on('click', function () {
		LayTableUtil.reload(tableIns, "auth-resource-search-form");
	});
	// SearchForm绑定回车事件
	$("#auth-resource-search-form").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#auth-resource-search').click();
		}
	});

	$('#auth-resource-from-reset').on('click', function () {
		if (formData == null) {
			$("#auth-resource-form")[0].reset();
		} else {
			loadSimpleFormData("#auth-resource-form", formData);
		}
	});

	layform.on('select(auth-resource-resourceType)', function (data) {
		if (data.value == "menuGroup") {
			$("#parentResourceName").attr("disabled", "disabled");
			$("#parentResourceName").attr("placeholder", "");
            $("#parentResourceId").val("-1");
            $("#parentResourceName").val("");
		} else {
			$("#parentResourceName").removeAttr("disabled");
			$("#parentResourceName").attr("placeholder", "请选择上级资源");
		}
	});

	layform.on('submit(authResourceSubmit)', function (data) {
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close();
			layer.msg("操作成功");
			LayTableUtil.refresh(tableIns, "auth-resource-search-form");
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});
});


function loadSimpleFormData(elem, data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = $(elem).find(selector);
		elt.val(v);
	});
}

function showResourceTree() {
	var result = AjaxUtil.ajaxPost(authManageApiUrl.getResourceTree);
	if (result) {
		resourceZTreeObj = $.fn.zTree.init($("#authResourceTree"), resourceTreeSetting, result.data);
		resourceZTreeObj.expandAll(true);
	}

    parentResourceIndex = LayerUtil.open("选择上级资源", $("#menuContent"), "500px");

}

