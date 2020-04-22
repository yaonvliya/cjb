var formData = null;
var loanUserInfoForm = $("#loanUserInfoForm");
var exportData;

$(document).ready(function () {
	layform.render(null, "loanUserInfoSearchForm");
	layform.render(null, "loanUserInfoForm");

	var loanUserInfoTableIns = LayTableUtil.render({
		elem: '#loanUserInfo'
		, cols: [[{field: 'userName', title: '用户姓名', width: 120}
			, {field: 'showLoginAccount', title: '用户登录账号', width: 140}
            , {field: 'certNo', title: '用户/法人身份证号', width: 180}
			, {field: 'userType', title: '用户类型', width: 120, templet: function (d) {	return d.userType.message;}}
            , {field: 'legalName', title: '法人姓名', width: 120}
            , {field: 'rowUpdateTime', title: '提交时间', width: 180, templet: function (d) {return DateUtils.longToDateString(d.rowUpdateTime);}}
            , {field: 'auditStatus', title: '审核状态', width: 150, templet: function (d) {return d.auditStatus.text;}}
            , {field: 'auditor', title: '审核人', width: 140}
            , {field: 'reviewer', title: '复核人', width: 140}
            , {field: 'rejectReason', title: '驳回原因', width: 140}
            , {field: 'certCardExpireTime', title: '身份证到期时间', width: 140, templet: function (d) {return DateUtils.longToDateStringYMD(d.certCardExpireTime);}}
            , {field: 'businessLicenseExpireTime', title: '企业营业执照到期时间', width: 180, templet: function (d) {return DateUtils.longToDateStringYMD(d.businessLicenseExpireTime);}}
            , {fixed: 'right', title: '操作', align: 'center', width: 140, toolbar: '#loanUserInfoBar'}]]
		, url: loanApiUrl.loanUserInfo.search
		, where: {"auditStatus": "auditing"}
		, page: true
		, id: 'loanUserInfoTable'
        // , toolbar: true
        // , defaultToolbar: ['filter', 'exports']
        , title: '借款资料审核_' + DateUtils.longToDateStringYMD(new Date())
        , done: function (res, curr, count) {
            exportData = JSON.parse(JSON.stringify(res.rows));
            layui.each(exportData, function (i, data) {
                data.showLoginAccount = "\t" + data.showLoginAccount;
                data.certNo = "\t" + data.certNo;
                data.certCardExpireTime = "\t" + DateUtils.longToDateString(data.certCardExpireTime);
                data.userType = data.userType.message;
                data.businessLicenseExpireTime = "\t" + DateUtils.longToDateString(data.businessLicenseExpireTime);
                data.auditStatus = data.auditStatus.text;
                data.rowUpdateTime = "\t" + DateUtils.longToDateString(data.rowUpdateTime);
            });
        }
	});

	//监听工具条
	laytable.on('tool(loanUserInfo)', function (obj) {
		var data = obj.data;
		loanUserInfoForm[0].reset();
		if (obj.event === 'detail') {
			$("#loanUserInfoFormButton").hide();
		} else if (obj.event === 'audit') {
			$("#loanUserInfoFormButton").show();
		}
		var result = AjaxUtil.ajaxPost(loanApiUrl.loanUserInfo.get, JSON.stringify({"userId": data.userId}));
		if (result) {
			formData = result.data;
			loadLoanUserInfo();
		}
		openRightWin('loanUserInfoModel');
	});

	layform.on('submit(loanUserInfoAuditRejectSubmit)', function (data) {
		var auditData = {
			"userId": formData.userId,
			"auditStatus": "reject",
			"rejectReason": data.field.rejectReason
		};
		var result = AjaxUtil.ajaxPost(loanApiUrl.loanUserInfo.audit, JSON.stringify(auditData));
		if (result) {
			LayerUtil.close();
			closeRightWin('loanUserInfoModel');
			layer.msg("操作成功");
			LayTableUtil.refresh(loanUserInfoTableIns, "loanUserInfoSearchForm");
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});


	$('#loanUserInfoSearch').on('click', function () {
		LayTableUtil.reload(loanUserInfoTableIns, "loanUserInfoSearchForm");
	});

	// SearchForm绑定回车事件
	$("#loanUserInfoSearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#loanUserInfoSearch').click();
		}
	});

	layform.on('submit(loanUserInfoAuditPass)', function (data) {
		var params = DataDeal.formToJsonObj($('#loanUserInfoForm'));
		var drivingLicenseExpireTime = [];
		var drivingNumber = [];
		$.each(params, function (k, v) {
			if(StringUtil.isContains(k, "drivingLicenseExpireTime")){
				drivingLicenseExpireTime.push(v);
			}
		});
		$.each(params, function (k, v) {
			if(StringUtil.isContains(k, "drivingNumber")){
				drivingNumber.push(v);
			}
		});
		params["userId"] = formData.userId;
		params["auditStatus"] = "pass";
		params["drivingLicenseExpireTime"] = JSON.stringify(drivingLicenseExpireTime);
		params["drivingNumber"] = JSON.stringify(drivingNumber);

		var result = AjaxUtil.ajaxPost(loanApiUrl.loanUserInfo.audit, JSON.stringify(params));
		if (result) {
			LayerUtil.close();
			closeRightWin('loanUserInfoModel');
			layer.msg("操作成功");
			LayTableUtil.refresh(loanUserInfoTableIns, "loanUserInfoSearchForm");
		}
	});

	$('#loanUserInfoAuditReject').on('click', function () {
		$("#loanUserInfoAuditRejectForm")[0].reset();
		LayerUtil.open("审核驳回", $("#loanUserInfoAuditRejectForm"), "400px")
	});

	$('.mask').click(function () {
		closeRightWin('loanUserInfoModel');
	});


    $('#loanUserInfoSearchForm [id="downloadLoanUserInfoDetail"]').click(function () {
        laytable.exportFile(loanUserInfoTableIns.config.id, exportData, 'xls');
    });

    $('#loanUserInfoForm').on('click', '.addDriving', function () {
        $('#luiDrivingLicenseImg').click();
    });

    $('#loanUserInfoForm').on('click', '.modifyNum', function () {
        var params = DataDeal.formToJsonObj($('#loanUserInfoForm'));
        var data = {};
        var drivingNumber = [];
        $.each(params, function (k, v) {
            if(StringUtil.isContains(k, "drivingNumber")){
                drivingNumber.push(v);
            }
        });
        data["userId"] = formData.userId;
        data["drivingNumber"] = JSON.stringify(drivingNumber);
        var result = AjaxUtil.ajaxPost(loanApiUrl.loanUserInfo.updateDrivingNumber, JSON.stringify(data));
        if (result){
            layer.msg("操作成功");
            LayTableUtil.refresh(loanUserInfoTableIns, "loanUserInfoSearchForm");
        }
    });

    // 上传图片
    var uploader = new plupload.Uploader({
        runtimes: 'html5,flash,silverlight,html4',
        browse_button: "luiDrivingLicenseImg",
        multi_selection: false,
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
                var userId = formData.userId;
                layui.each(files, function (i, file) {
                    PluploadUtil.set_upload_param(up, "loan", file, 'drivingLicense', userId);
                });
            },
            BeforeUpload: function (up, file) {
            },
            UploadProgress: function (up, file) {
            },
            FileUploaded: function (up, file, info) {
                if (info.status == 200) {
                    openLayer("<form class='ta-c' id='addDrivingLicenseForm'><img id='drivingLicense' class='w120 m20'>" +
                        "<input type='hidden' value='" + file.name + "' name='drivingLicense'>" +
                        "<input type='hidden' value='" + formData.userId + "' name='userId'>" +
                        "<div class='layui-form-item'>" +
                        "        <div class='layui-block'>" +
                        "            <label class='layui-form-label w120'>行驶证过期时间：</label>" +
                        "            <div class='layui-input-block'>" +
                        "                <input class='expireTime layui-input w200' lay-verify='required' name='drivingLicenseExpireTime'>" +
                        "            </div>" +
                        "        </div>" +
                        "    </div>" +
                        "<div class='layui-form-item'>" +
                        "        <div class='layui-block'>" +
                        "            <label class='layui-form-label w120'>车牌号：</label>" +
                        "            <div class='layui-input-block'>" +
                        "                <input class='layui-input w200' lay-verify='required' name='drivingNumber'>" +
                        "            </div>" +
                        "        </div>" +
                        "</div></form>");
                    PluploadUtil.previewImg("drivingLicense", file, up.settings.multi_selection);
                    layer.close()
                } else {
                    layer.msg(info.response);
                }
                new Viewer(document.querySelector('#drivingLicense'));
                lay('.expireTime').each(function () {
                    laydate.render({
                        elem: this
                        , trigger: 'click'
                    });
                });
            },
            Error: function (up, err) {
                if (err.code == plupload.FILE_EXTENSION_ERROR) {
                    layer.msg("图片仅支持JPG、PNG格式");
                } else if (err.code == plupload.FILE_SIZE_ERROR) {
                    layer.msg("图片大小不能超过10M");
                } else {
                    layer.msg(err.message);
                }
            }
        }
    });

    uploader.init();

});

