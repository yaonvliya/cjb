var demandDetailForm = $("#demandDetailForm");
var loanerUserId;
$(document).ready(function () {
	var demandDraftTable = LayTableUtil.render({
		elem: '#demandDraft'
		,cols: [[
			{field: 'demandId', title: '标的id', width: 180}
			,{field: 'demandName', title: '标的名称', width: 180}
			,{field: 'loanUserName', title: '融资用户'}
			,{field: 'loanMerchantName', title: '融资商户'}
			,{field: 'loanAmount', title: '融资金额', templet: function (d) { return MoneyUtil.formatMoney(d.loanAmount.amount) + '元'}}
			,{fixed: 'right', title: '操作', align:'center', toolbar: '#demandDraftOperation', width: 260}
		]]
		, url: financeApiUrl.demand.draftList
		, page: true
		, id: 'demandDraft'
	});

	//监听工具条
	laytable.on('tool(demandDraft)', function(obj){
		var data = obj.data;
		if(obj.event === 'detail'){
			openRightWinForDemandDraft(data);
		} else if(obj.event === 'del'){
			layer.confirm('真的删除这条草稿箱记录吗？', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(financeApiUrl.demand.draftDelete + data.draftId);
				if(result){
					layer.msg("刪除成功");
					layer.close(index);
					closeDemandDraftModelFrame();
					LayTableUtil.reload(demandDraftTable, 'demandDraftSearchForm');
				}
			});
		} else if(obj.event == 'launch'){
			layer.confirm('确认发布这条融资需求吗？', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(financeApiUrl.demand.publishFormDraft + data.draftId);
				if(result){
					layer.msg("发布成功");
					layer.close(index);
					closeDemandDraftModelFrame();
					LayTableUtil.reload(demandDraftTable, 'demandDraftSearchForm');
				}
			});
		}
	});

	$('#reloadDemandDraft').click(function () {
		LayTableUtil.reload(demandDraftTable, 'demandDraftSearchForm');
	});

	// SearchForm绑定回车事件
	$("#demandDraftSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadDemandDraft').click();
		}
	});

	//监听提交
	layform.on('submit(demandDetailFormSubmit)', function(){
		var data = DataDeal.formToJsonObj($('#demandDetailForm'));
		var formData = new FormData();
		layui.each(data, function (i, item) {
			formData.append(i, item);
		});
		var result = AjaxUtil.ajaxFormData(submitUrl, formData);
		if (result.code == "20000") {
			layer.msg('操作成功', {
				time: 1000 //1秒关闭
			}, function () {
				closeDemandDraftModelFrame();
				LayTableUtil.reload(demandDraftTable, 'demandDraftSearchForm');
			});
		} else if(result.code == "40404" || result.code == "40405"){
			CookieUtil.clearAllCookie();
			window.location.href = $_GLOBAL.basePath() + '/login';
		} else {
			layer.msg(result.message);
		}
		return false;
	});

	$('.mask').click(function () {
		closeDemandDraftModelFrame();
	});

	$('#demandDraftToLaunchBtn').click(function () {
		var result = AjaxUtil.ajaxGet(financeApiUrl.demand.checkLoaner + loanerUserId);
		if (result && result.data) {
			submitUrl = financeApiUrl.demand.publish;
			$('#demandDetailFormSubmitBtn').click();
		} else {
			layer.msg(result.message);
		}
	});

	$('#demandDraftToSaveDraftBtn').click(function () {
		submitUrl = financeApiUrl.demand.modifyDraft;
		$('#demandDetailFormSubmitBtn').click();
	});

	$('#demandDraftLoanFailBtn').click(function () {
		var result = AjaxUtil.ajaxGetWithLoading(loanApiUrl.loanApply.reject + demandDetailForm.find('[name="loanApplyId"]').val());
		if(result){
			layer.msg("已驳回", {time:500}, function () {
				closeDemandDraftModelFrame();
				LayTableUtil.reload(demandDraftTable, 'demandDraftSearchForm');
			});
		}
	});

});

function openRightWinForDemandDraft(data){
	openRightWin('demandDraftDiv');
	$('#demandDraftDemandDetail').load('finance/demand/view');
	loadFormDataForDemandDraft( data);
	layform.render(null, 'demandDetailForm');
}

function loadFormDataForDemandDraft(data) {
	var result = AjaxUtil.ajaxGetWithLoading(financeApiUrl.demand.get + data.demandId);
	if(result){
		var applyResult = AjaxUtil.ajaxGet(loanApiUrl.loanApply.get + result.data.demandBaseInfoDTO.loanApplyId);
		if(applyResult) {
			loanFormDataForDemandDraft2DemandDetail(applyResult.data);
		}
		result.data.demandBaseInfoDTO['investBeginTime'] = DateUtils.longToDateString(result.data.demandBaseInfoDTO['investBeginTime']);
		result.data.demandBaseInfoDTO['investTerminalTime'] = DateUtils.longToDateString(result.data.demandBaseInfoDTO['investTerminalTime']);
		layui.each(result.data.demandBaseInfoDTO, function (k, v) {
			var selector = '[name="' + k + '"]';
			var elt = demandDetailForm.find(selector);
			elt.val("" + v);
		});
		layui.each(result.data.demandExtendInfoDTO, function (k, v) {
			var selector = '[name="' + k + '"]';
			var elt = demandDetailForm.find(selector);
			elt.val("" + v);
		});
		var param = result.data.demandBaseInfoDTO;
		demandDetailForm.find('[name="draftId"]').val(data.draftId);
		demandDetailForm.find('[name="increaseAmount"]').val(param.increaseAmount.amount);
		demandDetailForm.find('[name="singleMinAmount"]').val(param.singleMinAmount.amount);
		demandDetailForm.find('[name="singleMaxAmount"]').val(param.singleMaxAmount.amount);
		demandDetailForm.find('[name="fullScaleMethod"]').val(param.fullScaleMethod.code);

		demandDetailForm.find('[name="demandType"]').val(param.riskLevel);
		demandDetailForm.find('[name="recommendType"]').val(param.recommendType.code);

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
		layform.render(null, 'demandDetailForm');
	}
}

function loanFormDataForDemandDraft2DemandDetail(data){
	loanerUserId = data.userId;
	demandDetailForm.find('[name="userLoginName"]').text(data.userLoginName);
	demandDetailForm.find('[name="loanApplyAmount"]').text(MoneyUtil.formatMoney(data.loanApplyAmount.amount) + '元');
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

	demandDetailForm.find('[name="loanApplyId"]').val(data.applyId);

	var loanUserResult = AjaxUtil.ajaxPost(loanApiUrl.loanUserInfo.get, JSON.stringify({"userId": data.userId}));
	if(loanUserResult){
		$('#demandDetailLoanerInfoText').val(loanUserResult.data.loanUserIntroduce);
	}
}

function closeDemandDraftModelFrame() {
	$('#demandDraftDemandDetail').html("");
	closeRightWin('demandDraftDiv');
}