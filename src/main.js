// 运行在 Electron 主进程 下的插件入口
const {pluginLog} = require("./utils/backendLogUtils.js");

// 创建窗口时触发
exports.onBrowserWindowCreated = (window) => {
    try {
        // window 为 Electron 的 BrowserWindow 实例
        window.webContents.on("did-stop-loading", async () => {
            if (window.webContents.getURL().indexOf("#/main/message") === -1 &&
                window.webContents.getURL().indexOf("#/chat") === -1
            ) {
                pluginLog('当前窗口ID为' + window.id)
                pluginLog(window.webContents.getURL())
                pluginLog(window.webContents.getURL().indexOf("#/main/message"))
                return;
            }
            // 进入聊天页面时触发渲染
            pluginLog('检测到聊天页面,通知渲染进程')
            window.echo_message.startRender()//给渲染进程发消息，说明当前是聊天窗口，可以进行渲染。
        })
    } catch (e) {
        pluginLog(e)
    }
}


// 用户登录时触发
exports.onLogin = (uid) => {
    // uid 为 账号 的 字符串 标识
}