var submitUrl = null;
var formData = null;
var itemSubmitUrl = null;
var itemFormData = null;
var currMerchantId = sessionStorage.getItem("currMerchantId");
var productTableIns;
var productItemTableIns;
var currProductId;
var productSearchForm = $("#productSearchForm");
var productForm = $("#productForm");
var productItemForm = $("#productItemForm");
$(document).ready(function () {
	layform.render(null, "productSearchForm");
    layform.render(null, "productForm");

    productTableIns = LayTableUtil.render({
		elem: '#product'
		, height: '220'
		, cellMinWidth: 120
		, cols: [[ //表头
            {field: 'productTypeName', event: 'click', title: '产品类型'}
			, {field: 'productName', event: 'click', title: '产品名称'}
            , {field: 'productDesc', event: 'click', title: '产品描述'}
            , {field: 'productStatus', event: 'click', title: '状态', templet: '#productStatusTpl', fixed: 'right'}
			, {fixed: 'right', title: '操作', align: 'center', toolbar: '#productBar', width: 250}
		]]
		, page: false
		, id: 'productTable'
		, done: function(res, curr, count){
		    // 有产品的情况默认选中第一条产品，并且加载子产品
		    if(curr > 0){
				currProductId = res.data[0].productId;
				reloadProductItemTable();
				$('#product').next().find("table").eq(1).find("tr").eq(0).addClass("layui-table-click");
            }
        }
	});

    productItemTableIns = LayTableUtil.render({
        elem: '#productItem'
        , height: '220'
        , cellMinWidth: 120
        , cols: [[ //表头
			{field: 'productItemName', title: '子产品名称', width:200},
            {field: 'loanTermUnit', title: '借款期限', width: 100, templet: function(d){
                return d.loanTermValue + d.loanTermUnit.message;
            }}
            , {field: 'repayMethod', title: '还款方式', width: 140, templet: function(d){
                return d.repayMethod.message;
            }}
            , {field: 'loanInterestRate', title: '借款年化利率', templet: function(d){
                return NumberUtil.mul(d.loanInterestRate, 100) + "%";
            }}
            , {field: 'serviceFeeRate', title: '服务费率', width: 100, templet: function(d){
                return NumberUtil.mul(d.serviceFeeRate, 100) + "%";
            }}
            , {field: 'serviceFeeType', title: '服务费收取方式', width: 160, templet: function(d){
                if(d.serviceFeeType == "pre"){
                    return "前置收取";
                } else if(d.serviceFeeType == "post"){
                    return "后置收取";
                } else {
                    return "";
                }

            }}
            , {field: 'productItemDesc', title: '产品描述'}
            , {field: 'productItemStatus', title: '状态', templet: '#productItemStatusTpl', fixed: 'right'}
            , {fixed: 'right', title: '操作', align: 'center', toolbar: '#productItemBar', width: 160}

        ]]
        , page: false
        , id: 'productItemTable'

    });

    layform.on('switch(currProductStatus)', function(obj){
        var data;
        if(obj.elem.checked){
            data = {"productId": this.value, "productStatus": "online"};
        }else {
            data = {"productId": this.value, "productStatus": "offline"};
        }
        var result = AjaxUtil.ajaxPost(assetsApi.updateProductStatus, JSON.stringify(data));
        if (result) {
            layer.tips(obj.elem.checked ? "启用成功" : "停用成功", obj.othis);
        } else {
            obj.elem.checked = obj.elem.checked ? false : true ;
            layform.render('checkbox');
        }
    });

    layform.on('switch(currProductItemStatus)', function(obj){
        var data;
        if(obj.elem.checked){
            data = {"productItemId": this.value, "productItemStatus": "online"};
        }else {
            data = {"productItemId": this.value, "productItemStatus": "offline"};
        }
        var result = AjaxUtil.ajaxPost(assetsApi.updateProductItemStatus, JSON.stringify(data));
        if (result) {
            layer.tips(obj.elem.checked ? "启用成功" : "停用成功", obj.othis);
        } else {
            obj.elem.checked = obj.elem.checked ? false : true ;
            layform.render('checkbox');
        }
    });

    if(currMerchantId != null){
        productSearchForm.find('[name="merchantId"]').val(sessionStorage.getItem("currMerchantId"));
        productSearchForm.find('[name="merchantName"]').text(sessionStorage.getItem("currMerchantName"));

        reloadProductTable();
    }

    //监听工具条
	laytable.on('tool(product)', function (obj) {
		var data = obj.data;
		if (obj.event === 'edit') {
			// TODO Test
			productForm[0].reset();
			productForm.find('[name="productName"]').prop("readonly", "readonly");

			submitUrl = assetsApi.editProduct;

            LayerUtil.open("编辑产品", $("#productForm"), "420px", null, 'productForm', null, true);

            loadProductType();

			var result = AjaxUtil.ajaxPost(assetsApi.getProduct, JSON.stringify({"productId": data.productId}));
			if (result) {
				formData = result.data;
				loadSimpleFormData("#productForm", result.data);
                productForm.find('[name="productStatus"]').val(formData.productStatus.code);
                if(formData.productStatus.code == "online"){
                    $("#productStatusChk").prop("checked", true)
				}else {
                    $("#productStatusChk").prop("checked", false)
				}

			}
		} else if (obj.event === 'online') {
			layer.confirm('确认启用该产品', function (index) {
				var result = AjaxUtil.ajaxPost(assetsApi.updateProductStatus, JSON.stringify({"productId": data.productId, "productCreditStatus": "online"}));
				if (result) {
					layer.close(index);
					layer.msg("启用产品成功");
					reloadProductTable();
				}
			});
		} else if (obj.event === 'offline') {
            layer.confirm('确认停用该产品', function (index) {
                var result = AjaxUtil.ajaxPost(assetsApi.updateProductStatus, JSON.stringify({"productId": data.productId, "productCreditStatus": "offline"}));
                if (result) {
                    layer.close(index);
                    layer.msg("停用产品成功");
                    reloadProductTable();
                }
            });
        } else if (obj.event === 'addItem') {
            currProductId = data.productId;

            $("#productItemForm")[0].reset();
            productItemForm.find('[name="repayMethod"] option[value="month_interest_maturity_principal"]').removeAttr("disabled");

            itemFormData = null;
            itemSubmitUrl = assetsApi.addProductItem;

            openRightWin("productItemDetailWin");
            $("#productItemDetailWinTitle").text("添加子产品");
        } else if (obj.event === 'click') {
            currProductId = data.productId;
            reloadProductItemTable()
        }

	});

    laytable.on('tool(productItem)', function (obj) {
        var data = obj.data;
        if (obj.event === 'editItem') {
			productItemForm[0].reset();
			productItemForm.find('[name="productItemName"]').prop("readonly", "readonly");

            itemSubmitUrl = assetsApi.editProductItem;

            openRightWin("productItemDetailWin");
            $("#productItemDetailWinTitle").text("编辑子产品");

            var result = AjaxUtil.ajaxPost(assetsApi.getProductItem, JSON.stringify({"productItemId": data.productItemId}));
            if (result) {
                itemFormData = result.data;
                loadProductItemFormData();
            }
        }
    });

    layform.on('select(productTypeId)', function (data) {
        $('#productTypeName').val($(this).text());
    });

	layform.on('submit(productSubmit)', function (data) {
		productForm.find('[name="productName"]').removeAttr("disabled");
	    var postData = data.field;
        postData.merchantId = currMerchantId;
		var result = AjaxUtil.ajaxPost(submitUrl, JSON.stringify(postData));
		if (result) {
			LayerUtil.close();
			layer.msg("操作成功");
            reloadProductTable();
		}
		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
	});

    layform.on('submit(productItemSubmit)', function (data) {
        var postData = data.field;
        var loanTermValue = null;
        if(postData.loanTermUnit == "D"){
            loanTermValue = $("#loanTermDayValue").val();
        }else if(postData.loanTermUnit == "M"){
            loanTermValue = $("#loanTermMonthValue").val();
        }
        if(loanTermValue == null || loanTermValue == ""){
            layer.msg("借款期限不能为空");
            return false;
        }

        postData.loanTermValue = loanTermValue;
        postData.merchantId = currMerchantId;
        postData.productId = currProductId;
        postData.loanInterestRate = NumberUtil.div(postData.loanInterestRate, 100);
        postData.serviceFeeRate = NumberUtil.div(postData.serviceFeeRate, 100);

        var result = AjaxUtil.ajaxPost(itemSubmitUrl, JSON.stringify(postData));
        if (result) {
            LayerUtil.close();
            layer.msg("操作成功");
            closeRightWin("productItemDetailWin");
            reloadProductItemTable();
        }
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });

    layform.on('switch(productStatus)', function(data){
        if(data.elem.checked){
            productForm.find('[name="productStatus"]').val("online");
        }else {
            productForm.find('[name="productStatus"]').val("offline");
        }
    });

    layform.on('switch(productItemStatus)', function(data){
        if(data.elem.checked){
            productItemForm.find('[name="productItemStatus"]').val("online");
        }else {
            productItemForm.find('[name="productItemStatus"]').val("offline");
        }
    });

    layform.on('radio(loanTermUnit)', function(data){
        if(data.value == "D"){
            $("#loanTermMonthValue").val("");
            $("#loanTermDayValue").focus();
            productItemForm.find('[name="repayMethod"] option[value="month_interest_maturity_principal"]').attr("disabled", true);
        }else if(data.value == "M"){
            $("#loanTermDayValue").val("");
            $("#loanTermMonthValue").focus();
            productItemForm.find('[name="repayMethod"] option[value="month_interest_maturity_principal"]').removeAttr("disabled");
        }
        layform.render(null, "productItemForm");
    });

    $('#productAdd').on('click', function () {
        if(currMerchantId == null){
            layer.msg("请选择所属商户");
            return;
        }
        $("#productForm")[0].reset();
        productForm.find('[name="merchantId"]').val(currMerchantId);

		formData = null;
		submitUrl = assetsApi.addProduct;

        LayerUtil.open("新增产品", $("#productForm"), "420px")

        loadProductType();
	});

	$('#productSearch').on('click', function () {
        reloadProductTable();
	});

    $('#productReset').on('click', function () {
        if (formData == null) {
            $("#productForm")[0].reset();
        } else {
            loadSimpleFormData("#productForm", formData);
            productForm.find('[name="productStatus"]').val(formData.productStatus.code);
            if(formData.productStatus.code == "online"){
                $("#productStatusChk").prop("checked", true);
            }else {
                $("#productStatusChk").prop("checked", false);
            }
            layform.render(null, "productForm");
        }
    });

    $('#productItemReset').on('click', function () {
        if (itemFormData == null) {
            productItemForm[0].reset();
        } else {
            productItemForm[0].reset();
            loadProductItemFormData();
        }
    });

    // 点击遮罩层关闭窗口
    $('.mask').click(function () {
		closeRightModelForProduct();
    });

    $('#productItemSubmit').click(function () {
        $('#productItemSubmitBtn').click();
    });

});

