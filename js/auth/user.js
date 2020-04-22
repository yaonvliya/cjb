var submitUrl = null;
var formData = null;
$(document).ready(function () {
	layform.render(null, "auth-user-form");

	var tableIns = LayTableUtil.render({
		elem: '#auth-user'
		, cols: [[ //表头
			{field: 'userId', title: '登录名', sort: true}
            ,{field: 'userName', title: '真实姓名'}
            , {field: 'cellphone', title: '手机号'}
            , {field: 'roleName', title: '角色名称'}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#authUserBar', width: 220}
		]]
		, url: authManageApiUrl.searchUser
		, page: true
		, id: 'authUserTable'

	});


	//监听工具条
	laytable.on('tool(auth-user)', function (obj) {
		var data = obj.data;
		if (obj.event === 'edit') {
			submitUrl = authManageApiUrl.editUser;

			$("#auth-user-form")[0].reset();

			$("#auth-user_userId").attr('readonly', true);

			$("#user-password-item").hide();
			$("#auth-user-password").attr("lay-verify", "");

			LayerUtil.open("编辑用户", $("#auth-user-form"), "450px");

			loadRoleSelect();

			var result = AjaxUtil.ajaxPost(authManageApiUrl.getUser, JSON.stringify({"userId": data.userId}));
			if (result) {
				formData = result.data;
				loadSimpleFormData("#auth-user-form", result.data);
			}
		} else if (obj.event === 'del') {
			layer.confirm('真的删除行么', function (index) {
				var result = AjaxUtil.ajaxPost(authManageApiUrl.deleteUser, JSON.stringify({"userId": data.userId}));
				if (result) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(tableIns, "auth-user-search-form");
				}
			});
		}
	});

	layform.on('submit(authUserSubmit)', function (data) {
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close();
			layer.msg("操作成功");
			LayTableUtil.refresh(tableIns, "auth-user-search-form");
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});

	$('#auth-user-add').on('click', function () {
		formData = null;
		submitUrl = authManageApiUrl.addUser;

		$("#auth-user-form")[0].reset();

		$("#auth-user_userId").attr('readonly', false);
		$("#user-password-item").show();
		$("#auth-user-password").attr("lay-verify", "required|password");

		LayerUtil.open("新增用户", $("#auth-user-form"), "450px");

		loadRoleSelect();
	});

	$('#auth-user-search').on('click', function () {
		LayTableUtil.reload(tableIns, "auth-user-search-form");
	});
	// SearchForm绑定回车事件
	$("#auth-user-search-form").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#auth-user-search').click();
		}
	});

	$('#auth-user-from-reset').on('click', function () {
		if (formData == null) {
			$("#auth-user-form")[0].reset();
		} else {
			loadSimpleFormData("#auth-user-form", formData);
		}
	});

	$('#userAuthPassWordTipInfo').on('mouseenter', function () {
		this.index = layer.tips('密码必须是8-20位且为数字、字母、字符至少2种以上组合', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});
});

function loadRoleSelect() {
	var result = AjaxUtil.ajaxPost(authManageApiUrl.getAllRole);
	if (result) {
		SelectUtil.setSelectOpts(result.data, "auth-user-roleId", "roleId", "roleName")
	}
}


function loadSimpleFormData(elem, data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = $(elem).find(selector);
		elt.val(v);
	});
}