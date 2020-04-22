var transferRuleFormBox = $('#transferRuleFormBox');

$().ready(function () {
	var cashWin = null;
	var submitUrl = null;

	layform.render('radio', 'transferRuleFormBox');

	var tableIns = LayTableUtil.render({
		elem: '#transferRuleDataList'
		, id: 'transferRuleDataList'
		, cols: [[
			{field: 'leastHoldDays', title: '允许转让最少持有天数'}
			, {field: 'mostAdvanceDays', title: '允许转让最多提前天数'}
			, {field: 'effectiveDays', title: '债权转让有效天数'}
			, {
				field: 'serviceChargeAmt', title: '手续费', templet: function (d) {
					return MoneyUtil.formatMoney(d.serviceChargeAmt.amount) + "元"
				}
			}
			, {field: 'creator', title: '创建人'}
			, {field: 'modifier', title: '修改人'}
			, {
				field: 'currentStatus', title: '状态', fixed: 'right', templet: '#transferRuleStatus'}
			, {field: 'caozuo', title: '操作', fixed: 'right', width: 250, align: 'center', toolbar: '#transferRuleBar'}
		]]
		, url: transferApi.rule.search
		, page: false
		, toolbar: '#addTransferRuleToolBar'
	});


	//监听工具条
	laytable.on('tool(transferRuleDataList)', function (obj) {
		var res = null;
		var data = obj.data;
		if (obj.event === 'detail') {
			res = AjaxUtil.ajaxGet(transferApi.rule.get + data.ruleId);
			if (res) {
				setTransferRuleFormData(res.data);
				cashWin = LayerUtil.open('查看债权转让规则', transferRuleFormBox, '700px', null, 'transferRuleFormBox', null, true);
			}
			transferRuleFormBox.find('input,select').prop("disabled", "disabled");
		} else if (obj.event === 'del') {
			layer.confirm('确定要删除吗？', function (index) {
				var res = AjaxUtil.ajaxGet(transferApi.rule.delete + data.ruleId);
				if (res) {
					layer.close(index);
					layer.msg("刪除成功");
					tableIns.refresh();
				}
			});
		} else if(obj.event === 'edit') {
			submitUrl = transferApi.rule.edit;
			res = AjaxUtil.ajaxGet(transferApi.rule.get + data.ruleId);
			if (res) {
				setTransferRuleFormData(res.data);

				cashWin = LayerUtil.open('修改债权转让规则', transferRuleFormBox, '700px', null, 'transferRuleFormBox');
			}
		}
	});

	//头工具栏事件
	laytable.on('toolbar(transferRuleDataList)', function(obj){
		switch(obj.event){
			case 'addTransferRule':
				cashWin = LayerUtil.open('添加债权转让规则', transferRuleFormBox, '700px', null, 'transferRuleFormBox');
				submitUrl = transferApi.rule.create;
				break;
		}
	});

	layform.on('radio(transferRuleStatusFilter)', function(data){
		transferRuleFormBox.find('[name="currentStatus"]').val(data.value);
	});


	layform.on('submit(transferRuleSubmit)', function (data) {
		var info = data.field;
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(info));
		if (result) {
			layer.close(cashWin);
			layer.msg("操作成功");
			tableIns.refresh();
		}
		return false;
	});

});


function setTransferRuleFormData(data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = transferRuleFormBox.find(selector);
		elt.val("" + v);
	});
	transferRuleFormBox.find('[name="serviceChargeAmt"]').val(MoneyUtil.formatMoney(data.serviceChargeAmt.amount));
	transferRuleFormBox.find('[name="currentStatus"]').val(data.currentStatus.code);
	if (data.currentStatus.code == 'online') {
		transferRuleFormBox.find("[name='currentStatus'][value = 'online']").prop("checked", true);
	} else {
		transferRuleFormBox.find("[name='currentStatusTemp'][value = 'offline']").prop("checked", true);
	}
	layform.render('radio', 'transferRuleFormBox');
}
