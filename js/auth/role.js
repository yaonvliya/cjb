var submitUrl = null;
var formData = null;
var currRoleId = null;
var roleResourceZTreeObj,
	roleResourceTreeSetting = {
		view: {
			selectedMulti: false,
			autoCancelSelected: false
		},
		check: {
			enable: true
		}
		, data: {
			key: {
				name: "name" //就是返回数据中要显示的字段名称（默认为name）
			},
			simpleData: {
				enable: true,
				idKey: "id",// 节点id
				pIdKey: "pid",// 父节点id
				rootPId: ""//根节点id
			}
		}

	};

$(document).ready(function () {

	layform.render(null, "auth-role-form");

	var tableIns = LayTableUtil.render({
		elem: '#auth-role'
		, cols: [[ //表头
			{field: 'roleId', title: '角色ID', sort: true}
			, {field: 'roleName', title: '角色名称'}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#authRoleBar', width: 260}

		]]
		, url: authManageApiUrl.searchRole
		, page: true
		, id: 'authRoleTable'

	});

	//监听工具条
	laytable.on('tool(auth-role)', function (obj) {
		var data = obj.data;
		if (obj.event === 'edit') {
			submitUrl = authManageApiUrl.editRole;

			$("#auth-role-form")[0].reset();

			$("#auth-role_roleId").attr('readonly', true);

			LayerUtil.open("编辑角色", $("#auth-role-form"), "450px");

			var result = AjaxUtil.ajaxPost(authManageApiUrl.getRole, JSON.stringify({"roleId": data.roleId}));
			if (result) {
				formData = result.data;
				loadSimpleFormData("#auth-role-form", result.data);
			}
		} else if (obj.event === 'del') {
			layer.confirm('真的删除行么', function (index) {
				var result = AjaxUtil.ajaxPost(authManageApiUrl.deleteRole, JSON.stringify({"roleId": data.roleId}));
				if (result) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(tableIns, "auth-role-search-form");
				}
			});
		} else if (obj.event === 'authorize') {
			openRightWin('role-resource-win');
			var result = AjaxUtil.ajaxPost(authManageApiUrl.getRoleAuthorize, JSON.stringify({"roleId": data.roleId}));
			if (result) {
				currRoleId = data.roleId;
				roleResourceZTreeObj = $.fn.zTree.init($("#roleResourceTree"), roleResourceTreeSetting, result.data);
				roleResourceZTreeObj.expandAll(true);
			}
		}

	});

	layform.on('submit(authRoleSubmit)', function (data) {
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close();
			layer.msg("操作成功");
			LayTableUtil.refresh(tableIns, "auth-role-search-form");
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});

	$('#auth-role-add').on('click', function () {
		formData = null;
		submitUrl = authManageApiUrl.addRole;

		$("#auth-role-form")[0].reset();

		$("#auth-role_roleId").attr('readonly', false);

		LayerUtil.open("新增角色", $("#auth-role-form"), "450px");

	});

	$('#auth-role-search').on('click', function () {
		LayTableUtil.reload(tableIns, "auth-role-search-form");
	});
	// SearchForm绑定回车事件
	$("#auth-role-search-form").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#auth-role-search').click();
		}
	});

	$('#auth-role-from-reset').on('click', function () {
		if (formData == null) {
			$("#auth-role-form")[0].reset();
		} else {
			loadSimpleFormData("#auth-role-form", formData);
		}
	});

	// 点击遮罩层关闭窗口
	$('.mask').click(function () {
		closeRightWin('role-resource-win');
	});

});

function loadSimpleFormData(elem, data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = $(elem).find(selector);
		elt.val(v);
	});
}


function roleAuthorize() {
	var treeObj = $.fn.zTree.getZTreeObj("roleResourceTree");
	//获取选中节点的值
	var nodes = treeObj.getCheckedNodes(true);
	var checkedNode = [];
	for (var i = 0; i < nodes.length; i++) {
		checkedNode.push(nodes[i].id);
	}
	var params = {
		"roleId": currRoleId,
		"resourceIds": checkedNode
	}

	var result = AjaxUtil.ajaxPost(authManageApiUrl.roleAuthorize, JSON.stringify(params));

	if (result) {
		layer.msg("保存成功");
		closeRightWin('role-resource-win');
	}

}