var submitUrl = null;
var formData = null;
var creditForm = $("#creditForm");

$(document).ready(function () {

    loadSearchMerchant();

	layform.render(null, "creditSearchForm");
    layform.render(null, "creditForm");
	laydate.render({elem: '#creditTimeLeftRangeSearch', type: 'date', trigger: 'click'});
	laydate.render({elem: '#creditTimeRightRangeSearch', type: 'date', trigger: 'click'});
    laydate.render({elem: '#creditDeadline',type: 'date',format: 'yyyy-MM-dd',min: 0 });

	var creditTableIns = LayTableUtil.render({
		elem: '#credit'
		, cellMinWidth: 120
		, cols: [[ //表头
            {field: 'userRealName', title: '用户名'}
            , {field: 'userLoginName', title: '用户登录账号', width: 130}
			, {field: 'userType', title: '用户类型', width: 100, templet: function(d){
				return d.userType.message;
			}}
            , {field: 'merchantUserName', title: '所属商户'}
            , {field: 'creditUsedAmount', title: '已用信额度(元)', width: 140, align: 'right', templet: function(d){
                return MoneyUtil.formatMoney(d.creditUsedAmount.amount);
            }}
            , {field: 'creditTime', title: '授信时间', width: 170, templet: function(d){
                return DateUtils.longToDateString(d.creditTime);
            }}
            , {field: 'creditDeadline', title: '授信到期时间', width: 120, templet: function(d){
                return DateUtils.longToDateStringYMD(d.creditDeadline);
            }}
            , {field: 'userCertNo', title: '用户证件号', width: 180}
            , {field: 'creditStatus', title: '授信状态', templet: '#creditStatusTpl', fixed: 'right', width: 100}
            , {fixed: 'right', title: '操作', align: 'center', toolbar: '#creditBar', width: 230}

		]]
		, url: assetsApi.searchCredit
		, page: {
			theme: '#009688'
		}
		, limit: 10
		, id: 'creditTable'

	});

    layform.on('switch(currCreditStatus)', function(obj){
        var data;
        if(obj.elem.checked){
            data = {"creditId": this.value, "creditStatus": "online"};
        }else {
            data = {"creditId": this.value, "creditStatus": "offline"};
        }
        var result = AjaxUtil.ajaxPost(assetsApi.updateCreditStatus, JSON.stringify(data));
        if (result) {
            layer.tips(obj.elem.checked ? "启用成功" : "停用成功", obj.othis);
        } else {
            obj.elem.checked = obj.elem.checked ? false : true ;
            layform.render('checkbox');
        }
    });


    //监听工具条
	laytable.on('tool(credit)', function (obj) {
		var data = obj.data;
		if (obj.event === 'edit') {
			submitUrl = assetsApi.editCredit;

			$("#creditForm")[0].reset();
            $("#creditFormButtons").show();
            creditForm.find('[name="merchantId"]').attr("disabled", "disabled");
            $("#creditUserLoginName").attr("readonly", "readonly");

            $("#creditUserInfo").show();

            LayerUtil.open("编辑授信", $("#creditForm"));

            loadMerchant();

			var result = AjaxUtil.ajaxPost(assetsApi.getCredit, JSON.stringify({"creditId": data.creditId}));
			if (result) {
				formData = result.data;
                loadCreditFormData();
            }
		} else if (obj.event === 'detail') {
            submitUrl = null;
            $("#creditForm")[0].reset();
            $("#creditFormButtons").hide();

            creditForm.find('[name="merchantId"]').attr("disabled", "disabled");
            $("#creditUserLoginName").attr("readonly", "readonly");

            $("#creditUserInfo").show();

            LayerUtil.open("查看授信", $("#creditForm"));

            loadMerchant();

            var result = AjaxUtil.ajaxPost(assetsApi.getCredit, JSON.stringify({"creditId": data.creditId}));
            if (result) {
                formData = result.data;
                loadCreditFormData();
            }
		} else if (obj.event === 'revision') {
			layer.confirm('确认要订正授信额度吗？', function (index) {
				var result = AjaxUtil.ajaxPost(assetsApi.revisionCredit, JSON.stringify({"creditId": data.creditId}));
				if (result) {
					layer.close(index);
					layer.msg("订正成功");
					LayTableUtil.refresh(creditTableIns, "creditSearchForm");
				}
			});
		}

	});

	layform.on('submit(creditSubmit)', function (data) {
        if(data.field.userId == null || data.field.userId == ""){
            layer.msg("无效的用户账号");
            return false;
        }
        $("#merchantId").removeAttr("disabled");
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(data.field));
		if (result) {
			LayerUtil.close();
			layer.msg("操作成功");
			LayTableUtil.refresh(creditTableIns, "creditSearchForm");
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});


    layform.on('switch(creditStatus)', function(data){
        if(data.elem.checked){
            creditForm.find('[name="creditStatus"]').val("online");
        }else {
            creditForm.find('[name="creditStatus"]').val("offline");
        }
    });

	$('#creditAdd').on('click', function () {
		formData = null;
		submitUrl = assetsApi.addCredit;

		$("#creditForm")[0].reset();
        $("#creditFormButtons").show();
        creditForm.find('[name="merchantId"]').removeAttr("disabled");
        $("#creditUserLoginName").removeAttr("readonly");
        $("#creditUserInfo").hide();

        loadMerchant();

        LayerUtil.open("新增授信", $("#creditForm"))

	});

	$('#creditSearch').on('click', function () {
		var param = DataDeal.formToJsonObj($('#creditSearchForm'));
		if(param.creditTimeLeftRange && param.creditTimeRightRange){
			if(param.creditTimeLeftRange > param.creditTimeRightRange){
				layer.msg("授信日期区间选择有误，请重新选择");
				return false;
			}
		}
		LayTableUtil.refresh(creditTableIns, "creditSearchForm");
	});

    $('#creditUserLoginName').on('blur', function () {
		var that = this;
		var userLoginAccount = that.value;
		if (StringUtil.isEmpty(userLoginAccount)) {
			return false;
		} else if(!VerificationUtil.isMobile(userLoginAccount)) {
			layer.msg("请输入正确的借款人用户登录账号进行查询");
			return false;
		}
		setTimeout(function () {
			getUserInfoByLoginAccountForCredit(userLoginAccount);
		},400);
    });

    $('#creditReset').on('click', function () {
        if (formData == null) {
            $("#creditForm")[0].reset();
        } else {
            loadCreditFormData();
        }
    });

	// SearchForm绑定回车事件
	$("#creditSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#creditSearch').click();
		}
	});

});

