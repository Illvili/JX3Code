var JX3CodeApp = angular.module('JX3CodeApp', ['angularLocalStorage', 'angularMoment']);

JX3CodeApp.controller('JX3CodeController', function ($scope, $window, storage) {
	var app_base_url = 'http://app.jx3.xoyo.com/app/jx3/zlp201404/';
	
	function jsonp(url, callback) {
		$.ajax({
			url: url,
			dataType: 'jsonp'
		}).success(callback);
	}
	
	function update_scrope() {
		if (!$scope.$$phase) $scope.$apply();
	}
	
	$scope.servers = {
		'z01': '电信一区',
		'z02': '电信二区',
		'z03': '电信三区',
		'z04': '电信四区',
		'z05': '电信五区',
		'z06': '电信六区',
		'z07': '电信七区',
		'z08': '电信八区（点卡）',
		'z11': '网通1/2区',
		'z13': '网通三区'
	};
	
	$scope.awards = {
		'127': '罗伞•舒翎',
		'51': '波斯猫跟宠',
		'40': '与子偕老',
		'94': '真橙之心',
		'81': '遗失的尊敬',
		'58': '马上有礼包',
		'124': '栖鹤流云砚',
		'125': '机关小马•玉狮子',
		'126': '鎏翊\'',
		'1001': 'iPhone5S',
		'1002': 'iPad Air',
		'1003': '玲珑密保锁',
		'1004': '包年点卡',
		'1005': '剑网3定制内存',
		'1006': '剑网3定制显卡',
		'1007': '剑网3定制显示器',
		'1008': '剑网3定制机'
	};
	
	$scope.awardLevels = {
		'127': 'info',
		'51': 'info',
		'40': 'success',
		'94': 'success',
		'81': 'info',
		'58': 'default',
		'124': 'primary',
		'125': 'primary',
		'126': 'primary',
		'1001': 'danger',
		'1002': 'danger',
		'1003': 'danger',
		'1004': 'danger',
		'1005': 'danger',
		'1006': 'danger',
		'1007': 'danger',
		'1008': 'danger'
	};
	
	$scope.awardGroup = {
		'default': { title: '粗糙', ids: ['58'] },
		'info': { title: '普通', ids: ['51', '81', '127'] },
		'success': { title: '稀有', ids: ['40', '94'] },
		'primary': { title: '限量', ids: ['124', '125', '126'] },
		'danger': { title: '传奇', ids: ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008'] }
	};
	
	$scope.awardFilters = {
		'127': 1,
		'51': 1,
		'40': 1,
		'94': 1,
		'81': 1,
		'58': 1,
		'124': 1,
		'125': 1,
		'126': 1,
		'1001': 1,
		'1002': 1,
		'1003': 1,
		'1004': 1,
		'1005': 1,
		'1006': 1,
		'1007': 1,
		'1008': 1
	};
	
	$scope.AwardFilterOn = function (awardid) {
		return $scope.awardFilters[awardid] ? 'glyphicon-ok' : '';
	};
	
	$scope.AwardFilterSwitch = function (awardid) {
		$scope.awardFilters[awardid] = !$scope.awardFilters[awardid];
	};
	
	$('#award_filter_button').click(function () {
		if (!$('#award_filter_container').hasClass('open')) {
			$('#award_filter_container').addClass('open');
			
			$('body').on('click.awardfilter', function (e) {
				if ($(e.target).parents('#award_filter_container').length) return;
				
				$('#award_filter_container').removeClass('open');
				$('body').off('click.awardfilter');
			});
			
			return false;
		} else {
			$('#award_filter_container').removeClass('open');
			$('body').off('click.awardfilter');
		}
	});
	
	$('#award_filter_menu').on('click', 'a', function () {
		return false;
	});
	
	$scope.CodeFilter = function (code) {
		return !!$scope.awardFilters[code.type];
	};
	
	$scope.predicate = '-created';
	
	storage.bind($scope, 'accounts', { defaultValue: [] });
	$scope.current_account = null;
	$scope.current_server = null;
	$scope.current_lottery = 0;
	
	$scope.weibo_left = 0;
	$scope.weibo_left_tip = 'info';
	
	storage.bind($scope, 'codes', { defaultValue: [] });
	
	$window.moment.lang('zh-cn');
	
	$('#vcode_form').bind('shown.bs.modal', function () {
		$('#vcode_input').val('').focus();
	});
	$('#vcode_input').keypress(function (e) {
		if (13 == e.keyCode) $('#vcode_button').trigger('click.vcode');
	});
	
	$scope.RefreshVCode = function () {
		$('#vcode_img').attr('src', 'http://app.jx3.xoyo.com/app/captcha?' + +new Date());
	};
	
	$scope.PromptVCode = function (callback) {
		$scope.RefreshVCode();
		$('#vcode_button').off('click.vcode').on('click.vcode', function () {
			callback.call($window, $('#vcode_input').val());
			
			$('#vcode_form').modal('hide');
		});
		$('#vcode_form').modal('show');
	};
	
	$scope.GetLoginAccount = function () {
		jsonp('http://app.jx3.xoyo.com/app/api/passport/get_user_info/?callback=?', function (data) {
			$scope.current_account = data;
			if (data) $scope.current_server = _.chain($scope.accounts)
				.filter(function (account) { return data == account.usr; })
				.first()
				.result('srv')
				.value();
			
			update_scrope();
		});
	};
	$scope.GetLoginAccount();
	
	$scope.LoginAccount = function (acc) {
		$scope.PromptVCode(function (code) {
			jsonp('http://app.jx3.xoyo.com/app/api/passport/login/?callback=?&user=' + acc.usr + '&pass=' + acc.pwd + '&vcode=' + code, function (data) {
				if (data.status <= 0) {
					alert(data.tips);
				} else if (1 == data.status) {
					$scope.current_account = data.tips.user;
					$scope.current_server = acc.srv;
					$scope.current_lottery = 0;
				}
				
				update_scrope();
			});
		});
	};
	
	$scope.LogoutAccount = function () {
		jsonp('http://app.jx3.xoyo.com/app/api/passport/logout?callback=', function (data) {
			if (data.status < 0) {
				alert(data.tips);
			} else if (1 == data.status) {
				$scope.current_account = null;
				$scope.current_server = null;
				$scope.current_lottery = 0;
			}
			
			update_scrope();
		});
	};
	
	$scope.CheckLotteryCount = function () {
		jsonp(app_base_url + 'prize/?callback=?&zone=' + $scope.current_server + '&query=1', function (data) {
			if (-21 == data.status) {
				alert('请稍后重试');
			} else if (data.status < 0) {
				alert(data.tips);
			} else if (1 == data.status) {
				$scope.current_lottery = data.tips['1'] + data.tips['2'] + data.tips['3'] + data.tips['4'];
			}
			
			update_scrope();
		});
	};
	
	$scope.DeleteAccount = function (acc) {
		if (!$window.confirm('确定删除 ' + acc.usr + ' @ ' + $scope.servers[acc.srv] + ' 吗？')) return;
		
		$scope.accounts = _.reject($scope.accounts, function (account) {
			return account.usr == acc.usr && account.pwd == acc.pwd && account.srv == acc.srv;
		});
		update_scrope();
	};
	
	$scope.AddAccount = function () {
		$scope.accounts.push({ usr: '', pwd: '', srv: 'z13' });
		update_scrope();
	};
	
	$scope.GetWeiboLeft = function () {
		jsonp(app_base_url + 'weibo_times?callback=?', function (data) {
			if (-21 == data.status) {
				alert('请稍后重试');
			} else if (data.status < 0) {
				alert(data.tips);
			} else if (1 == data.status) {
				$scope.weibo_left = data.tips.left;
				$scope.weibo_left_tip = data.tips.left ? 'info' : 'danger';
			}
			
			update_scrope();
		});
	};
	$scope.GetWeiboLeft();
	
	$scope.SendWeibo = function () {
		jsonp(app_base_url + 'weibo/?callback=?&zone=' + $scope.current_server + '&weibo_type=0', function (data) {
			if (-21 == data.status) {
				alert('请稍后重试');
			} else if (-10 == data.status) {
				$('#bind_weibo_address').attr('href', data.tips);
				$('#bind_weibo_form').modal('show');
			} else if (data.status < 0) {
				alert(data.tips);
			} else if (1 == data.status) {
				alert(data.tips);
				$scope.CheckLotteryCount();
			}
			
			update_scrope();
		});
	};
	
	$scope.Bingo = function () {
		jsonp(app_base_url + 'prize/?callback=?&zone=' + $scope.current_server, function (data) {
			if (-21 == data.status) {
				alert('请稍后重试');
			} else if (-10 == data.status) {
				$('#bind_weibo_address').attr('href', data.tips);
				$('#bind_weibo_form').modal('show');
			} else if (data.status < 0) {
				alert(data.tips);
			} else if (1 == data.status) {
				var code = data.tips;
				insert_code({
					code: code.code,
					status: 1 * code.code_status,
					type: code.code_type,
					account: $scope.current_account,
					zone: code.zone,
					created: code.created,
					updated: +new Date()
				});
				
				alert('恭喜您获得 ' + $scope.awards[code.code_type] + ' ！');
				$scope.CheckLotteryCount();
			}
			
			update_scrope();
		});
	};
	
	function insert_code(code) {
		$scope.codes = _.reject($scope.codes, function (code_data) {
			return code_data.code == code.code;
		});
		
		$scope.codes.push(code);
	}
	
	$scope.GetAccountCode = function () {
		jsonp(app_base_url + 'my_code_prize/?callback=?&zone=' + $scope.current_server, function (data) {
			if (data.status < 0) {
				alert(data.tips);
			} else if (1 == data.status) {
				angular.forEach(data.tips, function (code) {
					insert_code({
						code: code.code,
						status: 1 * code.code_status,
						type: code.code_type,
						account: $scope.current_account,
						zone: code.zone,
						created: code.created,
						updated: +new Date()
					});
				});
			}
			
			update_scrope();
		});
	};
	
	$scope.CheckCode = function (code) {
		jsonp(app_base_url + 'query_code_status/?callback=?&code=' + code.code + '&zone=' + code.zone, function (data) {
			if (data.status < 0) {
				alert(data.tips);
			} else if (1 == data.status) {
				code.status = 1 * data.tips.status;
				code.updated = +new Date();
				
				insert_code(code);
			}
			
			update_scrope();
		});
	};
	
	$scope.ClearAllCode = function () {
		if (!$window.confirm('确定删除所有兑换码吗？')) return;
		
		$scope.codes = [];
		update_scrope();
	};
});
