var submitUrl = null, cashFormData = null, activityId = null;
var cashCouponForm = $('#cashCouponForm');

$().ready(function () {
	var cashWin;

	layform.render(null, 'cashCouponForm');
	layform.render('select', 'cashCouponSearchForm');

	laydate.render({elem: '#cashCouponGrantTime', type: 'date', range: '~', trigger: 'click'});
	laydate.render({elem: '#cashCouponEffectiveTime', type: 'date', range: '~', trigger: 'click'});

	$('#addCash').on('click', function () {
		submitUrl = userApi.coupon.addCashCoupon;
		cashFormData = null;
		activityId = null;
		resetCashFormData();
		$('#addModalCashCouponTitle').text("新建红包活动");
		openRightWin('addCashCoupon');
	});

	var tableIns = LayTableUtil.render({
		elem: '#cashCouponDataList'
		, id: 'cashCouponDataList'
		, cols: [[
			{field: 'activityName', title: '活动名称', width: 180, sort: true}
			, {
				field: 'totalLimitAmount', title: '发放总额', sort: true, align: 'right', templet: function (d) {
					return d.totalLimitAmount.amount + '元'
				}
			}
			, {
				field: 'singleMinAmount', title: '最小金额', sort: true, align: 'right', templet: function (d) {
					return d.singleMinAmount.amount + '元'
				}
			}
			, {
				field: 'singleMaxAmount', title: '最大金额', sort: true, align: 'right', templet: function (d) {
					return d.singleMaxAmount.amount + '元'
				}
			}
			, {
				field: 'activityScene', title: '发放场景', sort: true, templet: function (d) {
					return d.activityScene.message
				}
			}
			, {
				field: 'activityBeginTime', title: '开始时间', width: 120, sort: true, templet: function (d) {
					return DateUtils.longToDateStringYMD(d.activityBeginTime)
				}
			}
			, {
				field: 'activityFinishTime', title: '截止时间', width: 120, sort: true, templet: function (d) {
					return DateUtils.longToDateStringYMD(d.activityFinishTime)
				}
			}
			, {field: 'creator', title: '创建人'}
			, {field: 'modifier', title: '修改人'}
			, {field: 'activityStatus', title: '状态', fixed: 'right', templet: '#cashCouponCurrentStatus'}
			, {field: 'caozuo', title: '操作', fixed: 'right', width: 210, align: 'center', toolbar: '#cashCouponBar'}
		]]
		, url: userApi.coupon.searchCashCouponList
		, page: true
	});


	//监听工具条
	laytable.on('tool(cashCouponDataList)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			var res = AjaxUtil.ajaxGet(userApi.coupon.getCashCouponById + data.activityId);
			if (res) {
				setCashFormData(res.data);
				$('#cashCouponSubmit').hide();
				cashCouponForm.find('input,select').prop("disabled", "disabled");
				openRightWin('addCashCoupon');
				$('#addModalCashCouponTitle').text("查看红包活动");
			}
		} else if (obj.event === 'edit') {
			var res = AjaxUtil.ajaxGet(userApi.coupon.getCashCouponById + data.activityId);
			if (res) {
				cashFormData = res.data;
				submitUrl = userApi.coupon.editCashCoupon;
				activityId = data.activityId;

				setCashFormData(cashFormData);

				$('#addModalCashCouponTitle').text("编辑红包活动");
				openRightWin('addCashCoupon');
			}
		} else if (obj.event === 'del') {
			layer.confirm('确定要删除吗？', function (index) {
				var res = AjaxUtil.ajaxGet(userApi.coupon.deleteCashCouponById + data.activityId);
				if (res) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.refresh(tableIns, "cashCouponSearchForm");
				}
			});
		}
	});

	layform.on('radio(cashEffectiveType)', function (data) {
		if (data.value == 1) {
			$('#cashCouponEffectiveTime').removeAttr("disabled");
			cashCouponForm.find('[name="couponEffectiveDays"]').attr("disabled", "disabled").val("");
		} else {
			$('#cashCouponEffectiveTime').attr("disabled", "disabled").val("");
			cashCouponForm.find('[name="couponEffectiveDays"]').removeAttr("disabled");
		}
	});

	layform.on('submit(addCashCouponSubmit)', function (data) {
		var info = data.field;
		info['activityId'] = activityId;
		if (NumberUtil.compare(info.singleMinAmount, info.singleMaxAmount) == -1) {
			layer.msg('红包最小金额不能大于最大金额', {icon: 5, anim: 6});
			return false;
		}

		var cashCouponGrantTime = info.cashCouponGrantTime.split(' ~ ');
		var grantStartTime = cashCouponGrantTime[0];
		var grantEndTime = cashCouponGrantTime[1];
		if (DateUtils.compareDate(grantStartTime, grantEndTime)) {
			layer.msg('活动有效期开始时间不能大于结束时间', {icon: 5, anim: 6});
			return false;
		} else {
			info['activityBeginTime'] = grantStartTime;
			info['activityFinishTime'] = grantEndTime;
		}

		var cashCouponEffectiveTime = info.cashCouponEffectiveTime;
		if (info.cashEffectiveType == 1) {
			if (StringUtil.isEmpty(cashCouponEffectiveTime)) {
				layer.msg('请选择红包有效期', {icon: 5, anim: 6});
				return false;
			} else {
				var cashCouponEffectiveArr = cashCouponEffectiveTime.split(' ~ ');
				var effectiveTime = cashCouponEffectiveArr[0];
				var expireTime = cashCouponEffectiveArr[1];
				if (DateUtils.compareDate(effectiveTime, expireTime)) {
					layer.msg('红包有效期开始时间不能大于结束时间', {icon: 5, anim: 6});
					return false;
				} else {
					info['couponEffectiveTime'] = effectiveTime;
					info['couponExpireTime'] = expireTime;
				}
			}
		} else if (info.cashEffectiveType == 2 && StringUtil.isEmpty(info.couponEffectiveDays)) {
			layer.msg('请输入红包有效期天数', {icon: 5, anim: 6});
			cashCouponForm.find('[name="couponEffectiveDays"]').focus();
			return false;
		}
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(info));
		if (result) {
			closeCashCouponModelFrame();
			layer.msg("操作成功");
			LayTableUtil.reload(tableIns, "cashCouponSearchForm");
		}
		return false;
	});

	layform.on('select(cashCouponActivityScene)', function (data) {
		if ("invest" == data.value) {
			$("#cashCouponLeastObtainAmountController").show();
			cashCouponForm.find('[name="leastObtainAmount"]').removeAttr("readonly").prop("placeholder", "请输入发放规则").attr("lay-verify","required|amount");
		} else {
			$("#cashCouponLeastObtainAmountController").hide();
			cashCouponForm.find('[name="leastObtainAmount"]').val("0").prop("readonly", "readonly").prop("placeholder", "非投资活动，不用填写").removeAttr("lay-verify");
		}
	});

	$('#cashCouponSubmit').click(function () {
		$('#cashCouponSubmitBtn').click();
	});

	layform.on('switch(cashCouponCurrentStatus)', function (data) {
		if (data.elem.checked) {
			var res = AjaxUtil.ajaxGet(userApi.coupon.onlineCashCouponById + data.value);
			if (res) {
				layer.tips("上线成功", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var res = AjaxUtil.ajaxGet(userApi.coupon.offlineCashCouponById + data.value);
			if (res) {
				layer.tips("下线成功", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	$('#cashCouponSearchBtn').on('click', function () {
		LayTableUtil.reload(tableIns, "cashCouponSearchForm");
	});
	// SearchForm绑定回车事件
	$("#cashCouponSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#cashCouponSearchBtn').click();
		}
	});

	$('#cashAmountTipInfo').on('mouseenter', function () {
		this.index = layer.tips('数值相同表示发放的红包金额为固定值', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});

	$('.mask').click(function () {
		closeCashCouponModelFrame();
	});

});


function setCashFormData(info) {
	cashCouponForm.find('[name="activityName"]').val(info.activityName);
	cashCouponForm.find('[name="totalLimitAmount"]').val(info.totalLimitAmount.amount);
	cashCouponForm.find('[name="singleMinAmount"]').val(info.singleMinAmount.amount);
	cashCouponForm.find('[name="singleMaxAmount"]').val(info.singleMaxAmount.amount);
	cashCouponForm.find('[name="activityScene"]').val(info.activityScene.code);
	$('#cashCouponGrantTime').val(DateUtils.longToDateStringYMD(info.activityBeginTime) +
		' ~ ' + DateUtils.longToDateStringYMD(info.activityFinishTime));
	cashCouponForm.find('[name="leastActivateAmount"]').val(info.leastActivateAmount.amount);
	cashCouponForm.find('[name="leastObtainAmount"]').val(info.leastObtainAmount.amount);

	if (info.couponEffectiveDays > 0) {
		cashCouponForm.find("[name='cashEffectiveType'][value = '2']").prop("checked", true);
		cashCouponForm.find('[name="couponEffectiveDays"]').val(info.couponEffectiveDays).removeAttr("disabled");
		$('#cashCouponEffectiveTime').attr("disabled", "disabled").val("");
	} else {
		cashCouponForm.find("[name='cashEffectiveType'][value = '1']").prop("checked", true);
		$('#cashCouponEffectiveTime').val(DateUtils.longToDateStringYMD(info.couponEffectiveTime) +
			' ~ ' + DateUtils.longToDateStringYMD(info.couponExpireTime)).removeAttr("disabled");
		cashCouponForm.find('[name="couponEffectiveDays"]').attr("disabled", "disabled").val("");
	}
	if (info.activityStatus.code == 'online') {
		cashCouponForm.find("[name='activityStatus'][value = 'online']").prop("checked", true);
	} else {
		cashCouponForm.find("[name='activityStatus'][value = 'offline']").prop("checked", true);
	}
	if (info.decimalAllowed) {
		cashCouponForm.find("[name='decimalAllowed'][value = true]").prop("checked", true);
	} else {
		cashCouponForm.find("[name='decimalAllowed'][value = false]").prop("checked", true);
	}

	layform.render(null, 'cashCouponForm');
}

function resetCashFormData() {
	if (cashFormData) {
		setCashFormData(cashFormData);
	} else {
		cashCouponForm[0].reset();
		$('#cashCouponEffectiveTime').removeAttr("disabled").val("");
		cashCouponForm.find('[name="couponEffectiveDays"]').attr("disabled", "disabled").val("");
	}
}

function closeCashCouponModelFrame() {
	$("#cashCouponSubmit").show();
	cashCouponForm[0].reset();
	cashCouponForm.find('input,select').removeAttr("disabled");
	closeRightWin('addCashCoupon');
}
