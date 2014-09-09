// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('lol', ['ionic'])

.factory('LeagueAPI', function($http, $q, $ionicLoading, $ionicPopup, $state) {
	var apiKey = 'b6483b70-d668-4a11-9b3b-f65a8a483838';
	var baseUrl = 'https://eune.api.pvp.net/api/lol/';
	var showLoading = function() {
		$ionicLoading.show({
			template: 'Loading...'
		})
	};
	var hideLoading = function() {
		$ionicLoading.hide();
	};
	
    var alertPopup = function() {
		$ionicPopup.alert({
				      title: 'No Internet Access',
				      template: 'Cannot connect to the internet, summoner.'
			});
		alertPopup.then(function($state){
			console.log('Go connect it to the internet!');
		});
	};
		
	var isOnline = navigator.onLine;
	
	if(isOnline) {
		return {
			getSummonerData: function(name, region) {
				if(isOnline) {
					showLoading();
					var url = baseUrl + region.toLowerCase() + '/v1.4/summoner/by-name/' + name.toLowerCase() + '?api_key=' + apiKey;
					return $http.get(url).then(function(summoner) {
						hideLoading();
						return summoner;
					}, function(error) {
						$q.reject(error);
					})
						
				}
			},
			getPlayerStats: function(summonerId, region) {
				///api/lol/{region}/v1.3/stats/by-summoner/{summonerId}/summary
				var url = baseUrl + region.toLowerCase() + '/v1.3/stats/by-summoner/' + summonerId + '/summary?api_key=' + apiKey; 
				return $http.get(url).then(function(summonerStats) {
					return summonerStats;
				}, function(error) {
					$q.reject(error);
				})
			},
			getPlayerRankedStats: function(summonerId, region) {
					var url = baseUrl + region.toLowerCase() + '/v1.3/stats/by-summoner/' + summonerId + '/ranked?api_key=' + apiKey;
					return $http.get(url).then(function(summonerRankedStats) {
						return summonerRankedStats;
					}, function(error) {
						$q.reject(error);
					})
	  		},
			getTeamStats: function(summonerId, region) {
				// https://eune.api.pvp.net/api/lol/eune/v2.3/team/by-summoner/36959241?api_key=b6483b70-d668-4a11-9b3b-f65a8a483838
				var url = baseUrl + region.toLowerCase() + '/v2.3/team/by-summoner/' + summonerId + '?api_key=' + apiKey;
				return $http.get(url).then(function(teamStats) {
					return teamStats;
				}, function(error) {
					$q.reject(error);
				})
			},
			getChampions: function(champions) {
				var url = baseUrl + 'static-data/eune/v1.2/champion?champData=image&api_key=' + apiKey;
				var champions;
				showLoading();
				$http.get(url).success(champions);
				hideLoading();
			},
			getItems: function() {
				showLoading();
				var url = baseUrl + 'static-data/eune/v1.2/item?itemListData=gold,image,into&api_key=' + apiKey;
				return $http.get(url).then(function(items) {
					hideLoading();
					return items.data;
				}, function(error) {
					$q.reject(error);
				})
			},
			getItem: function(id) {
				var url = baseUrl +  'static-data/eune/v1.2/item/' + id + '?itemData=gold,specialRecipe,stacks,stats,tags,image&api_key=' + apiKey;
				return $http.get(url).then(function(item) {
					return item;
				}, function(error) {
					$q.reject(error);
				});
			},
			getFreeToPlayChampions: function(region) {
				var url = baseUrl + region + '/v1.2/champion?freeToPlay=true&api_key=' + apiKey;
				return $http.get(url).then(function(championsData) {
					return championsData;
				}, function(error) {
					$q.reject(error);
				});
			},
			getChampion: function(id) {
				showLoading();
				var url = baseUrl + 'static-data/eune/v1.2/champion/' + id + '?champData=info,passive,stats,tags,lore,image&api_key=' + apiKey;
				return $http.get(url).then(function(champion) {
					hideLoading()
					return champion;
				}, function(error) {
					$q.reject(error);
				});
			}
		}
	}
	else {
		alertPopup();
	}
})

.controller('SummonersCtrl', function($scope, $http, $ionicLoading, $ionicPopup, $state, LeagueAPI) {
	$scope.servers = [ 'EUNE',
					   'NA',
					   'EUW',
					   'Korea'
	];

	$scope.showPopup = function(field) {
		var myPopup = $ionicPopup.confirm({
			title: 'Missing Field',
			template: 'You need to fill out the ' + field + '!'
		});
	};
	
	$scope.search = function(summoner) {	
		if(summoner.name && summoner.region) {
			$state.go('tabs.summonerInfo', {name: summoner.name, region: summoner.region});
		}
		else if(!summoner.region) $scope.showPopup('region');
		else if(!summoner.name) $scope.showPopup('name');
	};
	
})

.controller('ChampionsCtrl', function($scope, $http, $ionicLoading, LeagueAPI) {
	LeagueAPI.getChampions(function(champions) {
		$scope.championPool = champions.data;
		$scope.baseImgUrl = 'http://ddragon.leagueoflegends.com/cdn/4.10.7/img/champion/'
	});
	
	$scope.freeToPlayChampions = [];
	
	LeagueAPI.getFreeToPlayChampions('eune').then(function(championsData) {
		championsData.data.champions.forEach(function(c) {
			LeagueAPI.getChampion(c.id).then(function(champion) {
				$scope.freeToPlayChampions.push(champion.data);
			});
		});
	});
})

.controller('ItemsCtrl', function($scope, $http, LeagueAPI) {
	$scope.data = {};
	LeagueAPI.getItems().then(function(items){
		$scope.items = items.data;
		$scope.baseImgUrl = 'http://ddragon.leagueoflegends.com/cdn/4.10.7/img/item/';
	});
	
	$scope.clearSearch = function() {
		$scope.data.searchQuery = '';
	}
})

