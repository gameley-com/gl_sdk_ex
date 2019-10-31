module YouziMoreGameH_Module
{
    export class YouziMoreGameH extends ui.youzi.Youzi_MoreGameHUI
    {
        private mainItemHExposure = {};
        private fisrtShow = false;
        private isCreate = false;
        private uiCompleteCallCopy:Function = null;
        private uiStateCallCopy:Function = null;

        private curFront = true;
        private curBack = false;
        private stopAction = false;
        private isClick = false;
        private dur = 5000;

        constructor() 
        {
            super();
            if(Laya.stage.width/Laya.stage.height >=1.9){
                this.MoreGameUI.scale(0.9, 0.9);
                var scaleW = this.MoreGameUI.width*0.9;
                var scaleH = this.MoreGameUI.height*0.9;
                this.MoreGameUI.pos(Laya.stage.width/2-scaleW/2,Laya.stage.height/2-scaleH/2);
            }else{
                this.centerX = 0;
                this.centerY = 0;
            }
            this.visible = false;
            this.MoreGameUI.visible = false;
            this.moreGameList.scrollBar.hide = true;
        }

        setYouziPosition(x:number,y:number)
        {
            this.MoreGameUI.pos(x,y);
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

        offUIStateCall()
        {
            if(this.uiStateCallCopy){
                this.uiStateCallCopy = null;
            }
        }

        onMyStart()
        {
            var isMoreGameOk = YouziDataModule.YouziData._isDataLoaded;
            if(isMoreGameOk){
                this.initShow();
            }else{
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        }

        showMoreGameUI()
        {
            if(this.isCreate && !this.visible){       
                this.visible = true
                this.moreGameList.mouseThrough = false;
                this.MoreGameUI.visible = true;
                this.starMoreGameAction();
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_MoreGameH,{uiVisible:true});
                this.checkExposure();
            }  
        }

        private initShow()
        {
            if(YouziDataModule.YouziData.moreDatas.length > 0){
                var arr: Array<any> = [];
                for (var i: number = 0; i < YouziDataModule.YouziData.moreDatas.length; i++) {
                    var pRecord = YouziDataModule.YouziData.moreDatas[i];
                    arr.push({icon:pRecord.iconImg,namelab: pRecord.title});
                }
        
                this.moreGameList.array = arr;
                this.moreGameList.renderHandler = new Handler(this,this.onListRender);
                this.moreGameList.mouseHandler = new Handler(this, this.moreGameListMouseEvent);
                this.moreGameCloseBtn.on(Laya.Event.CLICK,this,this.onBtnCloseClicked);
                
                this.isCreate = true;
                this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_MoreGameH,{complete:true});
            }
        }

        private onBtnCloseClicked (){
            this.stopMoreGameAcion();
            this.visible = false;
            this.moreGameList.mouseThrough = true;
            this.MoreGameUI.visible = false;
            this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_MoreGame,{uiVisible:false});
        }

        private onListRender(item:Laya.Box,index:number):void
        {
            // console.log('------->render moregameh : ',index);
            this.checkSendExpsureLog(index);
        }

        private checkSendExpsureLog(index)
        {
            if(this.visible && this.MoreGameUI.visible)
            {
                if(!this.mainItemHExposure[YouziDataModule.YouziData.moreDatas[index].appid])
                {
                    // console.log('---send log moregame index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.moreDatas[index],YouziDataModule.BI_PAGE_TYPE.MORE);
                    this.mainItemHExposure[YouziDataModule.YouziData.moreDatas[index].appid] = 1;
                }
            }
        }

        stopMoreGameAcion()
        {
            this.stopAction = true;
        }

        starMoreGameAction()
        {
            this.moreGameListAutoScroll();
        }

        private moreGameListAutoScroll(){
            if(!this.MoreGameUI.visible)
                return;
            if(YouziDataModule.YouziData.moreDatas.length<=12){
                return;
            }
            this.stopAction = false;
            this.dur = (YouziDataModule.YouziData.moreDatas.length-12)*3000;
            //当前是从前面开始向后，但是未到后面
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
                this.moreGameList.tweenTo(YouziDataModule.YouziData.moreDatas.length-1,this.dur,endCompletHandler);
            }
            this.curFront = true;
            this.curBack = false;
        }

        private listTweenToStart()
        {
            if(!this.stopAction){
                var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
                this.moreGameList.tweenTo(0,this.dur,startCompleteHandler);
            }
            this.curFront = false;
            this.curBack = true;
        }

        private moreGameListMouseEvent(e:Event,index:number):void
        {
            if(e.type == 'mousedown')
            {
                
            }else if(e.type == 'mouseup'){
                if(!this.isClick){
                    this.isClick = true;
                    console.log("当前选择的更多游戏索引：" + index);
                    var tmpData = YouziDataModule.YouziData.moreDatas[index];
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.MORE;
                    YouziDataModule.YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                }
            }else if(e.type == 'mouseover'){
                    
            }
        }

        private startOtherCall(){
            this.isClick = false;
            this.starMoreGameAction();
        }

        private checkExposure()
        {
            if(this.MoreGameUI.visible){
                for(var i=0; i<YouziDataModule.YouziData.moreDatas.length; i++){
                    var infoData = YouziDataModule.YouziData.moreDatas[i];
                    if(!this.mainItemHExposure[infoData.appid]){
                        this.mainItemHExposure[infoData.appid] = 1;
                        YouziDataModule.YouziData.sendExposureLog(infoData, YouziDataModule.BI_PAGE_TYPE.MORE);
                    }
                    
                    if(i>=11){
                        break;
                    }
                }
            }
        }

    }
}