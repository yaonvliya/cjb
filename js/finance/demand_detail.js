var demandDetailForm = $("#demandDetailForm");
$(document).ready(function () {
	loanInfo();

	/**标的模板提示信息*/
	$('#demandDetailDemandTemplateSelectTipInfo').on('mouseenter', function () {
		this.index = layer.tips('先选择标的模板，快速补充标的信息', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});

	/**可以债权转让时提示信息*/
	$('#demandDetailTransferLeastHoldingDaysTipInfo').on('mouseenter', function () {
		this.index = layer.tips('允许债权转让时，需要填写最少持有天数', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});

	/**定向融资为是时提示信息*/
	$('#demandDetailDirectInvestFlagTipInfo').on('mouseenter', function () {
		this.index = layer.tips('定向融资需要设置密码', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});

	/**融资密码提示信息*/
	$('#demandDetailDirectInvestPassTipInfo').on('mouseenter', function () {
		this.index = layer.tips('定向融资密码为6位数字密码', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});

	/**设置是否可是定向融资时赋值，并提示密码框*/
	layform.on('radio(demandDetailDirectInvestFlagFilter)', function(data){
		$('#demandDetailDirectInvestFlag').val(data.value);
		if('true' == data.value){
			demandDetailForm.find("[name='directInvestPass']").removeAttr("disabled").prop("placeholder", "请输入定向融资密码").attr("lay-verify","required|passWord");
		} else {
			demandDetailForm.find("[name='directInvestPass']").removeAttr("lay-verify").prop("disabled", "disabled").prop("placeholder", "非定向融资，此项不必填写").val("");
		}
	});

	/**设置是否可以使用加息券时赋值*/
	layform.on('radio(demandDetailInterestCouponSwitchFilter)', function(data){
		$('#demandDetailInterestCouponSwitch').val(data.value);
	});

	/**设置是否可以使用红包时赋值*/
	layform.on('radio(demandDetailCashCouponSwitchFilter)', function(data){
		$('#demandDetailCashCouponSwitch').val(data.value);
	});

	layform.on('radio(saveToTemplateAddDemandTemplateStatusFilter)', function(data){
		$("#saveToTemplateAddDemandTemplateStatus").val(data.value);
	});

	/**设置是否可以自动投标时赋值*/
	layform.on('radio(demandDetailAutoInvestSwitchFilter)', function(data){
		$('#demandDetailAutoInvestSwitch').val(data.value);
	});

	/**个人用户信息维护*/
	layform.on('switch(identity_cert_flag)', function (data) {
		if (data.elem.checked) {
			$("#identity_cert_flag").val(true);
		} else {
			$("#identity_cert_flag").val(false);
		}
	});
	layform.on('switch(driver_license_flag)', function (data) {
		if (data.elem.checked) {
			$("#driver_license_flag").val(true);
		} else {
			$("#driver_license_flag").val(false);
		}
	});
	layform.on('switch(personal_third_contract_flag)', function (data) {
		if (data.elem.checked) {
			$("#personal_third_contract_flag").val(true);
		} else {
			$("#personal_third_contract_flag").val(false);
		}
	});

	/**企业用户信息维护*/
	layform.on('switch(business_license_flag)', function (data) {
		if (data.elem.checked) {
			$("#business_license_flag").val(true);
		} else {
			$("#business_license_flag").val(false);
		}
	});
	layform.on('switch(legal_person_identity_flag)', function (data) {
		if (data.elem.checked) {
			$("#legal_person_identity_flag").val(true);
		} else {
			$("#legal_person_identity_flag").val(false);
		}
	});
	layform.on('switch(trade_license_flag)', function (data) {
		if (data.elem.checked) {
			$("#trade_license_flag").val(true);
		} else {
			$("#trade_license_flag").val(false);
		}
	});
	layform.on('switch(company_third_contract_flag)', function (data) {
		if (data.elem.checked) {
			$("#company_third_contract_flag").val(true);
		} else {
			$("#company_third_contract_flag").val(false);
		}
	});

	/**满标方式切换时，切换满标方式值*/
	layform.on('select(demandDetailFullScaleMethodFilter)', function(data){
		if('fixed_time' == data.value) {
			$('#demandDetailFullScaleValue').html('<input class="layui-input" lay-verify="required"  name="fullScaleValue" id="demandDetailFullScaleDate" placeholder="请选择满标日期" autocomplete="off">');
			laydate.render({
				elem: '#demandDetailFullScaleDate'
			});
		} else {
			$('#demandDetailFullScaleValue').html('<input class="layui-input" lay-verify="required"  name="fullScaleValue" placeholder="请输入满标条件值" autocomplete="off">');
		}
	});

	/**选择标的模板时，补充信息*/
	layform.on('select(demandDetailDemandTemplateSelectFilter)', function(data){
		var demandTemplateResult = AjaxUtil.ajaxPost(financeApiUrl.demandTemplate.get + data.value);
		var param = demandTemplateResult.data;
		if(param){
			loadDemandTemplateInfo(param);
		}
	});

	var hour = new Date().getHours();
	var startTime = "";
	if(0 <= hour && hour < 11){
		startTime = DateUtils.longToDateStringYMD(Date.now()) + " 11:00:00"
	} else if(11 <= hour && hour < 16) {
		startTime = DateUtils.longToDateStringYMD(Date.now()) + " 16:00:00"
	} else {
		startTime = DateUtils.longToDateStringYMD(DateUtils.dateAdd('d', 1, new Date())) + " 11:00:00"
	}

	/**设置标的起投时间*/
	laydate.render({
		elem: '#demandDetailInvestStartTime'
		, type: 'datetime'
		, value: startTime
	});

	/**设置标的投资截止时间*/
	laydate.render({
		elem: '#demandDetailInvestEndTime'
		, type: 'datetime'
		, value: DateUtils.longToDateString(NumberUtil.add(Date.now(), NumberUtil.mul(86400000, 7)))
	});

	//监听表单提交
	layform.on('submit(demandDetailSaveToDemandTemplateFormSubmit)', function(data){
		var flg = 0;
		layui.each(data.field, function (k , v) {
			if("" == v){
				flg++;
			}
		});
		if(flg < 1) {
			var result = AjaxUtil.ajaxPostWithLoading(financeApiUrl.demandTemplate.add, JSON.stringify(data.field));
			if (result) {
				closeSave();
				loanInfo();
				layer.msg("操作成功");
			}
		} else {
			layer.msg("信息不完善，请返回重新填写", {time:1000}, function () {
				closeSave();
			});
		}
		return false;
	});

	$("#demandDetailInvestEndTime").focus(function () {
		var time = $('#demandDetailInvestStartTime').val();
		$(this).attr("startTime", time)
	});
	
	$('#demandDetailSaveToDemandTemplate').click(function () {
		demandDetailForm.find('[name="preDemandName"]').val(demandDetailForm.find('[name="demandName"]').val());
		var data = DataDeal.formToJsonObj($('#demandDetailForm'));
		layui.each(data, function (k, v) {
			var selector = '[name="' + k + '"]';
			var elt = $('#demandDetailSaveToDemandTemplateForm').find(selector);
			elt.val("" + v);
		});

		$(".shade").show();
		$(".save-demand-template").show();
		layform.render(null, "addLoanApplyForm");
	});

	$('.demandDetailText').xheditor({
		tools: 'full',
		skin: 'default',
		width: 700,
		height:250,
		upMultiple: true,
		upImgUrl: "#",
		upImgExt: "jpg,jpeg,gif,bmp,png",
		onUpload: insertUploadDemandDetail,
		html5Upload: false
	});

	//xhEditor编辑器图片上传回调函数
	function insertUploadDemandDetail(msg) {
		var _msg = msg.toString();
		var _picture_name = _msg.substring(_msg.lastIndexOf("/") + 1);
		var _picture_path = SubstringDemandDetail(_msg);
		var _str = "<input type='checkbox' name='_pictures' value='" + _picture_path + "' checked='checked' onclick='return false'/><label>" + _picture_name + "</label><br/>";
		$("#xh_editor").append(_msg);
		$("#uploadList").append(_str);
	}
//处理服务器返回到回调函数的字符串内容,格式是JSON的数据格式.
	function SubstringDemandDetail(s) {
		return s.substring(s.substring(0, s.lastIndexOf("/")).lastIndexOf("/"), s.length);
	}
});
// 页面加载信息
function loanInfo() {
	var demandTemplateResult = AjaxUtil.ajaxPost(financeApiUrl.demandTemplate.listOnlyOnline);
	if (demandTemplateResult) {
		SelectUtil.setSelectOpts(demandTemplateResult.data, 'demandDetailDemandTemplateSelect', 'templateId', 'templateName');
	}
	layform.render(null, 'demandDetailForm');
}

function loadDemandTemplateInfo(data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = demandDetailForm.find(selector);
		elt.val("" + v);
	});
	demandDetailForm.find('[name="increaseAmount"]').val(data.increaseAmount.amount);
	demandDetailForm.find('[name="singleMinAmount"]').val(data.singleMinAmount.amount);
	demandDetailForm.find('[name="singleMaxAmount"]').val(data.singleMaxAmount.amount);
	demandDetailForm.find('[name="fullScaleMethod"]').val(data.fullScaleMethod.code);
	demandDetailForm.find('[name="recommendType"]').val(data.recommendType ? data.recommendType.code : "");
	demandDetailForm.find('[name="demandName"]').val(data.preDemandName);
	if (data.autoInvestSwitch) {
		demandDetailForm.find("[name='demandDetailAutoInvestSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailAutoInvestSwitchTemp'][title='否']").prop("checked", true);
	}
	if (data.cashCouponSwitch) {
		demandDetailForm.find("[name='demandDetailCashCouponSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailCashCouponSwitchTemp'][title='否']").prop("checked", true);
	}
	if (data.interestCouponSwitch) {
		demandDetailForm.find("[name='demandDetailInterestCouponSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailInterestCouponSwitchTemp'][title='否']").prop("checked", true);
	}
	if (data.transferSwitch) {
		demandDetailForm.find("[name='demandDetailTransferSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailTransferSwitchTemp'][title='否']").prop("checked", true);
		// demandDetailForm.find("[name='transferLeastHoldingDays']").prop("disabled", "disabled").prop("placeholder", "不允许债权转让，此项不必填写").removeAttr("lay-verify");
	}

	layform.render(null, 'demandDetailForm');
}

function closeSave() {
	$('#demandDetailSaveToDemandTemplateForm')[0].reset();
	$(".shade").hide();
	$(".save-demand-template").hide();
}
