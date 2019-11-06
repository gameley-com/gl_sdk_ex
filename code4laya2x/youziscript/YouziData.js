"use strict";
exports.__esModule = true;
var YouziCenter_1 = require("./YouziCenter");
//{"togame" : "wx5cc078f08942ebfe","boxAppid" : "leuokNull","orgAppid" : "wx1577b6b084c38df7"}wxc62f7ed8b36ea9e8
/**
 * 底部banner类型
 */
exports.BANNER_TYPE = {
    MATRIX: 1,
    WX: 2,
    GAME: 3,
    SWITCH: 4 //矩阵banner 与 微信banner 进行来回切换展示(根据服务器配置时间间隔进行自动切换展示)
};
/**
 * 手机类型
 */
var PHONE_TYPE = {
    ANDROID: 2,
    IOS: 3 //苹果
};
/**
 * 交叉营销开关枚举
 * 该开关控制抽屉类型(目前只控制抽屉)的显示和隐藏
 */
var PAGE_STATUS = {
    CLOSE: 0,
    OPEN: 1,
    AUDIT: 2,
    BUY: 3 //买量
};
/**
 * 打点位置枚举
 */
exports.BI_PAGE_TYPE = {
    MAIN: 1,
    FLOAT: 2,
    MATRIX: 3,
    GUESS: 4,
    MORE: 5,
    GAME: 6,
    OFFLINE: 7,
    BUY_Screen: 8,
    BUY_BOX: 9,
    SMALL_MATRIX_WALL: 10,
    FULL_MATRIX_SCRENN: 11,
    CUSTOM_COMPONENT: 9999 //自定义或者没有传入页面类型时
};
/**
 * 交叉营销下行数据类型
 */
var PAGE_TYPE = {
    BANNER: 1,
    ITEMLIST: 2,
    HOT: 3,
    MAIN: 4,
    PAGE: 5,
    OFFLINE: 6,
    BUY: 7,
    MORE: 8,
    MATRIX_BANNER: 9,
    FULL_MATRIX_SCREEN: 10 //全屏落地页矩阵
};
/**
 * 平台
 */
var PLAT_TYPE = {
    Test: 0,
    WeChat: 1,
    OppoMiniGame: 2
};
var PLAT_TYPE_CHANNELID = [
    1002,
    1002,
    8001 //oppo小游戏
];
exports.AllDataAnimaTypeJson = {};
/**
 * 柚子UI界面ID编号
 */
