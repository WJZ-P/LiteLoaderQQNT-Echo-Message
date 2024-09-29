// Electron 主进程 与 渲染进程 交互的桥梁
const {contextBridge, ipcRenderer} = require("electron");


// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("echo_message", {
    // 框架中 IPC 通信标识格式为 "组织名.项目名.方法名"
    // 格式不重要，只需要确保标识唯一即可，定义成什么都行
    invokeNative: (eventName, cmdName, registered, webContentId, ...args) => invokeNative(eventName, cmdName, registered, webContentId, ...args),
});


/**
 * 调用一个qq底层函数，并返回函数返回值。来自
 * https://github.com/xtaw/LiteLoaderQQNT-Euphony/blob/master/src/main/preload.js
 *
 * @param { String } eventName 函数事件名。
 * @param { String } cmdName 函数名。
 * @param { Boolean } registered 函数是否为一个注册事件函数。
 * @param {Number} webContentId 当前窗口的webContentsId，在window对象中有这个属性。
 * @param  { ...Object } args 函数参数。
 * @returns { Promise<any> } 函数返回值。
 */
function invokeNative(eventName, cmdName, registered, webContentId, ...args) {
    console.log(`尝试发送IPC消息，webContentsId${webContentId},eventName${eventName},cmdName${cmdName},registered${registered},args${args}`)
    return new Promise(resolve => {
        const callbackId = crypto.randomUUID();
        const callback = (event, ...args) => {
            if (args?.[0]?.callbackId == callbackId) {
                ipcRenderer.off(`IPC_DOWN_${webContentId}`, callback);
                resolve(args[1]);
            }
        };
        ipcRenderer.on(`IPC_DOWN_${webContentId}`, callback);

        ipcRenderer.send(
            `IPC_UP_${webContentId}`,
            {
                type: 'request',
                callbackId,
                eventName: `${eventName}-${webContentId}${registered ? '-register' : ''}`
            },
            [cmdName, ...args]);
    });


}