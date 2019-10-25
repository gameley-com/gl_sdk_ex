/**
 * 底部banner类型
 */
export const BANNER_TYPE=
    {
        MATRIX:1,   //矩阵banner (由服务器配置的热游列表进行滚动展示)
        WX:2,       //微信banner (由客户端配置微信bannerID后进行展示)
        GAME:3,     //游戏banner (由服务器配置的指定大banner展示页进行轮播展示)
        SWITCH:4    //矩阵banner 与 微信banner 进行来回切换展示(根据服务器配置时间间隔进行自动切换展示)
    };
/**
 * 手机类型
 */
const PHONE_TYPE=
    {
        ANDROID:2,  //安卓
        IOS:3       //苹果
    };
/**
 * 交叉营销开关枚举
 * 该开关控制抽屉类型(目前只控制抽屉)的显示和隐藏
 */
const PAGE_STATUS=
    {
        CLOSE:0,    //关闭
        OPEN:1,     //正常
        AUDIT:2,    //审核
        BUY:3       //买量
    };
/**
 * 打点位置枚举
 */
export const BI_PAGE_TYPE=
    {
        MAIN:1,       //主推
        FLOAT:2,      //抽屉
        MATRIX:3,     //矩阵banner
        GUESS:4,      //矩阵小banner
        MORE:5,       //矩阵墙
        GAME:6,       //游戏banner
        OFFLINE:7,    //离线banner
        BUY_Screen:8, //买量-落地页
        BUY_BOX:9,     //买量-盒子页
        SMALL_MATRIX_WALL: 10,  // 小矩阵墙
        CUSTOM_COMPONENT: 9999       // 自定义组件时，位置使用这个值

    };
/**
 * 交叉营销下行数据类型
 */
const PAGE_TYPE=
    {
        BANNER:1,       //旧轮播类型 废弃
        ITEMLIST:2,     //奖励列表类型
        HOT:3,          //抽屉
        MAIN:4,         //主推
        PAGE:5,         //底部大推荐图
        OFFLINE:6,      //离线推荐
        BUY:7,          //买量
        MORE: 8,         // 矩阵墙
        MATRIX_BANNER: 9   //矩阵banner类型(包含小banner)
    };

