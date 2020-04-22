/**
 * 初始化layui表单验证扩展包
 * @param layform
 */
var initLayuiValidataExtends = function (layform) {
	/**
	 * layui预设以下验证规则
	 *
	 * required（必填项）
	 * phone（手机号）
	 * email（邮箱）
	 * url（网址）
	 * number（数字）
	 * date（日期）
	 * identity（身份证）
	 */

	/**
	 * 以下为自定义验证规则
	 */
	layform.verify({
		password: [/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*_]+$)[a-zA-Z\d!@#$%^&*_]{8,20}$/,'密码必须是8-20位且为数字、字母、字符至少2种以上组合']
		, equalTo: function (value, item) {
			var equalTo = $(item).attr('equalTo');
			if ($('#' + equalTo).val() != value) {
				return '两次输入不相同';
			}
		}
		, mobile: function (value) {
			if (StringUtil.isEmpty(value)) {
				return '请输入有效的手机号码';
			} else {
				var rex = /^1[0-9]{10}$/;
				if (!rex.test(value)) {
					return '请输入有效的手机号码';
				}
			}
		}
		, amount: function (value) {
			if (StringUtil.isEmpty(value)) {
				return '请输入有效的金额';
			} else {
				var rex = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
				if (!rex.test(value)) {
					return '请输入有效的金额';
				}
			}
		}
		, minlength: function (value, item) {
			var minlength = $(item).attr('minlength');
			if (value.length < minlength) {
				return '最少要输入' + minlength + '个字符';
			}
		}
		, maxlength: function (value, item) {
			var maxlength = $(item).attr('maxlength');
			if (value.length > maxlength) {
				return '最多可以输入' + maxlength + '个字符';
			}
		}
		, max: function (value, item) {
			var max = $(item).attr('max');
			if (Number(value) > Number(max)) {
				return '请输入不大于' + max + '的数值';
			}
		}
		, min: function (value, item) {
			var min = $(item).attr('min');
			if (Number(value) < Number(min)) {
				return '请输入不小于' + min + '的数值';
			}
		}
		, captcha: function (value) {
			if (value.length != 4) {
				return '图形验证码为4个字符';
			}
		}
		, smsCode: [/^\d{6}$/, '短信验证码为6个字符的数字']
		, passWord: [/^\d{6}$/, '定向融资密码为6个字符的数字']
		, contact: function (value, item) {
			if (StringUtil.isEmpty(value)) {
				return '请在富文本编辑框内编辑内容';
			}
		}, beforeTime: function (value, item) {
			var start = $(item).attr('startTime');
			if (value < start) {
				return '开始日期不能早于结束日期';
			}
		}, feeRate: function (source) {
            var regex = /^\d+(?:\.\d{1,2})?$/;
            if(!regex.test(source)){
                return '请输入不小于0的整数或1-2位小数的数';
			}
        }

	});
};
