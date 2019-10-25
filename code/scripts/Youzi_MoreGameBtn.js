

/**
 * 中心化 更多游戏按钮
 */
var Youzi_MoreGameBtn = cc.Class({
    extends: cc.Component,

    properties: { },
    onLoad () {
        this.btn = this.node.getComponent(cc.Button)
    },

    start ()
    {
        var event = new cc.Component.EventHandler()
        event.target = this.node
        event.component = "Youzi_MoreGameBtn"
        event.handler = "btnClick"
        this.btn.clickEvents.push(event)
    },
    btnClick()
    {
        if (this.clickEvent)
        {
            this.clickEvent()
        }
    },
    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        this.clickEvent = params.clickEvent
        if (params.size)
        {
            this.node.width = params.size.width
            this.node.height = params.size.height
        }
        if (params.position){this.node.position = params.position}
    }
});

export function YouziCreateMoreGameBtn(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/Youzi_MoreGameBtn', function (err, prefab)
    {
        try {
            params = params || {};
            let node = cc.instantiate(prefab);
            node.position = cc.v2(0,0)
            parentNode.addChild(node);
            let cls = node.getComponent(Youzi_MoreGameBtn);
            cls.DIY(params);
            if (params.callback){params.callback(node);}
        } catch (error) {
            console.error('YouziCreateMoreGameBtn 生成错误',parentNode,params);
        }
    })
}

