// 传到这层应该是在可视区域实际渲染的：
// viewIdx
// viewOffset
// realIdx?
// viewSource

// 至于：以下方法应该是更上层去做
// canvas层：realIdx -> viewIdx:  (idx: RangeIndexes, scrollidx: ScrollIndexes) => RangeIndexes;
// rangecontroller层：getOffsetByIndex: 逻辑索引得到物理定位

export const CellZindexMap = {
    'blank': 0,
    // 'merge': 1,
    'grid-range': 2,
    'style-range': 3,
    // 3: 'bgcolor',
    // 4: 'border',
    'text-range': 100,
    'selector-range': 999,
};