import { YouziData, BI_PAGE_TYPE } from "./YouziData";
import { YouziCreateIcons } from "./Youzi_Icon";

/**
 * 中心化UI 抽屉界面
 */
var YouziUI_Float = cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad () {
        this.loged = []     //元素形式为索引_appid
        this.shadow = this.node.getChildByName('notTouch')
        this.bg = this.node.getChildByName('bg')
        this.scr = this.bg.getChildByName('ScrollView').getComponent(cc.ScrollView)
        this.view = this.scr.node.getChildByName('view')
        this.close = this.bg.getChildByName('close')
    },

    start () {
        this.close.x = this.isRight ? -this.close.x : this.close.x
        this.close.scaleX = this.isRight ? -1 : 1
        this.originX = this.isRight ? (this.node.width/2 + this.close.width)*this.scale : -(this.node.width/2 + this.close.width)*this.scale
        this.node.x = this.originX

        this.initShow()
    },
    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        let size = params.size
        let pos = params.position
        this.isRight = params.isRight
        this.btnNode = params.btnNode
        this.isMainPage = params.isMainPage //用于控制抽屉及抽屉按钮是否显示 该配置由客户端及服务器共同控制抽屉
        this.closeEvent = params.closeEvent

        let visibleSize = cc.view.getVisibleSize()
        let vSizeRate = visibleSize.width < visibleSize.height ? visibleSize.width :  visibleSize.height
        this.scale = vSizeRate/640//640是中心化UI设计尺寸
        this.node.scale = this.scale

        // size = {width:visibleSize.width/640 * 494,height:visibleSize.width/640 * 590}//TODO:支持DIY
        // if (size)
        // {
        //     this.node.width = size.width
        //     this.node.height = size.height
        //     this.bg.width = size.width
        //     this.bg.height = size.height
        //     this.view.width = size.width
        //     this.view.height = size.height
        //     this.scr.content.width = size.width
        //     this.scr.content.position = size.height / 2 - 5
        //     this.close.x = size.width / 2
        // }

        if(pos){this.node.position = pos}

        if (this.btnNode)
        {
            let btn = this.btnNode.getComponent(cc.Button)
            if (btn)
            {
                var event = new cc.Component.EventHandler()
                event.target = this.node
                event.component = "YouziUI_Float"
                event.handler = "openWithAnim"
                btn.clickEvents.push(event)
            }else
            {
                console.warn('YouziUI_Float 传入的btnNode不包含cc.Button组件')
            }
        }else
        {
            console.warn('未设置抽屉的入口按钮')
        }
        if(params.moreGameNode) {
            this.cancelCallback = function() {
                if (params.moreGameNode && params.moreGameNode.openYouziMoreGame) {
                    params.moreGameNode.openYouziMoreGame()
                }
            }
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
        if (this.checkNeedCloseSome())
        {
            var self = this

            let func = function(nodes)
            {
                if(self && self.scr && self.scr.content) {
                    for (let i = 0; i < nodes.length; i++) {
                        self.scr.content.addChild(nodes[i])
                    }
                }
            }
            YouziCreateIcons(BI_PAGE_TYPE.FLOAT,{size:{width:120,height:120},nameClose:false, cancelCallback: self.cancelCallback},func)
        }else
        {
            this.node.active = false
            if(this.btnNode) {this.btnNode.active = false}
            console.log('关闭抽屉及入口显示',this.isMainPage)
        }
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
                if(i < this.loged) {
                    isHave = true
                }
                if(!isHave)
                {
                    ok.push(children[i])
                }

            }

            if(ok.length>0)
            {
                let maxPosition = this.view.convertToWorldSpaceAR(cc.v2(0, this.view.height/2+ok[0].height))
                let minPosition = this.view.convertToWorldSpaceAR(cc.v2(0, -this.view.height/2))
                this.loged += YouziData._checkExposureInview1(ok, true, YouziData.hotListDatas,BI_PAGE_TYPE.FLOAT,0, 0, minPosition.y, maxPosition.y)
            }
        }
    },

    openWithAnim()
    {
        let self = this
        this.loged = 0
        this.bg.active = true
        this.shadow.active = true
        this.shadow.runAction(cc.fadeTo(0.2,210))

        let mx = this.isRight? -this.node.width/2*this.scale : this.node.width/2*this.scale
        let my = this.node.y
        this.node.runAction(cc.moveTo(0.2,mx,my))
        this.scr.scrollToTop(0)
        this.scheduleOnce(this.scrollCallBack, 0)
    },
    closeWithAnim()
    {
        let ft = cc.fadeTo(0.2,1)
        let call = cc.callFunc(this.closeShadow,this)
        this.shadow.runAction(cc.sequence(ft,call))

        let mx = this.originX
        let my = this.node.y
        this.node.runAction(cc.moveTo(0.2,mx,my))
        if (this.closeEvent) { this.closeEvent() }
    },
    closeShadow()
    {
        this.shadow.active = false
        this.bg.active = false
    },
    onBtnClose()
    {
        this.closeWithAnim()
    },
    checkNeedCloseSome(){
        if(this.isMainPage){
            if(YouziData._pageOpen==1){
                return true
            }else{
                return false
            }
        }

        return true
    },
});

/**
 * 创建抽屉类型的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateFloat(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_Float', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            node.position = cc.v2(0,0)
            parentNode.addChild(node)
            let cls = node.getComponent(YouziUI_Float)
            cls.DIY(params)
            if (params.callback){params.callback(node);}
        } catch (error) {
            console.error('YouziCreateFloat 生成错误',parentNode,params);
        }
    })
}
