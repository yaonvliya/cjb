/* 这里列举了所有的api请求url */
var domain = window.location.host;
if(domain.indexOf("chejubao.cn") != -1){
	apiContext = "";
}
var commonApiUrl = {
	getUploadParam : apiContext + "/internal/common/upload/get_upload_param",
	getSysUploadFileURL: apiContext + "/internal/common/upload/get_public_file_url",
	getCredentialsUploadFileURL: apiContext + "/internal/common/upload/get_credentials_file_url"
};

/** 平台相关接口*/
var platformApi = {
    // 获取图形验证码
    getImgCaptcha: apiContext + "/captcha/img",
    // 获取短信验证码
    getSmsCaptcha: apiContext + "/captcha/sms",

    login: apiContext + "/login",

    doLogin: apiContext + "/doLogin",

    resetPwd: apiContext + "/resetPwd"
};

// 首页接口
var indexApiUrl = {
	index: apiContext + "/index",
	// getMenu:  apiContext + "/menu",
    getMenu:  apiContext + "properties/menu.json",
	logout: apiContext + "/logout",
	getUserInfo: apiContext + "/userInfo",
    modifyPwd: apiContext + "/modifyPwd"
};

// 图表类接口
var chartReport = {
	operationSituation: apiContext + "/chartReport/operationSituation"
};


