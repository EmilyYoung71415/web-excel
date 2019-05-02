class Webexcel{
    constructor(){
    }
}

const webexcel = (el, options = {}) => new Webexcel(el, options);

if (window) {
  window.webexcel = webexcel;
}

export default webexcel;