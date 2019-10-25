import { YouziData, BI_PAGE_TYPE } from "./YouziData";
import { YouziCreateIcons } from "./Youzi_Icon";

var YouziUI_Guess = cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad (){
        this.loged = 0
        this.h = this.node.getChildByName('H')
        this.v = this.node.getChildByName('V')
    },

    start ()
    {
        let node = this.isVerticle ? this.v : this.h
        node.active = true

        this.bg = node.getChildByName('bg')
        this.scr = node.getChildByName('ScrollView').getComponent(cc.ScrollView)
        this.view = this.scr.node.getChildByName('view')

        this.initShow()
    },

    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        let size = params.size
        this.isVerticle = params.isVerticle
        let pos = params.position

        if (size)
        {
            //TODO:设定大小
        }

        if(params.moreGameNode) {
            this.cancelCallback = function() {
                if (params.moreGameNode && params.moreGameNode.openYouziMoreGame) {
                    params.moreGameNode.openYouziMoreGame()
                }
            }
        }
        if (pos){this.node.position = pos}
    },
    initShow()
    {
        let isLoadOk = YouziData._isDataLoaded
        if (isLoadOk)
        {
            this.freshShow()
        }else
        {
            YouziData._loadedCallBacks.push(this.freshShow.bind(this))
        }
    },

    freshShow()
    {
        var self = this
        let func = function(nodes)
        {
            if (self && self.scr && self.scr.content) {
                for (let i = 0; i < nodes.length; i++) {
                    let node = new cc.Node()
                    node.setContentSize(new cc.Size(90, 90))
                    node.addChild(nodes[i])
                    self.scr.content.addChild(node)
                }
            }
            let guessCallback = function() {
                if (self && self.scr) {
                    YouziData.scrollviewAction(self.scr, 1.5, 5)
                    self.scrollCallBack()
                }
            }
            setTimeout(guessCallback, 500);
        }
        //按钮大小根据猜你喜欢大小设定
        YouziCreateIcons(BI_PAGE_TYPE.GUESS,{size:{width:90,height:90},nameClose:true, cancelCallback: self.cancelCallback},func)
    },

    scrollCallBack(scrollview, eventType, customEventData)
    {
        if (!this.scr || !this.scr.content)
        {
            return;
        }
        if(!this.scr.content.children.length) {
            return
        }
        if(cc.ScrollView.EventType.SCROLL_BEGAN===eventType || cc.ScrollView.EventType.TOUCH_UP===eventType){
            this.scr.node.stopAllActions()
            YouziData.scrollviewAction(this.scr,1.5,5)
        }

        let ok = []
        let children = this.scr.content.children
        if(!this.initPosition) {
            this.initPosition = true
            this.minPosition = this.view.convertToWorldSpaceAR(cc.v2(-this.view.width/2, -this.view.height/2))
            this.minPositionHideX = this.view.convertToWorldSpaceAR(cc.v2(-this.view.width/2-children[0].children[0].width, 0))
            this.maxPositionHideY = this.view.convertToWorldSpaceAR(cc.v2(0, this.view.height/2+children[0].children[0].height))
            this.maxPosition = this.view.convertToWorldSpaceAR(cc.v2(this.view.width/2, this.view.height/2))
        }

        if(this.loged !== children.length) {
            for (let i = 0; i < children.length; i++) {
                let isHave = false
                if(i < this.loged ) {
                    isHave = true
                }

                if(!isHave)
                {
                    ok.push(children[i].children[0])
                }
            }

            if(ok.length>0)
            {
                this.loged += YouziData._checkExposureInview1(ok, this.isVerticle, YouziData.matrixBannerDatas, BI_PAGE_TYPE.GUESS, this.minPosition.x, this.maxPosition.x, this.minPosition.y, this.maxPosition.y)
            }
        }
        YouziData._hideShowChild(children, this.isVerticle, this.minPositionHideX.x, this.maxPosition.x, this.minPosition.y, this.maxPositionHideY.y)

    },

});
/**
 * 创建猜你喜欢类型的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateGuess(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_Guess', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            let cls = node.getComponent(YouziUI_Guess)
            node.position = cc.v2(0,0)
            cls.DIY(params)
            parentNode.addChild(node)
            if (params.callback){params.callback(node);}
        } catch (e) {
            console.error('YouziCreateGuess 生成错误',parentNode,params);
            console.error(e)
        }

    })
};