export var YouziData=
    {
        SdkVersion : '5.8.5',                                                                 //当前SDK版本
        resVersion : '1.00.00',                                                             //中心化资源版本
        debug : false,                                                                      //当前是否是测试服
        appid : '',                                                                         //渠道提供的appid
        channelId : 1002,                                                                   //管理后台提供的平台渠道
        bannnerDatas : [],                                                                  //交叉营销 轮播图类型列表
        itemListDatas : [],                                                                 //交叉营销 奖励类型列表
        hotListDatas : [],                                                                  //交叉营销 热游类型列表
        moreDatas: [],                                                                      //矩阵墙列表
        matrixBannerDatas: [],                                                              //矩阵banner列表
        mainRecDatas : [],                                                                  //交叉营销 主推类型列表
        buyListDatas : [],                                                                  //交叉营销 买量类型列表
        gameBannerDatas : [],                                                               //交叉营销 游戏banner类型列表
        offlineBannerDatas : [],                                                            //交叉营销 离线banner类型列表
        allBeRecommendGames: {},                                                            //盒子里所有被推广的游戏

        _userinfo:
            {
                uid:'',     //玩家唯一标识，发日志统一用这个
                gender:0,   //0未知,1男,2女
                type:1      //用户类型 1普通类型,2买量类型,3分享类型
            },
        _platform : cc.sys.os == cc.sys.OS_ANDROID ? PHONE_TYPE.ANDROID : PHONE_TYPE.IOS,    //当前平台
        _isDataLoaded : false,                //中心化下行数据是否完成
        _isLoadFinish : false,                //数据请求是否完成
        _requestErrorCbs: [],                 //请求失败后执行的操作
        _loadedCallBacks : [],                //中心化数据下行完成后,将数组中注册的函数进行回调
        _bannerType : BANNER_TYPE.MATRIX,     //底部banner显示的类型
        _banerShowSwitchInterval : 10,        //如果_bannerType是SWITCH类型 则该值表示切换间隔时间(秒)
        _bannerCreateInterval : 20,           //微信banner 该值控制微信banner自身的切换时间(秒)
        _pageOpen : PAGE_STATUS.OPEN,         //服务器配置的部分页面开关
        _bannerSwitchs : [],                  //已注册的所有banner节点 用于切换显示
        _provinceAllow : 1,                   //分省控制
        mainRecAmount: 1,                     //多个主推时，主推的数量，默认是1
        /**
         * 中心化初始化函数 调用一次即可
         * @param {string} appid 渠道提供的appid
         * @param {string} resVersion 中心化资源版本 默认'1.00.00'
         * @param {number} channelId 管理后台提供的平台渠道 默认1002微信
         */
        init(appid, resVersion, channelId)
        {
            if(this.isInit) return;
            console.log('中心化初始化 SdkVersion',this.SdkVersion,appid,resVersion,channelId)
            console.log(this.debug)
            this.isInit = true
            this.appid = appid || '';
            this.resVersion = resVersion || '1.00.00';
            this.channelId = channelId || 1002;
            this._loadUid();
            this._loadData(this._initBannerShow.bind(this));
            this._wxLaunch();

        },

        /**
         * 决定主推数量，用于界面一次创建多个主推的情况，规则如下：
         * a.客户端传来的节点数量m >= 后台配置主推数量n, 显示n个主推节点
         *    1.后台配置数量n >= 游戏数量p, 则显示p个节点，游戏不进行轮换
         *    2.后台配置数量n < 游戏数量p, 显示n个节点, 游戏进行随机轮换
         * b.客户端传来的节点数量m < 后台配置的主推数量n, 显示m个主推节点
         *    1.客户端传来的数量m >= 游戏数量p, 则显示p个节点，游戏不进行轮换
         *    2.客户端传来的数量m < 游戏数量p, 显示m个节点, 游戏进行随机轮换
         * @param nodes
         * @return [a,b] 返回一个数组，a: 需要创建的节点数量， b: true/false 是否进行游戏随机切换
         */
        getMainNum(nodes) {
            if (!nodes || nodes.length === 0) {
                return [0, false]
            }
            let m = nodes.length
            let n = YouziData.mainRecAmount
            let p = YouziData.mainRecDatas.length
            if (m >= n) {
                return n >= p ? [p, false] : [n, true]
            } else {
                return m >= p ? [p, false] : [m, true]
            }
        },

        /**
         * 获取指定数量的游戏下标（不重复）
         * @param num  游戏数量
         * @param showNum   要显示的游戏数量
         */
        getGamesIndex(num, showNum) {
            let arr = []
            for(let i = 0; i < num; i++) {
                arr.push(i)
            }
            if(num <= showNum) {
                return arr
            } else {
                let t, k
                while (num) {
                    k = Math.floor(Math.random()*num--);
                    t = arr[num];
                    arr[num] = arr[k];
                    arr[k] = t;
                }
                return arr.slice(0, showNum)
            }
        },

        _wxLaunch(){
            if (!window.wx)
            {
                return
            }else if(!wx.getLaunchOptionsSync)
            {
                return;
            }
            var self = this
            let wxLaunchOptions = wx.getLaunchOptionsSync()
            this._loadUid();
            this.checkUserIsImported(wxLaunchOptions)

            if(wxLaunchOptions.referrerInfo
                && wxLaunchOptions.referrerInfo.appId
                && wxLaunchOptions.referrerInfo.extraData
                && wxLaunchOptions.referrerInfo.extraData.boxAppid
                && wxLaunchOptions.referrerInfo.extraData.orgAppid){
                this.sendJumpToOpen(wxLaunchOptions.referrerInfo.extraData.orgAppid,wxLaunchOptions.referrerInfo.extraData.boxAppid,wxLaunchOptions.referrerInfo.extraData.locationIndex?wxLaunchOptions.referrerInfo.extraData.locationIndex:BI_PAGE_TYPE.CUSTOM_COMPONENT);
            } else {
                this.openGameInitLog()
            }

            wx.onShow(function(res){
                self._wxOnShow(res);
            });
        },
        _wxOnShow(wxOnShowRes){
            console.log('wx onShow--------------');
            this.checkUserIsImported(wxOnShowRes)
            if(wxOnShowRes.referrerInfo
                && wxOnShowRes.referrerInfo.extraData
                && wxOnShowRes.referrerInfo.extraData.boxAppid
                && wxOnShowRes.referrerInfo.extraData.orgAppid){
                this.sendJumpToOpen(wxOnShowRes.referrerInfo.extraData.orgAppid,wxOnShowRes.referrerInfo.extraData.boxAppid,wxOnShowRes.referrerInfo.extraData.locationIndex?wxOnShowRes.referrerInfo.extraData.locationIndex:BI_PAGE_TYPE.CUSTOM_COMPONENT);
            }
        },
        checkUserIsImported(res){
            if((res.referrerInfo && res.referrerInfo.adChannelId&&res.referrerInfo.adSubChannelId)||
                (res.query && res.query.adChannelId && res.query.adSubChannelId))
            {
                this._userinfo.type = 2
            }

            if((res.referrerInfo && res.referrerInfo.leuokShareIn)||
                (res.query && res.query.leuokShareIn))
            {
                this._userinfo.type = 3
            }

            var isNeedSaveUID = false

            let hasExtraData = res.referrerInfo && res.referrerInfo.extraData
            if(hasExtraData) {

                if (res.referrerInfo.extraData.YouziFixUID && res.referrerInfo.extraData.YouziFixUID.trim().length > 0) {
                    // 通过新版本跳转到新版本
                    isNeedSaveUID = true
                    this._userinfo.uid = res.referrerInfo.extraData.YouziFixUID
                } // 通过其它引擎或者cocoxcreator老版本跳转到新版本
                else if (res.referrerInfo.extraData.YouziUID && res.referrerInfo.extraData.YouziUID.trim().length > 0) {
                    isNeedSaveUID = true
                    this._userinfo.uid = res.referrerInfo.extraData.YouziUID

                }
                // 如果两者都没有，直接在_loadUid()方法里去取uid或者生成一个uid
            }

            if(res.query && res.query.extraData && res.query.extraData.YouziUID)
            {
                isNeedSaveUID = true
                this._userinfo.uid = res.query.YouziUID
            }

            if(isNeedSaveUID)
            {
                try {
                    localStorage.setItem('YOUZI_UID', this._userinfo.uid);
                } catch (e) {
                    console.log('set uid to localstorage fail! current uid: '+this._userinfo.uid)
                }
            }
        },
        _loadData(cb)
        {
            var self = this;
            let reqData = {
                "appid":self.appid,
                "channelId":self.channelId,
                "languageType":1,
                "uid":self._userinfo.uid,
                "version":self.resVersion
            };
            let errCb = function () {
                console.log('中心化数据异常')
                self._isLoadFinish = true
                for (let i = 0; i < self._requestErrorCbs.length; i++) {
                    const callback = self._requestErrorCbs[i];
                    if (callback) callback();
                }
            }
            var cb2 = function(res){
                let clone= JSON.parse(JSON.stringify(res))
                console.log('中心化数据OK',clone)
                // console.log('中心化数据加载完成',res);
                if(res && res.info && res.info.swith && res.info.swith==1)
                {
                    self._pageOpen = res.info.status;
                    self._bannerType = res.info.bannerSwith;
                    self._banerShowSwitchInterval = res.info.bannerAutoInterval;
                    self._bannerCreateInterval = res.info.wxBannerRefresh;
                    self._provinceAllow = res.info.provinceAllow;
                    self.mainRecAmount = res.info.mainRecAmount
                    let weight = function(a,b){return b.weight-a.weight;};
                    let clear = function (list)
                    {
                        list = list.sort(weight);
                        list = self._clearArrIndex(list);
                        list = self._removeItemByTestPeriod(list);
                        return list;
                    };

                    for(let i=0; i<res.info.recommendListBos.length; i++)
                    {
                        var data = res.info.recommendListBos[i];
                        data.contentBos.forEach(item => {
                            if(!self.allBeRecommendGames.hasOwnProperty.call({}, item.appid)) {
                                self.allBeRecommendGames[item.appid] = Object.assign({}, item)
                            }
                        })

                        switch (data.type)
                        {
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
                            default:
                                console.error('中心化数据类型错误',data.type);
                                break;
                        }
                    }
                }
                console.log(self.allBeRecommendGames)

                self._isDataLoaded = true;
                self._isLoadFinish = true

                if(cb) cb(res);
                for (let i = 0; i < self._loadedCallBacks.length; i++) {
                    const callback = self._loadedCallBacks[i];
                    if (callback) callback();
                }

                if (self._bannerType == BANNER_TYPE.SWITCH)
                {
                    self.refreshBannerSwitch()
                    setInterval(self.refreshBannerSwitch.bind(self),self._banerShowSwitchInterval*1000)
                }

            }
            self._getWxUserInfo(function()
            {
                self._request('POST', reqData, self._url(), cb2, errCb);
            });
        },
        _clearArrIndex(dataArray)
        {
            let arr1 = []
            for (let i = 0; i < dataArray.length; i++) {
                const data = dataArray[i];
                if (this._pushData(data.hide))
                {
                    arr1.push(data)
                }
            }

            let arr2 = []
            for (let i = 0; i < arr1.length; i++) {
                const data = arr1[i];
                if (this._pushDataBySexual(data.gender))
                {
                    arr2.push(data)
                }
            }

            return arr2;
        },
        _request(methon, data, url, cb, errCb)
        {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if(xhr.status >= 200 && xhr.status < 400) {
                        if(xhr.responseText!=''){
                            var res = JSON.parse(xhr.responseText);
                            if(cb){
                                cb(res)
                            }
                        }else{
                            if(cb){
                                cb({})
                            }
                        }
                    } else {
                        if (errCb) {
                            errCb()
                        }
                    }

                }
            }

            xhr.open(methon, url, true);
            //设置发送数据的请求格式
            xhr.setRequestHeader('content-type', 'application/json');
            xhr.send(JSON.stringify(data));
        },
        _loadUid()
        {
            try {
                let gen = function()
                {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                        return v.toString(16);
                    });
                }
                let uid = localStorage.getItem('YOUZI_UID');
                if (uid && uid.trim().length > 0)
                {
                    this._userinfo.uid = uid;
                }else
                {
                    this._userinfo.uid = gen();
                    localStorage.setItem('YOUZI_UID',this._userinfo.uid);
                }
            } catch (error) {
                this._userinfo.uid = '10001';
            }
        },
        _removeItemByTestPeriod(list)
        {
            //testPeriod 0通用,1测试期,2卖量CPA,3卖量CPS
            for(var i=0; i<list.length; i++)
            {
                var tmp = list[i]
                //测试期与下架同时判定，通用类型的游戏已经在后端处理了
                if((tmp.testPeriod==1||tmp.testPeriod==3) && tmp.showLimit==0)
                {
                    var navigatedMark = localStorage.getItem(tmp.appid);
                    if(navigatedMark&&navigatedMark=='navigated')
                    {
                        continue;
                    }
                    else
                    {
                        list.splice(i, 1);
                        i--;
                    }
                }
                //卖量判定
                else if(tmp.testPeriod==2)
                {
                    var cpacpsMark = localStorage.getItem(tmp.appid);
                    if(cpacpsMark&&cpacpsMark=='CPACPS')
                    {
                        list.splice(i, 1);
                        i--;
                    }
                }
            }
            return list;
        },
        _url()
        {
            return this.debug ? 'https://test.gw.leuok.com/gl-ms-mini-recommend/recommend/show' : 'https://gw.lightlygame.com/gl-ms-mini-recommend/recommend/show';
        },

        _pushData(hideType){
            let push = false;
            switch(hideType){
                case 1:
                    push = true;
                    break;
                case 2:
                    if(this._platform == PHONE_TYPE.ANDROID){
                        push = true;
                    }
                    break;
                case 3:
                    if(this._platform == PHONE_TYPE.IOS){
                        push = true;
                    }
                    break;
                default:
                    push = false;
                    break;
            }
            return push;
        },

        _pushDataBySexual(sexual){
            let pushSexual = false;
            switch(sexual){
                case 0:
                    pushSexual = true;
                    break;
                case 1://男
                    if(this._userinfo.gender == 1){
                        pushSexual = true;
                    }
                    break;
                case 2://女
                    if(this._userinfo.gender == 2){
                        pushSexual = true;
                    }
                    break;
                default:
                    pushSexual = false;
                    break;
            }
            return pushSexual;
        },
        _getWxUserInfo(call)
        {
            var self = this
            if(!window.wx){
                call()
                return;
            }else if(!wx.getUserInfo)
            {
                call()
                return;
            }

            wx.getUserInfo({
                success(res){
                    self._userinfo.gender = res.userInfo.gender;
                    call();
                    return;
                },
                fail(res){
                    call();
                }
            });
        },
        _loadTexture(sp,url)
        {
            cc.loader.loadRes(url, function (err, tex)
            {
                if (!err)
                {
                    sp.spriteFrame = new cc.SpriteFrame(tex);
                }else
                {
                    console.error(err)
                }
            });
        },
        //跳转
        startOtherGame(data,call,cancelCall){
            if(data.codeJump == 1){
                this.wxPreviewImage(data.chopencode || data.vopencode || data.hopencode,data,call);
            }else{
                this.navigateToOtherGame(data,call,cancelCall);
            }
        },
        //曝光日志
        sendExposureLog(data,locationIndex){
            if(!data)
            {
                console.warn('发送曝光日志时,data不存在',data,locationIndex)
                return
            }
            let curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss",new Date());
            let param =
                {
                    "logType":"exposure",
                    "channelId":this.channelId,
                    "orgAppid":this.appid,
                    "uid":this._userinfo.uid,
                    "languageType":1,
                    "jumpAppid":data.appid,
                    "locationIndex":locationIndex?locationIndex:BI_PAGE_TYPE.CUSTOM_COMPONENT,
                    "recommendType":data.type?data.type : 1,
                    "screenId":locationIndex?locationIndex:1,
                    "dt":curTime,
                    "sdkVersion": this.SdkVersion
                }
            let cb = function(res)
            {
                // console.log('log event exposure success---',param)
            }
            this.logNavigate(param, cb);
        },
        navigateToOtherGame(data,call,cancelCall){

            if(!window.wx){
                // if(cancelCall) {
                //     cancelCall()
                // }
                return;
            }else if(!wx.navigateToMiniProgram)
            {
                return;
            }
            var self = this
            let desAppid = data.appid
            let haveBoxAppId = false;
            let _boxId = 'leuokNull';
            if(data.boxAppId && data.boxAppId!=''){
                haveBoxAppId = true;
                desAppid = data.boxAppId;
                _boxId = desAppid;
            }

            let extraJson = {
                'togame' : data.appid,
                'boxAppid' : _boxId,
                'orgAppid' : self.appid,
                'YouziUID' : self.uid,
                'YouziFixUID' : self._userinfo.uid,
                'userType' : self._userinfo.type,
                'locationIndex': data.locationIndex
            };
            //获取小程序路径
            let littleProgramPath = null;
            if(data.miniProgramArgs && data.miniProgramArgs != ''){
                littleProgramPath = data.miniProgramArgs;
            }

            if(data.anChannelId || data.ioChannelId){
                if(littleProgramPath != null){
                    littleProgramPath = littleProgramPath + "&anChannelId="+data.anChannelId + "&ioChannelId=" +data.ioChannelId;
                }else{
                    littleProgramPath = "?anChannelId="+data.anChannelId + "&ioChannelId=" +data.ioChannelId;
                }
            }

            console.log('mimiProgramPath:' + littleProgramPath);
            //获取联运小游戏附加key名和对应value值
            if(data.miniGameArgs && data.miniGameArgs != ''){
                let addJson = JSON.parse(data.miniGameArgs);
                //获取json中所有key名
                let addJsonKeyArr = Object.keys(addJson);
                //去第一个key名
                let key0 = addJsonKeyArr[0];
                if(key0 == 'togame' || key0 == 'boxAppid' || key0 == 'orgAppid'){
                    console.log('联运附加key值冲突');
                    return;
                }
                //往extraJson添加新属性
                extraJson[key0] = addJson[key0];
            }

            console.log('extraData'+JSON.stringify(extraJson));

            wx.navigateToMiniProgram(
                {
                    appId : desAppid,
                    path : littleProgramPath,
                    extraData : extraJson,
                    success(result)
                    {
                        if(haveBoxAppId){
                            self.sendGameToBox(data);
                        }else{
                            self.sendGameToGame(data);
                        }
                        haveBoxAppId = false;
                        if(call) call();
                        console.log('navigateToMiniProgram success');
                        //测试期产品用户跳转标记
                        if(data.testPeriod && data.testPeriod == '1'){
                            localStorage.setItem(data.appid, 'navigated')
                        }else if(data.testPeriod == '2')
                        {
                            localStorage.setItem(data.appid, 'CPACPS')
                        }
                    },
                    fail() {
                        if(cancelCall) {
                            console.log('cancel jump to other game!')
                            try {
                                cancelCall()
                            }catch(e) {
                                console.log('open failed')
                            }
                        }
                    }
                });
        },
        sendJumpToOpen(orgAppId,boxAppId,locationIndex=BI_PAGE_TYPE.CUSTOM_COMPONENT){
            let type = 'jump2open';//小游戏跳转到盒子
            if(boxAppId == 'leuokNull'){
                type = 'app2open';//小游戏直接跳小游戏
                boxAppId = '';
            }
            let cb = function(res){
                console.log('log event sendJumpToOpen success---')
            }
            let curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss",new Date());
            let param =
                {
                    "logType":type,
                    "userType":this._userinfo.type,
                    "channelId":this.channelId,
                    "orgAppid":orgAppId,
                    "boxAppid":boxAppId,
                    "uid":this._userinfo.uid,
                    "languageType":1,
                    "jumpAppid":this.appid,
                    "locationIndex":locationIndex,
                    "recommendType":1,
                    "screenId":1,
                    "dt":curTime,
                    "sdkVersion": this.SdkVersion
                }
            console.log(param);
            this.logNavigate(param, cb);
        },

        openGameInitLog() {
            let cb = function(){
                console.log('log event sendYouziSdk init success---')
            }
            let curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss", new Date());
            let param =
                {
                    "logType":"login",
                    "channelId":this.channelId,
                    "orgAppid":this.appid,
                    "uid":this._userinfo.uid,
                    "dt":curTime,
                    "sdkVersion": this.SdkVersion
                }
            this.logNavigate(param, cb);
        },
        sendGameToGame(_data){
            let curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss",new Date());
            let cb = function(res)
            {
                console.log('log event success---')
            }
            let param =
                {
                    "logType":"app2app",
                    "userType":this._userinfo.type,
                    "channelId":this.channelId,
                    "orgAppid":this.appid,
                    "uid":this._userinfo.uid,
                    "languageType":1,
                    "jumpAppid":_data.appid,
                    "locationIndex":_data.locationIndex,
                    "recommendType":_data.type,
                    "screenId":1,
                    "dt":curTime,
                    "sdkVersion": this.SdkVersion
                }
            console.log(param)
            this.logNavigate(param, cb);
        },
        sendGameToBox(_data){
            let curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss",new Date());
            let cb = function(res)
            {
                console.log('log event success---')
            }
            let param =
                {
                    "logType":"jump2box",
                    "userType":this._userinfo.type,
                    "channelId":this.channelId,
                    "orgAppid":this.appid,
                    "uid":this._userinfo.uid,
                    "languageType":1,
                    "boxAppid":_data.boxAppId,
                    "jumpAppid":_data.appid,
                    "locationIndex":_data.locationIndex,
                    "recommendType":_data.type,
                    "screenId":1,
                    "dt":curTime,
                    "sdkVersion": this.SdkVersion
                }
            console.log(param)
            this.logNavigate(param, cb);
        },
        wxPreviewImage(qrCodeimageUrl,data,call){
            let self = this;
            wx.previewImage({
                current:qrCodeimageUrl,
                urls:[qrCodeimageUrl],
                success:function(){
                    if(call) call();
                    self.sendGameByQrcode(data);
                }
            });
        },
        sendGameByQrcode(_data){
            let curTime = this.YouziDateFtt("yyyy-MM-dd hh:mm:ss",new Date());
            let cb = function(res)
            {
                console.log('log event success---')
            }
            let param =
                {
                    "logType":"showcode",
                    "userType":this._userinfo.type,
                    "channelId":this.channelId,
                    "orgAppid":this.appid,
                    "uid":this._userinfo.uid,
                    "languageType":1,
                    "jumpAppid":_data.appid,
                    "locationIndex":_data.locationIndex,
                    "recommendType":_data.type,
                    "screenId":1,
                    "dt":curTime,
                    "sdkVersion": this.SdkVersion
                }
            console.log(param)
            this.logNavigate(param, cb);
        },
        logNavigate(reqData, cb){
            console.log('send log')
            if(!this.debug) {
                this._request('POST', reqData, 'https://bi.log.lightlygame.com/recommend/', cb);
            }
        },
        YouziDateFtt(fmt,date) {
            var o = {
                "M+" : date.getMonth()+1,                 //月份
                "d+" : date.getDate(),                    //日
                "h+" : date.getHours(),                   //小时
                "m+" : date.getMinutes(),                 //分
                "s+" : date.getSeconds(),                 //秒
                "q+" : Math.floor((date.getMonth()+3)/3), //季度
                "S"  : date.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt))
                fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            for(var k in o)
                if(new RegExp("("+ k +")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            return fmt;
        },

        getDatasByBIType(locationIndex)
        {
            if (locationIndex==1) {
                return this.mainRecDatas;
            }else if(locationIndex==2)
            {
                return this.hotListDatas;
            }else if (locationIndex === 3 || locationIndex==4) {
                return this.matrixBannerDatas
            }
            else if (locationIndex === 5 || locationIndex === 10) {
                return this.moreDatas
            }
            else if (locationIndex==6)
            {
                return this.gameBannerDatas;
            }else if (locationIndex==7)
            {
                return this.offlineBannerDatas;
            }else if (locationIndex==8 || locationIndex==9) {return this.buyListDatas;}

            console.error('未找到中心化数据 locationIndex',locationIndex);
            return []
        },

        _initBannerShow()
        {

            if (this._bannerType == BANNER_TYPE.MATRIX || this._bannerType == BANNER_TYPE.GAME || this._bannerType == BANNER_TYPE.WX)
            {
                for (let i = 0; i < this._bannerSwitchs.length; i++) {
                    const banner = this._bannerSwitchs[i];
                    if(banner && banner.bannerType == this._bannerType)
                    {
                        banner.showBanner()
                    }else if(banner)
                    {
                        banner.hideBanner()
                    }
                }
            }else if(this._bannerType == BANNER_TYPE.SWITCH)
            {
                for (let i = 0; i < this._bannerSwitchs.length; i++) {
                    const banner = this._bannerSwitchs[i];
                    if(banner && banner.bannerType == BANNER_TYPE.MATRIX)
                    {
                        banner.showBanner()
                    }else if(banner)
                    {
                        banner.hideBanner()
                    }
                }
            }
        },

        addBanner(banner)
        {
            this._destroyUnuseWxBanner(banner)
            this._bannerSwitchs.push(banner)
            //如果banner是后续加入的 立刻刷新显示
            if (this._isDataLoaded)
            {
                this._initBannerShow()
            }
        },

        refreshBannerSwitch()
        {
            if (!this.curBannerType)
            {
                this.curBannerType = BANNER_TYPE.WX
            }
            this.curBannerType = this.curBannerType == BANNER_TYPE.WX ? BANNER_TYPE.MATRIX : BANNER_TYPE.WX

            for (let i = 0; i < this._bannerSwitchs.length; i++) {
                let banner = this._bannerSwitchs[i];
                if(banner && banner.bannerType == this.curBannerType)
                {
                    banner.showBanner()
                }else if(banner)
                {
                    banner.hideBanner()
                }
            }
        },
        /**
         * 微信banner 有且只有一个
         */
        _destroyUnuseWxBanner(b)
        {
            if (b.bannerType == BANNER_TYPE.WX)
            {
                for (let i = 0; i < this._bannerSwitchs.length; i++) {
                    let banner = this._bannerSwitchs[i];
                    if(banner && banner.bannerType == BANNER_TYPE.WX)
                    {
                        banner.destroySelf()
                        this._bannerSwitchs.splice(i,1)
                        return
                    }
                }
            }
        },
        _checkExposureInview(cellNodes, limitx, limity, datas,locationIndex){
            let sended = []
            for(var i=0; i<cellNodes.length; i++)
            {
                let child = cellNodes[i]
                let data = this._getDataByAppid(datas,child.name)

                if (!data)
                {
                    console.warn('数据丢失 appid:',child.name)
                    continue;
                }
                let tempPos = child.convertToWorldSpace(cc.v2(0, 0))
                if (limitx)//0认为是忽略x轴判断
                {
                    if(tempPos.x<limitx)
                    {
                        this.sendExposureLog(data,locationIndex);
                        sended.push(data.appid);
                    }
                }else if(limity)
                {
                    if(tempPos.y>limity)
                    {
                        this.sendExposureLog(data,locationIndex);
                        sended.push(data.appid);
                    }
                }
            }
            return sended
        },
        _checkExposureInview1(cellNodes, isVerticle, datas, locationIndex, minX, maxX, minY, maxY){
            let sendedCount = 0
            for(var i=0; i<cellNodes.length; i++)
            {
                let child = cellNodes[i]
                let data = this._getDataByAppid(datas,child.name)

                if (!data)
                {
                    console.warn('数据丢失 appid:',child.name)
                    continue;
                }
                // console.log('child.x-->'+child.x)
                let tempPos = child.convertToWorldSpaceAR(cc.v2(-child.width/2, child.height/2))
                if (!isVerticle)//0认为是忽略x轴判断
                {
                    if(tempPos.x>=minX && tempPos.x<=maxX)
                    {
                        this.sendExposureLog(data,locationIndex);
                        sendedCount++
                    }
                }else
                {
                    if(tempPos.y >= minY && tempPos.y<=maxY)
                    {
                        this.sendExposureLog(data,locationIndex);
                        sendedCount++
                    }
                }
            }
            return sendedCount
        },
        _hideShowChild(children, isVerticle, minX, maxX, minY, maxY, hideChild = true) {
            if(children.length<5)
            {
                return
            }
            let child
            let tempPos
            for(let j=0; j<children.length; j++) {
                child = children[j].children[0]
                tempPos = child.convertToWorldSpaceAR(cc.v2(-child.width/2, child.height/2))
                if (!isVerticle)//0认为是忽略x轴判断
                {
                    if(tempPos.x>=minX && tempPos.x<=maxX)
                    {
                        child.active = true
                    } else {
                        if (hideChild) {
                            child.active = false
                        }
                    }
                }else
                {
                    if(tempPos.y >= minY && tempPos.y<=maxY)
                    {
                        child.active = true
                    } else {
                        if (hideChild) {
                            child.active = false
                        }
                    }
                }
            }
        },


        /**
         * 根据appid获取被推广游戏的信息
         * @param appid
         * @returns {*}
         */
        getDataFromAllGameObj(appid) {
            return this.allBeRecommendGames[appid]
        },

        _getDataByAppid(datas,appid)
        {
            for (let i = 0; i < datas.length; i++) {
                if(datas[i].appid == appid)
                {
                    return datas[i]
                }
            }
            return null
        },
        /**
         * 滚动列表滚动动画
         * @param {cc.ScrollView} scrollView
         * @param {number} speed 滚动速度 越小速度越快
         * @param {number} limit 少于该数量不滚动
         * @param {number} durTime 间时
         */
        scrollviewAction(scrollView,speed,limit,durTime)
        {
            if (scrollView && scrollView.content)
            {
                let iconLength = scrollView.content.children.length
                if(iconLength<=limit){
                    return
                }
                let dur
                if(durTime) {
                    dur = durTime
                } else {
                    dur = speed*(iconLength-1)
                }

                let isVertical = scrollView.vertical
                let actionCallback = function () {
                    if (!(scrollView && scrollView.content)) {
                        return
                    }
                    if(isVertical){
                        if(scrollView.getScrollOffset().y > scrollView.getMaxScrollOffset().y/2){
                            scrollView.scrollToTop(dur, false)
                        }else{
                            scrollView.scrollToBottom(dur, false)
                        }
                    }else{
                        if(scrollView.getScrollOffset().x < -scrollView.getMaxScrollOffset().x/2){
                            scrollView.scrollToLeft(dur, false)
                        }else{
                            scrollView.scrollToRight(dur, false)
                        }
                    }
                }
                scrollView.node.stopAllActions()
                scrollView.node.runAction(cc.repeatForever(cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(actionCallback),
                    cc.delayTime(dur-1)
                )))
            }
        },

        BI_AppOnce(params)
        {
            let BI = this.getBI()
            if (BI && BI.leuok)
            {
                BI.leuok.appOnce(params)
            }
        },
        BI_Action(params)
        {
            let BI = this.getBI()
            if (BI && BI.leuok)
            {
                BI.leuok.action(params)
            }
        },
        BI_WXBannerError(params)
        {
            let BI = this.getBI()
            if (BI && BI.leuok)
            {
                BI.leuok.error(params)
            }
        },
        getBI()
        {
            if (typeof wx !== 'undefined')
            {
                return wx
            }else if(typeof BK !== 'undefined')
            {
                return BK
            }else if(typeof qg !== 'undefined')
            {
                return qg
            }else if(typeof window !== 'undefined')
            {
                return window
            }
        }
    };
window.YouziData = YouziData;
