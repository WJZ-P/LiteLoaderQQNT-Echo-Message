import {messageRenderer, patchCss} from "./utils/rendererUtils.js";

const pluginName = '[Echo-Message]'

// 打开设置界面时触发,不需要插件页面
// export const onSettingWindowCreated = (view) => {
//     // view 为 Element 对象，修改将同步到插件设置界面
//
//
// }

function onLoad(){
    patchCss()
}
onLoad()//调用onLoad

async function render() {
    try {
        const allChats = document.querySelectorAll('.ml-item')
        if (allChats) await messageRenderer(allChats)

    } catch (e) {
        console.log(e)
    }
}

//下面的方案有bug,MutationObserver有概率不触发，所以选择直接写死循环

//节流，防止多次渲染
let observerRendering = false
//聊天窗口监听器
const chatObserver = new MutationObserver(mutationsList => {
    if (observerRendering) return;

    observerRendering = true
    setTimeout(async () => {
        await render()
        observerRendering = false
    }, 50)
})

//聊天列表，所有聊天都显示在这里
const finder = setInterval(async () => {
    if (document.querySelector(".ml-list.list")) {
        clearInterval(finder);
        console.log(pluginName, "已检测到聊天区域");
        const targetNode = document.querySelector(".ml-list.list");
        //只检测childList就行了
        const config = {attributes: false, childList: true, subtree: false,};
        chatObserver.observe(targetNode, config);
    }
}, 100);


// Vue组件挂载时触发
export const onVueComponentMount = (component) => {
    // component 为 Vue Component 对象
}


// Vue组件卸载时触发
export const onVueComponentUnmount = (component) => {
    // component 为 Vue Component 对象
}