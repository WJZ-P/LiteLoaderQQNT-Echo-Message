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
    //新版qq，这个allChats反过来了，reverse一下
    //console.log(allChats)
    allChats = Array.from(allChats).reverse(); // 转数组再反转

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
    return JSON.stringify(nextMsgs) === JSON.stringify(currentMsgs) && JSON.stringify(currentMsgs) !== JSON.stringify(prevMsgs)
}

/**
 * 传入msgContent，返回一个数组，里面是消息文本和图片src地址
 * @param msgContent
 * @returns {*[]}
 */
function msgExtractor(msgContent) {
    if (!msgContent?.querySelectorAll) return []
    return [...(Array.from(msgContent?.querySelectorAll('.text-normal')).map(textElement => textElement?.innerText)), ...(Array.from(msgContent?.querySelectorAll('.image-content')).map(imgElement => imgElement?.src)), ...(Array.from(msgContent?.querySelectorAll('.markdown-element')).map(markdownElement => markdownElement.children))]
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
            svgContainer.style.transform = msgContentContainer?.classList.contains('container--others') ? "translateX(50%)" : "translateX(-50%)";
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

let cachedCurAioDataPath = null;

/**
 * 根据字符串路径安全地从对象中获取嵌套值。
 * @param {object} rootObject - 开始查找的根对象，例如 window 或 app。
 * @param {string} path - 要访问的路径，例如 'user.profile.name' 或 'user.friends[0]'。
 * @returns {any|undefined} 返回找到的值，如果路径无效则返回 undefined。
 */
function getValueByPath(rootObject, path) {
    if (!path || typeof path !== 'string') {
        return undefined;
    }
    // 将路径 'a.b[0].c' 转换为 ['a', 'b', '0', 'c']
    const keys = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');

    let result = rootObject;
    for (const key of keys) {
        if (result === null || typeof result !== 'object') {
            return undefined;
        }
        result = result[key];
    }
    return result;
}

function plusOneListener(svgContainer) {
    svgContainer.addEventListener('click', async () => {
        let curAioData;
        console.log("--- 开始获取 curAioData ---");

        // 1. [优先] 尝试使用缓存的路径
        if (cachedCurAioDataPath) {
            curAioData = getValueByPath(window, cachedCurAioDataPath); // 假设根对象是 window
            if (curAioData) {
                console.log(`✅ 成功从缓存路径获取: ${cachedCurAioDataPath}`);
            } else {
                console.warn(`⚠️ 缓存路径 "${cachedCurAioDataPath}" 已失效。`);
            }
        }

        // 2. [回退] 如果缓存路径失效或不存在，尝试已知的固定路径
        if (!curAioData) {
            console.log("... 尝试已知路径 1 (老版本)");
            curAioData = app?.__vue_app__?.config?.globalProperties?.$store?.state?.common_Aio?.curAioData;
        }
        if (!curAioData) {
            console.log("... 尝试已知路径 2 (新版本)");
            curAioData = app?.__vue_app__?.config?.globalProperties?.$dt?.pageManager?.pageMap?.pg_aio_pc?.pageRoot?.__VUE__?.[0]?.proxy?.aioStore?.curAioData;
        }

        // 3. [最后手段] 如果所有已知路径都失败，则执行搜索
        if (!curAioData) {
            console.log("... 所有已知路径均失败，开始执行全局搜索...");
            const result = findShortestPathAndValue(app, "curAioData");
            if (result && result.value) {
                curAioData = result.value;
                // 找到后，立即更新缓存！
                cachedCurAioDataPath = result.path;
                console.log(`✅ 搜索成功！已缓存新路径: ${cachedCurAioDataPath}`);
            }
        }

        // 4. 最终检查
        if (!curAioData) {
            console.error("❌ 致命错误: 所有方法都未能获取到 curAioData。无法执行复读操作。");
            return; // 中断执行
        }

        console.log("--- 获取成功, 准备转发消息 ---", curAioData);

        //准备复读并发送消息.
        const msgID = svgContainer.closest('.ml-item').id
        const peerUid = curAioData.header.uid
        const chatType = curAioData.chatType
        //console.log('拿到的消息ID为' + msgID)
        //发送IPC消息

        //基于新版进行修改。
        window.echo_message.invokeNative("ntApi", "nodeIKernelMsgService/forwardMsgWithComment", window.webContentId, {
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
    elementType: 1, elementId: '', textElement: {
        content: '', atType: 0, atUid: '', atTinyId: '', atNtUid: ''
    }
}

const success = [{
    "senderFrame": {}, "frameId": 1, "processId": 6, "frameTreeNodeId": 3
}, false, "RM_IPCFROM_RENDERER3", [{
    "type": "request", "callbackId": "16102db9-dca5-45fd-8b28-3cead14512a6", "eventName": "ntApi", "peerId": 3
}, {
    "cmdName": "nodeIKernelMsgService/forwardMsgWithComment", "cmdType": "invoke", "payload": [{
        "msgIds": ["7596720489687103620"],
        "srcContact": {"chatType": 2, "peerUid": "934773893", "guildId": ""},
        "dstContacts": [{"chatType": 2, "peerUid": "934773893", "guildId": ""}],
        "commentElements": [],
        "msgAttributeInfos": {}
    }, null]
}]]

/**
 * [V4 优化版] - 查找对象中某个 key 的最短可访问路径及其对应的值
 *
 * 该算法使用广度优先搜索 (BFS) 来保证找到的路径层级最浅。
 * 它会忽略 Vue 内部的响应式依赖属性（如 dep, __v_raw, _value 等），
 * 从而避免产生超长的无效路径。
 *
 * @param {object} rootObject - 搜索的起始对象，例如 `app` 或 `window`。
 * @param {string} targetKey - 要查找的属性名，例如 "curAioData"。
 * @returns {{path: string, value: any}|null} - 返回一个包含最短路径和对应值的对象，如果找不到则返回 null。
 */
function findShortestPathAndValue(rootObject, targetKey) {
    console.log(`🚀 开始搜索 "${targetKey}" 的最短路径和值...`);

    // 定义需要忽略的属性名
    const ignoreProps = new Set([
        'dep', '__v_raw', '__v_skip', '_value', '__ob__',
        'prevDep', 'nextDep', 'prevSub', 'nextSub', 'deps', 'subs',
        '__vueParentComponent', 'parent', 'provides'
    ]);

    // 使用广度优先搜索 (BFS)
    const queue = [{obj: rootObject, path: 'app'}]; // 队列中存储对象及其路径
    const visited = new Set(); // 存储已经访问过的对象，防止循环引用

    visited.add(rootObject);

    while (queue.length > 0) {
        const {obj, path} = queue.shift(); // 取出队列头的元素

        // 检查当前对象是否直接包含目标 key
        if (obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, targetKey)) {
            const finalPath = `${path}.${targetKey}`;
            const finalValue = obj[targetKey]; // 【新】获取找到的值

            console.log(`✅ 成功! 找到最短路径:`);
            console.log(`%c${finalPath}`, 'color: #4CAF50; font-weight: bold; font-size: 14px;');
            console.log('✅ 对应的值为:', finalValue);


            // 验证路径是否真的可访问
            try {
                if (eval(finalPath) === finalValue) {
                    console.log("路径验证成功！");
                    // 【修改点】返回一个包含路径和值的对象
                    return { path: finalPath, value: finalValue };
                }
            } catch (e) {
                console.warn(`找到路径 "${finalPath}"，但无法通过 eval 访问。继续搜索...`);
            }
        }

        // 将子属性加入队列
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (ignoreProps.has(prop)) {
                    continue;
                }

                const childObj = obj[prop];

                if (childObj && typeof childObj === 'object' && !visited.has(childObj)) {
                    visited.add(childObj);
                    const newPath = Array.isArray(obj) ? `${path}[${prop}]` : `${path}.${prop}`;
                    queue.push({obj: childObj, path: newPath});
                }
            }
        }
    }

    console.log(`❌ 搜索完成，未找到 "${targetKey}" 的可访问路径。`);
    return null;
}


// --- 如何使用 ---

// 假设 app 依然是你的 Vue 应用根对象
// const shortestPath = findShortestPath(app, 'curAioData');

// if (shortestPath) {
//     console.log("你可以通过以下方式访问数据:");
//     console.log(`const data = ${shortestPath}`);
// }