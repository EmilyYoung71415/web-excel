/**
 * 性能监控的打点
 */
// canvas绘制的相关数据
export function performanceLog() {
    const entries = performance.getEntriesByType('measure');
    for (const entry of entries) {
        console.table(entry.toJSON());
    }
    performance.clearMarks();
    performance.clearMeasures();
}

// 监听dom
export function mutationObserverDoc($target) {
    const observer = new MutationObserver(mutationsList => {
        console.log(`时间：${performance.now()}，DOM树发生了变化！有以下变化类型:`);
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
            }
            else if (mutation.type === 'attributes') {
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
        }
    });
    observer.observe($target, {
        attributes: true,
        childList: true,
        subtree: true,
    });
}