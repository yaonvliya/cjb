var refreshUrl = 'home'; // 刷新页面功能缓存的url地址(初始化为后台首页)

var tabAction,//tab处理
	layuiTabId = 'content-main';//tab容器id

var layer, layelement, laytable, laypage, layform, laydate;

var uploadType = [];

$(document).ready(function () {
	var changePwdWin;// 修改密码窗口id

	getUserInfo();

	// 初始化左侧菜单数据
	initMenuList();

	layui.use(['layer', 'element', 'table', 'laydate', 'laypage', 'form'], function () {
		layer = layui.layer
			, layelement = layui.element
			, laytable = layui.table
			, laypage = layui.laypage
			, layform = layui.form
			, laydate = layui.laydate;

		initLayuiValidataExtends(layform);
		tabAction = {
			tabAdd: function (title, url) {
				var $_titleEles = $('#rightBoxTitle li');
				var tabListLength = $_titleEles.length;
				/*if (tabListLength >= 5 && tabListLength <= 10) {
					$('.close-all-tab-box').show();
				} else if (tabListLength > 10) {
					layer.msg("您打开的标签太多了，请先关闭一些");
					return;
				}*/
				if(tabListLength >= 5){
					$('.close-all-tab-box').show();
				}
				if(tabListLength >= 8){
					$('#rightBoxTitle li').eq(0).remove();
					$('#rightBoxContent .layui-tab-item').eq(0).remove();
				}

				// 如果url以http或www开头，则打开一个iframe窗口
				if (url.indexOf('http') == 0 || url.indexOf('www') == 0) {
					layelement.tabAdd(layuiTabId, {
						title: title
						, content: '<div class="h600"><iframe src="' + url
						+ '" height="100%" width="100%" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="auto" allowtransparency="yes"></iframe></div>'
						, id: url
					});
					tabAction.tabChange(url);
				} else {
					//新增一个Tab项
					layelement.tabAdd(layuiTabId, {
						title: title
						, content: null
						, id: url
					});
					tabAction.tabChange(url);
                    loadContent();
				}
			}
			, tabChange: function (url) {
				//切换到指定Tab项
				layelement.tabChange(layuiTabId, url);
				refreshUrl = url;
			}
		};
		// 监听选项卡切换
		layelement.on('tab(' + layuiTabId + ')', function (data) {
			layer.closeAll();
			refreshUrl = $('#rightBoxTitle').find('.layui-this').attr('lay-id');
			$('.right-win').hide();//防止右侧弹窗闪现
		});
		// 监听选项卡删除
		layelement.on('tabDelete(' + layuiTabId + ')', function (data) {
			if ($('#rightBoxTitle li').length <= 5) {
				$('.close-all-tab-box').hide();
			}
			refreshUrl = $('#rightBoxTitle').find('.layui-this').attr('lay-id');
			$('.right-win').hide();//防止右侧弹窗闪现
		});

		// 初始化加载“后台首页”
		tabAction.tabAdd("后台首页", refreshUrl);

		// 修改密码确认
		layform.on('submit(changePwdSubmit)', function (data) {
			var result = AjaxUtil.ajaxPost(indexApiUrl.modifyPwd, JSON.stringify(data.field));
			if (result) {
				LayerUtil.close(changePwdWin);
				layer.msg('密码修改成功', {
					time: 1000 //1秒关闭
				}, function () {
					// 跳转至登录页
					window.location.href = platformApi.login;
				});
			}
		});


	});

	// 绑定搜索菜单回车事件
	$("#searchMenuBtn").bind('keypress', function (event) {
		if (event.keyCode == "13") {
			var name = $(this).val();
			if (name == "") {
				layer.msg("请输入需要查找的页面名称");
				return;
			}
			var obj = $("#menuList").find("a");
			var jumpUrl = "";
			$.each(obj, function (infoIndex, info) {
				var _this = $(info).clone();
				$(_this).find('i').remove();
				var itemName = $(_this).text();
				if (itemName == name) {
					jumpUrl = $(_this).attr("data-url");
					return false;
				}
			});
			if (jumpUrl) {
				var flag = $('#rightBoxTitle li[lay-id="' + jumpUrl + '"]').text();
				if (StringUtil.isEmpty(flag)) {
					tabAction.tabAdd(name, jumpUrl);
				} else {
					tabAction.tabChange(jumpUrl);
				}
			} else {
				layer.msg("您输入的页面不存在或您没有权限访问该页面！");
			}
		}
	});

	$(".index-search-box > .float-in-input").on('click', function () {
		$("#searchMenuBtn").val('');
	});

	// 刷新容器内的页面
	$('#refreshWinBtn').click(function () {
		if (refreshUrl) {
            loadContent();
		}
	});

	// 弹出修改密码窗口
	$('#changeLoginPwdBtn').on('click', function () {
		changePwdWin = LayerUtil.open('修改登录密码', $("#changePwdForm"), '500px', null, 'changePwdForm');
	});

	$('#menuList').find("li").click(function () {
		if(!$(this).hasClass("layui-nav-itemed"))
			$('#menuList').find("li").removeClass("layui-nav-itemed");
		else
			$(this).addClass("layui-nav-itemed").siblings().removeClass("layui-nav-itemed");

	});
});


