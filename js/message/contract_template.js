var contractTemplateForm = $('#addContractTemplateForm');
var formData = null;
$(document).ready(function () {
    var submitUrl = null;
    var index = null;

	layform.render(null, 'searchContractTemplateForm');

	var contracTemplateTable = LayTableUtil.render({
		elem: '#contractTemplate'
		, cols: [[ //表头
            {field: 'productTypeName', title: '产品类型名称'}
			, {field: 'contractTemplateName', title: '合同模版名称'}
			, {field: 'contractFileName', title: '合同文件名称'}
			, {field: 'contractTypeName', title: '合同类型名称'}
			, {field: 'contractTemplateStatus', title: '状态', fixed: 'right', width:120, templet: '#contractTemplateStatusTpl'}
			, {fixed: 'right', align: 'center', toolbar: '#contractTemplateOperation', width: 390}
		]]
		, url: messageCenterApiUrl.contractTemplate.list
		, page: true
		, id: 'contractTemplateTable'
	});

	//监听工具条
	laytable.on('tool(contractTemplate)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			openLayerForContract('查看合同模板', 'detail', data);
		} else if (obj.event === 'del') {
			layer.confirm('是否删除合同模版名称为"' + data.contractTemplateName + '"的这行吗？', function(index){
				var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.contractTemplate.delete + data.contractTemplateId);
				if(result){
					layer.close(index);
					layer.msg("刪除成功");
					closeContracTemplateModelFrame();
					LayTableUtil.reload(contracTemplateTable, 'searchContractTemplateForm');
				}
			});
		} else if (obj.event === 'edit') {
			openLayerForContract('编辑合同模板', 'edit', data);

		} else if (obj.event === 'setSignPosition') {
            index = LayerUtil.open("签章坐标设置", $('#setSignPositionForm'), '700px', '', 'setSignPositionForm', null, true);

            $('#firstDiv').show();
            $('#secondDiv').show();
            $('#thirdDiv').show();
            $('#fourthDiv').show();
            layform.render(null, 'setSignPositionForm');

            loadContractSignPosition(data.contractTemplateId)
        } else if (obj.event === 'preview') {
			var data = {
				key: data.previewUrl
			};
            var res = AjaxUtil.ajaxPostWithLoading(messageCenterApiUrl.contractTemplate.previewUrl, JSON.stringify(data));
            if(res){
				window.open(res.data);
			}

        }
	});

	layform.on('switch(contractTemplateStatusTpl)', function (data) {
		if (data.elem.checked) {
			var param = {"contractTemplateId": data.value, "contractTemplateStatus": 'online'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.contractTemplate.status, JSON.stringify(param));
			if (res) {
				layer.tips("已上线", data.othis);
			} else {
				data.elem.checked = false;
				layform.render('checkbox');
			}
		} else {
			var param = {"contractTemplateId": data.value, "contractTemplateStatus": 'offline'};
			var res = AjaxUtil.ajaxPost(messageCenterApiUrl.contractTemplate.status, JSON.stringify(param));
			if (res) {
				layer.tips("已下线", data.othis);
			} else {
				data.elem.checked = true;
				layform.render('checkbox');
			}
		}
	});

	layform.on('select(contractTypeScope)', function(data){
		if(data.value){
			var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.contractType.scopeList + data.value);
			if(result) {
				var optionstring = "";
				$.each(result.data, function(i,item){
					optionstring += "<option value=\"" + item.contractTypeCode + "\" >" + item.contractTypeName + "</option>";
				});
				$("#addContractTempSelectContractType").html('<option value=""></option>' + optionstring);
				layform.render('select');
			}
		}
	});

	layform.on('select(addContractTempSelectContractType)', function (data) {
		if(data.value){
			var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.contractType.get + data.value);
			if(result) {
				var buttonString = "";
				$.each(JSON.parse(result.data.bizButtons), function(i,item){
					buttonString += '<button type="button" class="layui-btn" data-method="loadMsg" value="' + item.btnValue + '">' + item.btnText + '</button>';
				});
				$("#contractTempLoadMsg").html(buttonString);
			}

			$('#addContractTempContractTypeCode').val(data.value);
			$('#addContractTempContractTypeName').val($(this).text());
		} else {
			$('#addContractTempContractTypeCode').removeAttr('lay-verify').val('');
			$('#addContractTempContractTypeName').removeAttr('lay-verify').val('');
		}
	});

    layform.on('select(contractProductTypeId)', function (data) {
        $('#contractProductTypeName').val($(this).text());
    });

	layform.on('radio(contractTemplateStatusFilter)', function(data){
		$("#addContractTemplateStatus").val(data.value);
	});

    layform.on('checkbox(firstCheckbox)', function(obj){
    	if(checkSignRole(obj)){
            if(obj.elem.checked){
                $('#firstDiv').show();
                $('input[name="firstPagenum"]').attr('lay-verify', 'required');
                $('input[name="firstX"]').attr('lay-verify', 'required');
                $('input[name="firstY"]').attr('lay-verify', 'required');
            } else {
                $('#firstDiv').hide();
                $('input[name="firstPagenum"]').removeAttr('lay-verify').val('');
                $('input[name="firstX"]').removeAttr('lay-verify').val('');
                $('input[name="firstY"]').removeAttr('lay-verify').val('');
            }
        }
    });
    layform.on('checkbox(secondCheckbox)', function(obj){
        if(checkSignRole(obj)) {
            if (obj.elem.checked) {
                $('#secondDiv').show();
                $('input[name="secondPagenum"]').attr('lay-verify', 'required');
                $('input[name="secondX"]').attr('lay-verify', 'required');
                $('input[name="secondY"]').attr('lay-verify', 'required');
            } else {
                $('#secondDiv').hide();
                $('input[name="secondPagenum"]').removeAttr('lay-verify').val('');
                $('input[name="secondX"]').removeAttr('lay-verify').val('');
                $('input[name="secondY"]').removeAttr('lay-verify').val('');
            }
        }
    });
    layform.on('checkbox(thirdCheckbox)', function(obj){
        if(checkSignRole(obj)) {
            if (obj.elem.checked) {
                $('#thirdDiv').show();
                $('input[name="thirdPagenum"]').attr('lay-verify', 'required');
                $('input[name="thirdX"]').attr('lay-verify', 'required');
                $('input[name="thirdY"]').attr('lay-verify', 'required');
            } else {
                $('#thirdDiv').hide();
                $('input[name="thirdPagenum"]').removeAttr('lay-verify').val('');
                $('input[name="thirdX"]').removeAttr('lay-verify').val('');
                $('input[name="thirdY"]').removeAttr('lay-verify').val('');
            }
        }
    });
    layform.on('checkbox(fourthCheckbox)', function(obj){
        if(checkSignRole(obj)) {
            if (obj.elem.checked) {
                $('#fourthDiv').show();
                $('input[name="fourthPagenum"]').attr('lay-verify', 'required');
                $('input[name="fourthX"]').attr('lay-verify', 'required');
                $('input[name="fourthY"]').attr('lay-verify', 'required');
            } else {
                $('#fourthDiv').hide();
                $('input[name="fourthPagenum"]').removeAttr('lay-verify').val('');
                $('input[name="fourthX"]').removeAttr('lay-verify').val('');
                $('input[name="fourthY"]').removeAttr('lay-verify').val('');
            }
        }
    });

    $('.mask').click(function () {
		closeContracTemplateModelFrame();
	});

	$('#reloadContractTemplate').click(function () {
		LayTableUtil.reload(contracTemplateTable, 'searchContractTemplateForm');
	});
	// SearchForm绑定回车事件
	$("#searchContractTemplateForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadContractTemplate').click();
		}
	});

	$('#addContractTemplateBtn').click(function(){
		openLayerForContract('新建合同模板', 'add');
	});

	$('#contractTempLoadMsg').on('click', '.layui-btn', function () {
		contractTemplateContent.pasteText($(this).val());
	});

	function openLayerForContract(title, method, data) {
		openRightWin('addContractTemplate');

        loadProductType();

		$('#addModalContractTemplateTitle').text(title);
		if (method == "add") {
			submitUrl = messageCenterApiUrl.contractTemplate.add;
			$("#contractTemplateSubmit").show();
		} else if (method == "edit") {
			submitUrl = messageCenterApiUrl.contractTemplate.modify;
			$("#contractTemplateSubmit").show();
			loadContractTemplateFormData(data);
		} else if (method == "detail") {
			loadContractTemplateFormData(data);
			$("#contractTemplateSubmit").hide();
			contractTemplateForm.find("input,select").prop("disabled", "disabled");
		}

		layform.render(null, 'addContractTemplateForm');
	}

	//监听提交
	layform.on('submit(addContractTemplateSubmit)', function (data) {
		var formData = new FormData();
		$.each(data.field, function (i, item) {
			formData.append(i, item);
		});
		var result = AjaxUtil.ajaxFormData(submitUrl, formData);
		if (result.code == "20000") {
			layer.msg('操作成功', {
				time: 1000 //1秒关闭
			}, function () {
				closeContracTemplateModelFrame();
				LayTableUtil.reload(contracTemplateTable, 'searchContractTemplateForm');
			});
		} else if(result.code == "40404" || result.code == "40405"){
			CookieUtil.clearAllCookie();
			window.location.href = $_GLOBAL.basePath() + '/login';
		} else {
			layer.msg(result.message);
		}
		return false;
	});

    //监听签章坐标设置提交
    layform.on('submit(setSignPositionFormSubmit)', function (data) {
    	var signaturePositionFirst = null;
        var signaturePositionSecond = null;
        var signaturePositionThird = null;
        var signaturePositionFourth = null;
        
        var formData = data.field;
        if($('input[name="signRole"]').eq(0).prop('checked')){
            signaturePositionFirst = [{pagenum: formData.firstPagenum, x: formData.firstX, y: formData.firstY}];
		}
        if($('input[name="signRole"]').eq(1).prop('checked')){
            signaturePositionSecond = [{pagenum: formData.secondPagenum, x: formData.secondX, y: formData.secondY}];
        }
        if($('input[name="signRole"]').eq(2).prop('checked')){
            signaturePositionThird = [{pagenum: formData.thirdPagenum, x: formData.thirdX, y: formData.thirdY}];
        }
        if($('input[name="signRole"]').eq(3).prop('checked')){
            signaturePositionFourth = [{pagenum: formData.fourthPagenum, x: formData.fourthX, y: formData.fourthY}];
        }
		var data = {
            contractTemplateId: formData.contractTemplateId,
            signaturePositionFirst: signaturePositionFirst,
            signaturePositionSecond: signaturePositionSecond,
            signaturePositionThird: signaturePositionThird,
            signaturePositionFourth: signaturePositionFourth,
		};
        var result = AjaxUtil.ajaxPostWithLoading(messageCenterApiUrl.contractTemplate.setSignPosition, JSON.stringify(data));
        if (result) {
            LayerUtil.close(index);
            layer.msg("操作成功");
        }
        return false;
    });

	$('#contractTemplateSubmit').click(function () {
		$('#contractTemplateSubmitBtn').click();
	});

	var contractTemplateContent = $('#contractTemplateContent').xheditor({
		tools: 'full',
		skin: 'default',
		height:300,
		upMultiple: true,
		upImgUrl: "#",
		upImgExt: "jpg,jpeg,gif,bmp,png",
		onUpload: insertUploadContractTemplate,
		html5Upload: false
	});

	function loadContractTemplateFormData(data) {
		var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.contractTemplate.get + data.contractTemplateId);
		if (result) {
			layui.each(result.data, function (k, v) {
				var selector = '[name="' + k + '"]';
				var elt = contractTemplateForm.find(selector);
				elt.val("" + v);
			});

			if (result.data.contractTemplateStatus == 'online') {
				contractTemplateForm.find("[name='contractTemplateStatusTemp'][value='online']").prop("checked", true);
			} else {
				contractTemplateForm.find("[name='contractTemplateStatusTemp'][value='offline']").prop("checked", true);
			}
		}
	}
});