// 消息服务中心接口
var messageCenterApiUrl = {
	//公告
	announcement: {
		//获取公告列表
		list: apiContext + "/business/notice/queryList",

		//删除公告 (get)
		delete: apiContext + "/business/notice/delete/",

		//添加公告
		add: apiContext + "/business/notice/add",

		//获取公告详情 (get)
		get: apiContext + "/business/notice/search/",

		//修改公告
		modify: apiContext + "/business/notice/modify",

		//修改公告是否在首页展示
		showSwitch: apiContext + "/business/notice/edit/show",

		//修改公告是否置顶
		topSwitch: apiContext + "/business/notice/edit/top"
	},
	//问题
	faq:{
		//获取问题列表
		list: apiContext + "/business/faq/question/queryList",

		//删除问题 (get)
		delete: apiContext + "/business/faq/question/delete/",

		//添加问题
		add: apiContext + "/business/faq/question/add",

		//获取问题详情 (get)
		get: apiContext + "/business/faq/question/search/",

		//修改问题
		modify: apiContext + "/business/faq/question/edit",

		//修改问题是否在首页展示
		indexSwitch: apiContext + "/business/faq/question/edit/index",

		//修改问题状态
		status: apiContext + "/business/faq/question/edit/status"


	},
	//问题类型
	faqType:{
		//获取问题列表
		list: apiContext + "/business/faqType/queryList",

		//删除问题 (get)
		delete: apiContext + "/business/faqType/delete/",

		//添加问题
		add: apiContext + "/business/faqType/add",

		//获取问题详情 (get)
		get: apiContext + "/business/faqType/search/",

		//修改问题
		modify: apiContext + "/business/faqType/edit",

		//修改问题状态
		status: apiContext + "/business/faqType/edit/status",

		//不分页查询问题类型
		types: apiContext + "/business/faqType/types/"

	},
	//轮播图
	banner:{
		//获取轮播图列表
		list: apiContext + "/business/banner/queryList",

		//删除轮播图 (get)
		delete: apiContext + "/business/banner/delete/",

		//添加轮播图
		add: apiContext + "/business/banner/add",

		//获取轮播图详情 (get)
		get: apiContext + "/business/banner/search/",

		//修改轮播图
		modify: apiContext + "/business/banner/edit",

		//修改轮播图状态
		status: apiContext + "/business/banner/edit/status"
	},
	//活动
	activity:{
		//获取活动列表
		list: apiContext + "/business/activity/queryList",

		//删除活动 (get)
		delete: apiContext + "/business/activity/delete/",

		//添加活动
		add: apiContext + "/business/activity/add",

		//获取活动详情 (get)
		get: apiContext + "/business/activity/search/",

		//修改活动
		modify: apiContext + "/business/activity/edit",

		//修改活动展示与否
		show: apiContext + "/business/activity/edit/show",

		//修改活动状态
		status: apiContext + "/business/activity/edit/status"
	},
	//系统参数
	sysParam:{
		//获取系统参数列表
		list: apiContext + "/config/sys/param/queryList",

		//删除系统参数 (get)
		delete: apiContext + "/config/sys/param/delete/",

		//添加系统参数
		add: apiContext + "/config/sys/param/add",

		//获取系统参数详情 (get)
		get: apiContext + "/config/sys/param/search/",

		//修改系统参数
		modify: apiContext + "/config/sys/param/edit"
	},
	//短信模板
	smsTemplate:{
		//获取短信模板列表
		list: apiContext + "/config/sms/template/queryList",

		//删除短信模板 (get)
		delete: apiContext + "/config/sms/template/delete/",

		//添加短信模板
		add: apiContext + "/config/sms/template/add",

		//获取短信模板详情 (get)
		get: apiContext + "/config/sms/template/search/",

		//修改短信模板
		modify: apiContext + "/config/sms/template/edit"
	},
    //短信模板
    mailTemplate:{
        //获取邮件模板列表
        list: apiContext + "/config/mail/template/queryList",

        //删除邮件模板 (get)
        delete: apiContext + "/config/mail/template/delete/",

        //添加邮件模板
        add: apiContext + "/config/mail/template/add",

        //获取邮件模板详情 (get)
        get: apiContext + "/config/mail/template/search/",

        //修改邮件模板
        modify: apiContext + "/config/mail/template/edit"
    },
	//合同类型
	contractType:{
		//获取合同类型列表
		list: apiContext + "/config/contract/type/queryList",

		//根据作用域获取合同类型列表 (get)
		scopeList: apiContext + "/config/contract/type/queryList/",

		//删除合同类型 (get)
		delete: apiContext + "/config/contract/type/delete/",

		//添加合同类型
		add: apiContext + "/config/contract/type/add",

		//获取合同类型详情 (get)
		get: apiContext + "/config/contract/type/search/",

		//修改合同类型
		modify: apiContext + "/config/contract/type/edit",

		//修改合同类型
		status: apiContext + "/config/contract/type/edit/status"
	},
	//合同模板
	contractTemplate:{
		//获取合同模板列表
		list: apiContext + "/config/contractTemp/queryList",

		//获取在线合同模板
		onlineList: apiContext + "/config/contractTemp/queryList/online",

		//删除合同模板 (get)
		delete: apiContext + "/config/contractTemp/delete/",

		//添加合同模板
		add: apiContext + "/config/contractTemp/add",

		//获取合同模板详情 (get)
		get: apiContext + "/config/contractTemp/search/",

		//修改合同模板
		modify: apiContext + "/config/contractTemp/edit",

		//修改合同模板状态
		status: apiContext + "/config/contractTemp/edit/status",

		//设置合同模板签约位置
        setSignPosition: apiContext + "/config/contractTemp/setSignPosition",

		//合同模板预览地址
		previewUrl: apiContext + "/config/contractTemp/previewUrl"

	}

};

