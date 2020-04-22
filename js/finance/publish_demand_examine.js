var demandDetailForm = $("#demandDetailForm");
var loanerUserId;
$(document).ready(function () {
	layform.render(null, "publishDemandExamineSearchForm");
	var publishDemandExamineTable = LayTableUtil.render({
		elem: '#publishDemandExamine'
		, cols: [[
			{field: 'demandName', title: '标的名称', width: 160}
			, {field: 'loanUserName', title: '融资用户'}
			, {field: 'loanMerchantName', title: '所属商户'}
			, {field: 'publishStatus', title: '发布状态', width: 120, templet: function (d) {
				return d.publishStatus.message
			}}
			, {field: 'publishCommitUser', title: '提交人'}
			, {
				field: 'publishCommitTime', title: '提交时间', width: 180, templet: function (d) {
					return DateUtils.longToDateString(d.publishCommitTime)
				}
			}
			, {field: 'publishReviewUser', title: '审核人'}
			, {
				field: 'publishReviewTime', title: '审核时间', width: 180, templet: function (d) {
					if (d.publishPlanningTime) {
						return DateUtils.longToDateString(d.publishReviewTime);
					} else {
						return "";
					}
				}
			}
			, {field: 'publishMethod', title: '发布方式', width: 150, templet: function (d) {
				return d.publishMethod.message
			}}
			, {
				field: 'publishPlanningTime', title: '计划发布时间', width: 180, templet: function (d) {
					if (d.publishPlanningTime) {
						return DateUtils.longToDateString(d.publishPlanningTime);
					} else {
						return "";
					}
				}
			}
			, {
				field: 'publishEffectiveTime', title: '正式发布时间', width: 180, templet: function (d) {
					if (d.publishEffectiveTime) {
						return DateUtils.longToDateString(d.publishEffectiveTime);
					} else {
						return "";
					}
				}
			}
			, {field: 'publishRemark', title: '备注'}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#publishDemandExamineOperation', width: 100}
		]]
		, url: financeApiUrl.demand.publishDemandList
		, where: {"demandPublishStatus": "committed"}
		, page: true
		, id: 'publishDemandExamine'
	});

	//监听工具条
	laytable.on('tool(publishDemandExamine)', function (obj) {
		var data = obj.data;
		if (obj.event === 'review') {
			openRightWin('publishDemandExamineDiv');
			$('#publishDemandExamineDemandDetail').load('finance/demand/view');
			$('#demandDetailSaveToDemandTemplate').parent().hide();
			loanPublishDemandForm(data);
			demandDetailForm.find("input,select,textarea").prop("disabled", "disabled");
			demandDetailForm.find('[name="investBeginTime"]').removeAttr("disabled");
			demandDetailForm.find('[name="investTerminalTime"]').removeAttr("disabled");
			layform.render(null, 'demandDetailForm');
		}
	});

	$('#reloadPublishDemandExamine').click(function () {
		LayTableUtil.reload(publishDemandExamineTable, 'publishDemandExamineSearchForm');
	});

	// SearchForm绑定回车事件
	$("#publishDemandExamineSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadPublishDemandExamine').click();
		}
	});

	//监听提交
	layform.on('submit(publishDemandReviewImmediatelyFormSubmit)', function () {
		var checkResult = AjaxUtil.ajaxGet(financeApiUrl.demand.checkLoaner + loanerUserId);
		if (checkResult && checkResult.data) {
			var result = AjaxUtil.ajaxPost(financeApiUrl.demand.publishReview, DataDeal.formToJsonStr('publishDemandReviewImmediatelyForm'));
			if (result) {
				closePublishDemandExamineModelFrame();
				closePublishDemandExamine();
				LayTableUtil.reload(publishDemandExamineTable, 'publishDemandExamineSearchForm');
				layer.msg("操作成功");

				var jumpUrl = "finance/demand/trade/view";
				var flag = $('#rightBoxTitle li[lay-id="' + jumpUrl + '"]').text();
				if (StringUtil.isEmpty(flag)) {
					tabAction.tabAdd("标的列表", jumpUrl);
				} else {
					tabAction.tabChange(jumpUrl);
					$("#rightBoxContent .layui-show").load(jumpUrl);
				}
				// LayTableUtil.reload(publishDemandExamineTable, 'publishDemandExamineSearchForm');
			}
		} else {
			layer.msg(checkResult.message);
		}
		return false;
	});

	layform.on('submit(publishDemandReviewRefusedFormSubmit)', function () {
		var result = AjaxUtil.ajaxPost(financeApiUrl.demand.publishReview, DataDeal.formToJsonStr('publishDemandReviewRefusedForm'));
		if (result) {
			closePublishDemandExamineModelFrame();
			closePublishDemandExamine();
			layer.msg("操作成功");
			LayTableUtil.reload(publishDemandExamineTable, 'publishDemandExamineSearchForm');
		}
		return false;
	});

	$('.mask').click(function () {
		closePublishDemandExamineModelFrame();
		closePublishDemandExamine();
	});

	/**审核通过*/
	$('#publishDemandExamineImmediatelyBtn').click(function () {
		var investBeginTime = demandDetailForm.find('[name="investBeginTime"]').val();
		var investTerminalTime = demandDetailForm.find('[name="investTerminalTime"]').val();
		console.log(investBeginTime + ":" + investTerminalTime);
		if(StringUtil.isEmpty(investBeginTime)){
			layer.msg("请选择起投时间");
			return false;
		}
		if(StringUtil.isEmpty(investTerminalTime)){
			layer.msg("请选择投资截止时间");
			return false;
		}

		$('#pdeImmediatelyDemandId').val(demandDetailForm.find('[name="demandId"]').val());
		var publishDemandReviewImmediatelyForm = $('#publishDemandReviewImmediatelyForm');
		publishDemandReviewImmediatelyForm.find('[name="investBeginTime"]').val(investBeginTime);
		publishDemandReviewImmediatelyForm.find('[name="investTerminalTime"]').val(investTerminalTime);
		$(".shade").show();
		$(".review-immediately").show();
		$(".review-refused").hide();
		layform.render(null, "publishDemandReviewImmediatelyForm");
	});

	/**审核驳回*/
	$('#publishDemandExamineRefusedBtn').click(function () {
		$('#pdeRefusedDemandId').val(demandDetailForm.find('[name="demandId"]').val());
		$(".shade").show();
		$(".review-immediately").hide();
		$(".review-refused").show();
	});

	/**设置审核时间*/
	laydate.render({
		elem: '#pdeDemandPublishPlanningTime'
		, type: 'datetime'
	});

	layform.on('radio(pdeDemandPublishMethodFilter)', function (data) {
		$("#pdeDemandPublishMethodFlag").val(data.value);
		if ('planning' == data.value) {
			$('#pdePlanningTime').removeClass("hide");
			$('#pdeDemandPublishPlanningTime').attr("lay-verify", "required");
		} else {
			$('#pdePlanningTime').addClass("hide");
			$('#pdeDemandPublishPlanningTime').removeAttr("lay-verify").val("");
		}
	});

});