//xhEditor编辑器图片上传回调函数
function insertUploadContractTemplate(msg) {
	var _msg = msg.toString();
	var _picture_name = _msg.substring(_msg.lastIndexOf("/") + 1);
	var _picture_path = SubstringContractTemplate(_msg);
	var _str = "<input type='checkbox' name='_pictures' value='" + _picture_path + "' checked='checked' onclick='return false'/><label>" + _picture_name + "</label><br/>";
	$("#xh_editor").append(_msg);
	$("#uploadList").append(_str);
}
//处理服务器返回到回调函数的字符串内容,格式是JSON的数据格式.
function SubstringContractTemplate(s) {
	return s.substring(s.substring(0, s.lastIndexOf("/")).lastIndexOf("/"), s.length);
}

function closeContracTemplateModelFrame() {
	$("#contractTemplateSubmit").show();
	contractTemplateForm[0].reset();
	$("#contractTempLoadMsg").html("");
	contractTemplateForm.find("input,select").removeAttr("disabled");
	closeRightWin('addContractTemplate');
}

function loadContractSignPosition(contractTemplateId){
    var result = AjaxUtil.ajaxGetWithLoading(messageCenterApiUrl.contractTemplate.get + contractTemplateId);
    if(result){
    	var data = result.data;
        formData = data;
        setContractSignPosition();
	}
}