var financeApiUrl = {
	demandType : {
		//获取标的类型列表
		list: apiContext + "/finance/demand/type/queryList",

		//获取在线的标的类型
		listOnlyOnline: apiContext + "/finance/demand/type/queryList/online",

		//删除标的类型 (get)
		delete: apiContext + "/finance/demand/type/delete/",

		//添加标的类型
		add: apiContext + "/finance/demand/type/add",

		//获取标的类型详情 (get)
		get: apiContext + "/finance/demand/type/search/",

		//修改标的类型
		modify: apiContext + "/finance/demand/type/edit"
	},

	demandTemplate : {
		//获取标的模板列表
		list: apiContext + "/finance/demand/template/queryList",

		//获取在线的标的模板
		listOnlyOnline: apiContext + "/finance/demand/template/queryList/online",

		//删除标的模板 (get)
		delete: apiContext + "/finance/demand/template/delete/",

		//添加标的模板
		add: apiContext + "/finance/demand/template/add",

		//获取标的模板详情 (get)
		get: apiContext + "/finance/demand/template/search/",

		//修改标的模板
		modify: apiContext + "/finance/demand/template/edit"
	},

	demand : {
		//获取标的草稿箱列表
		draftList: apiContext + "/finance/demand/draft/queryList",

		//获取已发布标的列表
		publishDemandList: apiContext + "/finance/demand/publish/queryList",

		//删除标的草稿箱 (get)
		draftDelete: apiContext + "/finance/demand/draft/delete/",

		//获取标的详情 (get)
		get: apiContext + "/finance/demand/search/",

		//从草稿箱发布融资需求 (get)
		publishFormDraft: apiContext + "/finance/demand/publish/draft/",

		// 发布融资需求
		publish: apiContext + "/finance/demand/publish",

		// 检查借款人资料
		checkLoaner: apiContext + "/finance/demand/check_loaner_right/",

		// 融资需求审核
		publishReview: apiContext + "/finance/demand/publish/review",

		// 保存融资需求到草稿箱
		saveToDraft: apiContext + "/finance/demand/draft/save",

		// 修改标的草稿箱
		modifyDraft: apiContext + "/finance/demand/draft/modify"
	},

	invest: {
		//获取投资列表
		list: apiContext + "/finance/invest/queryList",

		//根据标的获取投资列表
		tradeList: apiContext + "/finance/invest/queryList/"
	}
};

var tradeApiUrl = {
	trade : {
		// 获取交易列表
		tradeList: apiContext + "/loan/trade/queryList",

		//  获取交易详情 (get) 后边需要拼接tradeID
		get: apiContext + "/loan/trade/search/",

		// 获取流标交易列表
		tradeRefusedList: apiContext + "/loan/trade/refused/queryList",

		// 流标 (get)
		refused: apiContext + "/loan/trade/refused",

		// 获取满标放款列表
		fullGrantList: apiContext + "/loan/trade/full_grant/queryList",

		//放款
		fullGrant: apiContext + "/loan/trade/full_grant",

		// 重新生成标的合同
		rebuildContract: apiContext + "/loan/trade/rebuild_contract",

        // 置顶设置
        topSwitch: apiContext + "/loan/trade/topSwitch"
	}
};

var transferApiUrl = {
	transfer : {
		// 获取交易列表
		transferList: apiContext + "/transfer/queryList",

		// 获取转让详情 (get) 后边需要拼接上transferID
		get : apiContext + "/transfer/search/"
	}
};

//借款接口
var loanApiUrl = {

	//借款申请
	loanApply : {
		//获取借款申请列表
		list: apiContext + "/loan/apply/queryList",

		//获取借款申请详情 (get)
		get: apiContext + "/loan/apply/search/",

		// 平台驳回借款申请
		reject: apiContext + "/loan/apply/reject/",

		// 更新借款信息
		modify: apiContext + "/loan/apply/update"
	},

    loanUserInfo : {
		search: apiContext + "/loan/userInfo/search",
        get: apiContext + "/loan/userInfo/get",
		audit: apiContext + "/loan/userInfo/audit",
		personalUploadInfo: apiContext + "/loan/userInfo/personal_cert_upload",
		companyUploadInfo: apiContext + "/loan/userInfo/enterprise_cert_upload",
		updateUploadInfo: apiContext + "/loan/userInfo/update_cert_upload",
        updateDrivingNumber: apiContext + "/loan/userInfo/update_driving_number",
        addDrivingLicense: apiContext + "/loan/userInfo/add_driving_License",
	}


};

// 权限管理接口
var authManageApiUrl = {

	//用户查询
	searchUser: apiContext + "/auth/user/search",
	//添加用户
	addUser: apiContext + "/auth/user/add",
	//修改用户
	editUser: apiContext + "/auth/user/edit",
	//获取用户
	getUser: apiContext + "/auth/user/get",
	//删除用户
	deleteUser: apiContext + "/auth/user/delete",
	//获取角色下拉列表
	getAllRole: apiContext + "/auth/role/getAll",

	//角色查询
	searchRole: apiContext + "/auth/role/search",
	//添加角色
	addRole: apiContext + "/auth/role/add",
	//修改角色
	editRole: apiContext + "/auth/role/edit",
	//获取角色
	getRole: apiContext + "/auth/role/get",
	//删除角色
	deleteRole: apiContext + "/auth/role/delete",
	//获取角色授权树
	getRoleAuthorize: apiContext + "/auth/role/authorizeTree",
	//角色授权
	roleAuthorize: apiContext + "/auth/role/authorize",

	//资源查询
	searchResource: apiContext + "/auth/resource/search",
	//添加资源
	addResource: apiContext + "/auth/resource/add",
	//修改资源
	editResource: apiContext + "/auth/resource/edit",
	//获取资源
	getResource: apiContext + "/auth/resource/get",
	//删除资源
	deleteResource: apiContext + "/auth/resource/delete",
	//获取资源树
	getResourceTree: apiContext + "/auth/resource/tree"

};