exports.YOUZI_UI_ID = {
    Youzi_BottomBanner: 1,
    Youzi_GameBanner: 2,
    Youzi_GuessLike: 3,
    Youzi_GuessLikeH: 4,
    Youzi_MainPush: 5,
    Youzi_MoreGame: 6,
    Youzi_MoreGameH: 7,
    Youzi_OffLine: 8,
    Youzi_OffLineH: 9,
    Youzi_SlideWindow: 10,
    Youzi_SlideWindowH: 11,
    Youzi_SmallWall: 12,
    Youzi_SmallWallH: 13 //大家都在玩儿横屏
};
exports.YouziData = {
    SdkVersion: 'laya2.0-v6.2',
    resVersion: '1.00.00',
    debug: false,
    appid: '',
    channelId: 1002,
    miniGamePlatType: 0,
    bannnerDatas: [],
    itemListDatas: [],
    hotListDatas: [],
    moreDatas: [],
    matrixBannerDatas: [],
    fullMatrixScreenDatas: [],
    mainRecDatas: [],
    buyListDatas: [],
    gameBannerDatas: [],
    offlineBannerDatas: [],
    allBeRecommendGames: {},
    clickGameYouziUIId: 0,
    _userinfo: {
        uid: '',
        gender: 0,
        type: 1 //用户类型 1普通类型,2买量类型,3分享类型
    },
    _platform: 1,
    _isDataLoaded: false,
    _loadedCallBacks: [],
    _bannerType: exports.BANNER_TYPE.MATRIX,
    _banerShowSwitchInterval: 10,
    _bannerCreateInterval: 20,
    _pageOpen: PAGE_STATUS.OPEN,
    _bannerSwitchs: [],
    _provinceAllow: 1,
    _mainRecAmount: 1,
    _gameIndexArrLength: 1,
    _gameIndexArr: [],
    /**
     * 中心化初始化函数 调用一次即可
     * @param {string} appid 渠道提供的appid
     * @param {string} resVersion 中心化资源版本 默认'1.00.00'
     * @param {number} miniGamePlatType 管理后台提供的平台渠道类型
     */
    init: function (appid, resVersion, miniGamePlatType) {
        if (this.isInit)
            return;
        if (Laya.Browser.onIOS) {
            this._platform = PHONE_TYPE.IOS;
        }
        else if (Laya.Browser.onAndroid) {
            this._platform = PHONE_TYPE.ANDROID;
        }
        console.log('中心化初始化 SdkVersion', this.SdkVersion, appid, resVersion, miniGamePlatType);
        console.log('中心化平台：', PLAT_TYPE_CHANNELID[miniGamePlatType]);
        this.isInit = true;
        this.appid = appid || '';
        this.resVersion = resVersion || '1.00.00';
        this.miniGamePlatType = miniGamePlatType || 0;
        this.channelId = PLAT_TYPE_CHANNELID[miniGamePlatType] || 1002;
        this._loadUid();
        this._loadData(this._initBannerShow.bind(this));
        if (this.miniGamePlatType == PLAT_TYPE.WeChat) {
            this._wxLaunch();
        }
    },
    _wxLaunch: function () {
        if (!Laya.Browser.window.wx) {
            return;
        }
        else if (!Laya.Browser.window.wx.getLaunchOptionsSync) {
            return;
        }
        var self = this;
        var wxLaunchOptions = Laya.Browser.window.wx.getLaunchOptionsSync();
        this._loadUid();
        this.checkUserIsImported(wxLaunchOptions);
        if (wxLaunchOptions.referrerInfo
            && wxLaunchOptions.referrerInfo.appId
            && wxLaunchOptions.referrerInfo.extraData
            && wxLaunchOptions.referrerInfo.extraData.boxAppid
            && wxLaunchOptions.referrerInfo.extraData.orgAppid) {
            this.sendJumpToOpen(wxLaunchOptions.referrerInfo.extraData.orgAppid, wxLaunchOptions.referrerInfo.extraData.boxAppid, wxLaunchOptions.referrerInfo.extraData.locationIndex ? wxLaunchOptions.referrerInfo.extraData.locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT);
        }
        else {
            this.openGameInitLog();
        }
        Laya.Browser.window.wx.onShow(function (res) {
            self._wxOnShow(res);
        });
    },
    _wxOnShow: function (wxOnShowRes) {
        console.log('wx onShow--------------');
        this.checkUserIsImported(wxOnShowRes);
        if (wxOnShowRes.referrerInfo
            && wxOnShowRes.referrerInfo.extraData
            && wxOnShowRes.referrerInfo.extraData.boxAppid
            && wxOnShowRes.referrerInfo.extraData.orgAppid) {
            this.sendJumpToOpen(wxOnShowRes.referrerInfo.extraData.orgAppid, wxOnShowRes.referrerInfo.extraData.boxAppid, wxOnShowRes.referrerInfo.extraData.locationIndex ? wxOnShowRes.referrerInfo.extraData.locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT);
        }
    },
    checkUserIsImported: function (res) {
        if ((res.referrerInfo && res.referrerInfo.adChannelId && res.referrerInfo.adSubChannelId) ||
            (res.query && res.query.adChannelId && res.query.adSubChannelId)) {
            this._userinfo.type = 2;
        }
        if ((res.referrerInfo && res.referrerInfo.leuokShareIn) ||
            (res.query && res.query.leuokShareIn)) {
            this._userinfo.type = 3;
        }
        var isNeedSaveUID = false;
        var hasExtraData = res.referrerInfo && res.referrerInfo.extraData;
        if (hasExtraData) {
            if (res.referrerInfo.extraData.YouziFixUID && res.referrerInfo.extraData.YouziFixUID.trim().length > 0) {
                // 通过新版本跳转到新版本
                isNeedSaveUID = true;
                this._userinfo.uid = res.referrerInfo.extraData.YouziFixUID;
            } // 通过其它引擎或者cocoxcreator老版本跳转到新版本
            else if (res.referrerInfo.extraData.YouziUID && res.referrerInfo.extraData.YouziUID.trim().length > 0) {
                isNeedSaveUID = true;
                this._userinfo.uid = res.referrerInfo.extraData.YouziUID;
            }
            // 如果两者都没有，直接在_loadUid()方法里去取uid或者生成一个uid
        }
        if (res.query && res.query.extraData && res.query.extraData.YouziUID) {
            isNeedSaveUID = true;
            this._userinfo.uid = res.query.YouziUID;
        }
        if (isNeedSaveUID) {
            localStorage.setItem('YOUZI_UID', this._userinfo.uid);
        }
    },
    _loadData: function (cb) {
        var self = this;
        var reqData = {
            "appid": self.appid,
            "channelId": self.channelId,
            "languageType": 1,
            "uid": self._userinfo.uid,
            "version": self.resVersion
        };
        var cb2 = function (res) {
            var clone = JSON.parse(JSON.stringify(res));
            console.log('中心化数据OK', clone);
            // console.log('中心化数据加载完成',res);
            if (res && res.info && res.info.swith && res.info.swith == 1) {
                self._mainRecAmount = res.info.hasOwnProperty('mainRecAmount') ? res.info.mainRecAmount : 3;
                self._pageOpen = res.info.status;
                self._bannerType = res.info.bannerSwith;
                self._banerShowSwitchInterval = res.info.bannerAutoInterval;
                self._bannerCreateInterval = res.info.wxBannerRefresh;
                self._provinceAllow = res.info.provinceAllow;
                var weight_1 = function (a, b) { return b.weight - a.weight; };
                var clear = function (list) {
                    list = list.sort(weight_1);
                    list = self._clearArrIndex(list);
                    list = self._removeItemByTestPeriod(list);
                    return list;
                };
                for (var i = 0; i < res.info.recommendListBos.length; i++) {
                    var data = res.info.recommendListBos[i];
                    data.contentBos.forEach(function (item) {
                        if (!self.allBeRecommendGames.hasOwnProperty.call({}, item.appid)) {
                            self.allBeRecommendGames[item.appid] = Object.assign({}, item);
                        }
                    });
                    console.log('allBeRecommendGames:' + self.allBeRecommendGames);
                    switch (data.type) {
                        case PAGE_TYPE.BANNER:
                            self.bannnerDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.ITEMLIST:
                            self.itemListDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.HOT:
                            self.hotListDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.MORE:
                            self.moreDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.MATRIX_BANNER:
                            self.matrixBannerDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.MAIN:
                            self.mainRecDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.PAGE:
                            self.gameBannerDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.OFFLINE:
                            self.offlineBannerDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.BUY:
                            self.buyListDatas = clear(data.contentBos);
                            break;
                        case PAGE_TYPE.FULL_MATRIX_SCREEN:
                            self.fullMatrixScreenDatas = clear(data.contentBos);
                            break;
                        default:
                            console.error('中心化数据类型错误', data.type);
                            break;
                    }
                }
            }
            self._isDataLoaded = true;
            if (cb)
                cb(res);
            for (var i = 0; i < self._loadedCallBacks.length; i++) {
                var callback = self._loadedCallBacks[i];
                if (callback)
                    callback();
            }
            if (self._bannerType == exports.BANNER_TYPE.SWITCH) {
                self.refreshBannerSwitch();
                setInterval(self.refreshBannerSwitch.bind(self), self._banerShowSwitchInterval * 1000);
            }
        };
        if (self.miniGamePlatType == PLAT_TYPE.WeChat) {
            console.log('userInfo 调用开始');
            self._getWxUserInfo(function () {
                console.log('请求开始');
                self._request('POST', reqData, self._url(), cb2);
            });
        }
        else {
            self._request('POST', reqData, self._url(), cb2);
        }
    },
    _clearArrIndex: function (dataArray) {
        var arr1 = [];
        for (var i = 0; i < dataArray.length; i++) {
            var data = dataArray[i];
            if (this._pushData(data.hide)) {
                arr1.push(data);
            }
        }
        var arr2 = [];
        for (var i = 0; i < arr1.length; i++) {
            var data = arr1[i];
            if (this._pushDataBySexual(data.gender)) {
                arr2.push(data);
            }
        }
        return arr2;
    },
    _request: function (methon, data, url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                if (xhr.responseText != '') {
                    var res = JSON.parse(xhr.responseText);
                    if (cb) {
                        cb(res);
                    }
                }
                else {
                    if (cb) {
                        cb({});
                    }
                }
            }
        };
        xhr.open(methon, url, true);
        //设置发送数据的请求格式
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(data));
    },
    _loadUid: function () {
        try {
            var gen = function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            var uid = localStorage.getItem('YOUZI_UID');
            if (uid && uid.trim().length > 0) {
                this._userinfo.uid = uid;
            }
            else {
                this._userinfo.uid = gen();
                localStorage.setItem('YOUZI_UID', this._userinfo.uid);
            }
        }
        catch (error) {
            this._userinfo.uid = '10001';
        }
    },
    _removeItemByTestPeriod: function (list) {
        //testPeriod 0通用,1测试期,2卖量CPA,3卖量CPS
        for (var i = 0; i < list.length; i++) {
            var tmp = list[i];
            //测试期与下架同时判定
            if ((tmp.testPeriod == 1 || tmp.testPeriod == 3) && tmp.showLimit == 0) {
                var navigatedMark = localStorage.getItem(tmp.appid);
                if (navigatedMark && navigatedMark == 'navigated') {
                    continue;
                }
                else {
                    list.splice(i, 1);
                    i--;
                }
            }
            //卖量判定
            else if (tmp.testPeriod == 2) {
                var cpacpsMark = localStorage.getItem(tmp.appid);
                if (cpacpsMark && cpacpsMark == 'CPACPS') {
                    list.splice(i, 1);
                    i--;
                }
            }
        }
        return list;
    },
    _url: function () {
        return this.debug ? 'https://test.gw.leuok.com/gl-ms-mini-recommend/recommend/show' : 'https://gw.lightlygame.com/gl-ms-mini-recommend/recommend/show';
    },
    _pushData: function (hideType) {
        var push = false;
        switch (hideType) {
            case 1:
                push = true;
                break;
            case 2:
                if (this._platform == PHONE_TYPE.ANDROID) {
                    push = true;
                }
                break;
            case 3:
                if (this._platform == PHONE_TYPE.IOS) {
                    push = true;
                }
                break;
            default:
                push = false;
                break;
        }
        return push;
    },
    _pushDataBySexual: function (sexual) {
        var pushSexual = false;
        switch (sexual) {
            case 0:
                pushSexual = true;
                break;
            case 1: //男
                if (this._userinfo.gender == 1) {
                    pushSexual = true;
                }
                break;
            case 2: //女
                if (this._userinfo.gender == 2) {
                    pushSexual = true;
                }
                break;
            default:
                pushSexual = false;
                break;
        }
        return pushSexual;
    },
    _getWxUserInfo: function (call) {
        var self = this;
        if (!Laya.Browser.window.wx) {
            call();
            return;
        }
        else if (!Laya.Browser.window.wx.getUserInfo) {
            call();
            return;
        }
        console.log('userInfo 调用 start');
        Laya.Browser.window.wx.getUserInfo({
            success: function (res) {
                self._userinfo.gender = res.userInfo.gender;
                console.log('userInfo 成功回调请求');
                call();
                return;
            },
            fail: function (res) {
                console.log('userInfo 失败回调请求');
                call();
            }
        });
        console.log('userInfo 调用 end');
    },
    _loadTexture: function (sp, url) {
    },
    //跳转
    startOtherGame: function (data, call) {
        switch (this.miniGamePlatType) {
            case PLAT_TYPE.WeChat:
                if (data.codeJump == 1) {
                    this.wxPreviewImage(data.chopencode || data.vopencode || data.hopencode, data, call);
                }
                else {
                    this.navigateToOtherGame(data, call);
                }
                break;
            case PLAT_TYPE.OppoMiniGame:
                this.navigateToOppoMiniGame(data, call);
                break;
            default:
                if (call)
                    call(false);
                // this.notifyNavigateFailUIId();
                break;
        }
    },
    //发送sdk初始化日志
    openGameInitLog: function () {
        var curInitLogTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
        var curInitLogParam = {
            "logType": "login",
            "channelId": this.channelId,
            "orgAppid": this.appid,
            "uid": this._userinfo.uid,
            "dt": curInitLogTime,
            "sdkVersion": this.SdkVersion
        };
        var initLogCall = function () {
            console.log("log event send YouziSdk init success");
        };
        this.logNavigate(curInitLogParam, initLogCall);
    },
    //曝光日志
    sendExposureLog: function (data, locationIndex) {
        if (!data) {
            console.warn('发送曝光日志时,data不存在', data, locationIndex);
            return;
        }
        var curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
        var param = {
            "logType": "exposure",
            "channelId": this.channelId,
            "orgAppid": this.appid,
            "uid": this._userinfo.uid,
            "languageType": 1,
            "jumpAppid": data.appid,
            "locationIndex": locationIndex ? locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT,
            "recommendType": data.type ? data.type : 1,
            "screenId": locationIndex ? locationIndex : 1,
            "dt": curTime,
            "sdkVersion": this.SdkVersion
        };
        var cb = function (res) {
            // console.log('log event exposure success---',param)
        };
        this.logNavigate(param, cb);
    },
    navigateToOppoMiniGame: function (data, call) {
        if (this.debug) {
            console.log('oppo小游戏跳转成功');
        }
        else {
            var self = this;
            console.log('--------->1', data.pkgName);
            var packageName = data.pkgName.replace(/\s*/g, "");
            console.log('--------->2', packageName);
            Laya.Browser.window.qg.navigateToMiniGame({
                pkgName: packageName,
                success: function () {
                    self.sendGameToGame(data);
                    if (call)
                        call(true);
                    console.log('oppo小游戏跳转成功');
                },
                fail: function (res) {
                    if (call)
                        call(false);
                    console.log('oppo小游戏跳转失败：', JSON.stringify(res));
                }
            });
        }
    },
    navigateToOtherGame: function (data, call) {
        if (!Laya.Browser.window.wx) {
            return;
        }
        else if (!Laya.Browser.window.wx.navigateToMiniProgram) {
            return;
        }
        var self = this;
        var desAppid = data.appid;
        var haveBoxAppId = false;
        var _boxId = 'leuokNull';
        if (data.boxAppId && data.boxAppId != '') {
            haveBoxAppId = true;
            desAppid = data.boxAppId;
            _boxId = desAppid;
        }
        var extraJson = {
            'togame': data.appid,
            'boxAppid': _boxId,
            'orgAppid': self.appid,
            'YouziUID': self.uid,
            'YouziFixUID': self._userinfo.uid,
            'userType': self._userinfo.type,
            'locationIndex': data.locationIndex ? data.locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT
        };
        //获取小程序路径
        var littleProgramPath = null;
        if (data.miniProgramArgs && data.miniProgramArgs != '') {
            littleProgramPath = data.miniProgramArgs;
        }
        if (data.anChannelId || data.ioChannelId) {
            if (littleProgramPath != null) {
                littleProgramPath = littleProgramPath + "&anChannelId=" + data.anChannelId + "&ioChannelId=" + data.ioChannelId;
            }
            else {
                littleProgramPath = "?anChannelId=" + data.anChannelId + "&ioChannelId=" + data.ioChannelId;
            }
        }
        console.log('mimiProgramPath:' + littleProgramPath);
        //获取联运小游戏附加key名和对应value值
        if (data.miniGameArgs && data.miniGameArgs != '') {
            var addJson = JSON.parse(data.miniGameArgs);
            //获取json中所有key名
            var addJsonKeyArr = Object.keys(addJson);
            //去第一个key名
            var key0 = addJsonKeyArr[0];
            if (key0 == 'togame' || key0 == 'boxAppid' || key0 == 'orgAppid') {
                console.log('联运附加key值冲突');
                return;
            }
            //往extraJson添加新属性
            extraJson[key0] = addJson[key0];
        }
        console.log('extraData' + JSON.stringify(extraJson));
        Laya.Browser.window.wx.navigateToMiniProgram({
            appId: desAppid,
            path: littleProgramPath,
            extraData: extraJson,
            success: function (result) {
                if (haveBoxAppId) {
                    self.sendGameToBox(data);
                }
                else {
                    self.sendGameToGame(data);
                }
                haveBoxAppId = false;
                if (call)
                    call(true);
                console.log('navigateToMiniProgram success');
                //测试期产品用户跳转标记
                if (data.testPeriod && data.testPeriod == '1') {
                    localStorage.setItem(data.appid, 'navigated');
                }
                else if (data.testPeriod == '2') {
                    localStorage.setItem(data.appid, 'CPACPS');
                }
            },
            fail: function (res) {
                if (call)
                    call(false);
                self.notifyNavigateFailUIId();
                console.log('navigateToMiniProgram fail');
            }
        });
    },
    notifyNavigateFailUIId: function () {
        switch (this.clickGameYouziUIId) {
            case exports.YOUZI_UI_ID.Youzi_MainPush:
            case exports.YOUZI_UI_ID.Youzi_BottomBanner:
            case exports.YOUZI_UI_ID.Youzi_GuessLike:
            case exports.YOUZI_UI_ID.Youzi_GuessLikeH:
                YouziCenter_1["default"].getInstance().notifyNavigateToMini(this.clickGameYouziUIId);
                break;
            default:
                console.log('不需要取消');
                break;
        }
    },
    sendJumpToOpen: function (orgAppId, boxAppId, locationIndex) {
        if (locationIndex === void 0) { locationIndex = 1; }
        var type = 'jump2open'; //小游戏跳转到盒子
        if (boxAppId == 'leuokNull') {
            type = 'app2open'; //小游戏直接跳小游戏
            boxAppId = '';
        }
        var cb = function (res) {
            console.log('log event sendJumpToOpen success---');
        };
        var curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
        var param = {
            "logType": type,
            "userType": this._userinfo.type,
            "channelId": this.channelId,
            "orgAppid": orgAppId,
            "boxAppid": boxAppId,
            "uid": this._userinfo.uid,
            "languageType": 1,
            "jumpAppid": this.appid,
            "locationIndex": locationIndex ? locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT,
            "recommendType": 1,
            "screenId": 1,
            "dt": curTime,
            "sdkVersion": this.SdkVersion
        };
        console.log(param);
        this.logNavigate(param, cb);
    },
    sendGameToGame: function (_data) {
        var curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
        var cb = function (res) {
            console.log('log event success---');
        };
        var param = {
            "logType": "app2app",
            "userType": this._userinfo.type,
            "channelId": this.channelId,
            "orgAppid": this.appid,
            "uid": this._userinfo.uid,
            "languageType": 1,
            "jumpAppid": _data.appid,
            "locationIndex": _data.locationIndex ? _data.locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT,
            "recommendType": _data.type,
            "screenId": 1,
            "dt": curTime,
            "sdkVersion": this.SdkVersion
        };
        console.log(param);
        this.logNavigate(param, cb);
    },
    sendGameToBox: function (_data) {
        var curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
        var cb = function (res) {
            console.log('log event success---');
        };
        var param = {
            "logType": "jump2box",
            "userType": this._userinfo.type,
            "channelId": this.channelId,
            "orgAppid": this.appid,
            "uid": this._userinfo.uid,
            "languageType": 1,
            "boxAppid": _data.boxAppId,
            "jumpAppid": _data.appid,
            "locationIndex": _data.locationIndex ? _data.locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT,
            "recommendType": _data.type,
            "screenId": 1,
            "dt": curTime,
            "sdkVersion": this.SdkVersion
        };
        console.log(param);
        this.logNavigate(param, cb);
    },
    wxPreviewImage: function (qrCodeimageUrl, data, call) {
        var self = this;
        Laya.Browser.window.wx.previewImage({
            current: qrCodeimageUrl,
            urls: [qrCodeimageUrl],
            success: function () {
                if (call)
                    call(true);
                self.sendGameByQrcode(data);
            },
            fail: function () {
                if (call)
                    call(false);
            }
        });
    },
    sendGameByQrcode: function (_data) {
        var curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
        var cb = function (res) {
            console.log('log event success---');
        };
        var param = {
            "logType": "showcode",
            "userType": this._userinfo.type,
            "channelId": this.channelId,
            "orgAppid": this.appid,
            "uid": this._userinfo.uid,
            "languageType": 1,
            "jumpAppid": _data.appid,
            "locationIndex": _data.locationIndex ? _data.locationIndex : exports.BI_PAGE_TYPE.CUSTOM_COMPONENT,
            "recommendType": _data.type,
            "screenId": 1,
            "dt": curTime,
            "sdkVersion": this.SdkVersion
        };
        console.log(param);
        this.logNavigate(param, cb);
    },
    logNavigate: function (reqData, cb) {
        console.log('send log--->' + reqData);
        if (!this.debug) {
            this._request('POST', reqData, 'https://bi.log.lightlygame.com/recommend/', cb);
        }
    },
    YouziDateFtt: function (fmt, date) {
        var o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },
    getDatasByBIType: function (locationIndex) {
        if (locationIndex == 1) {
            return this.mainRecDatas;
        }
        else if (locationIndex == 2) {
            return this.hotListDatas;
        }
        else if (locationIndex === 3 || locationIndex == 4) {
            return this.matrixBannerDatas;
        }
        else if (locationIndex === 5 || locationIndex === 10) {
            return this.moreDatas;
        }
        else if (locationIndex == 6) {
            return this.gameBannerDatas;
        }
        else if (locationIndex == 7) {
            return this.offlineBannerDatas;
        }
        else if (locationIndex == 8 || locationIndex == 9) {
            return this.buyListDatas;
        }
        console.error('未找到中心化数据 locationIndex', locationIndex);
        return [];
    },
    _initBannerShow: function () {
        if (this._bannerType == exports.BANNER_TYPE.MATRIX || this._bannerType == exports.BANNER_TYPE.GAME || this._bannerType == exports.BANNER_TYPE.WX) {
            for (var i = 0; i < this._bannerSwitchs.length; i++) {
                var banner = this._bannerSwitchs[i];
                if (banner && banner.bannerType == this._bannerType) {
                    banner.showBanner();
                }
                else if (banner) {
                    banner.hideBanner();
                }
            }
        }
        else if (this._bannerType == exports.BANNER_TYPE.SWITCH) {
            for (var i = 0; i < this._bannerSwitchs.length; i++) {
                var banner = this._bannerSwitchs[i];
                if (banner && banner.bannerType == exports.BANNER_TYPE.MATRIX) {
                    banner.showBanner();
                }
                else if (banner) {
                    banner.hideBanner();
                }
            }
        }
    },
    /**
     *
     * @param nodesAmout 多主推节点数量
     *一、多主推节点数量大于等于服务器配置的多主推数量
     * 1、数量先以服务器配置的多主推数量为准进行 2、3判断
     * 2、如果多主推数量大于等于主推数组长度，则实际多主推数量为主推数组长度，且不进行切换
     * 3、如果多主推数量小于主推数组长度，则实际多主推数量为服务器配置的多主推数量，且进行切换
     * 二、多主推节点数量小于服务器配置的多主推数量
     * 1、数量先以多主推节点数量为准进行2、3判断
     * 2、如果多主推节点数量大于等于主推数组长度，则实际多主推数量为主推数组长度，且不进行切换
     * 3、如果多主推节点数量小于主推数组长度，则实际多主推数量为多主推节点数量，且进行切换
     * 返回数组[a,b];a实际多主推数量:number，b是否进行切换：boolean
     *
     */
    getMultiMainAmount: function (nodesAmout) {
        if (nodesAmout >= this._mainRecAmount) {
            return this._mainRecAmount >= this.mainRecDatas.length ? [this.mainRecDatas.length, false] : [this._mainRecAmount, true];
        }
        else {
            return nodesAmout >= this.mainRecDatas.length ? [this.mainRecDatas.length, false] : [nodesAmout, true];
        }
    },
    getGamesIndex: function (num, showNum) {
        if (this._gameIndexArr.length == 0) {
            this._gameIndexArrLength = num;
            for (var i = 0; i < num; i++) {
                this._gameIndexArr.push(i);
            }
        }
        else {
            if (num != this._gameIndexArrLength) {
                this._gameIndexArrLength = num;
                for (var i = 0; i < num; i++) {
                    this._gameIndexArr.push(i);
                }
            }
        }
        if (num <= showNum) {
            return this._gameIndexArr;
        }
        else {
            var t = void 0, k = void 0;
            while (num) {
                k = Math.floor(Math.random() * num--);
                t = this._gameIndexArr[num];
                this._gameIndexArr[num] = this._gameIndexArr[k];
                this._gameIndexArr[k] = t;
            }
            return this._gameIndexArr.slice(0, showNum);
        }
    },
    getRandomArrayElements: function (arr, count) {
        var m = arr.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = arr[m];
            arr[m] = arr[i];
            arr[i] = t;
        }
        return arr.slice(0, count);
    },
    addBanner: function (banner) {
        this._destroyUnuseWxBanner(banner);
        this._bannerSwitchs.push(banner);
        //如果banner是后续加入的 立刻刷新显示
        if (this._isDataLoaded) {
            this._initBannerShow();
        }
    },
    refreshBannerSwitch: function () {
        if (!this.curBannerType) {
            this.curBannerType = exports.BANNER_TYPE.WX;
        }
        this.curBannerType = this.curBannerType == exports.BANNER_TYPE.WX ? exports.BANNER_TYPE.MATRIX : exports.BANNER_TYPE.WX;
        for (var i = 0; i < this._bannerSwitchs.length; i++) {
            var banner = this._bannerSwitchs[i];
            if (banner && banner.bannerType == this.curBannerType) {
                banner.showBanner();
            }
            else if (banner) {
                banner.hideBanner();
            }
        }
    },
    /**
     * 微信banner 有且只有一个
     */
    _destroyUnuseWxBanner: function (b) {
        if (b.bannerType == exports.BANNER_TYPE.WX) {
            for (var i = 0; i < this._bannerSwitchs.length; i++) {
                var banner = this._bannerSwitchs[i];
                if (banner && banner.bannerType == exports.BANNER_TYPE.WX) {
                    banner.destroySelf();
                    this._bannerSwitchs.splice(i, 1);
                    return;
                }
            }
        }
    },
    _checkExposureInview: function (cellNodes, limitx, limity, datas, locationIndex) {
    },
    getDataByAppId: function (appid) {
        var data = this._getDataByAppid(this.mainRecDatas, appid);
        if (!data) {
            data = this._getDataByAppid(this.hotListDatas, appid);
        }
        if (!data) {
            data = this._getDataByAppid(this.buyListDatas, appid);
        }
        return data;
    },
    /**
     * 根据appid获取被推广游戏的信息
     * @param appid
     * @returns {*}
     */
    getDataFromAllGameObj: function (appid) {
        return this.allBeRecommendGames[appid];
    },
    _getDataByAppid: function (datas, appid) {
        for (var i = 0; i < datas.length; i++) {
            if (datas[i].appid == appid) {
                return datas[i];
            }
        }
        return null;
    },
    /**
     * 滚动列表滚动动画
     * @param {cc.ScrollView} scrollView
     * @param {number} speed 滚动速度 越小速度越快
     * @param {number} limit 少于该数量不滚动
     */
    scrollviewAction: function (scrollView, speed, limit) {
    },
    /**
     * 限定浮点数的最大最小值
     * @param valueNumber
     * @param minNumber
     * @param maxNumber
     */
    miscClampf: function (valueNumber, minNumber, maxNumber) {
        if (minNumber > maxNumber) {
            var temp = minNumber;
            minNumber = maxNumber;
            maxNumber = temp;
        }
        return valueNumber < minNumber ? minNumber : valueNumber < maxNumber ? valueNumber : maxNumber;
    },
    BI_AppOnce: function (params) {
        var BI = this.getBI();
        if (BI && BI.leuok) {
            BI.leuok.appOnce(params);
        }
    },
    BI_Action: function (params) {
        var BI = this.getBI();
        if (BI && BI.leuok) {
            BI.leuok.action(params);
        }
    },
    BI_WXBannerError: function (params) {
        var BI = this.getBI();
        if (BI && BI.leuok) {
            BI.leuok.error(params);
        }
    },
    getBI: function () {
        if (typeof Laya.Browser.window.wx !== 'undefined') {
            return Laya.Browser.window.wx;
        }
        else if (typeof Laya.Browser.window.BK !== 'undefined') {
            return Laya.Browser.window.BK;
        }
        else if (typeof Laya.Browser.window.qg !== 'undefined') {
            return Laya.Browser.window.qg;
        }
        else if (typeof window !== 'undefined') {
            return window;
        }
    }
};
