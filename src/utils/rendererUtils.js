const pluginName = '[Echo-Message]'

class ListenerHandler {
    constructor(msgContentContainer) {
        this.msgContentContainer = msgContentContainer
        this.leaveTimeout = undefined
        //绑定下面函数this的上下文
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseEnter() {
        clearTimeout(this.leaveTimeout);
        appendPlusOneTag(this.msgContentContainer); // 添加tag
    }

    handleMouseLeave() {
        this.leaveTimeout = setTimeout(() => {
            removePlusOneTag(this.msgContentContainer);
        }, 150) // 移除tag
    };

    addCommonPlusOne() {
        try {
            //给每一个消息都加上tag。实现在hover的时候显示，在不hover的时候取消显示。
            if (!this.msgContentContainer?.classList.contains('echo-message'))//说明这条消息还没加上事件监听器
            {
                this.msgContentContainer.classList.add('echo-message')
                //准备添加事件监听器
                this.msgContentContainer.addEventListener('mouseenter', this.handleMouseEnter)
                this.msgContentContainer.addEventListener('mouseleave', this.handleMouseLeave)
            }
        } catch (e) {
        }
    }
}

export async function messageRenderer(allChats) {

    for (let i = 0; i < allChats.length; i++) {
        const msgContentContainer = allChats[i]?.querySelector('.msg-content-container')
        const preMsgConContainer = i > 0 ? allChats[i - 1]?.querySelector('.msg-content-container') : null;
        if (preMsgConContainer?.querySelector('.em-svg-container')) removePlusOneTag(msgContentContainer)//只保留一个svg
        if (msgContentContainer?.classList.contains('em-msg-container')) continue//已经改过的不要改


        const currentMsgContent = allChats[i]?.querySelector('.message-content');
        const prevMsgContent = i - 1 < 0 ? undefined : allChats[i - 1]?.querySelector('.message-content');
        const nextMsgContent = i + 1 === allChats.length ? undefined : allChats[i + 1]?.querySelector('.message-content');
        //判断有没有越界，越界了就开始下一个循环。
        if (!(prevMsgContent || nextMsgContent)) {
            (new ListenerHandler(msgContentContainer)).addCommonPlusOne()
            continue
        }
        //判断是否符合+1条件
        if (!msgChecker(prevMsgContent, currentMsgContent, nextMsgContent)) {
            (new ListenerHandler(msgContentContainer)).addCommonPlusOne()
            continue
        }

        //没问题！应该对下一条消息加上+1标签。
        //console.log(pluginName + '消息检查成功')
        appendPlusOneTag(msgContentContainer)//添加tag
    }
}

/**
 * 检查当前元素是否和上一个相同，同时和下一个不同
 * @param prevMsgContent
 * @param currentMsgContent
 * @param nextMsgContent
 */
function msgChecker(prevMsgContent, currentMsgContent, nextMsgContent) {
    const prevMsgs = msgExtractor(prevMsgContent)
    const currentMsgs = msgExtractor(currentMsgContent)
    const nextMsgs = msgExtractor(nextMsgContent)
    //console.log(JSON.stringify(prevMsgs), JSON.stringify(currentMsgs), JSON.stringify(nextMsgs))
    return JSON.stringify(nextMsgs) === JSON.stringify(currentMsgs) &&
        JSON.stringify(currentMsgs) !== JSON.stringify(prevMsgs)
}

/**
 * 传入msgContent，返回一个数组，里面是消息文本和图片src地址
 * @param msgContent
 * @returns {*[]}
 */
function msgExtractor(msgContent) {
    if (!msgContent?.querySelectorAll) return []
    return [...(Array.from(msgContent?.querySelectorAll('.text-normal')).map(textElement => textElement?.innerText)),
        ...(Array.from(msgContent?.querySelectorAll('.image-content')).map(imgElement => imgElement?.src)),
        ...(Array.from(msgContent?.querySelectorAll('.markdown-element')).map(markdownElement => markdownElement.children))]
}

/**
 * 添加+1tag
 * @param msgContentContainer
 */
function appendPlusOneTag(msgContentContainer) {
    try {
        if (msgContentContainer.querySelector('.em-svg-container')) return;//已经有了就不要再加了。

        const svgContainer = document.createElement('div');
        svgContainer.className = 'em-svg-container'
        svgContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#66ccff"><path d="M250-292.31v-120H130v-60h120v-120h60v120h120v60H310v120h-60Zm391.54 71.54v-428.77l-96.62 68.31-34.46-51.54 149.39-106.46h47.84v518.46h-66.15Z"/></svg>`
        svgContainer.style.display = 'flex';
        svgContainer.style.justifyContent = 'center'; // 水平居中
        svgContainer.style.alignItems = 'center'; // 垂直居中
        svgContainer.style.cursor = 'pointer'; // 鼠标悬停时光标变为手指

        msgContentContainer.classList.add('em-msg-container')//先修改父元素样式
        msgContentContainer.appendChild(svgContainer)

        if (msgContentContainer?.classList.contains('container--others'))//说明是别人发的消息
        {
            svgContainer.classList.add('em-plus-one-img-right')
            svgContainer.addEventListener('mouseenter', () => {
                svgContainer.style.transform = "translateX(50%) scale(1.1)";
                svgContainer.style.boxShadow = "0 0 10px rgba(17,183,234,0.5)";
            })
            svgContainer.addEventListener('mouseleave', () => {
                svgContainer.style.transform = "translateX(50%) scale(1)";
                svgContainer.style.boxShadow = "none"; // 恢复原来的样式
            })
            svgContainer.addEventListener('mousedown', () => {
                svgContainer.style.transform = "translateX(50%) scale(0.9)"; // 按下时缩小
                svgContainer.style.boxShadow = "0 0 5px rgba(17,183,234,0.5)"; // 按下时阴影
            });
            svgContainer.addEventListener('mouseup', () => {
                svgContainer.style.transform = "translateX(50%) scale(1)"; // 按下时缩小
                svgContainer.style.boxShadow = "0 0 5px rgba(17,183,234,0.5)"; // 按下时阴影
            });


        } else {
            svgContainer.classList.add('em-plus-one-img-left')
            svgContainer.addEventListener('mouseenter', () => {
                svgContainer.style.transform = "translateX(-50%) scale(1.1)";
                svgContainer.style.boxShadow = "0 0 10px rgba(17,183,234,0.5)";
            })
            svgContainer.addEventListener('mouseleave', () => {
                svgContainer.style.transform = "translateX(-50%) scale(1)";
                svgContainer.style.boxShadow = "none"; // 恢复原来的样式
            })
            svgContainer.addEventListener('mousedown', () => {
                svgContainer.style.transform = "translateX(-50%) scale(0.9)"; // 按下时缩小
                svgContainer.style.boxShadow = "0 0 5px rgba(17,183,234,0.5)"; // 按下时阴影
            });
            svgContainer.addEventListener('mouseup', () => {
                svgContainer.style.transform = "translateX(-50%) scale(1)"; // 按下时缩小
                svgContainer.style.boxShadow = "0 0 5px rgba(17,183,234,0.5)"; // 按下时阴影
            });
        }

        setTimeout(() => {
            svgContainer.style.transform = msgContentContainer?.classList.contains('container--others') ?
                "translateX(50%)" : "translateX(-50%)";
            svgContainer.style.opacity = "0.9";
            svgContainer.style.border = "2px solid #66ccff";
        }, 100);

        plusOneListener(svgContainer)//添加事件监听器。

        // console.log(pluginName + '+1tag添加成功')
    } catch (e) {

    }
}


function removePlusOneTag(msgContentContainer) {
    const svgContainer = msgContentContainer?.querySelector('.em-svg-container')
    if (!svgContainer) return//找不到就直接退出

    svgContainer.style.opacity = '0'
    if (msgContentContainer?.classList.contains('container--others'))//说明是别人发的消息
    {
        svgContainer.style.transform = "translateX(-100%)"
    } else {
        svgContainer.style.transform = "translateX(100%)"
    }

    setTimeout(() => {
        msgContentContainer.removeChild(svgContainer)//移除掉多余的svg
    }, 500)

}

function plusOneListener(svgContainer) {
    svgContainer.addEventListener('click', async () => {
        //准备复读并发送消息.
        const msgID = svgContainer.closest('.ml-item').id
        //新版拿不到这个curAioData了，那先看看有没有什么账号消息吧
        console.log("一些基本信息如下：", app.__vue_app__)
        //老版本的curAioData位置
        let curAioData = app.__vue_app__.config.globalProperties?.$store?.state?.common_Aio?.curAioData
        //新版本的curAioData位置
        if (!curAioData) //天哪让我们来点魔法！
            curAioData = app._vnode.component.appContext.app.config.globalProperties.$dt.pageManager.pageMap
                .pg_aio_pc.pageRoot.__VUE__[0].subTree.children[1].children[0].children[1]
                .component.ctx.msgAction.curAioData

        const peerUid = curAioData.header.uid
        const chatType = curAioData.chatType
        //console.log('拿到的消息ID为' + msgID)
        //发送IPC消息

        //基于新版进行修改。
        window.echo_message.invokeNative("ntApi", "nodeIKernelMsgService/forwardMsgWithComment", window.webContentId,
            {
                "msgIds": [msgID],
                "msgAttributeInfos": new Map(),
                "srcContact": {"chatType": chatType, "peerUid": peerUid, "guildId": ""},
                "dstContacts": [{"chatType": chatType, "peerUid": peerUid, "guildId": ""}],
                "commentElements": []
            }, null)
            .then(result => {
                console.log('消息转发成功, 返回结果:', result);
            }).catch(error => {
            console.error('消息转发失败:', error);
        });
    })
}

export function patchCss() {
    console.log(pluginName + 'css加载中')

    let style = document.createElement('style')
    style.type = "text/css";
    style.id = "echo-message-css";

    let sHtml = `
.em-msg-container {
    position: relative;
    overflow: unset !important;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
}

.em-plus-one-img-right {
    position: absolute;
    left: calc(100% - 5px);
    width: 25px;
    height: 25px;
    border-radius: 50%;
    opacity: 0.2;
    color: var(--text-color);
    background-color: var(--background-color-05);
    backdrop-filter: blur(14px);
    box-shadow: var(--box-shadow);
    transition: 250ms;
}


.em-plus-one-img-left {
    position: absolute;
    right: calc(100% - 5px);
    width: 25px;
    height: 25px;
    border-radius: 50%;
    opacity: 0.2;
    color: var(--text-color);
    background-color: var(--background-color-05);
    backdrop-filter: blur(28px);
    box-shadow: var(--box-shadow);
    transition: 250ms;
}

`

    style.innerHTML = sHtml
    document.getElementsByTagName('head')[0].appendChild(style)
    console.log(pluginName + 'css加载完成')
}

const textElement = {
    elementType: 1,
    elementId: '',
    textElement: {
        content: '',
        atType: 0,
        atUid: '',
        atTinyId: '',
        atNtUid: ''
    }
}

const success = [{
    "senderFrame": {},
    "frameId": 1,
    "processId": 6,
    "frameTreeNodeId": 3
}, false, "RM_IPCFROM_RENDERER3", [{
    "type": "request",
    "callbackId": "16102db9-dca5-45fd-8b28-3cead14512a6",
    "eventName": "ntApi",
    "peerId": 3
}, {
    "cmdName": "nodeIKernelMsgService/forwardMsgWithComment",
    "cmdType": "invoke",
    "payload": [{
        "msgIds": ["7596720489687103620"],
        "srcContact": {"chatType": 2, "peerUid": "934773893", "guildId": ""},
        "dstContacts": [{"chatType": 2, "peerUid": "934773893", "guildId": ""}],
        "commentElements": [],
        "msgAttributeInfos": {}
    }, null]
}]]


function findObjectByKey(obj, key, path = 'window', visited = new Set()) {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) {
        return;
    }
    visited.add(obj);

    if (key in obj) {
        console.log(`Found key "${key}" in object at path: ${path}`);
        console.log('Object:', obj);
        console.log('Value:', obj[key]);
    }

    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            const newPath = Array.isArray(obj) ? `${path}[${prop}]` : `${path}.${prop}`;
            try {
                findObjectByKey(obj[prop], key, newPath, visited);
            } catch (e) {
                // Ignore errors from accessing certain properties
            }
        }
    }
}

// console.log('Starting global search for "curAioData"... This may take a while.');
// // 我们不直接从 window 开始，而是从可能性最大的 app 对象开始，以提高效率
// findObjectByKey(app, 'curAioData', 'app');
// console.log('Search finished.');