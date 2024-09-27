const pluginName = '[Echo-Message]'

export async function messageRenderer(allChats) {
    for (let i = 0; i < allChats.length; i++) {
        try {
            const currentMsgContent = allChats[i].querySelector('.message-content');
            const prevMsgContent = i - 1 < 0 ? undefined :
                allChats[i - 1].querySelector('.message-content');
            const nextMsgContent = i + 1 === allChats.length ? undefined :
                allChats[i + 1].querySelector('.message-content');
            //判断有没有越界，越界了就开始下一个循环。
            if (!(prevMsgContent || nextMsgContent)) continue
            //判断是否符合+1条件
            if (!msgChecker(prevMsgContent, currentMsgContent, nextMsgContent)) continue

            //没问题！应该对下一条消息加上+1标签。
            const msgContentContainer = allChats[i + 1].querySelector('.msg-content-container')
            appendPlusOneTag(msgContentContainer)//添加tag

        } catch (e) {
            console.log(pluginName + e)
        }
    }
}


function appendPlusOneTag(msgContentContainer) {
    msgContentContainer.classList.add('.plus-one')//先修改父元素样式

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
    return JSON.stringify(prevMsgs) === JSON.stringify(currentMsgs) && JSON.stringify(currentMsgs) !== JSON.stringify(nextMsgs)
}

/**
 * 传入msgContent，返回一个数组，里面是消息文本和图片src地址
 * @param msgContent
 * @returns {*[]}
 */
function msgExtractor(msgContent) {
    return [...msgContent.querySelectorAll('.text-normal').map(textElement => textElement.innerText),
        ...msgContent.querySelectorAll('.image-content').map(imgElement => imgElement.src)]
}

export function patchCss() {
    console.log(pluginName + 'css加载中')

    let style = document.createElement('style')
    style.type = "text/css";
    style.id = "echo-message-css";

    let sHtml = `
.plus-one-other-msg {
    position: relative;
    overflow: unset !important;
    margin-right: 3px;
}
.plus-one-self-msg {
    position: relative;
    overflow: unset !important;
    margin-left: 3px;
}

`

    style.innerHTML = sHtml

    document.getElementsByTagName('head')[0].appendChild(style)
    console.log(pluginName + 'css加载完成')
}
