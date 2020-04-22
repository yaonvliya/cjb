var submitUrl = null, interestFormData = null, activityId = null;
var interestCouponForm = $('#interestCouponForm');

$().ready(function () {
	layform.render(null, 'interestCouponForm');
	layform.render('select', 'interestCouponSearchForm');

	laydate.render({elem: '#interestCouponGrantTime', type: 'date', range: '~', trigger: 'click'});
	laydate.render({elem: '#interestCouponEffectiveTime', type: 'date', range: '~', trigger: 'click'});

	$('#addInterest').on('click', function () {
		submitUrl = userApi.coupon.addInterestCoupon;
		interestFormData = null;
		activityId = null;
		resetInterestFormData();
		openRightWin('addCashInterest');
		$('#addModalInterestCouponTitle').text("新增加息券活动");
	});

	var tableIns = LayTableUtil.render({
		elem: '#interestCouponDataList'
		, id: 'interestCouponDataList'
		, cols: [[
			{field: 'activityName', title: '活动名称', width: 180, sort: true}
			, {
				field: 'totalLimitCount', title: '发放总量', sort: true, align: 'right', templet: function (d) {
					return d.totalLimitCount + '张'
				}
			}
			, {
				field: 'singleMinInterest', title: '最小年化', sort: true, align: 'right', templet: function (d) {
					return NumberUtil.transfPercentage(d.singleMinInterest)
				}
			}
			, {
				field: 'singleMaxInterest', title: '最大年化', sort: true, align: 'right', templet: function (d) {
					return NumberUtil.transfPercentage(d.singleMinInterest)
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
			, {field: 'activityStatus', title: '状态', fixed: 'right', templet: '#interestCouponCurrentStatus'}
			, {field: 'caozuo', title: '操作', fixed: 'right', width: 210, align: 'center', toolbar: '#interestCouponBar'}
		]]
		, url: userApi.coupon.searchInterestCouponList
		, page: true
	});


	//监听工具条
	laytable.on('tool(interestCouponDataList)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			var res = AjaxUtil.ajaxGet(userApi.coupon.getInterestCouponById + data.activityId);
			if (res) {
				setInterestFormData(res.data);
				$("#cashInterestSubmit").hide();
				interestCouponForm.find('input,select').prop("disabled", "disabled");
				openRightWin('addCashInterest');
				$('#addModalInterestCouponTitle').text("查看加息券活动");
			}
		} else if (obj.event === 'edit') {
			var res = AjaxUtil.ajaxGet(userApi.coupon.getInterestCouponById + data.activityId);
			if (res) {
				interestFormData = res.data;
				submitUrl = userApi.coupon.editInterestCoupon;
				activityId = data.activityId;

				setInterestFormData(interestFormData);

				openRightWin('addCashInterest');
				$('#addModalInterestCouponTitle').text("编辑加息券活动");
			}
		} else if (obj.event === 'del') {
			layer.confirm('确定要删除吗？', function (index) {
				var res = AjaxUtil.ajaxGet(userApi.coupon.deleteInterestCouponById + data.activityId);
				if (res) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.refresh(tableIns, "interestCouponSearchForm");
				}
			});
		}
	});

	layform.on('radio(interestEffectiveType)', function (data) {
		if (data.value == 1) {
			$('#interestCouponEffectiveTime').removeAttr("disabled");
			interestCouponForm.find('[name="couponEffectiveDays"]').attr("disabled", "disabled").val("");
		} else {
			$('#interestCouponEffectiveTime').attr("disabled", "disabled").val("");
			interestCouponForm.find('[name="couponEffectiveDays"]').removeAttr("disabled");
		}
	});

	layform.on('submit(addInterestCouponSubmit)', function (data) {
		var info = data.field;
		info['activityId'] = activityId;
		if (NumberUtil.compare(info.singleMinAmount, info.singleMaxAmount) == -1) {
			layer.msg('加息券最小年化收益率不能大于最大年化收益率', {icon: 5, anim: 6});
			return false;
		}

		var interestCouponGrantTime = info.interestCouponGrantTime.split(' ~ ');
		var grantStartTime = interestCouponGrantTime[0];
		var grantEndTime = interestCouponGrantTime[1];
		if (DateUtils.compareDate(grantStartTime, grantEndTime)) {
			layer.msg('活动有效期开始时间不能大于结束时间', {icon: 5, anim: 6});
			return false;
		} else {
			info['activityBeginTime'] = grantStartTime;
			info['activityFinishTime'] = grantEndTime;
		}

		var interestCouponEffectiveTime = info.interestCouponEffectiveTime;
		if (info.interestEffectiveType == 1) {
			if (StringUtil.isEmpty(interestCouponEffectiveTime)) {
				layer.msg('请选择加息券有效期', {icon: 5, anim: 6});
				return false;
			} else {
				var interestCouponEffectiveArr = interestCouponEffectiveTime.split(' ~ ');
				var effectiveTime = interestCouponEffectiveArr[0];
				var expireTime = interestCouponEffectiveArr[1];
				if (DateUtils.compareDate(effectiveTime, expireTime)) {
					layer.msg('加息券有效期开始时间不能大于结束时间', {icon: 5, anim: 6});
					return false;
				} else {
					info['couponEffectiveTime'] = effectiveTime;
					info['couponExpireTime'] = expireTime;
				}
			}
		} else if (info.interestEffectiveType == 2 && StringUtil.isEmpty(info.couponEffectiveDays)) {
			layer.msg('请输入加息券有效期天数', {icon: 5, anim: 6});
			interestCouponForm.find('[name="couponEffectiveDays"]').focus();
			return false;
		}
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(info));
		if (result) {
			closeCashInterestModelFrame();
			layer.msg("操作成功");
			LayTableUtil.reload(tableIns, "interestCouponSearchForm");
		}
		return false;
	});

	layform.on('select(interestCouponActivityScene)', function (data) {
		if ("invest" == data.value) {
			$("#interestCouponLeastObtainAmountController").show();
			interestCouponForm.find('[name="leastObtainAmount"]').removeAttr("readonly").prop("placeholder", "请输入发放规则").attr("lay-verify","required|amount");
		} else {
			$("#interestCouponLeastObtainAmountController").hide();
			interestCouponForm.find('[name="leastObtainAmount"]').val("0").prop("readonly", "readonly").prop("placeholder", "非投资活动，不用填写").removeAttr("lay-verify");
		}
	});

	$('#cashInterestSubmit').click(function () {
		$('#cashInterestSubmitBtn').click();
	});

	layform.on('switch(interestCouponCurrentStatus)', function (data) {
		if (data.elem.checked) {
			var res = AjaxUtil.ajaxGet(userApi.coupon.onlineInterestCouponById + data.value);
			if (res) {
				layer.tips("上线成功", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var res = AjaxUtil.ajaxGet(userApi.coupon.offlineInterestCouponById + data.value);
			if (res) {
				layer.tips("下线成功", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	$('#interestCouponSearchBtn').on('click', function () {
		LayTableUtil.reload(tableIns, "interestCouponSearchForm");
	});
	// SearchForm绑定回车事件
	$("#interestCouponSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#interestCouponSearchBtn').click();
		}
	});

	$('#interestTipInfo').on('mouseenter', function () {
		this.index = layer.tips('数值相同表示发放的加息券年化收益率为固定值', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});

	$('.mask').click(function () {
		closeCashInterestModelFrame();
	});

});


function setInterestFormData(info) {
	interestCouponForm.find('[name="activityName"]').val(info.activityName);
	interestCouponForm.find('[name="totalLimitCount"]').val(info.totalLimitCount);
	interestCouponForm.find('[name="singleMinInterest"]').val(NumberUtil.mul(info.singleMinInterest, 100));
	interestCouponForm.find('[name="singleMaxInterest"]').val(NumberUtil.mul(info.singleMaxInterest, 100));
	interestCouponForm.find('[name="activityScene"]').val(info.activityScene.code);
	$('#interestCouponGrantTime').val(DateUtils.longToDateStringYMD(info.activityBeginTime) +
		' ~ ' + DateUtils.longToDateStringYMD(info.activityFinishTime));
	interestCouponForm.find('[name="leastActivateAmount"]').val(info.leastActivateAmount.amount);
	interestCouponForm.find('[name="leastObtainAmount"]').val(info.leastObtainAmount.amount);

	if (info.couponEffectiveDays > 0) {
		interestCouponForm.find("[name='interestEffectiveType'][value = '2']").prop("checked", true);
		interestCouponForm.find('[name="couponEffectiveDays"]').val(info.couponEffectiveDays).removeAttr("disabled");
		$('#interestCouponEffectiveTime').attr("disabled", "disabled").val("");
	} else {
		interestCouponForm.find("[name='interestEffectiveType'][value = '1']").prop("checked", true);
		$('#interestCouponEffectiveTime').val(DateUtils.longToDateStringYMD(info.couponEffectiveTime) +
			' ~ ' + DateUtils.longToDateStringYMD(info.couponExpireTime)).removeAttr("disabled");
		interestCouponForm.find('[name="couponEffectiveDays"]').attr("disabled", "disabled").val("");
	}
	if (info.activityStatus.code == 'online') {
		interestCouponForm.find("[name='activityStatus'][value = 'online']").prop("checked", true);
	} else {
		interestCouponForm.find("[name='activityStatus'][value = 'offline']").prop("checked", true);
	}

	layform.render(null, 'interestCouponForm');
}

function resetInterestFormData() {
	if (interestFormData) {
		setInterestFormData(interestFormData);
	} else {
		interestCouponForm[0].reset();
		$('#interestCouponEffectiveTime').removeAttr("disabled").val("");
		interestCouponForm.find('[name="couponEffectiveDays"]').attr("disabled", "disabled").val("");
	}
}

function closeCashInterestModelFrame() {
	$("#cashInterestSubmit").show();
	interestCouponForm[0].reset();
	interestCouponForm.find('input,select').removeAttr("disabled");
	closeRightWin('addCashInterest');
}