import {BI_PAGE_TYPE, YouziData} from "./YouziData";
import {YouziCreateIcons} from "./Youzi_Icon";

/**
 * 中心化UI 小矩阵墙界面
 */
var YouziUI_SmallMatrixWall = cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad(){
        this.loged = 0
        this.h = this.node.getChildByName('H')
        this.v = this.node.getChildByName('V')
    },

    start(){
        let node = this.isVerticle ? this.v : this.h
        this.scrollCount = this.isVerticle ? 8 : 10
        this.scrollTime = this.isVerticle ? 0.4 : 0.3
        node.active = true
        this.bg = node.getChildByName('bg')
        this.scr = this.bg.getChildByName('ScrollView').getComponent(cc.ScrollView)
        this.view = this.scr.node.getChildByName('view')
        this.title = this.bg.getChildByName('title')
        this.initShow()
    },

    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        let visibleSize = cc.view.getVisibleSize()
        let vSizeRate = visibleSize.width < visibleSize.height ? visibleSize.width :  visibleSize.height
        this.node.scale = vSizeRate/640  //640是中心化UI设计尺寸
        this.isVerticle = params.isVerticle
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
            if(self && self.scr && self.scr.content) {
                if(self.isVerticle) {
                    self.scrollTime = Math.ceil(nodes.length / 4) * 1.4
                } else {
                    self.scrollTime = Math.ceil(nodes.length / 4) * 1.2
                }
                for (let i = 0; i < nodes.length; i++) {
                    self.scr.content.addChild(nodes[i])
                }
            }
            let smallMatrixWallCallback = function() {
                if (self && self.scr) {
                    YouziData.scrollviewAction(self.scr, 0, self.scrollCount, self.scrollTime)
                    self.scrollCallBack()
                }
            }
            setTimeout(smallMatrixWallCallback, 500);
        }
        YouziCreateIcons(BI_PAGE_TYPE.SMALL_MATRIX_WALL,{size:{width:110,height:110}},func)
    },

    scrollCallBack(scrollview, eventType, customEventData)
    {
        if (!this.scr || !this.scr.content)
        {
            return;
        }
        if(cc.ScrollView.EventType.SCROLL_BEGAN===eventType || cc.ScrollView.EventType.TOUCH_UP===eventType){
            this.scr.node.stopAllActions()
            YouziData.scrollviewAction(this.scr,0,this.scrollCount,this.scrollTime)
        }
        let ok = []
        let children = this.scr.content.children
        if(!this.initPosition) {
            this.initPosition = true
            this.minPosition = this.view.convertToWorldSpaceAR(cc.v2(0, -this.view.height/2))
            this.maxPosition = this.view.convertToWorldSpaceAR(cc.v2(0, this.view.height/2))
        }
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
                this.loged += YouziData._checkExposureInview1(ok, true, YouziData.moreDatas, BI_PAGE_TYPE.SMALL_MATRIX_WALL, 0, 0, this.minPosition.y, this.maxPosition.y)
            }
        }
    },
});

/**
 * 创建 小矩阵墙
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateSmallMatrixWall(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_SmallMatrixWall', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            let cls = node.getComponent(YouziUI_SmallMatrixWall)
            node.position = cc.v2(0,0)
            cls.DIY(params)
            parentNode.addChild(node)
            if (params.callback){params.callback(node)}
        } catch (error) {
            console.error('YouziCreateSmallMatrixWall 生成错误',parentNode,params)
        }
    })
}
