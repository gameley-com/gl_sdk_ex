import { YouziData, BI_PAGE_TYPE } from "./YouziData";
import { YouziCreateIcons } from "./Youzi_Icon";

/**
 * 中心化UI 更多游戏界面
 */
var YouziUI_MoreGame = cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad(){
        this.shadow = this.node.getChildByName('notTouch')
        this.h = this.node.getChildByName('H')
        this.v = this.node.getChildByName('V')
    },

    getUIVH(params) {
        let visibleSize = cc.view.getVisibleSize()
        if(params.isVerticle === undefined) {
            this.isVerticle = visibleSize.width < visibleSize.height;
        } else {
            this.isVerticle = params.isVerticle
        }

    },

    start(){
        this.curNodenode = this.isVerticle ? this.v : this.h
        this.scrollCount = this.isVerticle ? 8 : 10
        this.scrollTime = this.isVerticle ? 0.4 : 0.3
        this.wh = this.isVerticle ? 120 : 100
        this.bg = this.curNodenode.getChildByName('bg')
        this.scr = this.bg.getChildByName('ScrollView').getComponent(cc.ScrollView)
        this.view = this.scr.node.getChildByName('view')
        this.title = this.bg.getChildByName('title')
        this.close = this.bg.getChildByName('close')
        this.initShow()
    },
    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        let size = params.size
        let btnNode = params.btnNode
        let visibleSize = cc.view.getVisibleSize()
        let vSizeRate = visibleSize.width < visibleSize.height ? visibleSize.width :  visibleSize.height
        this.node.scale = vSizeRate/640   //640是中心化UI设计尺寸
        this.isShowNow = params.isShowNow
        this.closeEvent = params.closeEvent
        this.cancelCallback = params.cancelCallback
        // 兼容之前没传isVerticle的情况，通过visibleSize来判读


        this.scheduleOnce(() => {
            if(params.cancelCallback) {
                let pos = cc.view.getVisibleSize()
                let p = this.node.parent.convertToNodeSpaceAR(cc.v2(pos.width/2, pos.height/2))
                this.node.position = cc.v2(p.x, p.y)
                this.node.setSiblingIndex(999)
            } else {
                this.node.position = cc.v2(0,0)
            }
        }, 0)


        // if (size)
        // {
        //     this.node.width = size.width
        //     this.node.height = size.height
        //     this.bg.width = size.width
        //     this.bg.height = size.height
        //     this.view.width = size.width - 20
        //     this.view.height = size.height - 88
        //     this.scr.content.width = this.view.width
        //     this.scr.content.position = this.view.height / 2
        //     this.close.x = size.width / 2 - 9
        //     this.close.y = size.height /2 - 7
        //     this.title.y = size.height /2 - 26
        // }

        if (btnNode)
        {
            let btn = btnNode.getComponent(cc.Button)
            if (btn)
            {
                var event = new cc.Component.EventHandler()
                event.target = this.node
                event.component = "YouziUI_MoreGame"
                event.handler = "openWithAnim"
                btn.clickEvents.push(event)
            }else
            {
                // console.warn('YouziUI_MoreGame 传入的btnNode不包含cc.Button组件')
            }
        }else
        {
            // console.warn('未设置抽屉的入口按钮')
        }
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
                if(self.isVerticle) {
                    self.scrollTime = Math.ceil(nodes.length / 3) * 0.6
                } else {
                    self.scrollTime = Math.ceil(nodes.length / 5) * 0.6
                }

                for (let i = 0; i < nodes.length; i++) {
                    self.scr.content.addChild(nodes[i])
                }
                if (self.isShowNow) {
                    self.openWithAnim()
                }
            }
        }
        YouziCreateIcons(BI_PAGE_TYPE.MORE,{size:{width:self.wh,height:self.wh}},func)


    },

    scrollCallBack()
    {
        if (!this.scr || !this.scr.content)
        {
            return;
        }
        let ok = []
        let children = this.scr.content.children

        if(this.loged !== children.length) {
            for (let i = 0; i < children.length; i++) {
                let isHave = false
                if(i < this.loged ) {
                    isHave = true
                }
                if(!isHave)
                {
                    ok.push(children[i])
                }
            }
            if(!this.initPosition) {
                this.maxPosition = this.view.convertToWorldSpaceAR(cc.v2(0, this.view.height/2 + ok[0].height))
                this.minPosition = this.view.convertToWorldSpaceAR(cc.v2(0, -this.view.height/2))
                this.initPosition = true
            }

            if(ok.length>0)
            {
                this.loged += YouziData._checkExposureInview1(ok, true, YouziData.moreDatas, BI_PAGE_TYPE.MORE,0, 0, this.minPosition.y, this.maxPosition.y)
            }
        }
    },

    openWithAnim()
    {
        let self = this
        if(self.cancelCallback && this.node.parent) {
            let pos = cc.view.getVisibleSize()
            let p = this.node.parent.convertToNodeSpaceAR(cc.v2(pos.width/2, pos.height/2))
            this.node.position = cc.v2(p.x, p.y)
        }
        this.loged = 0
        this.shadow.active = true
        this.shadow.runAction(cc.fadeTo(0.2,210))

        this.bg.active = true
        this.curNodenode.active = true
        this.scr.scrollToTop(0)
        let smallMatrixWallCallback = function() {
            if (self && self.scr) {
                YouziData.scrollviewAction(self.scr, 0, self.scrollCount, self.scrollTime)
                self.scrollCallBack()
            }
        }
        setTimeout(smallMatrixWallCallback, 200)
        // this.scheduleOnce(this.scrollCallBack, 0)
    },
    closeWithAnim()
    {
        // let ft = cc.fadeTo(0.2,1)
        // let call = cc.callFunc(this.closeAll,this)
        // this.shadow.runAction(cc.sequence(ft,call))

        this.closeAll()
    },
    closeAll()
    {
        this.scr.scrollToTop(0)
        this.shadow.active = false
        this.bg.active = false
        this.curNodenode.active = false
        if (this.closeEvent) { this.closeEvent() }
        console.log('close--->'+this.node.position)
    }
});

/**
 * 创建 更多游戏类型 的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateMoreGame(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_MoreGame', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            let cls = node.getComponent(YouziUI_MoreGame)
            node.position = cc.v2(0,0)
            cls.getUIVH(params)
            parentNode.addChild(node)
            if(params.cancelCallback) {
                node.setSiblingIndex(999)
                node.zIndex = 999
            }
            cls.DIY(params)
            if (params.callback){params.callback(node);}
            parentNode.openYouziMoreGame = cls.openWithAnim.bind(cls)
        } catch (error) {
            console.error('YouziCreateMoreGame 生成错误',parentNode,params);
            console.log(error)
        }
    })
}