function initMenuList() {
	$.getJSON(indexApiUrl.getMenu, function (data) {
		var strHtml = ""; //存储数据的变量
		$.each(data.data, function (infoIndex, info) {
			var menuName = info.menuName;
			var menuIcon = info.menuIcon ? '<i class="iconfont ' + info.menuIcon + '"></i>' : '';
			var menuUrl = apiContext + info.menuUrl;
			var menuType = info.menuType;
			var menuRemark = info.menuRemark ? '(' + info.menuRemark + ')' : '';

			if (menuType == "menuGroup") {
				strHtml += '<li class="layui-nav-item"><a href="javascript:;">' + menuIcon + menuName + menuRemark + '</a>';
				var subMenus = info.subMenus;
				if (subMenus) {
					strHtml += '<dl class="layui-nav-child">';
					$.each(subMenus, function (infoIndex, info) {
						var menuName2 = info.menuName;
						var menuIcon2 = info.menuIcon ? '<i class="iconfont ' + info.menuIcon + '"></i>' : '';
						var menuUrl2 = apiContext + info.menuUrl;
						var menuRemark2 = info.menuRemark ? '(' + info.menuRemark + ')' : '';

						strHtml += '<dd><a href="javascript:;" data-url="' + menuUrl2 + '">' + menuIcon2 + menuName2 + menuRemark2 + '</a></dd>'
					});
					strHtml += '</dl></li>';
				} else {
					strHtml += '</li>';
				}
			} else if (menuType == "menuItem") {
				strHtml += '<li class="layui-nav-item"><a href="javascript:;" data-url="' + menuUrl +
					'">' + menuIcon + menuName + menuRemark + '</a></li>';
			}
		});
		// 向页面填充菜单数据
		$("#menuList").append(strHtml);
		// 绑定菜单点击事件
		$('#menuList a').on('click', function () {
			layer.closeAll();
			var url = $(this).attr('data-url');
			if (url) {
				var flag = $('#rightBoxTitle li[lay-id="' + url + '"]').text();
				if (StringUtil.isEmpty(flag)) {
					var temp = $(this).clone();
					$(temp).find("i").remove();
					tabAction.tabAdd($(temp).text(), url);
				} else {
					tabAction.tabChange(url);
				}
			}
		});
	});
}


// 登出操作
function logout() {
	layer.confirm('真的要退出吗？', function (index) {
		var result = AjaxUtil.ajaxGet(indexApiUrl.logout);
		if (result) {
			layer.close(index);
			CookieUtil.clearAllCookie();
			window.location.href = platformApi.login;
		}
	});
}

function closeAllTab() {
	$('#rightBoxTitle').empty();
	$('#rightBoxContent').empty();
	refreshUrl = null;
	$('.close-all-tab-box').hide();
}

/*******************************以下为通用方法，可供子页面调用**********************************************/

/** 打开右侧窗口 */
function openRightWin(winId, title) {
	$("#" + winId).removeClass('fadeOutRightBig').addClass('fadeInRight').show();
	if (title) {
		$("#" + winId).find('.right-win-title').text(title);
	}
	$('.mask').show();
}

/** 关闭右侧窗口 */
function closeRightWin(winId) {
	$("#" + winId).removeClass('fadeInRight').addClass('fadeOutRightBig');
	$('.mask').hide();
}

/** 显示更多查询条件 */
function showMoreSearch(ele, formId) {
	var showStatus = $(ele).attr('data-show');
	if (showStatus == 'off') {
		$('#' + formId + '  .more-search').show();
		$(ele).attr('data-show', 'on');
		$(ele).find('i').html('&#xe619;');
	} else {
		$('#' + formId + '  .more-search').hide();
		$(ele).attr('data-show', 'off');
		$(ele).find('i').html('&#xe61a;');
	}

}

// 设置或重置form表单
function setFormData(elem, data) {
	if (data) {
		layui.each(data, function (k, v) {
			var selector = '[name="' + k + '"]';
			var elt = $(elem).find(selector);
			elt.val(v);
		});
	} else {
		$(elem)[0].reset();
	}
}

function getUserInfo() {
	var result = AjaxUtil.ajaxGet(indexApiUrl.getUserInfo);
	if (result) {
		var userInfo = result.data;
		$("#userRealName span").text(userInfo.userName);
	}
}

function loadContent() {
    $("#rightBoxContent").children(".layui-show").load(refreshUrl, function(response,status,xhr){
        try {
            var result = eval("(" + response + ")");
            if (result.code == "40404" || result.code == "40405") {
                CookieUtil.clearAllCookie();
                window.location.href = $_GLOBAL.basePath() + '/login';
            } else if (result.code == "105190") {
                $("#rightBoxContent").children(".layui-show").load($_GLOBAL.basePath() + '/error/noPermission');
            }
        } catch (e) {
        }
    });
}