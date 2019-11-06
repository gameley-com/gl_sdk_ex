var YouziBoxManager_Module;
(function (YouziBoxManager_Module) {
    var YouziBoxManager = /** @class */ (function () {
        function YouziBoxManager() {
            this.referrerInfo = {
                appid: null,
                anChannelId: null,
                ioChannelId: null,
                appId: null,
                togame: null,
                userType: null,
                boxAppid: null,
                locationIndex: null
            };
        }
        YouziBoxManager.getInstance = function () {
            if (this.instance == null) {
                this.instance = new YouziBoxManager();
            }
            return this.instance;
        };
        YouziBoxManager.prototype.wxLaunch = function (launchInfo) {
            if (launchInfo.referrerInfo && launchInfo.referrerInfo.appId && launchInfo.referrerInfo.extraData && launchInfo.referrerInfo.extraData.togame) {
                this.referrerInfo = launchInfo.referrerInfo.extraData;
                this.referrerInfo.appid = launchInfo.referrerInfo.appId;
            }
            if (launchInfo.query && launchInfo.query.appid && launchInfo.query.togame) {
                this.referrerInfo = launchInfo.query;
                this.referrerInfo.appid = launchInfo.query.appid;
            }
            if (launchInfo.query && this.referrerInfo && launchInfo.query.anChannelId) {
                this.referrerInfo.anChannelId = launchInfo.query.anChannelId;
                this.referrerInfo.ioChannelId = launchInfo.query.ioChannelId;
            }
        };
        YouziBoxManager.prototype.wxOnShow = function (res) {
            if (res.scene == 1037) {
                if (res.referrerInfo && res.referrerInfo.appId && res.referrerInfo.extraData && res.referrerInfo.extraData.togame) {
                    this.referrerInfo = res.referrerInfo.extraData;
                    this.referrerInfo.appid = res.referrerInfo.appId;
                }
                if (res.query && res.query.appid && res.query.togame) {
                    this.referrerInfo = res.query;
                    this.referrerInfo.appId = res.query.appid;
                }
                if (res.query && this.referrerInfo && res.query.anChannelId) {
                    this.referrerInfo.anChannelId = res.query.anChannelId;
                    this.referrerInfo.ioChannelId = res.query.ioChannelId;
                }
            }
        };
        YouziBoxManager.prototype.sendExposureLog = function (_data, _screenid) {
            YouziDataModule.YouziData.sendExposureLog(_data, _screenid);
        };
        //落地页展示时 发送该日志
        YouziBoxManager.prototype.sendBox2Open = function () {
            var cb = function (res) {
                console.log('log event sendBox2Open success---');
            };
            var curTime = YouziDataModule.YouziData.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
            var oriappid = this.referrerInfo && this.referrerInfo.appid ? this.referrerInfo.appid : YouziDataModule.YouziData.appid;
            var jumpappid = this.referrerInfo && this.referrerInfo.togame ? this.referrerInfo.togame : YouziDataModule.YouziData.appid;
            if (!YouziDataModule.YouziData._userinfo.uid) {
                YouziDataModule.YouziData._loadUid();
            }
            var param = {
                "logType": 'box2open',
                "channelId": YouziDataModule.YouziData.channelId,
                "orgAppid": oriappid,
                "uid": YouziDataModule.YouziData._userinfo.uid,
                "languageType": 1,
                "jumpAppid": jumpappid,
                "boxAppid": YouziDataModule.YouziData.appid,
                "locationIndex": YouziDataModule.BI_PAGE_TYPE.BUY_Screen,
                "recommendType": 1,
                "screenId": 1,
                "dt": curTime,
                "sdkVersion": YouziDataModule.YouziData.SdkVersion
            };
            console.log(param);
            YouziDataModule.YouziData.logNavigate(param, cb);
        };
        //落地页跳转
        YouziBoxManager.prototype.navigateToOtherGame = function (data, call) {
            if (!Laya.Browser.window.wx) {
                return;
            }
            var self = this;
            if (!YouziDataModule.YouziData._userinfo.uid) {
                YouziDataModule.YouziData._loadUid();
            }
            var curTime = YouziDataModule.YouziData.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
            var logtype = this.referrerInfo && this.referrerInfo.appid ? 'jump2app' : 'box2app';
            var oriappid = this.referrerInfo && this.referrerInfo.appid ? this.referrerInfo.appid : YouziDataModule.YouziData.appid;
            var cb = function (res) {
                console.log(logtype + ' event logged success---');
            };
            var youziUID = YouziDataModule.YouziData._userinfo.uid;
            var userType = this.referrerInfo.userType ? this.referrerInfo.userType : 1;
            var param = {
                "logType": logtype,
                "userType": userType,
                "channelId": YouziDataModule.YouziData.channelId,
                "orgAppid": oriappid,
                "uid": youziUID,
                "languageType": 1,
                "jumpAppid": data.appid,
                "boxAppid": this.referrerInfo.boxAppid ? this.referrerInfo.boxAppid : YouziDataModule.YouziData.appid,
                "locationIndex": data.locationIndex ? data.locationIndex : this.referrerInfo.locationIndex,
                "recommendType": 3,
                "screenId": 1,
                "dt": curTime,
                "sdkVersion": YouziDataModule.YouziData.SdkVersion
            };
            var desAppid = data.appid;
            var haveBoxAppId = false;
            var _boxId = YouziDataModule.YouziData.appid;
            if (data.boxAppId && data.boxAppId != YouziDataModule.YouziData.appid) {
                haveBoxAppId = true;
                desAppid = data.boxAppId;
                _boxId = desAppid;
            }
            var extraJson = {
                'togame': data.appid,
                'boxAppid': _boxId,
                'orgAppid': oriappid,
                'YouziFixUID': youziUID,
                'userType': userType
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
                    YouziDataModule.YouziData.logNavigate(param, cb);
                    if (call)
                        call('success');
                    console.log('box manager navigateToMiniProgram success');
                },
                fail: function (res) {
                    console.log('box manager navigateToMiniProgram fail');
                    if (call) {
                        call('fail');
                    }
                }
            });
        };
        YouziBoxManager.instance = null;
        return YouziBoxManager;
    }());
    YouziBoxManager_Module.YouziBoxManager = YouziBoxManager;
})(YouziBoxManager_Module || (YouziBoxManager_Module = {}));
