export default class ObjectUtils {
  static isFunction: any;
  static getJSXElement(obj: any, ...params: any[]) {
    return this.isFunction(obj) ? obj(...params) : obj;
  }
}
