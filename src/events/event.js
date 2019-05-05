export function bind(target, name, fn) {
    target.addEventListener(name, fn);
}
export function unbind(target, name, fn) {
    target.removeEventListener(name, fn);
}