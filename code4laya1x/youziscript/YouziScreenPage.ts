module YouziScreenPage_Module{
    export class YouziScreenPage extends ui.youzi.Youzi_ScreenPageUI
    {

        private gotoGameListenTemp:Function = null;
        private launch = null;
        private loadErrParamInfo = {
            anChannelId:null,
            ioChannelId:null,
            appid:null
        };
        private luodiInfo = {
            anChannelId:null,
            ioChannelId:null,
            appid:null
        };
        
        constructor(wxLaunch)
        {
            super();
            this.LuoDi.visible = false;
            this.luoDiBtn.visible = false;
            this.launch = wxLaunch;
        }

        registerGoToGameListen(gotoGameListen:Function)
        {
            this.gotoGameListenTemp = gotoGameListen;
        }

        private notifyGoToGame()
        {
            if(this.gotoGameListenTemp){
                this.gotoGameListenTemp();
                this.gotoGameListenTemp = null;
            }
                
        }

        onMyStart()
        {
            var screenPageDataOk = YouziDataModule.YouziData._isDataLoaded;
            if(screenPageDataOk)
            {
                this.initShow();
            }
            else
            {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
                if(YouziDataModule.YouziData._isLoadFinish)
                {
                    this.loadErrHandle();
                }
                else
                {
                    YouziDataModule.YouziData._requestErrorCbs.push(this.loadErrHandle.bind(this));
                }
            }
        }

        private loadErrHandle()
        {

            console.log('launch---'+JSON.stringify(this.launch))
            if(this.launch.query && this.launch.query.anChannelId)
            {
                this.loadErrParamInfo.anChannelId = this.launch.query.anChannelId
                this.loadErrParamInfo.ioChannelId = this.launch.query.ioChannelId
            }
            if(this.launch.referrerInfo && this.launch.referrerInfo.extraData && this.launch.referrerInfo.extraData.togame)
            {
                this.loadErrParamInfo.appid = this.launch.referrerInfo.extraData.togame
                this.luodiInfo = this.loadErrParamInfo;
                console.log('jump info--'+this.loadErrParamInfo);
                this.LuoDi.visible = true;
            } else {
                this.goGame();
            }
        }

        private initShow()
        {
            this.PageBtn.on(Laya.Event.CLICK,this,this.btnLuoDiClick);
            if(Laya.Browser.window.wx){
                if(this.launch){
                    YouziBoxManager_Module.YouziBoxManager.getInstance().wxLaunch(this.launch);
                    this.initUI(this.launch);
                }
                Laya.Browser.window.wx.onShow(this.wxOnShowCb.bind(this));
            }else{
                this.goGame();
            }
        }

        private wxOnShowCb(res){
            YouziBoxManager_Module.YouziBoxManager.getInstance().wxOnShow(res);
            this.initUI(res);
        }

        private initUI(launch)
        {
            let togameAppId = YouziBoxManager_Module.YouziBoxManager.getInstance().referrerInfo.togame;
            if(togameAppId)
            {
                let data = YouziDataModule.YouziData.getDataFromAllGameObj(togameAppId)
                if (data)
                {
                    this.luodiInfo = data
                    //合并从推广游戏跳进普通盒子的游戏来源渠道
                    if(launch.query &&launch.query.anChannelId)
                    {
                    this.luodiInfo.anChannelId = launch.query.anChannelId
                    this.luodiInfo.ioChannelId = launch.query.ioChannelId
                    }
                    this.showLuoDi(data.newPush,data.iconImg)
                }
                else
                {
                    console.log('没发现落地页data',togameAppId)
                    this.goGame()
                }
            }
            else
            {
                console.log('没发现落地页appid')
                this.goGame()
            }
        }

        private showLuoDi(bigUrl,smallUrl)
        {
            if(bigUrl)
            {
                var boxWxDeviceInfo = Laya.Browser.window.wx.getSystemInfoSync();
                var boxWxWidth = boxWxDeviceInfo.screenWidth;
                var boxWxHeight = boxWxDeviceInfo.windowHeight;
                var boxWH = 0;
                if(boxWxWidth > boxWxHeight){
                    boxWH = boxWxWidth / boxWxHeight;
                }else{
                    boxWH = boxWxHeight / boxWxWidth;
                }
                if(boxWH < 1.9){
                    this.Big.loadImage(bigUrl);
                }else{
                    this.Big.loadImage(bigUrl,0,-100,boxWxWidth*2,boxWxHeight*2);
                }
                this.LuoDi.visible = true;
                YouziBoxManager_Module.YouziBoxManager.getInstance().sendBox2Open();
            }
            else if(smallUrl)
            {
                this.Small.loadImage(smallUrl,0,0,300,300);
                this.LuoDi.visible = true;
                this.luoDiBtn.visible = true;
                YouziBoxManager_Module.YouziBoxManager.getInstance().sendBox2Open();
            }
            else
            {
                this.closeLuoDi();
            }
        }

        private btnLuoDiClick()
        {
            var btnLuoDiClickSelf = this;
            console.log('点击落地页 即将跳转:',this.luodiInfo.appid);
            if(this.luodiInfo.appid){
                var luodiToOtherCb = function(res){
                    btnLuoDiClickSelf.closeLuoDi();
                }
                YouziBoxManager_Module.YouziBoxManager.getInstance().navigateToOtherGame(this.luodiInfo,luodiToOtherCb);
            }else{
                this.closeLuoDi();
            }
        }

        private closeLuoDi()
        {
            if(this.LuoDi.visible){
                this.LuoDi.visible = false;
            }
            this.goGame();
        }

        private goGame()
        {
            this.notifyGoToGame();
        }

    }
}