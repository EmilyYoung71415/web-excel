import { getOffScreenContext } from './offscreen';
import { Text } from '../../type';

export function assembleFont(attrs: Text) {
    const { fontSize, fontFamily, fontWeight, fontStyle } = attrs;
    return [fontStyle, fontWeight, `${fontSize}px`, fontFamily].join(' ').trim();
}

/**
 * 获取文本的渲染宽度
 * @param text 
 * @param font
 * @returns width
 */
export function getTextWidth(text: string, font: string): number {
    const context = getOffScreenContext();
    context.save();
    context.font = font;
    const width = context.measureText(text).width;
    context.restore();
    return width;
}