function reloadProductTable(){
    layer.load(1, {shade: [0.3, '#333']});
    productTableIns.reload({
        url: assetsApi.searchProduct
        , where: DataDeal.formToJsonObj($("#productSearchForm"))
        , page: false
    });
    layer.closeAll('loading');
}

function reloadProductItemTable(){
    layer.load(1, {shade: [0.3, '#333']});
    productItemTableIns.reload({
        url: assetsApi.getProductItems
        , where: {
            productId : currProductId
        }
        , page: false
    });
    layer.closeAll('loading');
}

function loadSimpleFormData(elem, data) {
	layui.each(data, function (k, v) {
		var selector = '[name="' + k + '"]';
		var elt = $(elem).find(selector);
		elt.val(v);
	});
}

function loadProductItemFormData(){

    $("#productItemForm input[name='loanTermUnit'][value='" + itemFormData.loanTermUnit.code + "']").prop("checked", true);

    if(itemFormData.loanTermUnit.code == "D"){
        $("#loanTermDayValue").val(itemFormData.loanTermValue);
        productItemForm.find('[name="repayMethod"] option[value="month_interest_maturity_principal"]').attr("disabled", true);
    }else if(itemFormData.loanTermUnit.code == "M"){
        $("#loanTermMonthValue").val(itemFormData.loanTermValue);
        productItemForm.find('[name="repayMethod"] option[value="month_interest_maturity_principal"]').removeAttr("disabled");
    }
    productItemForm.find('[name="repayMethod"]').val(itemFormData.repayMethod.code);
    productItemForm.find('[name="productItemStatus"]').val(itemFormData.productItemStatus.code);
    if(itemFormData.productItemStatus.code == "online"){
        $("#productItemStatusChk").attr("checked", "checked")
    }else {
        $("#productItemStatusChk").removeAttr("checked")
    }

    productItemForm.find('[name="loanInterestRate"]').val(NumberUtil.mul(itemFormData.loanInterestRate, 100));
    productItemForm.find('[name="serviceFeeRate"]').val(NumberUtil.mul(itemFormData.serviceFeeRate, 100));

    productItemForm.find('[name="productItemDesc"]').val(itemFormData.productItemDesc);

    productItemForm.find('[name="productItemId"]').val(itemFormData.productItemId);
	productItemForm.find('[name="productItemName"]').val(itemFormData.productItemName);

    productItemForm.find('[name="serviceFeeType"]').val(itemFormData.serviceFeeType);

    layform.render(null, "productItemForm");
}

function closeRightModelForProduct() {
	productItemForm.find('[name="productItemName"]').removeAttr("readonly", "readonly");
	closeRightWin('productItemDetailWin');
}

function loadProductType(){
    var result = AjaxUtil.ajaxPost(bizConfigAPI.productType.list);
    if(result){
        var productTypeList = result.data;
        SelectUtil.setSelectOpts(productTypeList, "productTypeId", "productTypeId", "productTypeName");
    }
}