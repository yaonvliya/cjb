var demandDetailForm = $("#demandDetailForm");
var loanerUserId;
var uploadSize, uploadIndex;
var isMultiSelection = true;
var isClick = true;
var replaceElm;
$(document).ready(function () {
	var publishDemandTable = LayTableUtil.render({
		elem: '#publishDemand'
		, cols: [[
			{field: 'userLoginName', title: '借款用户手机号', width: 130}
			, {field: 'userRealName', title: '借款用户姓名',  width: 130, totalRowText: '合计(元)：'}
			, {field: 'loanApplyAmount', title: '借款金额(元)', align: 'right', width: 140, templet: function (d) {
					return MoneyUtil.formatMoney(d.loanApplyAmount.amount)}, totalRow: true}
			, {field: 'loanTermValue', title: '借款期限', width: 100, templet: function (d) {
					return d.loanTermValue + d.loanTermUnit.message}}
			, {field: 'merchantUserName', title: '所属商户'}
			, {field: 'productName', title: '产品名称', width: 140}
			, {field: 'loanInterestRate', title: '年化利率', width: 100, templet: function (d) {
					return NumberUtil.transfPercentage(d.loanInterestRate)}}
			, {field: 'loanPurpose', title: '借款用途'}
			, {field: 'loanApplyTime', title: '借款申请时间', width: 180, templet: function (d) {
					return DateUtils.longToDateString(d.loanApplyTime)}}
			, {field: 'loanStatus', title: '当前借款状态', width: 120, templet: function (d) {
					return d.loanStatus.message}}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#publishDemandOperation', width: 120}
		]]
		, url: loanApiUrl.loanApply.list
		, where: {"loanStatus": "wait_publish"}
		, page: true
		// , totalRow: true
		, id: 'publishDemand'
	});

	//监听工具条
	laytable.on('tool(publishDemand)', function (obj) {
		var data = obj.data;
		if (obj.event === 'launch') {
			openRightWin('publishDemandDiv');
			$('#publishDemandDemandDetail').load('finance/demand/view');
			loanFormDataForPublishDemand2DemandDetail(data);
			layform.render(null, 'demandDetailForm');
		}
	});

	$('#reloadPublishDemand').click(function () {
		LayTableUtil.reload(publishDemandTable, 'publishDemandSearchForm');
	});

	// SearchForm绑定回车事件
	$("#publishDemandSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadPublishDemand').click();
		}
	});

	//监听提交
	layform.on('submit(demandDetailFormSubmit)', function () {
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
				closeRightWin('publishDemandDiv');
				closePublishDemandModelFrame();
				LayTableUtil.reload(publishDemandTable, 'publishDemandSearchForm');
			});
		} else if (result.code == "40404" || result.code == "40405") {
			CookieUtil.clearAllCookie();
			window.location.href = $_GLOBAL.basePath() + '/login';
		} else {
			layer.msg(result.message);
		}
		return false;
	});

	$('.mask').click(function () {
		closePublishDemandModelFrame();
	});

	$('#publishDemandToLaunchBtn').click(function () {
		var result = AjaxUtil.ajaxGet(financeApiUrl.demand.checkLoaner + loanerUserId);
		if (result && result.data) {
			submitUrl = financeApiUrl.demand.publish;
			$('#demandDetailFormSubmitBtn').click();
		} else {
			layer.msg(result.message);
		}
	});

	$('#publishDemandToSaveDraftBtn').click(function () {
		submitUrl = financeApiUrl.demand.saveToDraft;
		$('#demandDetailFormSubmitBtn').click();
	});

	$('#publishDemandLoanFailBtn').click(function () {
		layer.confirm('确认驳回?', {icon: 3, title:'提示'}, function(index){
			var result = AjaxUtil.ajaxGetWithLoading(loanApiUrl.loanApply.reject + demandDetailForm.find('[name="loanApplyId"]').val());
			if (result) {
				layer.msg("已驳回", {time: 500}, function () {
					closePublishDemandModelFrame();
					LayTableUtil.reload(publishDemandTable, 'publishDemandSearchForm');
				});
			}
			layer.close(index);
		});
	});

	$('.loanApplyLaunchTipInfo').on('mouseenter', function () {
		this.index = layer.tips('该借款申请需要缴纳前置服务费。', this, {
			time: -1
			, maxWidth: 180
		});
	}).on('mouseleave', function () {
		layer.close(this.index);
	});

	$(document).on('click', '#publishDemandUpdateLoanApplyInfo', function () {
		LayTableUtil.reload(publishDemandTable, 'publishDemandSearchForm');
		var date = {"applyId": $(this).attr("data-applyId"),
					"loanPurpose":demandDetailForm.find('input[name="loanPurpose"]').val()};
		var result = AjaxUtil.ajaxPost(loanApiUrl.loanApply.modify, JSON.stringify(date));
		if(result){
			layer.msg("修改成功");
		}
	});

	$(document).on('click', '#publishDemandUploadBillImg', function () {
		if(isClick) {
			isClick = false;
			//事件
			isMultiSelection = false;
			$("#imitateBtn").val("").attr("data-key","").click();
			//定时器
			setTimeout(function() {
				isClick = true;
			}, 1000);//一秒内不能重复点击
		}
	});

	$(document).on('click', '.replace-pic', function (eve) {
		if(isClick) {
			isClick = false;
			//事件
			isMultiSelection = true;
			replaceElm = $(this).prev();
			eve.stopPropagation();
			$("#imitateBtn").val("").val($(this).attr("data-id")).attr("data-key","").attr("data-key",$(this).attr("data-key")).click();
			//定时器
			setTimeout(function() {
				isClick = true;
			}, 1000);//一秒内不能重复点击
		}
	});

	var uploader = new plupload.Uploader({
		runtimes: 'html5,flash,silverlight,html4',
		browse_button: "imitateBtn",
		multi_selection: true,
		flash_swf_url: '../../plugins/plupload-2.1.2/js/Moxie.swf',
		silverlight_xap_url: '../../plugins/plupload-2.1.2/js/Moxie.xap',
		filters: {
			mime_types: [ //只允许上传图片和zip文件
				{title: "Image files", extensions: "jpg,jpeg,png"},
			],
			max_file_size: '10M', //最大只能上传400kb的文件
			prevent_duplicates: false //不允许选取重复文件
		},
		url: 'https://oss.aliyuncs.com',

		init: {
			PostInit: function () {

			},

			FilesAdded: function (up, files) {
				uploadSize = files.length;
				uploadIndex = 0;
				$.each(files, function (i, file) {
					PluploadUtil.set_upload_param(up, "loan_apply", file, "bill", loanerUserId, $("#imitateBtn").val());
				});
			},

			BeforeUpload: function (up, file) {

			},

			UploadProgress: function (up, file) {

			},

			FileUploaded: function (up, file, info) {
				if(isMultiSelection){
					var result = AjaxUtil.ajaxPost(commonApiUrl.getCredentialsUploadFileURL, JSON.stringify({'key': $("#imitateBtn").attr("data-key")}));
					replaceElm.attr("src", result.data);
				} else {
					uploadIndex++;
					$("#billImg").find("span").html("");
					if (info.status == 200) {
						var message = file.name;
						if(up.settings.multi_selection) {
							message = ($("#billImgUrl").val() ? $("#billImgUrl").val() + ";" : $("#billImgUrl").val()) + file.name;
						}
						$("#billImgUrl").val(message);

						PluploadUtil.previewImg("billImg", file, up.settings.multi_selection);
					} else {
						layer.msg(info.response);
					}

					if(uploadSize == uploadIndex){
						layer.confirm('确认上传?', {
							btn: ['确认','取消'] //按钮
						}, function(){
							var date = {"applyId": demandDetailForm.find('[name="loanApplyId"]').val(),
								"billImgUrl":$("#billImgUrl").val()};
							var result = AjaxUtil.ajaxPost(loanApiUrl.loanApply.modify, JSON.stringify(date));
							if(result){
								LayTableUtil.reload(publishDemandTable, 'publishDemandSearchForm');
								layer.msg("上传修改成功");
							}
						}, function(){
							$("#billImg").find("span").html("该笔借款申请没有上传账单或发票。" +
								"<button class='layui-btn layui-btn-warm layui-btn-sm' id='publishDemandUploadBillImg' type='button'>上传</button>");
							$("#billImgList").html("")
							$("#billImgUrl").val("")
						});
					}
				}
			},

			Error: function (up, err) {
				errorHandler(err);
			}
		}
	});

	uploader.init();

});

