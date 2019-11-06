var YouziWeChatBanner_Module;
(function (YouziWeChatBanner_Module) {
    YouziWeChatBanner_Module.WECHAT_BANNER_POSTYPE = {
        BOTTOM: 1,
        TOP: 2 //微信banner广告放在顶部
    };
    var YouziWeChatBanner = /** @class */ (function () {
        /**
         *
         * @param {string} wechatBannerID 微信banner广告id
         * @param {number} posType 微信banner广告位置类型,1为底部，2为顶部，默认为1
         * @param {json} offset json，格式{x:10,y:10}，key值为number，控制微信banner广告位置的偏移量，默认{x:0,y:0}
         * @param {bool} isOffSwich true:微信banner广告显示鱼隐藏有中心化sdk控制；false:微信banner广告的显示与隐藏，有游戏自己控制，中心化sdk不在进行显示隐藏、切换等任何控制
         * @param isOffSwitchSelf 微信banner广告是否自动更换。true交由中心化sdk调用switchBannerNow进行更换自身显示的内容
         */
        function YouziWeChatBanner(wechatBannerID, posType, offset, isOffSwich, isOffSwitchSelf) {
            if (posType === void 0) { posType = null; }
            if (offset === void 0) { offset = null; }
            if (isOffSwich === void 0) { isOffSwich = false; }
            if (isOffSwitchSelf === void 0) { isOffSwitchSelf = false; }
            this.isLoadOk = false;
            this.adUnitId = null;
            this.posType = 1;
            this.offset = {
                x: 0,
                y: 0
            };
            this.bannerType = YouziDataModule.BANNER_TYPE.WX;
            this.isShowBanner = false;
            this.isOffSwitch = false;
            this.isOffSwitchSelf = false;
            this.bannerAd = null;
            this.refreshTimer = null;
            this.adUnitId = wechatBannerID;
            this.posType = posType || 1;
            this.offset = offset || { x: 0, y: 0 };
            this.isOffSwitch = isOffSwich;
            this.isOffSwitchSelf = isOffSwitchSelf;
            this.initShow();
        }
        YouziWeChatBanner.prototype.initShow = function () {
            this.isLoadOk = YouziDataModule.YouziData._isDataLoaded;
            if (this.isLoadOk) {
                this.freshShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.freshShow.bind(this));
            }
        };
        YouziWeChatBanner.prototype.freshShow = function () {
            this.createWXBanner();
            if (!this.isOffSwitch) {
                YouziDataModule.YouziData.addBanner(this);
                this._autoSwitchSelf();
            }
        };
        YouziWeChatBanner.prototype.createWXBanner = function () {
            if (!Laya.Browser.window.wx) {
                return;
            }
            else if (!Laya.Browser.window.wx.createBannerAd) {
                return;
            }
            var self = this;
            var screenWidth = Laya.Browser.window.wx.getSystemInfoSync().screenWidth;
            var screenHeight = Laya.Browser.window.wx.getSystemInfoSync().screenHeight;
            var designWidth = Laya.stage.designWidth;
            var designHeight = Laya.stage.designHeight;
            var rateHeight = (screenWidth / designWidth) * designHeight;
            var minHeight = 100 * (screenWidth / designWidth) + (screenHeight - rateHeight) / 2;
            self.bannerAd = Laya.Browser.window.wx.createBannerAd({
                adUnitId: this.adUnitId,
                style: {
                    left: this.offset.x,
                    top: this.offset.y,
                    width: screenWidth
                }
            });
            var oldBannerAd = self.bannerAd;
            var isSetWidth = false;
            self.bannerAd.onResize(function (res) {
                if (isSetWidth) {
                    return;
                }
                if (self.bannerAd.style.realHeight > minHeight) {
                    isSetWidth = true;
                    var width = screenWidth * minHeight / self.bannerAd.style.realHeight;
                    width = YouziDataModule.YouziData.miscClampf(width, 300, 9999);
                    self.bannerAd.style.width = width;
                    self.bannerAd.style.top = screenHeight - self.bannerAd.style.realHeight * (width / self.bannerAd.style.realWidth) + self.offset.y;
                    self.bannerAd.style.left = (screenWidth - self.bannerAd.style.width) / 2 + self.offset.x;
                }
                else {
                    self.bannerAd.style.top = screenHeight - self.bannerAd.style.realHeight + self.offset.y;
                    if (screenHeight / screenWidth > 2) {
                        self.bannerAd.style.top = self.bannerAd.style.top - 34 + self.offset.y;
                    }
                }
                if (self.posType == YouziWeChatBanner_Module.WECHAT_BANNER_POSTYPE.TOP) {
                    self.bannerAd.style.left = (screenWidth - self.bannerAd.style.width) / 2 + self.offset.x;
                    self.bannerAd.style.top = self.offset.y;
                    if (screenHeight / screenWidth > 2) {
                        self.bannerAd.style.top += 76;
                    }
                    else if (screenWidth / screenHeight > 2) {
                        self.bannerAd.style.top += 76;
                    }
                }
            });
            self.bannerAd.onLoad(function (res) {
                if (oldBannerAd) {
                    oldBannerAd.hide();
                    oldBannerAd.destroy();
                }
                if (self.isShowBanner) {
                    self.bannerAd.show();
                }
                else {
                    self.bannerAd.hide();
                }
            });
            self.bannerAd.onError(function (err) {
                console.warn('微信banner广告出错', err);
            });
        };
        YouziWeChatBanner.prototype.showBanner = function () {
            this.isShowBanner = true;
            if (this.bannerAd) {
                this.bannerAd.show();
            }
        };
        YouziWeChatBanner.prototype.hideBanner = function () {
            this.isShowBanner = false;
            if (this.bannerAd) {
                this.bannerAd.hide();
            }
        };
        YouziWeChatBanner.prototype.destroySelf = function () {
            if (this.bannerAd) {
                this.bannerAd.destroy();
                this.bannerAd = null;
            }
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
            this.isShowBanner = false;
        };
        YouziWeChatBanner.prototype.switchBannerNow = function () {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
            this.createWXBanner();
            this._autoSwitchSelf();
        };
        YouziWeChatBanner.prototype._autoSwitchSelf = function () {
            if (!this.isOffSwitchSelf) {
                var self2 = this;
                this.refreshTimer = setInterval(function () {
                    self2.createWXBanner();
                }, YouziDataModule.YouziData._bannerCreateInterval * 1000);
            }
        };
        return YouziWeChatBanner;
    }());
    YouziWeChatBanner_Module.YouziWeChatBanner = YouziWeChatBanner;
})(YouziWeChatBanner_Module || (YouziWeChatBanner_Module = {}));
