module YouziGameBanner_Module
{
    export class YouziGameBanner extends ui.youzi.Youzi_GameBannerUI
    {
        private isOffSwitch = false;
        private bannerType:number = YouziDataModule.BANNER_TYPE.GAME;
        private switchTime = 5;
        private gameBannerItemExposure = {};
        private startSwitchIndex = 0;
        private isHide = false;
        private uiCompleteCallCopy:Function = null;
        private uiStateCallCopy:Function = null;

        constructor(isOffSwitch,switchTime)
        {
            super();
            this.pos(Laya.stage.width/2-this.GameBannerList.width/2,Laya.stage.height-this.GameBannerList.height);
            this.visible = false;
            this.GameBannerList.scrollBar.hide = true;
            this.isOffSwitch = isOffSwitch;
            this.switchTime = switchTime < 5 ? 5:switchTime;
            this.switchTime *= 1000;
        }

        setYouziPosition(x:number,y:number)
        {
            this.pos(x,y);
        }

        //传入UI是否创建完成通知对象
        setUICompleteCall(uiCompleteCall:Function)
        {
            this.uiCompleteCallCopy = uiCompleteCall;
        }
        
        /**通知UI已创建完毕
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        private notifyUIComplete(uiID,msg)
        {
            if(this.uiCompleteCallCopy)
            {
                this.uiCompleteCallCopy(uiID,msg);
            }
        }

        offUICompleteCall(){
            if(this.uiCompleteCallCopy)
            {
                this.uiCompleteCallCopy = null;
            }
        }

        setUIStateCall(uiStateCall:Function)
        {
            this.uiStateCallCopy = uiStateCall;
        }

        /**通知UI界面状态
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        private notifyUIState(uiID,msg)
        {
            if(this.uiStateCallCopy)
            {
                this.uiStateCallCopy(uiID,msg);
            }
        }

        offUIStateCall(){
            if(this.uiStateCallCopy){
                this.uiStateCallCopy = null;
            }
        }

        onMyStart()
        {
            var gameBannerDatasOk = YouziDataModule.YouziData._isDataLoaded;
            if(gameBannerDatasOk)
            {
                this.initShow();
            }
            else
            {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        }

        private initShow()
        {
            if(YouziDataModule.YouziData.gameBannerDatas.length <=0 )
                return;
            this.loadGameBannerList();
            this.startGameBannerTimerLoop();
            if(!this.isOffSwitch)
            {
                YouziDataModule.YouziData.addBanner(this);
            }
        }

        private loadGameBannerList()
        {
            var gameBannerArr:Array<any> = [];
            for(var i=0; i<YouziDataModule.YouziData.gameBannerDatas.length; i++)
            {
                gameBannerArr.push({infoData:YouziDataModule.YouziData.gameBannerDatas[i]});
            }
            this.GameBannerList.array = gameBannerArr;
            this.GameBannerList.renderHandler = new Handler(this,this.onListRender);
            this.GameBannerList.mouseHandler = new Handler(this,this.onGameBannerItemMouseEvent);
            this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_GameBanner,{complete:true});
        }

        private onListRender(item: Laya.Box, index: number) :void 
        {
            // console.log('------->render gamebanner : ',index);
            var gameBannerImage:Laya.Image = item.getChildByName('icon') as Laya.Image;
            gameBannerImage.loadImage(YouziDataModule.YouziData.gameBannerDatas[index].bannerImg);
        }

        startGameBannerTimerLoop()
        {
            if(this && this.visible)
                Laya.timer.loop(this.switchTime,this,this.updateGameBaner);
        }

        clearGameBannerTimerLoop()
        {
            if(this)
                Laya.timer.clear(this,this.updateGameBaner);
        }

        private updateGameBaner(e:Event)
        {
            if(YouziDataModule.YouziData.gameBannerDatas.length <=1){
                this.checkExposure();
                return;
            }else{
                this.startSwitchIndex = this.GameBannerList.startIndex+1;
                this.GameBannerList.scrollTo(this.startSwitchIndex>=this.GameBannerList.length?0:this.startSwitchIndex);
                this.checkExposure();
            }     
        }

        private checkExposure()
        {
            if(this.visible)
            {
                var data = YouziDataModule.YouziData.gameBannerDatas[this.startSwitchIndex]
                if(!this.gameBannerItemExposure[data.appid]){
                    this.gameBannerItemExposure[data.appid] = 1;
                    YouziDataModule.YouziData.sendExposureLog(data, YouziDataModule.BI_PAGE_TYPE.GAME);
                }
            }
        }

        private onGameBannerItemMouseEvent(e:Event, index: number)
        {
            if(e.type == 'mousedown'){
    
            }else if(e.type == 'mouseup'){
                console.log("当前选择的gamebannerlist索引：" + index);
                var tmpData = YouziDataModule.YouziData.gameBannerDatas[index];
                tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.GAME;
                YouziDataModule.YouziData.startOtherGame(tmpData,null);  
            }else if(e.type == 'mouseover'){
            
            }
        }

        showBanner()
        {
            if(this)
            {
                this.visible = true;
                if(this.isHide){
                    this.isHide = false;
                    this.startGameBannerTimerLoop();
                }
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_GameBanner,{uiVisible:true});    
            }
        }

        hideBanner()
        {
            if(this)
            {
                this.isHide = true;
                this.visible = false;
                this.clearGameBannerTimerLoop();
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_GameBanner,{uiVisible:false});    
            }
            
        }

        destroySelf()
        {
            if(this){
                this.removeSelf();
            }
        }

    }
}