/** 用户接口*/
var userApi = {
	// 卡券活动
	coupon: {
		// 查询红包活动
		searchCashCouponList: apiContext + "/coupon/cash/search",
		// 新增红包活动
		addCashCoupon: apiContext + "/coupon/cash/add",
		// 编辑红包活动
		editCashCoupon: apiContext + "/coupon/cash/edit",
		// 获取红包活动，get接口
		getCashCouponById: apiContext + "/coupon/cash/get/",
		// 删除红包活动，get接口
		deleteCashCouponById: apiContext + "/coupon/cash/delete/",
		// 下线红包活动，get接口
		offlineCashCouponById: apiContext + "/coupon/cash/offline/",
		// 上线红包活动，get接口
		onlineCashCouponById: apiContext + "/coupon/cash/online/",

		// 查询加息券活动
		searchInterestCouponList: apiContext + "/coupon/interest/search",
		// 新增加息券活动
		addInterestCoupon: apiContext + "/coupon/interest/add",
		// 编辑加息券活动
		editInterestCoupon: apiContext + "/coupon/interest/edit",
		// 获取加息券活动，get接口
		getInterestCouponById: apiContext + "/coupon/interest/get/",
		// 删除加息券活动，get接口
		deleteInterestCouponById: apiContext + "/coupon/interest/delete/",
		// 下线加息券活动，get接口
		offlineInterestCouponById: apiContext + "/coupon/interest/offline/",
		// 上线加息券活动，get接口
		onlineInterestCouponById: apiContext + "/coupon/interest/online/"
	},
	// 用户卡券
	userCoupon:{
		// 查询用户红包列表
		cashList: apiContext + "/user/coupon/list/cash/search",
		// 查询用户加息券列表
		interestList: apiContext + "/user/coupon/list/interest/search",
		// 获得用户红包详情 get接口
		getCash: apiContext + "/user/coupon/list/cash/get/",
		// 获得用户加息券详情 get接口
		getInterest: apiContext + "/user/coupon/list/interest/get/",
		// 动态查询红包发放总金额
		cashAmount: apiContext + "/user/coupon/list/cash/amount",
		// 手动发放红包
		grantCash: apiContext + "/user/coupon/list/cash/grant",
		// 手动发放加息券
		grantInterest: apiContext + "/user/coupon/list/interest/grant"
	}
};

/** 注册用户接口*/
var userManagerApi = {
    getUserInfoByLoginAccount: apiContext + "/userManage/getUserInfoByLoginAccount",
	getUserDepositInfo: apiContext + "/userManage/getUserDepositInfo",
    getUserInfoById: apiContext + "/userManage/getUserInfoById",

    searchPersonalUser: apiContext + "/userManage/personal/search",
    searchEnterpriseUser: apiContext + "/userManage/enterprise/search",
	searchNewRegisterUser: apiContext + "/userManage/new/register/search",
	searchFrozenUser: apiContext + "/userManage/frozen/search",
    getUserDetail: apiContext + "/userManage/detail",
    freezeUser: apiContext + "/userManage/freeze",
    unfreezeUser: apiContext + "/userManage/unfreeze",
	loginLog: apiContext + "/userManage/user/login/log/queryList",
	smsRecord: apiContext + "/userManage/sms/queryList"
};