function loanPublishDemandForm(data) {
	var applyResult = AjaxUtil.ajaxGet(loanApiUrl.loanApply.get + data.loanApplyId);
	if (applyResult) {
		loanFormDataForPublishDemandExamine2LoanApply(applyResult.data);
	}
	var demandResult = AjaxUtil.ajaxGet(financeApiUrl.demand.get + data.demandId);
	if (demandResult) {
		loanFormDataForPublishDemandExamine2DemandDetail(demandResult.data);
	}

}

function loanFormDataForPublishDemandExamine2LoanApply(data) {
	var demandExamineBillImg = $("#billImg");

	loanerUserId = data.userId;
	$('.pdeRefusedLoanApplyId').val(data.applyId);
	demandDetailForm.find('[name="userLoginName"]').text(data.userLoginName);
	demandDetailForm.find('[name="loanApplyAmount"]').text(MoneyUtil.formatMoney(data.loanApplyAmount.amount));
	demandDetailForm.find('[name="userRealName"]').text(data.userRealName);
	demandDetailForm.find('[name="loanInterestRate"]').text(NumberUtil.transfPercentage(data.loanInterestRate));
	demandDetailForm.find('[name="loanTerm"]').text(data.loanTermValue + data.loanTermUnit.message);
	demandDetailForm.find('[name="merchantUserName"]').text(data.merchantUserName);
	demandDetailForm.find('[name="repayMethod"]').text(data.repayMethod.message);
	demandDetailForm.find('[name="firstGuaranteeUserName"]').text(data.firstGuaranteeUserName);
	demandDetailForm.find('[name="secondGuaranteeUserName"]').text(data.secondGuaranteeUserName);
	demandDetailForm.find('[name="productName"]').text(data.productName);
	demandDetailForm.find('[name="loanApplyTime"]').text(DateUtils.longToDateString(data.loanApplyTime));
	demandDetailForm.find('[name="loanPurpose"]').text(data.loanPurpose);
	demandDetailForm.find('[name="certNo"]').text(data.certNo);

	if(data.billImgUrl){
		demandExamineBillImg.find("span").html("");
		$.each(data.billImgUrl, function (index, item) {
			demandExamineBillImg.append('<div class="w120 fl m5 ta-c"><img class="w120 h120 cr-pr" src="' + item + '" alt="账单/发票"></div>');
		});
		new Viewer(document.querySelector('#publishDemandExamineDiv'));
	}
}

