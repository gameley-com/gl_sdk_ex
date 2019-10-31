
module YouziBottomBanner_Module
{
    export class YouziBottomBanner extends ui.youzi.Youzi_BottomBannerUI
    {
        private bannerType:number = 0;
        private bannerBottomItemExposure = {};
        //false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
        private isOffSwitch = false;

        private stopAction = false;
        private curFront = true;
        private curBack = false;
        private isClick = false;
        private dur = 10;

        private uiCompleteCallCopy:Function = null;
        private uiStateCallCopy:Function = null;

        constructor(isOffSwitch)
        {
            super();
            this.pos(Laya.stage.width/2-this.BannerBottomUI.width,Laya.stage.height-this.BannerBottomUI.height);
            this.visible = false;
            this.BannerBottomUI.visible = false;    
            this.bottomList.scrollBar.hide = true;
            this.isOffSwitch = isOffSwitch;
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

        offUICompleteCall()
        {
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
            var isBottomDataOk = YouziDataModule.YouziData._isDataLoaded;
            if(isBottomDataOk){
                this.initShow();
            }else{
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        }

        private initShow()
        {

            if(YouziDataModule.YouziData.matrixBannerDatas.length <= 0){
                console.log('中心化-底部推荐无数据');
                return;
            }
            this.loadBottomList();
            if(!this.isOffSwitch){
                YouziDataModule.YouziData.addBanner(this);
            }
        }

        loadBottomList()
        {
            // this.bottomList.repeatX = this.matrixBannerDatas.length;
            var arr:Array<any> = [];
            var pRecord = null;
            for(var i:number = 0; i<YouziDataModule.YouziData.matrixBannerDatas.length;i++){
                pRecord = YouziDataModule.YouziData.matrixBannerDatas[i];
                if(pRecord.dynamicType == 1 && pRecord.dynamicIcon){
                    arr.push({namelab:pRecord.title});
                }else{
                    arr.push({icon:pRecord.iconImg,namelab:pRecord.title});
                }
            }
            this.bottomList.array = arr;
            this.bottomList.renderHandler = new Handler(this, this.onListRender);
            this.bottomList.mouseHandler = new Handler(this, this.onBannerItemMouseEvent);

            this.starBottomBannerAction();
        }

        private onListRender(item: Laya.Box, index: number): void {
            // console.log('------->render bottombanner : ',index);
             if(YouziDataModule.YouziData.matrixBannerDatas[index].dynamicType == 1 && YouziDataModule.YouziData.matrixBannerDatas[index].dynamicIcon){
                var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
                imgAnima.visible = true;
                var youziAnima = new YouziAtlasPngAnima_Module.YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    YouziDataModule.YouziData.matrixBannerDatas[index].dynamicIcon,
                    imgAnima,
                    function(anima){
                        imgAnima = anima;
                        imgAnima.play();
                    });
            }   
            this.checkSendExpsureLog(index);
	    }

        private checkSendExpsureLog(index)
        {
            if(this.visible && this.BannerBottomUI.visible)
            {
                if(!this.bannerBottomItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid])
                {
                    // console.log('---send log index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.matrixBannerDatas[index],YouziDataModule.BI_PAGE_TYPE.MATRIX);
                    this.bannerBottomItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid] = 1;
                }
            }
        }

        private onBannerItemMouseEvent(e:Event, index: number): void
        {
            if(e.type == 'mousedown'){
            
            }else if(e.type == 'mouseup'){
                if(!this.isClick){
                    this.isClick = true
                    console.log("当前选择的bottombanner索引：" + index);
                    YouziDataModule.YouziData.clickGameYouziUIId = YouziDataModule.YOUZI_UI_ID.Youzi_BottomBanner;
                    var tmpData = YouziDataModule.YouziData.matrixBannerDatas[index]
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.MATRIX;
                    YouziDataModule.YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                }
            }else if(e.type == 'mouseover'){
                
            }
        }

        private startOtherCall(state){
            this.isClick = false;
            this.starBottomBannerAction();
        }

        stopBottomBannerAcion()
        {
            this.stopAction = true;
        }
    
        starBottomBannerAction()
        {
            this.bottomlistAutoScroll();
        }

        private bottomlistAutoScroll()
        {

            if(YouziDataModule.YouziData.matrixBannerDatas.length<=5){
                return
            }
            this.stopAction = false;
            this.dur = (YouziDataModule.YouziData.matrixBannerDatas.length-5)*5000;
            if(this.curFront && !this.curBack){
                this.listTweenToEnd();
            }else if(!this.curFront && this.curBack){
                this.listTweenToStart();
            }
            
        }

        private listTweenToEnd()
        {
            if(!this.stopAction){
                var endCompletHandler = new Laya.Handler(this,this.listTweenToStart,null,true);
                this.bottomList.tweenTo(YouziDataModule.YouziData.matrixBannerDatas.length-1,this.dur,endCompletHandler);
            }
            this.curFront = true;
            this.curBack = false;
        }

        private listTweenToStart()
        {
            if(!this.stopAction){
                var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
                this.bottomList.tweenTo(0,this.dur,startCompleteHandler);
            }
            this.curFront = false;
            this.curBack = true;
        }

        showBanner()
        {
            if(this)
            {
                this.visible = true;
                this.BannerBottomUI.visible = true;
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_BottomBanner,{uiVisible:true});
            }
        }

        hideBanner()
        {
            if(this)
            {
                this.visible = true;
                this.BannerBottomUI.visible = true;
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_BottomBanner,{uiVisible:false});
            }
        }

        destroySelf()
        {
            if(this)
            {
                this.removeSelf();
            }
        }

    }
}