/** 资产信贷管理接口 */
var assetsApi = {
    searchMerchant: apiContext + "/assets/merchant/search",
    getOnlineMerchantList: apiContext + "/assets/merchant/getOnlineList",
    addMerchant: apiContext + "/assets/merchant/add",
    getMerchant: apiContext + "/assets/merchant/get",
    editMerchant: apiContext + "/assets/merchant/edit",
    updateMerchantStatus: apiContext + "/assets/merchant/updateStatus",
    setMerchantWithdrawExamineFlag: apiContext + "/assets/merchant/setWithdrawExamineFlag",
	setMerchantWithdrawFlag: apiContext + "/assets/merchant/setWithdrawFlag",

    searchProduct: apiContext + "/assets/product/search",
    addProduct: apiContext + "/assets/product/add",
    getProduct: apiContext + "/assets/product/get",
    editProduct: apiContext + "/assets/product/edit",
    updateProductStatus: apiContext + "/assets/product/updateStatus",

    getProductItems: apiContext + "/assets/product/getItems",
    addProductItem: apiContext + "/assets/product/addItem",
    getProductItem: apiContext + "/assets/product/getItem",
    editProductItem: apiContext + "/assets/product/editItem",
    updateProductItemStatus: apiContext + "/assets/product/updateItemStatus",

    searchCredit: apiContext + "/assets/credit/search",
    addCredit: apiContext + "/assets/credit/add",
    getCredit: apiContext + "/assets/credit/get",
	revisionCredit: apiContext + "/assets/credit/revisionCredit",
    editCredit: apiContext + "/assets/credit/edit",
    updateCreditStatus: apiContext + "/assets/credit/updateStatus",

	// 贷后管接口
	postInfo : {
    	// 获取用户信息
    	userInfo : apiContext + "/assets/user/info/queryList",

		// 添加用户贷后管
		add : apiContext + "/assets/loan/post/info/add",

		// 修改用户贷后管
		edit : apiContext + "/assets/loan/post/info/edit",

		// 获得用户贷后管 (get)
		get : apiContext + "/assets/loan/post/info/"
	}
};

//业务配置api
var bizConfigAPI = {
	bizIdTemplate: {
		search: apiContext + "/config/bizIdTemplate/search",
        add: apiContext + "/config/bizIdTemplate/add",
        get: apiContext + "/config/bizIdTemplate/get",
        edit: apiContext + "/config/bizIdTemplate/edit",
        delete: apiContext + "/config/bizIdTemplate/delete"

	},

    holiday: {
        search: apiContext + "/config/holiday/search",
        add: apiContext + "/config/holiday/add",
        get: apiContext + "/config/holiday/get",
        edit: apiContext + "/config/holiday/edit",
        delete: apiContext + "/config/holiday/delete"

    },

    productType: {
        list: apiContext + "/config/productType/list",
        add: apiContext + "/config/productType/add",
        get: apiContext + "/config/productType/get",
        edit: apiContext + "/config/productType/edit",
        delete: apiContext + "/config/productType/delete"

    }
};

// 转让
var transferApi = {
	// 转让规则
	rule: {
		// 查询所有规则
		search: apiContext + "/transfer/rule/search",
		// 创建并上线新规则
		create: apiContext + "/transfer/rule/create",
		// 更新规则
		edit: apiContext + "/transfer/rule/edit",
		// 删除已下线规则，get接口
		delete: apiContext + "/transfer/rule/delete/",
		// 根据id获取，get接口
		get: apiContext + "/transfer/rule/get/",
		// 获取在线的规则
		getOnlineRule: apiContext + "/transfer/rule/getOnlineRule"
	}
};

// 平台账户
var fuiouAccountApi = {
    // 平台账户总览
    overview: apiContext + "/platform/fuiouAccount/overview",
    // 获取富友充值跳转参数
    realname: apiContext + "/platform/fuiouAccount/realname",
    // 获取富友充值跳转参数
    recharge: apiContext + "/platform/fuiouAccount/recharge",
    // 获取富友提现跳转参数
    withdraw: apiContext + "/platform/fuiouAccount/withdraw",
    // 平台账户转账
    transfer: apiContext + "/platform/fuiouAccount/transfer"

};

// 富友api
var fuiouApi = {
    // 富友上下文
    context: apiContext + "/fuiou/context",

    // 富友回调结果
    result: apiContext + "/fuiou/result"

};