function setContractSignPosition(){
	var data = formData;
    $('#contractTemplateId').val(data.contractTemplateId);

    if(!(data.signaturePositionFirst == null && data.signaturePositionSecond == null &&
            data.signaturePositionThird == null && data.signaturePositionFourth == null)){
        if(data.signaturePositionFirst != null){
            $('input[name="firstPagenum"]').val(data.signaturePositionFirst[0].pagenum);
            $('input[name="firstX"]').val(data.signaturePositionFirst[0].x);
            $('input[name="firstY"]').val(data.signaturePositionFirst[0].y);
            $('#firstDiv').show();
        } else {
            $('input[name="signRole"]').eq(0).prop('checked', false);
            $('#firstDiv').hide();
        }

        if(data.signaturePositionSecond != null) {
            $('input[name="secondPagenum"]').val(data.signaturePositionSecond[0].pagenum);
            $('input[name="secondX"]').val(data.signaturePositionSecond[0].x);
            $('input[name="secondY"]').val(data.signaturePositionSecond[0].y);
            $('#secondDiv').show();
        } else {
            $('input[name="signRole"]').eq(1).prop('checked', false);
            $('#secondDiv').hide();
        }

        if(data.signaturePositionThird != null) {
            $('input[name="thirdPagenum"]').val(data.signaturePositionThird[0].pagenum);
            $('input[name="thirdX"]').val(data.signaturePositionThird[0].x);
            $('input[name="thirdY"]').val(data.signaturePositionThird[0].y);
            $('#thirdDiv').show();
        } else {
            $('input[name="signRole"]').eq(2).prop('checked', false);
            $('input[name="thirdPagenum"]').removeAttr('lay-verify').val('');
            $('input[name="thirdX"]').removeAttr('lay-verify').val('');
            $('input[name="thirdY"]').removeAttr('lay-verify').val('');
            $('#thirdDiv').hide();
        }
        if(data.signaturePositionFourth != null) {
            $('input[name="fourthPagenum"]').val(data.signaturePositionFourth[0].pagenum);
            $('input[name="fourthX"]').val(data.signaturePositionFourth[0].x);
            $('input[name="fourthY"]').val(data.signaturePositionFourth[0].y);
            $('#fourthDiv').show();
        } else {
            $('input[name="signRole"]').eq(3).prop('checked', false);
            $('input[name="fourthPagenum"]').removeAttr('lay-verify').val('');
            $('input[name="fourthX"]').removeAttr('lay-verify').val('');
            $('input[name="fourthY"]').removeAttr('lay-verify').val('');
            $('#fourthDiv').hide();
        }
    } else {
        $('#firstDiv').show();
        $('#secondDiv').show();
        $('#thirdDiv').show();
        $('#fourthDiv').show();
	}
    layform.render('checkbox', 'setSignPositionForm');
}


function resetSignPositionForm(){
    $('#setSignPositionForm')[0].reset();
    setContractSignPosition();
}

function checkSignRole(obj){
    if($('input[name="signRole"]:checked').length<2){
        layer.msg("签章至少要有两方及以上");
        obj.elem.checked = obj.elem.checked ? false : true ;
        layform.render('checkbox', 'setSignPositionForm');
        return false;
    }
    return true;
}

function loadProductType() {
    var result = AjaxUtil.ajaxGetWithLoading(bizConfigAPI.productType.list);
    if(result) {
        SelectUtil.setSelectOpts(result.data, "contractProductTypeId", "productTypeId", "productTypeName");
    }
}