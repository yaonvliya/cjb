var cashCouponDetailForm = $('#cashCouponDetailForm');
var sendCashForm = $('#sendCashForm');
var dataCount = 0, totalCashAmount = 0;
$().ready(function () {
    var cashWin;

    layform.render('select', 'userCashCouponListSearchForm');
    laydate.render({elem: '#cashListCouponUsedTimeLeftRangeSearch', type: 'date', trigger: 'click'});
    laydate.render({elem: '#cashListCouponUsedTimeRightRangeSearch', type: 'date', trigger: 'click'});

    var userCashListTable = LayTableUtil.render({
        elem: '#userCashCouponListDataList'
        , id: 'userCashCouponListDataList'
        , cols: [[
            {field: 'loginAccount', title: '用户名', width: 130, fixed: 'left'}
            , {field: 'userName', title: '姓名', width: 160, fixed: 'left'}
            , {field: 'couponActivityName', title: '活动名称', width: 150}
            , {field: 'couponCashAmount', title: '红包金额', width: 100}
            , {field: 'leastActivateAmount', title: '单笔最低投资额', width: 140}
            , {field: 'couponObtainSource', title: '发放场景', width: 100}
            , {field: 'couponObtainTime', title: '获取时间', width: 170}
            , {field: 'couponEffectiveTime', title: '生效时间', width: 170}
            , {field: 'couponExpireTime', title: '过期时间', width: 170}
            , {field: 'couponUsedFlag', title: '使用状态', width: 100}
            , {field: 'couponUsedTime', title: '使用时间', width: 170}
            , {field: 'couponTradeName', title: '交易名称', width: 180}
            , {field: 'couponCashId', title: '红包id', width: 250}
        ]]
        , url: userApi.userCoupon.cashList
        , page: true
        , toolbar: '#addUserCashToolBar'
        , defaultToolbar: ['filter', 'exports']
        , title: '红包发放及使用明细报表_' + DateUtils.longToDateStringYMD(new Date())
        , done: function (res, curr, count) {
            if (count != dataCount) {
                window.setTimeout(function () {
                    getAmount();
                }, 1000)
            } else {
                window.setTimeout(function () {
                    $('#sendCashTotalAmountLabel').text("￥" + MoneyUtil.formatMoney(totalCashAmount) + " 元");
                }, 1000)
            }
            dataCount = count;
        }
    });

    //头工具栏事件
    laytable.on('toolbar(userCashCouponListDataList)', function (obj) {
        switch (obj.event) {
            case 'addUserCash':
                $('#sendCashUserInfo').hide();
                cashWin = LayerUtil.open('发放红包', sendCashForm, '360px', null, 'sendCashForm');
                sendCashForm[0].reset();
                break;
        }
    });

    layform.on('submit(cashCouponDetailSubmit)', function (data) {
        var info = data.field;
        if (info.userId == null || info.userId == "") {
            layer.msg("无效的用户账号");
            return false;
        }
        var result = AjaxUtil.ajaxPost(userApi.userCoupon.grantCash, JSON.stringify(info));
        if (result) {
            LayerUtil.close(cashWin);
            layer.msg("红包发放成功");
            LayTableUtil.reload(userCashListTable, "userCashCouponListSearchForm");
        }
        return false;
    });

    $('#userCashCouponListSearchBtn').on('click', function () {
        var param = DataDeal.formToJsonObj($('#userCashCouponListSearchForm'));
        if (param.couponUsedTimeLeftRange && param.couponUsedTimeRightRange) {
            if (param.couponUsedTimeLeftRange > param.couponUsedTimeRightRange) {
                layer.msg("使用时间区间选择有误，请重新选择");
                return false;
            }
        }
        LayTableUtil.reload(userCashListTable, "userCashCouponListSearchForm");
    });
    // SearchForm绑定回车事件
    $("#userCashCouponListSearchForm").bind('keypress', function (event) {
        if (event.keyCode == "13") {
            $('#userCashCouponListSearchBtn').click();
        }
    });

    $('#sendCashAccount').on('blur', function (e) {
        var that = this;
        var userLoginAccount = that.value;
        if (StringUtil.isEmpty(userLoginAccount)) {
            return false;
        } else if (!VerificationUtil.isMobile(userLoginAccount)) {
            layer.msg("请输入正确的用户登录账号进行查询");
            return false;
        }
        setTimeout(function () {
            getUserInfoByLoginAccountForCash(userLoginAccount);
        }, 400);
    });

});

function getUserInfoByLoginAccountForCash(account) {
    var sendCashUserInfo = $('#sendCashUserInfo');
    var result = AjaxUtil.ajaxPostWithLoading(userManagerApi.getUserInfoByLoginAccount, JSON.stringify({"safeLoginAccount": account}));
    if (result.data) {
        var data = result.data;
        sendCashUserInfo.find('[name="userName"]').text(data.realName);
        sendCashForm.find('[name="userId"]').val(data.userId);
        sendCashUserInfo.show();
    } else {
        layer.msg("未查到[" + account + "]的个人信息");
        sendCashUserInfo.find('[name="userName"]').text("");
        sendCashForm.find('[name="userId"]').val("");
        sendCashUserInfo.hide();
    }
}

function getAmount() {
    var result = AjaxUtil.ajaxPost(userApi.userCoupon.cashAmount, DataDeal.formToJsonStr('userCashCouponListSearchForm'));
    if (result) {
        totalCashAmount = result.data;
        $('#sendCashTotalAmountLabel').text("￥" + MoneyUtil.formatMoney(totalCashAmount) + " 元");
    }
}