//运营报告api
var operationReportApi = {
    generate: apiContext + "/business/operationReport/generate"
    , getOperationReportDetail: apiContext + "/business/operationReport/getOperationReportDetail"
    , queryOperationReportList: apiContext + "/business/operationReport/queryOperationReportList"
};

//报表api
var reportApi = {
	//获取报表列表
	list: apiContext + "/business/report/queryList"

	//修改状态
	, updateStatus: apiContext + "/business/report/manage/updateStatus"

	//添加报表
	, add: apiContext + "/business/report/manage/add"

	//获取报表详情 (get)
	, get: apiContext + "/business/report/search/"

	//修改报表
	, modify: apiContext + "/business/report/manage/edit"

	// 报表详情
	, detail: apiContext + "/business/report/detail/"

	// 报表详情数据查询和下载
	, dataTable: {
		userClassifyDetail: {
			search: apiContext + "/business/report/user/userClassifyDetail/search",
			download: apiContext + "/business/report/user/userClassifyDetail/download"
		},
		userTransactionDetail: {
			search: apiContext + "/business/report/user/userTransactionDetail/search",
			download: apiContext + "/business/report/user/userTransactionDetail/download"
		}
        , rechargeStatistics: {
            search: apiContext + "/business/report/user/rechargeStatistics/search",
            download: apiContext + "/business/report/user/rechargeStatistics/download"
        }
		, investDetail: {
			search: apiContext + "/business/report/invest/investDetail/search",
			download: apiContext + "/business/report/invest/investDetail/download"
		}
		, userInvestStockAmt: {
			search: apiContext + "/business/report/invest/userInvestStockAmt/search",
			download: apiContext + "/business/report/invest/userInvestStockAmt/download"
		}
		, userInvestRangeAmt: {
			search: apiContext + "/business/report/invest/userInvestForRange/search",
			download: apiContext + "/business/report/invest/userInvestForRange/download"
		}
		, loanCredit: {
			search: apiContext + "/business/report/loan/loanCredit/search",
			download: apiContext + "/business/report/loan/loanCredit/download"
		}
		, loanApply: {
            search: apiContext + "/business/report/loan/loanApply/search",
            download: apiContext + "/business/report/loan/loanApply/download"
		}
		, merchantProduct: {
            search: apiContext + "/business/report/loan/merchantProduct/search",
            download: apiContext + "/business/report/loan/merchantProduct/download"
		}
	}
	, repayManager: {
		investRepay: {
			search: apiContext + "/repayManager/investRepay/search",
			download: apiContext + "/repayManager/investRepay/download"
		}
		, merchantRepay: {
			search: apiContext + "/repayManager/merchantRepay/search"
		}
		, loanRepay: {
			search: apiContext + "/repayManager/loanRepay/search",
			download: apiContext + "/repayManager/loanRepay/download"
		}
	}


};

var specialApi = {
	applyCompensatory: apiContext + "/business/special/apply/compensatory/",
	setCertCardExpireTime: apiContext + "/business/special/loanUserInfo/expire/",
    merchantDestroyProcessData: apiContext + "/business/special/merchantDestroyProcessData",
    modifyLoginAccount: apiContext + "/business/special/modifyLoginAccount",
    modifyUserInfo: apiContext + "/business/special/modifyUserInfo"
};


// 存管交易api
var depositApi = {
    //转账失败列表
    exchangeFailedList: apiContext + "/deposit/transaction/failed/list/exchange",

    //还款失败列表
    repayFailedList: apiContext + "/deposit/transaction/failed/list/repay",

    //解冻失败列表
    unfreezeFailedList: apiContext + "/deposit/transaction/failed/list/unfreeze",

    //发放卡包失败列表
    grantCouponFailedList: apiContext + "/deposit/transaction/failed/list/grantCoupon",


    //转账失败重试
    retryExchange: apiContext + "/deposit/transaction/failed/retryExchange",

    //还款失败重试
    retryRepay: apiContext + "/deposit/transaction/failed/retryRepay",

    //解冻失败重试
    retryUnfreeze: apiContext + "/deposit/transaction/failed/retryUnfreeze",

    //发放卡包失败重试
    retryGrantCoupon: apiContext + "/deposit/transaction/failed/retryGrantCoupon",

};