import { YouziData, BI_PAGE_TYPE } from "./YouziData";
import { YouziCreateIcons } from "./Youzi_Icon";

var YouziUI_Offline = cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad () {
        this.loged = 0
        this.offTime = 0
        this.shadow = this.node.getChildByName('notTouch')
        this.bg = this.node.getChildByName('bg')
        this.scr = this.bg.getChildByName('ScrollView').getComponent(cc.ScrollView)
        this.view = this.scr.node.getChildByName('view')
        this.title = this.bg.getChildByName('title')
        this.close = this.bg.getChildByName('close')
    },

    start(){
        this.initShow()

        var self = this
        if(window.wx)
        {
            if(!wx.onShow || !wx.onHide)
            {
                return;
            }
            wx.onShow(function(res)
            {
                let time = (new Date()).getSeconds()
                if (time - self.offTime > 8)
                {
                    self.openWithAnim()
                }
                self.offTime = time
            });
            wx.onHide(function(res)
            {
                //计时8秒
                self.offTime = (new Date()).getSeconds()
            });
        }
    },
    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        let size = params.size
        this.closeEvent = params.closeEvent
        if (size)
        {
            //TODO:
            // this.node.width = size.width
            // this.node.height = size.height
            // this.bg.width = size.width
            // this.bg.height = size.height
            // this.view.width = size.width - 20
            // this.view.height = size.height - 88
            // this.scr.content.width = this.view.width
            // this.scr.content.position = this.view.height / 2
            // this.close.x = size.width / 2 - 9
            // this.close.y = size.height /2 - 7
            // this.title.y = size.height /2 - 26
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
        let func = function (nodes) {
            if (self && self.scr && self.scr.content) {
                for (let i = 0; i < nodes.length; i++) {
                    self.scr.content.addChild(nodes[i])
                }
            }

        }
        YouziCreateIcons(BI_PAGE_TYPE.OFFLINE,{},func)
    },

    scrollCallBack()
    {
        if (!this.scr || !this.scr.content)
        {
            return;
        }
        if(!this.initPosition) {
            this.initPosition = true
            this.minPosition = this.view.convertToWorldSpaceAR(cc.v2(-this.view.width/2, 0))
            this.maxPosition = this.view.convertToWorldSpaceAR(cc.v2(this.view.width/2, 0))
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
                    ok.push(children[i].children[0])
                }
            }

            if(ok.length>0)
            {

                this.loged += YouziData._checkExposureInview1(ok, true, YouziData.offlineBannerDatas,BI_PAGE_TYPE.OFFLINE, this.minPosition.x, this.maxPosition.x)
            }
        }
    },

    openWithAnim()
    {
        if (this && this.node && YouziData.offlineBannerDatas.length>0)
        {
            this.shadow.active = true
            this.shadow.runAction(cc.fadeTo(0.2,210))

            this.bg.active = true
            this.loged = 0
            this.scr.scrollToLeft(0)
            this.scheduleOnce(this.scrollCallBack, 0)
        }
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
        this.shadow.active = false
        this.bg.active = false
        this.scr.scrollToLeft(0)
        if (this.closeEvent) { this.closeEvent() }
    }
});
/**
 * 创建 离线Banner类型 的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateOffline(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_Offline', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            node.position = cc.v2(0,0)
            parentNode.addChild(node)
            let cls = node.getComponent(YouziUI_Offline)
            cls.DIY(params)
            if (params.callback){params.callback(node)}
        } catch (error) {
            console.error('YouziCreateOffline 生成错误',parentNode,params)
        }
    })
}
