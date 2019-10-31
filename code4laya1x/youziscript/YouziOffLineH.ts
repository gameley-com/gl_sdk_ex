module YouziOffLineH_Module
{
    export class YouziOffLineH extends ui.youzi.Youzi_OffLineHUI
    {
        private offLineGameShow = [];
        private offLineCreateComplete = false;
        private isSendLog = true;
        private uiCompleteCallCopy:Function = null;
        private uiStateCallCopy:Function = null;
        //获取毫秒
        private hideOffLineGameTimes = 0;

        constructor(){
            super();
            if(Laya.stage.width/Laya.stage.height >= 1.9){
                this.OffLineUI.pos(Laya.stage.width/2 - this.OffLineUI.width/2,Laya.stage.height/2 - this.OffLineUI.height/2);
            }else{
                this.centerX = 0;
                this.centerY = 0;
            }

            this.visible = false;
            this.OffLineUI.visible = false;
        }

        setYouziPosition(x:number,y:number){
            this.OffLineUI.pos(x,y);
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
            var offLineDataOk = YouziDataModule.YouziData._isDataLoaded;
            if(offLineDataOk){
                this.initShow();
            }else{
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        }

        private initShow()
        {
            this.wxOnShow();
            this.wxOnHide();
            
            //以下demo演示用
            // this.createOffLineDialog();
            // this.visible = true;
            // this.OffLineUI.visible = true;
        }

        private wxOnShow()
        {
            var self = this;
            if(Laya.Browser.window.wx)
            {
                Laya.Browser.window.wx.onShow(function(res)
                {
                
                        var showOffLineTimes = Math.floor(new Date().getTime() - self.hideOffLineGameTimes);
                        var showOffLineTimeSecond = Math.floor(showOffLineTimes/1000);
                        if(showOffLineTimeSecond >= 8)
                        {
                            if(self.offLineCreateComplete)
                            {
                                self.visible = true;
                                self.OffLineUI.visible = true;
                                self.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine,{uiVisible:true});
                                self.checkExposure();
                            }
                        }       
                
                });
            }
            
        }

        private checkExposure()
        {
            if(this.isSendLog){
                for(var i=0;i<this.offLineGameShow.length;i++)
                {
                    YouziDataModule.YouziData.sendExposureLog(this.offLineGameShow[i], YouziDataModule.BI_PAGE_TYPE.OFFLINE);
                    if(i == this.offLineGameShow.length)
                    {
                        this.isSendLog = false;
                    }
                }
            }
        }

        private wxOnHide()
        {
            var self = this;
            if(Laya.Browser.window.wx)
            {
                Laya.Browser.window.wx.onHide(function()
                {
                    self.hideOffLineGameTimes = new Date().getTime();
                    if(YouziDataModule.YouziData.offlineBannerDatas.length > 0 && !self.offLineCreateComplete)
                    {
                        self.createOffLineDialog();
                    }
                });
            }
        }

        private createOffLineDialog()
        {

            this.OffLineCloseButton.on(Laya.Event.CLICK, this, this.onBtnOffLineClose);
            
            var offLineArr : Array<any> = [];
            for(var i:number = 0;i<YouziDataModule.YouziData.offlineBannerDatas.length;i++){
                if(i >= 3){
                    break;
                }else{
                    var tempOffLine = YouziDataModule.YouziData.offlineBannerDatas[i];
                    this.offLineGameShow.push(tempOffLine);
                    offLineArr.push({icon:tempOffLine.iconImg, namelab: tempOffLine.title});
                }
            }
            //设定list 位置，以这种方式解决list中item的居中问题
            var offLineListPostionX = 0;
            switch(offLineArr.length){
                case 1:
                offLineListPostionX = 205;
                break;
                case 2:
                offLineListPostionX = 85;
                this.OffLineList.spaceX = 50;
                break;
                default:
                offLineListPostionX = 8;
                this.OffLineList.spaceX = 15;
                break;
            }
            this.OffLineList.x = offLineListPostionX;
            this.OffLineList.array = offLineArr;
            this.OffLineList.mouseHandler = new Handler(this,this.onOffLinelistItemMouseEvent);
            this.OffLineList.renderHandler = new Handler(this,this.onListRender);
            this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine,{complete:true});
            this.offLineCreateComplete = true;
        }

        private onListRender(item:Laya.Box,index:number):void
        {
            var redhit:Laya.Image = item.getChildByName('icon').getChildByName('redhit') as Laya.Image;
            if(this.offLineGameShow[index].hotred == 1)
            {
                redhit.visible = true;
            }else{
                redhit.visible = false;
            }
        }

        private onBtnOffLineClose()
        {
            this.visible = false;
            this.OffLineUI.visible = false;
            this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine,{uiVisible:false});
        }

        private onOffLinelistItemMouseEvent(e:Event, index: number): void
        {
            if(e.type == 'mousedown'){
            
            }else if(e.type == 'mouseup'){
                console.log("当前选择的hotlist索引：" + index);
                var tmpData = this.offLineGameShow[index];
                tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.OFFLINE;
                YouziDataModule.YouziData.startOtherGame(tmpData,null);
                if(tmpData.hotred == 1){
                    var hideOffLineHit:Laya.Image = this.OffLineList.getCell(index).getChildByName('icon').getChildByName('redhit') as Laya.Image;
                    hideOffLineHit.visible = false;
                }
            }else if(e.type == 'mouseover'){
            
                
            }else if(e.type == 'mouseout'){
            
            }
        }

    }
}