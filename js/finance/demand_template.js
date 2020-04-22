var demandTemplateForm = $("#demandTemplateForm");
$(document).ready(function () {
	var index = null;
	var submitUrl = null;

	layform.render(null, 'searchDemandTemplateForm');
	var demandTemplateTable = LayTableUtil.render({
		elem: '#demandTemplate'
		,cols: [[
			{field: 'templateName', title: '模板名称'}
			,{field: 'preDemandName', title: '标的名称前缀'}
			,{field: 'fullScaleMethod', title: '满标条件类型', templet: function (d) {return d.fullScaleMethod.message}}
			,{field: 'fullScaleValue', title: '满标条件值'}
			,{field: 'singleMinAmount', title: '起投金额(元)', templet: function (d) { return MoneyUtil.formatMoney(d.singleMinAmount.amount)}}
			,{field: 'increaseAmount', title: '递增金额(元)', templet: function (d) { return MoneyUtil.formatMoney(d.increaseAmount.amount)}}
			,{field: 'singleMaxAmount', title: '单笔投资限额(元)', width: 150, templet: function (d) { return MoneyUtil.formatMoney(d.singleMaxAmount.amount)}}
			// ,{field: 'autoInvestSwitch', title: '是否支持自动投标', width: 150}
			// ,{field: 'cashCouponSwitch', title: '是否支持红包'}
			// ,{field: 'interestCouponSwitch', title: '是否支持加息券', width: 150}
			// ,{field: 'transferSwitch', title: '是否支持债权转让', width: 150}
			// ,{field: 'investCreditTemplateId', title: '用户投资凭证模板ID', width: 150}
			// ,{field: 'investContractTemplateId', title: '投资合同模板ID', width: 150}
			// ,{field: 'investTransferTemplateId', title: '债权转让合同模板ID', width: 160}
			// ,{field: 'guaranteeLetterTemplateId', title: '担保函模板ID', width: 150}
			, {field: 'currentStatus', title: '状态', width:120, templet: '#demandTemplateStatusTpl'}
			, {title: '操作', align:'center', toolbar: '#demandTemplateOperation', width: 210}

		]]
		, url: financeApiUrl.demandTemplate.list
		, page: true
		, id: 'demandTemplate'
	});

	//监听工具条
	laytable.on('tool(demandTemplate)', function(obj){
		var data = obj.data;
		if(obj.event === 'detail'){
			openRightWinForDemandTemplate('标的模板详情', 'detail', data);
		} else if(obj.event === 'del'){
			layer.confirm('真的删除这条标的模板吗？', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(financeApiUrl.demandTemplate.delete + data.templateId);
				if(result){
					layer.msg("刪除成功");
					layer.close(index);
					LayTableUtil.reload(demandTemplateTable, 'demandTemplateSearchForm');
				}
			});
		} else if(obj.event === 'edit'){
			openRightWinForDemandTemplate('编辑标的模板', 'edit', data);

		}
	});

	layform.on('radio(demandTemplateStatusFilter)', function(data){
		$("#addDemandTemplateStatus").val(data.value);
	});

	layform.on('radio(demandTemplateAutoInvestSwitchFilter)', function(data){
		$("#addDemandTemplateAutoInvestSwitch").val(data.value);
	});

	layform.on('radio(demandTemplateCashCouponSwitchFilter)', function(data){
		$("#addDemandTemplateCashCouponSwitch").val(data.value);
	});

	layform.on('radio(demandTemplateInterestCouponSwitchFilter)', function(data){
		$("#addDemandTemplateInterestCouponSwitch").val(data.value);
	});

	layform.on('radio(demandTemplateTransferSwitchFilter)', function(data){
		$("#addDemandTemplateTransferSwitch").val(data.value);
	});

	/**满标方式切换时，切换满标方式值*/
	layform.on('select(demandTemplateFullScaleMethodFilter)', function(data){
		if('fixed_time' == data.value) {
			$('#demandTemplateFullScaleValue').html('<input class="layui-input" lay-verify="required"  name="fullScaleValue" id="demandTemplateFullScaleDate" placeholder="请选择满标日期" autocomplete="off">');
			laydate.render({
				elem: '#demandTemplateFullScaleDate'
			});
		} else {
			$('#demandTemplateFullScaleValue').html('<input class="layui-input" lay-verify="required"  name="fullScaleValue" placeholder="请输入满标条件值" autocomplete="off">');
		}
	});

	$('#reloadDemandTemplate').click(function () {
		LayTableUtil.reload(demandTemplateTable, 'demandTemplateSearchForm');
	});

	$("#demandTemplateSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadDemandTemplate').click();
		}
	});

	$('#addDemandTemplateBtn').click(function () {
		openRightWinForDemandTemplate('新建标的模板', 'add');
	});

	/**打开表单*/
	function openRightWinForDemandTemplate(title, method, data){
		if (method == "add") {
			submitUrl = financeApiUrl.demandTemplate.add;
			$("#demandTemplateSubmit").show();
		} else if (method == "edit") {
			submitUrl = financeApiUrl.demandTemplate.modify;
			$("#demandTemplateSubmit").show();
			loadFormDataForDemandTemplate(data);
		} else if (method == "detail") {
			loadFormDataForDemandTemplate( data);
			$("#demandTemplateSubmit").hide();
			demandTemplateForm.find("input,select,textarea").prop("disabled", "disabled");
		}
		index = LayerUtil.open(title, demandTemplateForm, '820px', null, 'demandTemplateForm', null, true);

		layform.render(null, 'addDemandTemplateForm');
	}

	//监听表单提交
	layform.on('submit(demandTemplateFormSubmit)', function(data){
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(data.field));
		if (result) {
			layer.close(index);
			layer.msg("操作成功");
			LayTableUtil.reload(demandTemplateTable, 'demandTemplateSearchForm');
		}
		return false;
	});

	/**打开表单时填充信息*/
	function loadFormDataForDemandTemplate(data) {
		var result = AjaxUtil.ajaxGetWithLoading(financeApiUrl.demandTemplate.get + data.templateId);
		if(result){
			var data = result.data;
			layui.each(data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = demandTemplateForm.find(selector);
				elt.val("" + v);
			});

			demandTemplateForm.find('[name="increaseAmount"]').val(data.increaseAmount.amount);
			demandTemplateForm.find('[name="singleMinAmount"]').val(data.singleMinAmount.amount);
			demandTemplateForm.find('[name="singleMaxAmount"]').val(data.singleMaxAmount.amount);
			demandTemplateForm.find('[name="fullScaleMethod"]').val(data.fullScaleMethod.code);
			demandTemplateForm.find('[name="recommendType"]').val(data.recommendType ? data.recommendType.code : "");
			if (data.currentStatus.code == 'online') {
				demandTemplateForm.find("[name='demandTemplateStatusTemp'][title='正常']").prop("checked", true);
			} else {
				demandTemplateForm.find("[name='demandTemplateStatusTemp'][title='停用']").prop("checked", true);
			}
			if (data.autoInvestSwitch) {
				demandTemplateForm.find("[name='demandTemplateAutoInvestTemp'][title='是']").prop("checked", true);
			} else {
				demandTemplateForm.find("[name='demandTemplateAutoInvestTemp'][title='否']").prop("checked", true);
			}
			if (data.cashCouponSwitch) {
				demandTemplateForm.find("[name='demandTemplateCashCouponSwitch'][title='是']").prop("checked", true);
			} else {
				demandTemplateForm.find("[name='demandTemplateCashCouponSwitch'][title='否']").prop("checked", true);
			}
			if (data.interestCouponSwitch) {
				demandTemplateForm.find("[name='demandTemplateInterestCouponSwitch'][title='是']").prop("checked", true);
			} else {
				demandTemplateForm.find("[name='demandTemplateInterestCouponSwitch'][title='否']").prop("checked", true);
			}
			if (data.transferSwitch) {
				demandTemplateForm.find("[name='demandTemplateTransferSwitch'][title='是']").prop("checked", true);
			} else {
				demandTemplateForm.find("[name='demandTemplateTransferSwitch'][title='否']").prop("checked", true);
			}
		}
	}

});
