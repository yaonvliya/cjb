var zNodes =[
	{id:1, pId:0, demoName:"[core] 基本功能 演示", open:false},
	{id:101, pId:1, demoName:"最简单的树 --  标准 JSON 数据"},
	{id:102, pId:1, demoName:"最简单的树 --  简单 JSON 数据"},
	{id:103, pId:1, demoName:"不显示 连接线"},
	{id:104, pId:1, demoName:"不显示 节点 图标"},
	{id:105, pId:1, demoName:"自定义图标 --  icon 属性"},
	{id:106, pId:1, demoName:"自定义图标 --  iconSkin 属性"},
	{id:107, pId:1, demoName:"自定义字体"},
	{id:115, pId:1, demoName:"超链接演示"},
	{id:108, pId:1, demoName:"异步加载 节点数据"},
	{id:109, pId:1, demoName:"用 zTree 方法 异步加载 节点数据"},
	{id:110, pId:1, demoName:"用 zTree 方法 更新 节点数据"},
	{id:111, pId:1, demoName:"单击 节点 控制"},
	{id:112, pId:1, demoName:"展开 / 折叠 父节点 控制"},
	{id:113, pId:1, demoName:"根据 参数 查找 节点"},
	{id:114, pId:1, demoName:"其他 鼠标 事件监听"},

	{id:2, pId:0, demoName:"[excheck] 复/单选框功能 演示", open:false},
	{id:201, pId:2, demoName:"Checkbox 勾选操作"},
	{id:206, pId:2, demoName:"Checkbox nocheck 演示"},
	{id:207, pId:2, demoName:"Checkbox chkDisabled 演示"},
	{id:208, pId:2, demoName:"Checkbox halfCheck 演示"},

	{id:3, pId:0, demoName:"[exedit] 编辑功能 演示", open:false},
	{id:301, pId:3, demoName:"拖拽 节点 基本控制"},
	{id:302, pId:3, demoName:"拖拽 节点 高级控制"},
	{id:303, pId:3, demoName:"用 zTree 方法 移动 / 复制 节点"},

	{id:4, pId:0, demoName:"大数据量 演示", open:false},
	{id:401, pId:4, demoName:"一次性加载大数据量"},
	{id:402, pId:4, demoName:"分批异步加载大数据量"},
	{id:403, pId:4, demoName:"分批异步加载大数据量"},

	{id:5, pId:0, demoName:"组合功能 演示", open:false},
	{id:501, pId:5, demoName:"冻结根节点"},
	{id:502, pId:5, demoName:"单击展开/折叠节点"},
	{id:503, pId:5, demoName:"保持展开单一路径"},

	{id:6, pId:0, demoName:"其他扩展功能 演示", open:false},
	{id:601, pId:6, demoName:"隐藏普通节点"},
	{id:602, pId:6, demoName:"配合 checkbox 的隐藏"},
	{id:603, pId:6, demoName:"配合 radio 的隐藏"}
];



var setting = {
	view : {
		selectedMulti : false,
		autoCancelSelected : false
	},
	check : {
		enable : true
	},
	data : {
		key : {
			name : "demoName" //就是返回数据中要显示的字段名称（默认为name）
		},
		simpleData: {
			enable:true,
			idKey: "id",// 节点id
			pIdKey: "pId",// 父节点id
			rootPId: ""//根节点id
		}
	},
	callback : {
		beforeDrag : function (treeId, treeNodes) {return false;}// 禁止拖拽
	}
};

$(document).ready(function(){
	// 注意，ztree初始化必须写在单独的js文件中，在vm中不支持这种写法
	$.fn.zTree.init($("#demoTree"), setting, zNodes);
});



function showChecked() {
	var treeObj = $.fn.zTree.getZTreeObj("demoTree");
	// 这个地方要注意，如果被选中的节点含有子节点，子节点会在children字段中一起被返回（不管子节点有没有选中）
	// 提交数据到后台时，不用管子节点，所有数据只需要遍历nodes中的一级节点
	var nodes = treeObj.getCheckedNodes(true);
	console.info(nodes);


	layer.open({
		title: '选中的内容'
		,content: JSON.stringify(nodes)//直接显示json会包含子节点，实际操作时不用管子节点
	});
}