function loanFormDataForPublishDemand2DemandDetail(data) {
	var publishDemandBillImg = $("#billImg");

	loanerUserId = data.userId;
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = demandDetailForm.find(selector);
		elt.text("" + v);
	});

	demandDetailForm.find('[name="loanPurpose"]').replaceWith(
		"<input class='layui-input' name='loanPurpose' value='" + data.loanPurpose + "'>");
	demandDetailForm.find('[name="loanPurpose"]').parent().after(
		"<button class='layui-btn layui-btn-warm layui-btn-sm' id='publishDemandUpdateLoanApplyInfo' type='button' data-applyId='" + data.applyId + "'>确定修改</button>");


	demandDetailForm.find('[name="loanApplyAmount"]').text(MoneyUtil.formatMoney(data.loanApplyAmount.amount));
	demandDetailForm.find('[name="loanInterestRate"]').text(NumberUtil.transfPercentage(data.loanInterestRate));
	demandDetailForm.find('[name="loanTerm"]').text(data.loanTermValue + data.loanTermUnit.message);
	demandDetailForm.find('[name="repayMethod"]').text(data.repayMethod.message);
	demandDetailForm.find('[name="loanApplyTime"]').text(DateUtils.longToDateString(data.loanApplyTime));
	demandDetailForm.find('[name="loanApplyId"]').val(data.applyId);
	demandDetailForm.find('[name="certNo"]').val(data.certNo);

	if(data.billImgUrl){
		publishDemandBillImg.find("span").html("");
		$.each(data.billImgUrl, function (index, item) {
			publishDemandBillImg.append('<div class="w120 fl m5 ta-c pr">' +
				'<img class="w120 h120 cr-pr" src="' + item + '" alt="账单/发票">' +
				'<span class="replace-pic" data-key="' + item.substring(item.indexOf(".com")+5,item.indexOf("?Expires=")) + '" ' +
				'data-id="' + item.substring(item.indexOf(".com")+5,item.indexOf("?Expires=")) + '">替换</span>' +
				'</div>');
		});
		new Viewer(document.querySelector('#publishDemandDiv'));
	}

	var loanUserResult = AjaxUtil.ajaxPost(loanApiUrl.loanUserInfo.get, JSON.stringify({"userId": data.userId}));
	if (loanUserResult) {
		$('#demandDetailLoanerInfoText').val(loanUserResult.data.loanUserIntroduce);
	}
}

function closePublishDemandModelFrame() {
	$('#publishDemandDemandDetail').html("");
	$("#imitateBtn").val("").attr("data-key","");
	closeRightWin('publishDemandDiv');
}