.controller('SummonerCtrl', function($scope, summonerData, $rootScope) {
	var name = summonerData.name;
	var nameIndex = name.toLowerCase().replace(' ', '');
	var version = $rootScope.version;
	window.gameTypeDictionary = {
		gameTypes: [ 'AramUnranked5x5', 'CAP5x5','CoopVsAI','CoopVsAI3x3','OdinUnranked','OneForAll5x5','RankedSolo5x5','RankedTeam3x3','RankedTeam5x5','SummonersRift6x6','Unranked' ],
		gameHumanTypes: ['ARAM', 'CAP', 'Co-op vs AI', 'Co-op vs AI - 3 x 3', 'Odin Unranked', 'One for All - 5 x 5', 'Ranked Solo - 5 x 5', 'Ranked - 3 x 3', 'Ranked - 5 x 5', 'Hexakill - 6 x 6', 'Unranked - Normals' ]
	}
	
	
	window.stats = summonerData.stats;
	$scope.baseProfileIconUrl = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/profileicon/';
	$scope.summoner = summonerData.data[nameIndex];
	$scope.stats = summonerData.stats;
	$scope.statLength = summonerData.stats.playerStatSummaries.length;
	$scope.gameType = function(machineType) {
		var gameTypes = [ 'AramUnranked5x5', 'CAP5x5','CoopVsAI','CoopVsAI3x3','OdinUnranked','OneForAll5x5','RankedSolo5x5','RankedTeam3x3','RankedTeam5x5','SummonersRift6x6','Unranked', 'Unranked3x3', 'URF', 'URFBots' ];
		var gameHumanTypes = ['ARAM', 'CAP', 'Co-op vs AI', 'Co-op vs AI - 3 x 3', 'Odin Unranked', 'One for All - 5 x 5', 'Ranked Solo - 5 x 5', 'Ranked - 3 x 3', 'Ranked - 5 x 5', 'Hexakill - 6 x 6', 'Unranked - Normals', 'Unranked - 3 x 3', 'URF', 'URF - Bots' ];
		for(var i =0; i<gameTypes.length; i++) {
			if(machineType == gameTypes[i]) {
				return gameHumanTypes[i];
			}
		}
	};
})

.controller('ChampionCtrl', function($scope, championData) {
	$scope.champion = championData;
	$scope.baseImgUrl = 'http://ddragon.leagueoflegends.com/cdn/4.10.7/img/champion/'
})

.controller('ItemCtrl', function($scope, itemData) {
	$scope.item = itemData;
	$scope.baseImgUrl = 'http://ddragon.leagueoflegends.com/cdn/4.10.7/img/item/';
})

.run(function($ionicPlatform, $rootScope, LeagueAPI) {
  
  // Version
  $rootScope.version = '4.10.7';
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('tabs', {
		url: '/tab',
		templateUrl: 'tabs.html'
	})
	.state('tabs.summoner', {
		url: '/summoner',
		views: {
			'summoner-tab': {
				templateUrl: 'summoner.html',
				controller: 'SummonersCtrl'
			}
		}
	})
	.state('tabs.summonerInfo', {
		url: '/summoner/:region/:name',
		resolve: {
			summonerData: function(LeagueAPI, $stateParams, $q) {
				var name = $stateParams.name.toLowerCase().replace(' ', '');
				var region = $stateParams.region.toLowerCase();
				return LeagueAPI.getSummonerData(name, region).then(function(summoner) {
					var summonerId = summoner.data[name].id;
					return LeagueAPI.getPlayerStats(summonerId, region).then(function(stats) {
						if(summoner.data[name].summonerLevel == 30) {
							return LeagueAPI.getPlayerRankedStats(summonerId, region).then(function(rankedStats) {
								return LeagueAPI.getTeamStats(summonerId, region).then(function(teamStats) {
										return {data: summoner.data, stats: stats.data, name: name, rankedStats: rankedStats.data, teamStats: teamStats.data};									
								});
							});
						}
						else {
							return {data: summoner.data, stats: stats.data, name: name};
						}
						
					});
				}, function(error) {
					$q.reject(error);
				})
			}
		},
		views: {
			'summoner-tab': {
				templateUrl: 'summonerInfo.html',
				controller: 'SummonerCtrl'
			}
		}
	})
	.state('tabs.champions', {
		url: '/champions',
		views: {
			'champions-tab': {
				templateUrl: 'champions.html',
				controller: 'ChampionsCtrl'
			}
		}
	})
	.state('tabs.championInfo', {
		url: '/champion/:id',
		resolve: {
			championData: function(LeagueAPI, $stateParams, $q) {
				var championId = $stateParams.id;
				return LeagueAPI.getChampion(championId).then(function(champion) {
					return champion.data;
				})
			}
		},
		views: {
			'champions-tab': {
				templateUrl: 'championInfo.html',
				controller: 'ChampionCtrl'
			}
		}
	})
	.state('tabs.items', {
		url: '/items',
		views: {
			'items-tab': {
				templateUrl: 'items.html',
				controller: 'ItemsCtrl'
			}
		}
	})
	.state('tabs.itemInfo', {
		url: '/item/:id',
		resolve: {
			itemData: function(LeagueAPI, $stateParams, $q) {
				var itemId = $stateParams.id;
				return LeagueAPI.getItem(itemId).then(function(item) {
					console.log(item.data);
					return item.data;
				});
			}
		},
		views: {
			'items-tab': {
				templateUrl: 'itemInfo.html',
				controller: 'ItemCtrl'
			}
		}
	})
	
	$urlRouterProvider.otherwise('/tab/summoner');
});