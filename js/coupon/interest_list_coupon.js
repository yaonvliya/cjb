var interestCouponDetailForm = $('#interestCouponDetailForm');
var sendInterestForm = $('#sendInterestForm');
$().ready(function () {
	var cashWin;

	layform.render('select', 'userInterestCouponListSearchForm');
	laydate.render({elem: '#interestListCouponUsedTimeLeftRangeSearch', type: 'date', trigger: 'click'});
	laydate.render({elem: '#interestListCouponUsedTimeRightRangeSearch', type: 'date', trigger: 'click'});

	var userInterestListTable = LayTableUtil.render({
		elem: '#userInterestCouponListDataList'
		, id: 'userInterestCouponListDataList'
		, cols: [[
			{field: 'loginAccount', title: '用户名', width: 130, fixed: 'left'}
			, {field: 'userName', title: '姓名', width: 160, fixed: 'left'}
			, {field: 'couponActivityName', title: '活动名称', width: 150}
			, {field: 'couponInterestRate', title: '年化收益率', width: 120}
			, {field: 'leastActivateAmount', title: '单笔最低投资额', width: 140}
			, {field: 'couponObtainSource', title: '发放场景', width: 100}
			, {field: 'couponObtainTime', title: '获取时间', width: 170}
			, {field: 'couponEffectiveTime', title: '生效时间', width: 170}
			, {field: 'couponExpireTime', title: '过期时间', width: 170}
			, {field: 'couponUsedFlag', title: '使用状态', width: 100}
			, {field: 'couponUsedTime', title: '使用时间', width: 170}
			, {field: 'couponTradeName', title: '交易名称', width: 180}
			, {field: 'couponInterestId', title: '加息券id', width: 250}
		]]
		, url: userApi.userCoupon.interestList
		, page: true
		, toolbar: '#addInterestCouponToolBar'
		, defaultToolbar: ['filter', 'exports']
		, title: '加息券发放及使用明细报表_' + DateUtils.longToDateStringYMD(new Date())
	});

	//头工具栏事件
	laytable.on('toolbar(userInterestCouponListDataList)', function(obj){
		switch(obj.event){
			case 'addInterestCoupon':
				$('#sendInterestUserInfo').hide();
				cashWin = LayerUtil.open('发送加息券', sendInterestForm, '400px', null, 'sendInterestForm');
                sendInterestForm[0].reset();
				break;
		}
	});

	layform.on('submit(cashCouponDetailSubmit)', function (data) {
		var info = data.field;
        if(info.userId == null || info.userId == ""){
            layer.msg("无效的用户账号");
            return false;
        }
		var result = AjaxUtil.ajaxPost(userApi.userCoupon.grantInterest, JSON.stringify(info));
		if (result) {
			LayerUtil.close(cashWin);
			layer.msg("加息券发放成功");
			LayTableUtil.reload(userInterestListTable, "userInterestCouponListSearchForm");
		}
		return false;
	});

	$('#userInterestCouponListSearchBtn').on('click', function () {
		var param = DataDeal.formToJsonObj($('#userCashCouponListSearchForm'));
		if(param.couponUsedTimeLeftRange && param.couponUsedTimeRightRange){
			if(param.couponUsedTimeLeftRange > param.couponUsedTimeRightRange){
				layer.msg("使用时间区间选择有误，请重新选择");
				return false;
			}
		}
		LayTableUtil.reload(userInterestListTable, "userInterestCouponListSearchForm");
	});
	// SearchForm绑定回车事件
	$("#userInterestCouponListSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#userInterestCouponListSearchBtn').click();
		}
	});

	$('#sendInterestAccount').on('blur', function (e) {
		var that = this;
		var userLoginAccount = that.value;
		if (StringUtil.isEmpty(userLoginAccount)) {
			return false;
		} else if(!VerificationUtil.isMobile(userLoginAccount)) {
			layer.msg("请输入正确的用户登录账号进行查询");
			return false;
		}
		setTimeout(function () {
			getUserInfoByLoginAccountForInterest(userLoginAccount);
		},400);
	});

});

function getUserInfoByLoginAccountForInterest(account) {
	var sendInterestUserInfo = $('#sendInterestUserInfo');
	var result = AjaxUtil.ajaxPostWithLoading(userManagerApi.getUserInfoByLoginAccount, JSON.stringify({"safeLoginAccount": account}));
	if(result.data){
		var data = result.data;
		sendInterestUserInfo.find('[name="userName"]').text(data.realName);
		sendInterestForm.find('[name="userId"]').val(data.userId);
		sendInterestUserInfo.show();
	} else {
		layer.msg("未查到[" + account + "]的个人信息");
		sendInterestUserInfo.find('[name="userName"]').text("");
		sendInterestForm.find('[name="userId"]').val("");
		sendInterestUserInfo.hide();
	}
}
