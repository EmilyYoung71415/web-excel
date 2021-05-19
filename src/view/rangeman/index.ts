/**
 * @file 跨cell的管理器
 * - 样式 style-range
 * - 选区 selector-range
 * - 合并单元格
 * - 条件格式
 * - 格式刷
 */
import { GridRange } from './grid-range';
import { FixedHeaderRange } from './fixedheader-range';
import { TextRange } from './text-range';
import { _merge, draw } from '../../utils';
import { GridIdxToOffsetMap } from '../../type';
import { CanvasRender } from '..';

const COMMAND = {
    // 'drawall': // 整个可视区域
};
type IDataStore = {
    gridmap: GridIdxToOffsetMap;
}

export class RangeRenderController {
    private _gridRange: GridRange;
    private _fixedHeaderRange: FixedHeaderRange;
    private _textRange: TextRange;
    private _cacheQueue: unknown;
    canvas: CanvasRender;
    dataStore: IDataStore;
    constructor(canvas: CanvasRender) {
        this.canvas = canvas;
        this.dataStore = {
            gridmap: null,
        };
        // 子range设计成可以拿父实例是为了：1.可以直接使用笔触 2.直接使用父处理好的数据 3.向上通知父
        this._gridRange = new GridRange(this);
        this._fixedHeaderRange = new FixedHeaderRange(this);
        this._textRange = new TextRange(this);
        // range会维护一个队列：
        // rectidx: range实例

        // this._fixedHeaderRange
        this._cacheQueue = {
            'drawall': [this._gridRange, this._fixedHeaderRange],
        };
    }
    // 首次渲染是
    // 以action聚合range
    command(action: string, propsdata: IDataStore) {
        this.dataStore = {
            gridmap: propsdata.gridmap,
        };
        // 在这里查到 改变的diff？ maybe
        // this.dataStore = _merge(this.propsdata, propsdata);
        this.render('drawall');

        // setRange({sri:1,sci:1,eri:1,eci:1}).text = '输入多行文字测试一下';
        // 命令会被转换为下面的代码执行
        // 指定区域绘制文字
        this._textRange.render(draw.getRangeOffsetByIdxes(propsdata.gridmap, {
            sri: 1, sci: 1, eri: 1, eci: 1
        }), {
            text: '输入多行文字测试一下',
            fontColor: 'blue',
            fontSize: 14,
        });
        this._textRange.render(draw.getRangeOffsetByIdxes(propsdata.gridmap, {
            sri: 3, sci: 3, eri: 3, eci: 3
        }), {
            text: '123456789101112',
            fontColor: 'red',
            fontSize: 14,
        });
        // setRange({sri:1,sci:1,eri:1,eci:1}).bgcolor = ''
        // 则需要把这个range的所有属性拿给textRange
        // 理想情况是：controller拿到这个range的信息
        // 无条件传给range，range再视情况 按需拿属性
        // 这样controller也不会太笨重

        // setRange(xx).bgcolor 
        // 1.找到该命中range上挂在的属性
        // 属性对于range，多个range按照zindex顺序 形成queue，依次调用
        // 所以压力就转换到了 如果将树状上的一个个的属性 转换为 一个个的range对象，这样既能实现全局的序列化 又能实现局部渲染
        // setRange({sri:1,sci:1,eri:1,eci:1}).text = '输入多行文字测试一下';
        // this._getRenderList();
    }
    // 局部更新是 以rangeidx 聚合 range 渲染
    render(rectidx: string) {
        const rangelist = this._getRenderList(rectidx);
        try {
            for (const range of rangelist) {
                range.render();
            }
        }
        catch (error) {
            throw new Error('range.render 出错');
        }
    }
    private _getRenderList(rectidx: string): Array<any> {
        if (rectidx === 'drawall') return this._cacheQueue[rectidx];
    }
    // 得到canvas上当前的选中区域 selectIndexes
    // 最上层mdata：selectIndexes那里拿
    private _getRefreshRegions(): Array<any> {
        return [];
    }
}