var submitUrl = null;
var formData = null;
var merchantForm = $("#merchantForm");

$(document).ready(function () {
	layform.render(null, "merchantSearchForm");
	layform.render(null, "merchantForm");
	laydate.render({
		elem: '#merchantCreditDeadline'
		, type: 'date'
		, format: 'yyyy-MM-dd'
	});

	var merchantTableIns = LayTableUtil.render({
		elem: '#merchant'
		, cellMinWidth: 120
		, cols: [[ //表头
			{field: 'merchantUserName', title: '用户名称', sort: true}
			, {field: 'merchantCellphone', title: '用户登录账号', width: 130}
			, {
				field: 'merchantCreditAmount', title: '授信额度(元)', width: 140, align: 'right', templet: function (d) {
					return MoneyUtil.formatMoney(d.merchantCreditAmount.amount);
				}
			}
			, {
				field: 'merchantCreditBalanceAmount', title: '授信余额(元)',width: 140, align: 'right', templet: function (d) {
					return MoneyUtil.formatMoney(d.merchantCreditBalanceAmount.amount);
				}
			}
			, {
				field: 'merchantCreditDeadline', title: '授信到期时间', width: 120, templet: function (d) {
					return DateUtils.longToDateStringYMD(d.merchantCreditDeadline);
				}
			}
			, {field: 'grading', title: '风控等级', width: 90}
			, {field: 'withdrawExamineFlag', title: '需要审核提现',width: 150, templet: '#withdrawExamineFlagTpl', fixed: 'right'}
            , {field: 'withdrawFlag', title: '是否允许提现', width: 150,templet: '#withdrawFlagTpl', fixed: 'right'}
            , {field: 'merchantCreditStatus', title: '状态', width: 110, templet: '#merchantCreditStatusTpl', fixed: 'right'}
			, {fixed: 'right', title: '操作', width: 180, align: 'center', toolbar: '#merchantBar'}

		]]
		, url: assetsApi.searchMerchant
		, page: true
		, limit: 10
		, id: 'merchantTable'
	});

	layform.on('switch(currMerchantCreditStatus)', function (obj) {
		var data;
		if (obj.elem.checked) {
			data = {"merchantId": this.value, "merchantCreditStatus": "online"};
		} else {
			data = {"merchantId": this.value, "merchantCreditStatus": "offline"};
		}
		var result = AjaxUtil.ajaxPost(assetsApi.updateMerchantStatus, JSON.stringify(data));
		if (result) {
			layer.tips(obj.elem.checked ? "启用成功" : "停用成功", obj.othis);
		} else {
			obj.elem.checked = obj.elem.checked ? false : true;
			layform.render('checkbox');
		}
	});

	layform.on('checkbox(currWithdrawExamineFlag)', function (obj) {
		var data;
		if (obj.elem.checked) {
			data = {"merchantId": this.value, "withdrawExamineFlag": true};
		} else {
			data = {"merchantId": this.value, "withdrawExamineFlag": false};
		}
		var result = AjaxUtil.ajaxPost(assetsApi.setMerchantWithdrawExamineFlag, JSON.stringify(data));
		if (result) {
			layer.tips("审核提现设置成功", obj.othis);
		} else {
			obj.elem.checked = obj.elem.checked ? false : true;
			layform.render('checkbox');
		}
	});

    layform.on('checkbox(currWithdrawFlag)', function (obj) {
		var data;
		if (obj.elem.checked) {
			data = {"merchantId": this.value, "withdrawFlag": true};
		} else {
			data = {"merchantId": this.value, "withdrawFlag": false};
		}
		var result = AjaxUtil.ajaxPost(assetsApi.setMerchantWithdrawFlag, JSON.stringify(data));
		if (result) {
			layer.tips("提现设置成功", obj.othis);
		} else {
			obj.elem.checked = obj.elem.checked ? false : true;
			layform.render('checkbox');
		}
    });

	//监听工具条
	laytable.on('tool(merchant)', function (obj) {
		var data = obj.data;
		if (obj.event === 'edit') {
			submitUrl = assetsApi.editMerchant;

			openRightWin("merchantDetailWin");
			$("#merchantDetailWinTitle").text("编辑商户");
			merchantForm[0].reset();

			var result = AjaxUtil.ajaxPost(assetsApi.getMerchant, JSON.stringify({"merchantId": data.merchantId}));
			if (result) {
				formData = result.data;
				loadMerchantFormData();
			}
		} else if (obj.event === 'productManage') {
			sessionStorage.setItem("currMerchantId", data.merchantId);
			sessionStorage.setItem("currMerchantName", data.merchantUserName);
			var jumpUrl = "assets/product/view";
			var flag = $('#rightBoxTitle li[lay-id="' + jumpUrl + '"]').text();
			if (StringUtil.isEmpty(flag)) {
				tabAction.tabAdd("产品管理", jumpUrl);
			} else {
				tabAction.tabChange(jumpUrl);
				$("#rightBoxContent .layui-show").load(jumpUrl);
			}
		}

	});

	layform.on('submit(merchantSubmit)', function (data) {
		if (data.field.merchantUserId == null || data.field.merchantUserId == "") {
			layer.msg("无效的用户账号");
			return false;
		}
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close();
			layer.msg("操作成功");
			LayTableUtil.refresh(merchantTableIns, "merchantSearchForm");
			closeRightWin('merchantDetailWin');
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});

	layform.on('switch(merchantCreditStatus)', function (data) {
		if (data.elem.checked) {
			$("#merchantCreditStatus").val("online");
		} else {
			$("#merchantCreditStatus").val("offline");
		}
	});

	layform.on('switch(withdrawExamineFlag)', function (data) {
		if (data.elem.checked) {
			$("#withdrawExamineFlag").val("true");
		} else {
			$("#withdrawExamineFlag").val("false");
		}
	});

    layform.on('switch(withdrawFlag)', function (data) {
        if (data.elem.checked) {
            $("#withdrawFlag").val("true");
        } else {
            $("#withdrawFlag").val("false");
        }
    });

	$('#merchantAdd').on('click', function () {
		formData = null;
		submitUrl = assetsApi.addMerchant;

		openRightWin("merchantDetailWin");
		$("#merchantDetailWinTitle").text("新增商户");

		merchantForm[0].reset();

		$("#getMerchantUserBtn").show();
		$("#merchantUser").removeAttr("readonly");

		$("#merchantUserInfo").hide();
	});

	$('#merchantSearch').on('click', function () {
		LayTableUtil.reload(merchantTableIns, "merchantSearchForm");
	});

	$('#merchantSubmit').click(function () {
		$('#merchantSubmitBtn').click();
	});

	// 点击遮罩层关闭窗口
	$('.mask').click(function () {
		closeRightWin('merchantDetailWin');
	});

	$('#merchantUser').on('blur', function () {
		var that = this;
		var userLoginAccount = that.value;
		if (StringUtil.isEmpty(userLoginAccount)) {
			return false;
		} else if(!VerificationUtil.isMobile(userLoginAccount)) {
			layer.msg("请输入正确的商户用户登录账号进行查询");
			return false;
		}
		setTimeout(function () {
			getMerchantUserInfoByLoginAccount(userLoginAccount);
		},400);
	});

	// SearchForm绑定回车事件
	$("#merchantSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#merchantSearch').click();
		}
	});

});

