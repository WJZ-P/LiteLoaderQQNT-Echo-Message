import {messageRenderer, patchCss} from "./utils/rendererUtils.js";

const pluginName = '[Echo-Message]'

// 打开设置界面时触发,不需要插件页面
// export const onSettingWindowCreated = (view) => {
//     // view 为 Element 对象，修改将同步到插件设置界面
//
//
// }

//app.__vue_app__.config.globalProperties?.$store?.state?.common_Aio.curAioData


function onLoad() {
    patchCss()//添加自己自定义的css
    if (location.hash === "#/blank") {
        navigation.addEventListener("navigatesuccess", onHashUpdate, {once: true});
    } else {
        onHashUpdate();
    }

}

onLoad()//调用onLoad

function onHashUpdate() {
    const hash = location.hash;
    if (hash === '#/blank') {
        return
    }

    if (!(hash.includes("#/main/message") || hash.includes("#/chat"))) return;//不符合条件直接返回

    const finder = setInterval(() => {
        if (document.querySelector(".ml-list.list")) {
            clearInterval(finder);
            console.log(pluginName, "已检测到聊天区域");
            const targetNode = document.querySelector(".ml-list.list");
            //只检测childList就行了
            const config = {attributes: false, childList: true, subtree: false,};
            chatObserver.observe(targetNode, config);
        }
    }, 100);
}

async function render() {
    try {
        const allChats = document.querySelectorAll('.ml-item')
        if (allChats) await messageRenderer(allChats)

    } catch (e) {
        console.log(e)
    }
}

//下面的方案有bug,MutationObserver有概率不触发，所以选择直接写死循环

//聊天窗口监听器
const chatObserver = new MutationObserver(mutationsList => {
    setTimeout(async () => {
        await render()
    }, 50)
})


// Vue组件挂载时触发
export const onVueComponentMount = (component) => {
    // component 为 Vue Component 对象
}


// Vue组件卸载时触发
export const onVueComponentUnmount = (component) => {
    // component 为 Vue Component 对象
}