function getUserInfoByLoginAccountForCredit(loginAccount){
	clearCreditUserInfo();
    var result = AjaxUtil.ajaxPost(userManagerApi.getUserInfoByLoginAccount, JSON.stringify({"safeLoginAccount": loginAccount}));
    if (result) {
        var userInfo = result.data;
        if(userInfo != null){
        	if(userInfo.userRole.code != 'loaner'){
				layer.msg("该用户角色是[" + userInfo.userRole.message + "]，不能给非借款人授信");
				return;
			}
            if(userInfo.openDepositStatus.code == '00'){
                loadUserInfo(userInfo);
            }else {
                layer.msg("该用户未实名")
            }
        }else {
            $("#creditUserInfo").hide();
            layer.msg("无效的用户账号")
        }
    }
}

function loadUserInfo(userInfo){
    $("#creditUserInfo").show();
	creditForm.find('[name="userId"]').val(userInfo.userId);
    creditForm.find('[name="userRealName"]').val(userInfo.realName);
    creditForm.find('[name="userLoginName"]').val(userInfo.loginAccount);
    if(userInfo.userType.code == "GR"){
        creditForm.find('[name="userCertNo"]').val(userInfo.cert);
    }else {
        creditForm.find('[name="userCertNo"]').val(userInfo.legalCert);
	}
    creditForm.find('[name="userCellphone"]').val(userInfo.loginAccount);
}

function clearCreditUserInfo(){
    creditForm.find('[name="userId"]').val("");
    creditForm.find('[name="userRealName"]').val("");
    creditForm.find('[name="userLoginName"]').val("");
    creditForm.find('[name="userCertNo"]').val("");
    creditForm.find('[name="userCellphone"]').val("");
}

function loadMerchant(merchantName){
    var result = AjaxUtil.ajaxPost(assetsApi.getOnlineMerchantList, JSON.stringify({"merchantUserName": merchantName}));
    if(result){
        var merchantList = result.data;
        SelectUtil.setSelectOpts(merchantList, "merchantId", "merchantId", "merchantUserName");
    }
}

function loadSearchMerchant(merchantName){
    var result = AjaxUtil.ajaxPost(assetsApi.getOnlineMerchantList, JSON.stringify({"merchantUserName": merchantName}));
    if(result){
        var merchantList = result.data;
        SelectUtil.setSelectOpts(merchantList, "creditMerchantId", "merchantId", "merchantUserName");
    }
}

function loadCreditFormData(){
    loadSimpleFormData("#creditForm", formData);
    creditForm.find('[name="creditDeadline"]').val(DateUtils.longToDateStringYMD(formData.creditDeadline));
	creditForm.find('[name="userCertNo"]').val(MaskCodeUtil.dealCertNo(formData.userCertNo));
	creditForm.find('[name="userCellphone"]').val(MaskCodeUtil.dealCellphone(formData.userCellphone));
    if(formData.creditStatus == "online"){
        $("#creditStatusChk").prop("checked", true);
    }else {
        $("#creditStatusChk").prop("checked", false);
    }
    $("#creditUserLoginName").val(MaskCodeUtil.dealCellphone(formData.userLoginName));
    layform.render(null, "creditForm");
}

function loadSimpleFormData(elem, data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = $(elem).find(selector);
		elt.val(v);
	});
}
