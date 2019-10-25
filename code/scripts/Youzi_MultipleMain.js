import { YouziCreateMain } from './YouziUI_Main';
import { YouziCreateMoreGame } from './YouziUI_MoreGame';
class MultipleMain {
    createMultipleMain(nodes, params, moreGameNode) {
        let self = this
        let numInfo = YouziData.getMainNum(nodes)
        if(!numInfo[0]) {
            return
        }
        if(moreGameNode) {
            let params1 = {
                isShowNow: false,
                cancelCallback: true
            }
            YouziCreateMoreGame(moreGameNode, params1);
        }

        let mainNodeNum = numInfo[0]
        let isSwitchMain = numInfo[1]
        this.mainNodeNum = mainNodeNum
        this.isSwitchMain = isSwitchMain
        this.nodes = nodes
        if(!params) {
            params = []
        }

        // 第一次创建主推
        for(let i = 0; i < mainNodeNum; i++) {
            // 计算每个位置的icon index
            // 不需要切换icon,按照顺序设置icon
            if(!params[i]) {
                params[i] = {}
            }
            if(moreGameNode) {
                params[i].moreGameNode = moreGameNode
            }
            params[i].isCreateMultipleMain = true
            params[i].mainIconIndex = i
            YouziCreateMain(nodes[i], params[i])
        }

        self.setMainInterval()

    }

    setMainInterval() {
        if(this.isSwitchMain) {
            let self = this
            // 主推图片切换
            self.changeIconInterval = setInterval(function () {
                let p = YouziData.mainRecDatas.length
                let gameIndexs = YouziData.getGamesIndex(p, self.mainNodeNum)
                for(let i = 0; i < self.mainNodeNum; i++) {
                    if(!self.nodes[i].getParent()) {
                        clearInterval(self.changeIconInterval)
                    }
                    if(self.nodes[i].updateMultipleMain) {
                        self.nodes[i].updateMultipleMain(gameIndexs[i])
                    }
                }
            }, 5000)
        }
    }
    clearMainInterval() {
        if(this.changeIconInterval) {
            clearInterval(this.changeIconInterval)
        }
    }

}


/**
 * 创建多个主推，主推规则如下：
 * @param nodes 多个主推节点
 * @param params 每个主推相同的参数
 * @param moreGameNode 更多游戏节点
 * @constructor
 */
export function YouziCreateMultipleMain(nodes, params, moreGameNode) {
    let instance = new MultipleMain()
    let isLoadOk = YouziData._isDataLoaded
    if (isLoadOk)
    {
        instance.createMultipleMain(nodes,params,moreGameNode)
    }else
    {
        YouziData._loadedCallBacks.push(() => {
            instance.createMultipleMain(nodes,params,moreGameNode)
        })
    }
    return instance
}