function loadMerchantFormData() {
	loadSimpleFormData("#merchantForm", formData);

	merchantForm.find('[name="merchantCreditAmount"]').val(formData.merchantCreditAmount.amount);
	merchantForm.find('[name="merchantCreditDeadline"]').val(DateUtils.longToDateStringYMD(formData.merchantCreditDeadline));
	merchantForm.find('[name="merchantCreditStatus"]').val(formData.merchantCreditStatus.code);

	if (formData.withdrawExamineFlag) {
		$("#withdrawExamineFlagChk").attr("checked", "checked")
	} else {
		$("#withdrawExamineFlagChk").removeAttr("checked")
	}
    if (formData.withdrawFlag) {
		$("#withdrawFlagChk").attr("checked", "checked")
	} else {
		$("#withdrawFlagChk").removeAttr("checked")
	}
	if (formData.merchantCreditStatus == "online") {
		$("#merchantCreditStatusChk").attr("checked", "checked")
	} else {
		$("#merchantCreditStatusChk").removeAttr("checked")
	}
	$("#getMerchantUserBtn").hide();
	$("#merchantUser").attr("readonly", "readonly");
	$("#merchantUserInfo").hide();

	getMerchantUserInfoById(formData.merchantUserId);

}

function loadMerchantUserInfo(userInfo) {
	$("#merchantUserInfo").show();

	merchantForm.find('[name="merchantCertNo"]').val(userInfo.safeLegalCert);
	merchantForm.find('[name="merchantCellphone"]').val(userInfo.safeLoginAccount);

	merchantForm.find('[name="merchantUserEnterpriseName"]').text(userInfo.realName);
	merchantForm.find('[name="merchantUserArtificialPersonName"]').text(userInfo.legalName);
	merchantForm.find('[name="merchantUserEnterpriseLegalCert"]').text(userInfo.safeLegalCert);
	merchantForm.find('[name="merchantUserId"]').val(userInfo.userId);
	merchantForm.find('[name="merchantUserName"]').val(userInfo.realName);
	merchantForm.find('[name="merchantLoginName"]').val(userInfo.loginAccount);

	merchantForm.find('[name="merchantUserBankCardNo"]').text(userInfo.bankCardNo);
	merchantForm.find('[name="merchantUserBankType"]').text($_GLOBAL.formatBankCode(userInfo.bankCode));
}