function loadLoanUserInfo() {
	var $userImg = $("#userLoanInfoImg");
	var $transportContract = $("#auditTransportContract");
	var $driverLicenseImg = $("#auditDriverLicenseImg");
	var $drivingLicenseImgUrl = $("#drivingLicenseImgUrl");
	var $legalPersonCreditReporting = $("#auditLegalPersonCreditReporting");
	var $enterpriseCreditReporting = $("#auditEnterpriseCreditReporting");
	var $roadTransportLicense = $("#auditRoadTransportLicense");
	loanUserInfoForm.find('[name="auditStatus"]').text(formData.auditStatus.text);
	loanUserInfoForm.find('[name="showLoginAccount"]').text(formData.showLoginAccount);
	loanUserInfoForm.find('[name="userName"]').text(formData.userName);
    loanUserInfoForm.find('[name="certNo"]').text(formData.certNo);
    loanUserInfoForm.find('[name="legalName"]').text(formData.legalName);

	$userImg.empty();
	$transportContract.empty();
	$driverLicenseImg.empty().parent().hide();
	$legalPersonCreditReporting.empty().parent().hide();
	$enterpriseCreditReporting.empty().parent().hide();
	$roadTransportLicense.empty().parent().hide();
	$drivingLicenseImgUrl.empty().parent().hide();
	$userImg.append('<div class="w120 fl m5 ta-c">' +
		'<img class="w120 h120 cr-pr" src="' + formData.certCardFrontImgUrl + '" alt="身份证正面照">' +
		'<div>身份证正面照</div>' +
		'<div><input class="expireTime w120" name="certCardExpireTime" lay-verify="required" value="' + DateUtils.longToDateStringYMD(formData.certCardExpireTime) + '"></div>' +
		'</div><div class="w120 fl m5 ta-c">' +
		'<img class="w120 h120 cr-pr" src="' + formData.certCardBackImgUrl + '" alt="身份证反面照">' +
		'<div>身份证反面照</div>' +
		'</div>');

	if (formData.userType.code == "GR") {
		loanUserInfoForm.find('[class="businessInfo"]').hide();
		$userImg.append('<div class="w120 fl m5 ta-c">' +
			'<img class="w120 h120 cr-pr" src="' + formData.certCardWithSelfImgUrl + '" alt="本人与身份证合照">' +
			'<div>本人与身份证合照</div>' +
			'</div>');
		$.each(formData.driverLicenseImgUrl, function (index, item) {
			$driverLicenseImg.parent().show();
			var message = index == 0 ? "<div><input class='expireTime w120' name='driverLicenseExpireTime' lay-verify='required' value='" + DateUtils.longToDateStringYMD(formData.driverLicenseExpireTime) + "'></div>" : "";
			$driverLicenseImg.append('<div class="w120 fl m5 ta-c">' +
				'<img class="w120 h120 cr-pr" src="' + item + '" alt="驾驶证/挂靠协议">' +
				'<div>驾驶证/挂靠协议</div>' + message +
				'</div>');
		});
		$.each(formData.drivingLicenseImgUrl, function (index, item) {
			$drivingLicenseImgUrl.parent().show();
			var data = formData.drivingLicenseExpireTime ? JSON.parse(formData.drivingLicenseExpireTime)[index] + "" : "";
			var drivingNumber = formData.drivingNumber ? JSON.parse(formData.drivingNumber)[index] + "" : "";
			var message = "<div><input class='expireTime w120' lay-verify='required' name='drivingLicenseExpireTime" + index + "' value='" + data + "'>" +
				"<input class='w120' lay-verify='required' name='drivingNumber" + index + "' value='" + drivingNumber + "' placeholder='车牌号'></div>";
			$drivingLicenseImgUrl.append('<div class="w120 fl m5 ta-c">' +
				'<img class="w120 h120 cr-pr" src="' + item + '" alt="行驶证">' +
				'<div>行驶证</div>' + message +
				'</div>');
		});
		if (formData.auditStatus.code == 'pass'){
            $drivingLicenseImgUrl.append('<div class="pt145"><a class="layui-btn layui-btn-xs addDriving" ><i class="layui-icon">&#xe681;</i>添加行驶证</a><a class="layui-btn layui-btn-xs modifyNum" ><i class="layui-icon">&#xe642;</i>更新车牌号</a></div>')
        }

	} else {
		loanUserInfoForm.find('[class="businessInfo"]').show();
		$legalPersonCreditReporting.parent().show();
		$enterpriseCreditReporting.parent().show();
		$roadTransportLicense.parent().show();
		loanUserInfoForm.find('[name="operateScope"]').text(formData.operateScope);
		loanUserInfoForm.find('[name="operateStatus"]').text(formData.operateStatus);


		$userImg.append('<div class="w120 fl m5 ta-c">' +
			'<img class="w120 h120 cr-pr" src="' + formData.businessLicenseImgUrl + '" alt="企业营业执照">' +
			'<div>企业营业执照</div>' +
			'<div><input class="expireTime w120" name="businessLicenseExpireTime" lay-verify="required" value="' + DateUtils.longToDateStringYMD(formData.businessLicenseExpireTime) + '"></div>' +
			'</div>');

		$.each(formData.roadTransportLicenseImgUrl, function (index, item) {
			var message = index == 0 ? "<div><input class='expireTime w120' name='roadTransportLicenseExpireTime' lay-verify='required' value='" + DateUtils.longToDateStringYMD(formData.roadTransportLicenseExpireTime) + "'></div>" : "";
			$roadTransportLicense.append('<div class="w120 fl m5 ta-c">' +
				'<img class="w120 h120 cr-pr" src="' + item + '" alt="道路运输经营许可证">' +
				'<div>道路运输经营许可证</div>' + message +
				'</div>');
		});
		$.each(formData.legalPersonCreditReportingImgUrl, function (index, item) {
			var message = index == 0 ? "<div><input class='expireTime w120' name='legalPersonCreditReportingExpireTime' lay-verify='required' value='" + DateUtils.longToDateStringYMD(formData.legalPersonCreditReportingExpireTime) + "'></div>\n" : "";
			$legalPersonCreditReporting.append('<div class="w120 fl m5 ta-c">' +
				'<img class="w120 h120 cr-pr" src="' + item + '" alt="法人征信报告">' +
				'<div>法人征信报告</div>' + message +
				'</div>');
		});

		$.each(formData.enterpriseCreditReportingImgUrl, function (index, item) {
			var message = index == 0 ? "<div><input class='expireTime w120' name='enterpriseCreditReportingExpireTime' lay-verify='required' value='" + DateUtils.longToDateStringYMD(formData.enterpriseCreditReportingExpireTime) + "'></div>" : "";
			$enterpriseCreditReporting.append('<div class="w120 fl m5 ta-c">' +
				'<img class="w120 h120 cr-pr" src="' + item + '" alt="企业征信报告">' +
				'<div>企业征信报告</div>' + message +
				'</div>');
		});
	}

	$.each(formData.transportContractImgUrl, function (index, item) {
		var message = index == 0 ? "<div><input class='expireTime w120' name='transportContractExpireTime' lay-verify='required' value='" + DateUtils.longToDateStringYMD(formData.transportContractExpireTime) + "'></div>" : "";
		$transportContract.append('<div class="w120 fl m5 ta-c">' +
			'<img class="w120 h120 cr-pr" src="' + item + '" alt="运输合同">' +
			'<div>运输合同</div>' + message +
			'</div>');
	});

	lay('.expireTime').each(function () {
		laydate.render({
			elem: this
			, trigger: 'click'
		});
	});


	new Viewer(document.querySelector('#loanUserInfoModel'));

}

function openLayer(content) {
    layer.open({
        type: 1,
        offset: 'auto',
        title: false, //不显示标题栏
        closeBtn: false,
        area: '380px;',
        shade: 0.8,
        id: 'LAY_layuipro', //设定一个id，防止重复弹出
        btn: ['确定上传', '取消'],
        yes: function(index, layero){
            var flag = true;
            var data = DataDeal.formToJsonObj($('#addDrivingLicenseForm'))
            layui.each(data, function (k, v) {
                if (StringUtil.isEmpty(v)) {
                    layer.msg("请输入信息。");
                    $('#addDrivingLicenseForm').find('[name='+ k +']').focus();
                    flag = false;
                }
            })
            if (flag) {
                var result = AjaxUtil.ajaxPost(loanApiUrl.loanUserInfo.addDrivingLicense, JSON.stringify(data));
                if (result) {
                    layer.msg("操作成功", {time: 500}, function () {
                        layer.close(index);
                        LayTableUtil.refresh(loanUserInfoTableIns, "loanUserInfoSearchForm");
                    });
                }
            }
        },
        btnAlign: 'c',
        moveType: 1, //拖拽模式，0或者1
        content: content,
        success: function (layero) {
            layer.close();
        }
    });
}