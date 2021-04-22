class Webexcel {
    constructor(el, options = {}) {

    }
    loadData(data) {
        console.log(data);
        return this;
    }
}

const webexcel = (el, options = {}) => new Webexcel(el, options);

if (window) {
    window.webexcel = webexcel;
}

export default webexcel;
export {
    webexcel,
};