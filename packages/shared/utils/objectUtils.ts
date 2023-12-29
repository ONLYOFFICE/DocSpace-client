export default class ObjectUtils {
  static getJSXElement(obj: unknown, ...params: unknown[]) {
    // @ts-expect-error Don`t understand this line and class generally
    return this.isFunction(obj) ? obj(...params) : obj;
  }
}