function clearMerchantUserInfo() {
	merchantForm.find('[name="merchantCertNo"]').val("");
	merchantForm.find('[name="merchantCellphone"]').val("");
	merchantForm.find('[name="merchantUserId"]').val("");
	merchantForm.find('[name="merchantUserName"]').val("");
	merchantForm.find('[name="merchantLoginName"]').val("");

	merchantForm.find('[name="merchantUserPersonalName"]').text("");
	merchantForm.find('[name="merchantUserCertCardNo"]').text("");
	merchantForm.find('[name="merchantUserPersonalCellphone"]').text("");

	merchantForm.find('[name="merchantUserEnterpriseName"]').text("");
	merchantForm.find('[name="merchantUserBusinessLicenseNo"]').text("");
	merchantForm.find('[name="merchantUserArtificialPersonName"]').text("");
	merchantForm.find('[name="merchantUserEnterpriseCellphone"]').text("");

	merchantForm.find('[name="merchantUserBankCardNo"]').text("");
	merchantForm.find('[name="merchantUserBankType"]').text("");
	merchantForm.find('[name="merchantUserBankAddress"]').text("");
}

function getMerchantUserInfoByLoginAccount(loginAccount) {
	var result = AjaxUtil.ajaxPost(userManagerApi.getUserInfoByLoginAccount, JSON.stringify({"safeLoginAccount": loginAccount}));
	clearMerchantUserInfo();
	if (result) {
		var userInfo = result.data;
		if (userInfo != null) {
			if (userInfo.userType.code == "GR") {
				$("#merchantUserInfo").hide();
				layer.msg("个人用户不能添加为商户");
				return false;
			}
			if(userInfo.userRole.code != 'compensatory'){
				$("#merchantUserInfo").hide();
				layer.msg("非代偿户不能添加为商户");
				return false;
			}
			if (userInfo.openDepositStatus.code == "00") {
				loadMerchantUserInfo(userInfo);
			} else {
				layer.msg("该用户未实名");
				$("#merchantUserInfo").hide();
			}
		} else {
			$("#merchantUserInfo").hide();
			layer.msg("无效的用户账号")
		}
	}
}

function getMerchantUserInfoById(userId) {
	var result = AjaxUtil.ajaxPost(userManagerApi.getUserInfoById, JSON.stringify({"userId": userId}));
	if (result) {
		loadMerchantUserInfo(result.data);
		$("#merchantUser").val(result.data.loginAccount);
	}
}

function loadSimpleFormData(elem, data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = $(elem).find(selector);
		elt.val(v);
	});
}