function loanFormDataForPublishDemandExamine2DemandDetail(data) {
	var param = data.demandBaseInfoDTO;
	param['investBeginTime'] = DateUtils.longToDateString(param['investBeginTime']);
	param['investTerminalTime'] = DateUtils.longToDateString(param['investTerminalTime']);
	layui.each(param, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = demandDetailForm.find(selector);
		elt.val("" + v);
	});
	layui.each(data.demandExtendInfoDTO, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = demandDetailForm.find(selector);
		elt.val("" + v);
	});

	demandDetailForm.find('[name="increaseAmount"]').val(param.increaseAmount.amount);
	demandDetailForm.find('[name="singleMinAmount"]').val(param.singleMinAmount.amount);
	demandDetailForm.find('[name="singleMaxAmount"]').val(param.singleMaxAmount.amount);
	demandDetailForm.find('[name="fullScaleMethod"]').val(param.fullScaleMethod.code);
	if (param.autoInvestSwitch) {
		demandDetailForm.find("[name='demandDetailAutoInvestSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailAutoInvestSwitchTemp'][title='否']").prop("checked", true);
	}
	if (param.cashCouponSwitch) {
		demandDetailForm.find("[name='demandDetailCashCouponSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailCashCouponSwitchTemp'][title='否']").prop("checked", true);
	}
	if (param.interestCouponSwitch) {
		demandDetailForm.find("[name='demandDetailInterestCouponSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailInterestCouponSwitchTemp'][title='否']").prop("checked", true);
	}
	if (param.transferSwitch) {
		demandDetailForm.find("[name='demandDetailTransferSwitchTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailTransferSwitchTemp'][title='否']").prop("checked", true);
		demandDetailForm.find("[name='transferLeastHoldingDays']").prop("disabled", "disabled").prop("placeholder", "不允许债权转让，此项不必填写").removeAttr("lay-verify");
	}
	if (param.directInvestFlag) {
		demandDetailForm.find("[name='demandDetailDirectInvestFlagTemp'][title='是']").prop("checked", true);
	} else {
		demandDetailForm.find("[name='demandDetailDirectInvestFlagTemp'][title='否']").prop("checked", true);
	}
}

function closePublishDemandExamineModelFrame() {
	demandDetailForm.find("input,select,textarea").removeAttr("disabled");
	$('#publishDemandExamineDemandDetail').html("");
	closeRightWin('publishDemandExamineDiv');
}

function closePublishDemandExamine() {
	$('#publishDemandReviewImmediatelyForm')[0].reset();
	$(".shade").hide();
	$('#pdePlanningTime').addClass("hide");
	$(".review-immediately").hide();
	$(".review-refused").hide();
}