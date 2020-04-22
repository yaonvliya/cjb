var holidayForm = $("#holidayForm");
var holiday = {}, work = {};
var holidayDate, workDate;
var index = null;
var submitUrl = null;
var formData = null;

$(document).ready(function () {
    lay('.holidayYear').each(function(){
        laydate.render({
            elem: this
            ,type: 'year'
            ,format: 'yyyy'
            ,value: new Date()
        });
    });

	layform.render(null, 'holidaySearchForm');

    //自定义重要日
    var renderHoliday = function () {
        $("#holidayDates").remove();
        $("#holidayDiv").append("<div class=\"layui-inline\" id=\"holidayDates\" />");

        laydate.render({
            elem: '#holidayDates'
            ,position: 'static'
            ,mark: holiday
            ,showBottom: false
			,value: holidayDate
            , done: function (value, date) {
            	holidayDate = value;
                if(holiday[value]){
                    delete holiday[value];
                } else {
                    holiday[value] = '休';
                }

                renderHoliday();

            }
        });
    };
    var renderWork = function () {
        $("#workDates").remove();
        $("#workDiv").append("<div class=\"layui-inline\" id=\"workDates\" />");

        laydate.render({
            elem: '#workDates'
            ,position: 'static'
            ,mark: work
            ,showBottom: false
            ,value: workDate
            , done: function (value, date) {
                workDate = value;
                if(work[value]){
                    delete work[value];
                } else {
                    work[value] = '班';
                }

                renderWork();

            }
        });
    };

	var holidayTable = LayTableUtil.render({
		elem: '#holiday'
		, cols: [[ //表头
			{field: 'holidayYear', title: '法定节假日年份', width: 170}
			, {field: 'holidayName', title: '法定节假日名称'}
			, {field: 'rowAddTime', title: '创建时间', width: 180, templet: function (d) { return DateUtils.longToDateString(d.rowAddTime)}}
			, {field: 'rowUpdateTime', title: '修改时间', width: 180, templet: function (d) { return DateUtils.longToDateString(d.rowUpdateTime)}}
			, {fixed: 'right', align: 'center', toolbar: '#holidayOperation', width: 220}

		]]
		, url: bizConfigAPI.holiday.search
        , where: DataDeal.formToJsonObj($("#holidaySearchForm"))
		, page: true
		, id: 'holidayTable'
	});

	//监听工具条
	laytable.on('tool(holiday)', function (obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
            openLayerForHoliday('查看', 'detail', data);
		} else if (obj.event === 'del') {
			layer.confirm('是否删除"' + data.holidayYear + data.holidayName + '"这行吗？', function (index) {
				var param = {
					'holidayYear': data.holidayYear,
					'holidayName': data.holidayName
				};
				var result = AjaxUtil.ajaxPostWithLoading(bizConfigAPI.holiday.delete, JSON.stringify(param));
				if (result) {
					layer.close(index);
					layer.msg("刪除成功");
					LayTableUtil.reload(holidayTable, 'holidaySearchForm');
				}
			});
		} else if (obj.event === 'edit') {
            openLayerForHoliday('编辑', 'edit', data);
		}
	});


	$('#reloadHoliday').click(function () {
		LayTableUtil.reload(holidayTable, 'holidaySearchForm');
	});
	// SearchForm绑定回车事件
	$("#holidaySearchForm").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			$('#reloadHoliday').click();
		}
	});

	$('#addHolidayBtn').click(function () {
	    formData = null;
		openLayerForHoliday('新建', 'add');
	});

	function openLayerForHoliday(title, method, data) {
        holiday = {};
        work = {};
        holidayDate = null;
        workDate = null;
		if (method == "add") {
            formData == null;
			submitUrl = bizConfigAPI.holiday.add;
			$("#holidaySubmit").show();
            $("#holidayReset").show();
		} else if (method == "edit") {
			submitUrl = bizConfigAPI.holiday.edit;
			$("#holidaySubmit").show();
            $("#holidayReset").show();
            holidayForm.find('[name="holidayYear"]').prop("disabled", "disabled");
            holidayForm.find('[name="holidayName"]').prop("disabled", "disabled");

            getHoliday(data);
		} else if (method == "detail") {
            getHoliday( data);
            $("#holidaySubmit").hide();
            $("#holidayReset").hide();
            holidayForm.find("input,select").prop("disabled", "disabled");
		}
        renderHoliday();
        renderWork();
		layform.render(null, 'holidayForm');

        index = LayerUtil.open(title, holidayForm, '900px', null, 'holidayForm', null, true);
    }

	//监听提交
	layform.on('submit(holidayForm)', function (data) {
		var holidayDates = [];
        layui.each(holiday, function (k, v) {
            holidayDates.push({holidayDate: k, holidayFlag: true});
        });
        layui.each(work, function (k, v) {
            holidayDates.push({holidayDate: k, holidayFlag: false});
        });
        var submitData = {
        	holidayYear: data.field.holidayYear,
            holidayName: data.field.holidayName,
            holidayDates: holidayDates
		};
		var result = AjaxUtil.ajaxPostWithLoading(submitUrl, JSON.stringify(submitData));
		if (result) {
			layer.close(index);
			layer.msg("操作成功");
			LayTableUtil.reload(holidayTable, 'holidaySearchForm');
		}
		return false;
	});


    $('#holidayReset').on('click', function () {
        if (formData == null) {
            $("#holidayForm")[0].reset();
            holiday = {};
            work = {};
        } else {
            loadHolidayFormData();
        }
        renderHoliday();
        renderWork();
    });

    function getHoliday(data){
        var param = {
            'holidayYear': data.holidayYear,
            'holidayName': data.holidayName
        };
        var result = AjaxUtil.ajaxPostWithLoading(bizConfigAPI.holiday.get, JSON.stringify(param));
        if (result) {
            formData = result.data;
            loadHolidayFormData();
        }
    }

	function loadHolidayFormData() {
        loadSimpleFormData("#holidayForm", formData);

        holiday = {};
        work = {};
        layui.each(formData.holidayDates, function (i, obj) {
            var date = DateUtils.longToDateStringYMD(obj.holidayDate);
            if(obj.holidayFlag){
                if(JSON.stringify(holiday) == "{}"){
                    holidayDate = date;
                }
                holiday[date] = '休';
            } else {
                if(JSON.stringify(work) == "{}"){
                    workDate = date;
                }
                work[date] = '班';
            }
        });

        if(workDate == null){
            workDate = holidayDate;
        }

	}

    function loadSimpleFormData(elem, data) {
        layui.each(data, function (k, v) {
            var selector = '[name="' + k + '"]';
            var elt = $(elem).find(selector);
            elt.val(v);
        });
    }
});