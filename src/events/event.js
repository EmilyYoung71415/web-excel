export function bind(target, name, fn) {
    target.addEventListener(name, fn);
}
export function unbind(target, name, fn) {
    target.removeEventListener(name, fn);
}
// mouse move 及 up 的系列动作封装
export function mouseMoveUp(target, movefunc, upfunc) {
    bind(target, 'mousemove', movefunc);
    bind(target, 'mouseup', movefinished);
    function movefinished(evt){
        unbind(target, 'mousemove', movefunc);
        unbind(target, 'mouseup', movefinished);
        upfunc(evt);
    }
}