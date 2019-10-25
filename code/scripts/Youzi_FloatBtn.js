
/**
 * 中心化 抽屉入口按钮
 */
var Youzi_FloatBtn = cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad(){
        this.img = this.node.getChildByName('Image')
        this.btn = this.node.getComponent(cc.Button)
    },
    start(){
        var event = new cc.Component.EventHandler()
        event.target = this.node
        event.component = "Youzi_FloatBtn"
        event.handler = "btnClick"
        this.btn.clickEvents.push(event)

        this.btnAnim()
    },

    btnAnim()
    {
        this.img.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.5,1.1),cc.scaleTo(0.5,1))))
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
        this.isRight = params.isRight
        this.node.scaleX = this.isRight ? -1 : 1
        this.clickEvent = params.clickEvent
        if (params.position){this.node.position = params.position}
    }
});
export function YouziCreateFloatBtn(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/Youzi_FloatBtn', function (err, prefab)
    {
        try {
            params = params || {};
            let node = cc.instantiate(prefab);
            node.position = cc.v2(0,0)
            parentNode.addChild(node);
            let cls = node.getComponent(Youzi_FloatBtn);
            cls.DIY(params);
            if (params.callback){params.callback(node);}
        } catch (error) {
            console.error('YouziCreateFloatBtn 生成错误',parentNode,params);
        }
    })

};
