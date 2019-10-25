import { YouziData, BI_PAGE_TYPE, BANNER_TYPE } from "./YouziData";
import { YouziCreateIcons } from "./Youzi_Icon";

var YouziUI_Matrix = cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad () {
        this.bg = this.node.getChildByName('bg')
        this.txt = this.node.getChildByName('txt')
        this.scr = this.node.getChildByName('ScrollView').getComponent(cc.ScrollView)
        this.view = this.scr.node.getChildByName('view')

        this.bannerType = BANNER_TYPE.MATRIX
        this.loged = 0
    },

    start () {
        if (!this.isOffSwitch)
        {
            //记录 交由中心化切换显示隐藏
            this.node.active = false
            YouziData.addBanner(this)
        }

        this.initShow()
    },
    DIY(params)
    {
        let size = params.size
        this.isVerticle = params.isVerticle
        let pos = params.position
        this.isOffSwitch = params.isOffSwitch//如果设置成true 则该banner由客户端进行控制显示和隐藏,中心化不再控制切换等

        let visibleSize = cc.view.getVisibleSize()
        let vSizeRate = visibleSize.width < visibleSize.height ? visibleSize.width :  visibleSize.height
        this.node.scale = vSizeRate/640//640是中心化UI设计尺寸
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
            this.minPosition = this.view.convertToWorldSpaceAR(cc.v2(-this.view.width/2, 0))
            this.minPositionHide = this.view.convertToWorldSpaceAR(cc.v2(-this.view.width/2-children[0].children[0].width, 0))
            this.maxPosition = this.view.convertToWorldSpaceAR(cc.v2(this.view.width/2, 0))
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
                this.loged += YouziData._checkExposureInview1(ok, false, YouziData.matrixBannerDatas,BI_PAGE_TYPE.MATRIX, this.minPosition.x, this.maxPosition.x)
            }
        }
        YouziData._hideShowChild(children, false, this.minPositionHide.x, this.maxPosition.x)
    },

    freshShow()
    {
        var self = this
        let func = function(nodes)
        {
            if (self && self.scr && self.scr.content) {
                for (let i = 0; i < nodes.length; i++) {
                    let node = new cc.Node()
                    node.setContentSize(new cc.Size(105, 105))
                    node.addChild(nodes[i])
                    self.scr.content.addChild(node)
                }
            }
            let matrixCallback = function() {
                if (self && self.scr) {
                    YouziData.scrollviewAction(self.scr, 1.5, 5)
                    self.scrollCallBack()
                }
            }
            setTimeout(matrixCallback, 500);
        }
        //按钮大小根据猜你喜欢大小设定
        YouziCreateIcons(BI_PAGE_TYPE.MATRIX,{size:{width:105,height:105},nameClose:false,cancelCallback: self.cancelCallback},func)
    },

    showBanner(){
        if (this.node)
        {
            this.node.active = true
            YouziData.scrollviewAction(this.scr,1.5,5)
        }
    },
    hideBanner()
    {
        if (this.node)
        {
            this.scr.scrollToLeft(0)
            this.node.active = false
        }
    },
    destroySelf()
    {
        if (this && this.node)
        {
            this.node.removeFromParent(true)
        }
    },
});

/**
 * 创建底部矩阵banner类型的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateMatrix(parentNode,params) {
    try {
        cc.loader.loadRes('youzi/prefabs/YouziUI_Matrix', function (err, prefab)
        {
            params = params || {}
            let node = cc.instantiate(prefab)
            let cls = node.getComponent(YouziUI_Matrix)
            node.position = cc.v2(0,0)
            cls.DIY(params)
            parentNode.addChild(node)
            if (params.callback){params.callback(node);}
        });
    } catch (error) {
        console.error('YouziCreateMatrix 生成错误',parentNode,params);
    }
};
