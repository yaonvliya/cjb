var exchangeTableIns = null, repayTableIns = null, unfreezeTableIns = null, grantCouponTableIns = null;
$(document).ready(function () {

    //默认显示
    renderExchangeTable();

    //一些事件监听
    layelement.on('tab(transactionFailed)', function(elem){
        if(elem.index == 0){
            LayTableUtil.refresh(exchangeTableIns);
        } else if(elem.index == 1){
            if(repayTableIns){
                LayTableUtil.refresh(repayTableIns);
            } else {
                renderRepayTable();
            }
        } else if(elem.index == 2){
            if(unfreezeTableIns){
                LayTableUtil.refresh(unfreezeTableIns);
            } else {
                renderUnfreezeTable();
            }
        } else if(elem.index == 3){
            if(grantCouponTableIns){
                LayTableUtil.refresh(grantCouponTableIns);
            } else {
                renderGrantCouponTable();
            }
        }
    });
});

function renderExchangeTable() {
    exchangeTableIns = LayTableUtil.render({
        elem: '#exchangeFailed'
        , height: 'full-300'
        , cols: [[ //表头
            {field: 'exchangeType', title: '转账类型', width: 160, templet: function (d) {
                return d.exchangeType.message}}
            , {field: 'exchangeFromAcct', title: '出账账户'}
            , {field: 'exchangeDestAcct', title: '入账账户'}
            , {field: 'exchangeAmt', title: '转账金额（元）', templet: function (d) {
                return MoneyUtil.formatMoney(NumberUtil.div(d.exchangeAmt, 100))}}
            , {field: 'failureMsg', title: '失败原因'}
            , {fixed: 'right', title: '操作', align: 'center', toolbar: '#transactionFailedBar', width: 200}

        ]]
        , url: depositApi.exchangeFailedList
        , page: false
        , id: 'exchangeFailedTable'

    });

    //监听工具条
    laytable.on('tool(exchangeFailed)', function (obj) {
        var data = obj.data;
        if (obj.event === 'retry') {
            layer.confirm('确认重试吗', function (index) {
                var result = AjaxUtil.ajaxPost(depositApi.retryExchange, JSON.stringify({"taskId": data.exchangeTaskId}));
                if (result) {
                    layer.close(index);
                    layer.msg("重试成功");
                    LayTableUtil.refresh(exchangeTableIns);
                }
            });
        }
    });
}

function renderRepayTable() {
    repayTableIns = LayTableUtil.render({
        elem: '#repayFailed'
        , height: 'full-300'
        , cols: [[ //表头
            {field: 'tradeId', title: '项目编号'}
            , {field: 'payerAcctId', title: '出账账户'}
            , {field: 'investorAcctId', title: '入账账户'}
            , {field: 'repayAmt', title: '转账金额（元）', templet: function (d) {
                return MoneyUtil.formatMoney(d.repayAmt.amount)}}
            , {field: 'failureMsg', title: '失败原因'}
            , {fixed: 'right', title: '操作', align: 'center', toolbar: '#transactionFailedBar', width: 200}

        ]]
        , url: depositApi.repayFailedList
        , page: false
        , id: 'repayFailedTable'

    });

    //监听工具条
    laytable.on('tool(repayFailed)', function (obj) {
        var data = obj.data;
        if (obj.event === 'retry') {
            layer.confirm('确认重试吗', function (index) {
                var result = AjaxUtil.ajaxPost(depositApi.retryRepay, JSON.stringify({"taskId": data.repayTaskId}));
                if (result) {
                    layer.close(index);
                    layer.msg("重试成功");
                    LayTableUtil.refresh(repayTableIns);
                }
            });
        }
    });

}

function renderUnfreezeTable() {
    unfreezeTableIns = LayTableUtil.render({
        elem: '#unfreezeFailed'
        , height: 'full-300'
        , cols: [[ //表头
            {field: 'unfreezeType', title: '解冻类型', width: 160, templet: function (d) {
                return d.unfreezeType.message}}
            , {field: 'unfreezeAcct', title: '解冻账户'}
            , {field: 'unfreezeAmt', title: '解冻金额（元）', templet: function (d) {
                return MoneyUtil.formatMoney(NumberUtil.div(d.unfreezeAmt, 100))}}
            , {field: 'failureMsg', title: '失败原因'}
            , {fixed: 'right', title: '操作', align: 'center', toolbar: '#transactionFailedBar', width: 200}

        ]]
        , url: depositApi.unfreezeFailedList
        , page: false
        , id: 'unfreezeFailedTable'

    });

    //监听工具条
    laytable.on('tool(unfreezeFailed)', function (obj) {
        var data = obj.data;
        if (obj.event === 'retry') {
            layer.confirm('确认重试吗', function (index) {
                var result = AjaxUtil.ajaxPost(depositApi.retryUnfreeze, JSON.stringify({"taskId": data.unfreezeTaskId}));
                if (result) {
                    layer.close(index);
                    layer.msg("重试成功");
                    LayTableUtil.refresh(unfreezeTableIns);
                }
            });
        }
    });
}

function renderGrantCouponTable() {
    grantCouponTableIns = LayTableUtil.render({
        elem: '#grantCouponFailed'
        , height: 'full-300'
        , cols: [[ //表头
            {field: 'couponType', title: '红包/加息劵', width: 160, templet: function (d) {
                return d.couponType.desc}}
            , {field: 'marketingAcctId', title: '出账账户'}
            , {field: 'userAcctId', title: '入账账户'}
            , {field: 'amt', title: '转账金额（元）', templet: function (d) {
                return MoneyUtil.formatMoney(d.amt.amount)}}
            , {field: 'failureMsg', title: '失败原因'}
            , {fixed: 'right', title: '操作', align: 'center', toolbar: '#transactionFailedBar', width: 200}

        ]]
        , url: depositApi.grantCouponFailedList
        , page: false
        , id: 'grantCouponFailedTable'

    });

    //监听工具条
    laytable.on('tool(grantCouponFailed)', function (obj) {
        var data = obj.data;
        if (obj.event === 'retry') {
            layer.confirm('确认重试吗', function (index) {
                var result = AjaxUtil.ajaxPost(depositApi.retryGrantCoupon, JSON.stringify({"taskId": data.taskId}));
                if (result) {
                    layer.close(index);
                    layer.msg("重试成功");
                    LayTableUtil.refresh(grantCouponTableIns);
                }
            });
        }
    });
}