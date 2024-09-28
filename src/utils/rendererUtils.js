const pluginName = '[Echo-Message]'

export async function messageRenderer(allChats) {

    for (let i = 0; i < allChats.length; i++) {
        try {
            const msgContentContainer = allChats[i]?.querySelector('.msg-content-container')

            const preMsgConContainer = i > 0 ? allChats[i - 1]?.querySelector('.msg-content-container') : null;

            if (preMsgConContainer?.querySelector('.em-svg-container')) removePlusOneTag(msgContentContainer)//只保留一个svg

            if (msgContentContainer?.classList.contains('em-msg')) continue//已经改过的不要改

            const currentMsgContent = allChats[i]?.querySelector('.message-content');
            const prevMsgContent = i - 1 < 0 ? undefined : allChats[i - 1]?.querySelector('.message-content');
            const nextMsgContent = i + 1 === allChats.length ? undefined : allChats[i + 1]?.querySelector('.message-content');
            //判断有没有越界，越界了就开始下一个循环。
            if (!(prevMsgContent || nextMsgContent)) continue
            //判断是否符合+1条件
            if (!msgChecker(prevMsgContent, currentMsgContent, nextMsgContent)) continue

            //没问题！应该对下一条消息加上+1标签。
            console.log(pluginName + '消息检查成功')
            appendPlusOneTag(msgContentContainer)//添加tag

        } catch (e) {
            console.log(pluginName + e)
        }
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
        ...(Array.from(msgContent?.querySelectorAll('.image-content')).map(imgElement => imgElement?.src))]
}

/**
 * 添加+1tag
 * @param msgContentContainer
 */
function appendPlusOneTag(msgContentContainer) {
    const svgContainer = document.createElement('div');
    svgContainer.className = 'em-svg-container'
    svgContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#66ccff"><path d="M250-292.31v-120H130v-60h120v-120h60v120h120v60H310v120h-60Zm391.54 71.54v-428.77l-96.62 68.31-34.46-51.54 149.39-106.46h47.84v518.46h-66.15Z"/></svg>`
    svgContainer.style.display = 'flex';
    svgContainer.style.justifyContent = 'center'; // 水平居中
    svgContainer.style.alignItems = 'center'; // 垂直居中
    svgContainer.style.cursor = 'pointer'; // 鼠标悬停时光标变为手指

    msgContentContainer.classList.add('em-msg')//先修改父元素样式
    msgContentContainer.appendChild(svgContainer)

    if (msgContentContainer?.classList.contains('container--others'))//说明是别人发的消息
    {
        svgContainer.classList.add('em-plus-one-img-right')
    } else {
        svgContainer.classList.add('em-plus-one-img-left')
    }

    setTimeout(() => {
        svgContainer.style.transform = msgContentContainer?.classList.contains('container--others') ?
            "translateX(50%)" : "translateX(-50%)";
        svgContainer.style.opacity = "0.9";
        svgContainer.style.border = "2px solid #66ccff";
    }, 100);
    console.log(pluginName + '+1tag添加成功')
}


function removePlusOneTag(msgContentContainer) {
    const svgContainer = msgContentContainer?.querySelector('.em-svg-container')

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

export function patchCss() {
    console.log(pluginName + 'css加载中')

    let style = document.createElement('style')
    style.type = "text/css";
    style.id = "echo-message-css";

    let sHtml = `
.em-msg {
    position: relative;
    overflow: unset !important;
}

.em-svg-container:hover {
    opacity: 1; /* 鼠标悬停时完全不透明 */
    transform: scale(1.1); /* 放大效果 */
}

.em-svg-container:active {
    transform: scale(0.95); /* 点击时缩小效果 */
}

.em-plus-one-img-right {
    position: absolute;
    left: calc(95%);
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
    right: calc(95%);
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
