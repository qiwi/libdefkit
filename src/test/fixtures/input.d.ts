declare module '@qiwi/decorator-utils/target/es5/interface' {
  /** @module @qiwi/decorator-utils */
  export interface IDecorator {
    (...args: Array<any>): any;
  }
  export type IInstance = {
    constructor: IInstance;
    prototype?: IProto;
  };
  export type IDecoratorArgs = any[];
  export type IDecoratorContext = {
    targetType: ITargetType | null;
    target: ITarget;
    proto: IProto;
    ctor: Function;
    propName?: IPropName;
    paramIndex?: IParamIndex;
  };
  export type IDecoratorHandlerContext = IDecoratorContext & {
    args: IDecoratorArgs;
  };
  export type IParamIndex = number;
  export type IHandler = (context: IDecoratorHandlerContext) => ITarget;
  export interface IProto {
    [key: string]: IAnyType;
  }
  export type IMapIterator = {
    (value: IAnyType, key: any, obj: IAnyType): IAnyType;
  };
  export type IReduceIterator = {
    (result: IAnyType, value: IAnyType, key: string, obj: IAnyType): IAnyType;
  };
  export type IPropName = string;
  export type IPropValue = any;
  export type ITarget = any;
  export type ITargetType = string | null;
  export type ITargetTypes = ITargetType | Array<ITargetType>;
  export type IAnyType = any;
  export interface IReducible {
    hasOwnProperty(name: string): boolean;
    [key: string]: IAnyType;
  }
  export type IDescriptor = PropertyDescriptor;
}
declare module '@qiwi/decorator-utils/target/es5/utils' {
  /** @module @qiwi/decorator-utils */
  import { IInstance } from '@qiwi/decorator-utils/target/es5/interface';
  import get from '@qiwi/decorator-utils/target/es5/lodash.get';
  import set from '@qiwi/decorator-utils/target/es5/lodash.set';
  import mapValues from '@qiwi/decorator-utils/target/es5/lodash.mapvalues';
  import isFunction from '@qiwi/decorator-utils/target/es5/lodash.isfunction';
  import isUndefined from '@qiwi/decorator-utils/target/es5/lodash.isundefined';
  export { get, set, mapValues, isUndefined, isFunction, };
  /**
   * Extracts prototype methods of instance.
   * @param {*} instance
   * @returns {Object}
   */
  export function getPrototypeMethods(instance: IInstance): PropertyDescriptorMap;
}
declare module '@qiwi/decorator-utils/target/es5/resolver' {
  /** @module @qiwi/decorator-utils */
  import { IDecoratorContext, IDescriptor, IParamIndex, IPropName, ITarget, ITargetType } from '@qiwi/decorator-utils/target/es5/interface';
  export const METHOD = "method";
  export const CLASS = "class";
  export const FIELD = "field";
  export const PARAM = "param";
  export const TARGET_TYPES: {
    METHOD: string;
    CLASS: string;
    FIELD: string;
    PARAM: string;
  }; type IResolver = {
    (target: ITarget, propName: IPropName, descriptor: IDescriptor | IParamIndex | void): IDecoratorContext | null;
  };
  export const getDecoratorContext: IResolver;
  export const getClassDecoratorContext: IResolver;
  export const getMethodDecoratorContext: IResolver;
  export const getParamDecoratorContext: IResolver;
  export const getFieldDecoratorContext: IResolver;
  /**
   * Detects decorated target type.
   * @param {*} target
   * @param {string} [propName]
   * @param {Object} [descriptor]
   * @returns {*}
   */
  export const getTargetType: (target: any, propName: string, descriptor: number | void | PropertyDescriptor) => ITargetType;
  export {};
}
declare module '@qiwi/decorator-utils/target/es5/decorator' {
  /** @module @qiwi/decorator-utils */
  import { IHandler, IDecorator, ITargetType } from '@qiwi/decorator-utils/target/es5/interface';
  /**
   * Constructs decorator by given function.
   * Holywar goes here: https://github.com/wycats/javascript-decorators/issues/23
   * @param {IHandler} handler
   * @param {ITargetTypes} [allowedTypes]
   * @returns {function(...[any])}
   */
  export const constructDecorator: (handler: IHandler, allowedTypes?: string | ITargetType[] | null | undefined) => IDecorator;
  export const assertTargetType: (targetType: ITargetType, allowedTypes: string | void | ITargetType[] | null) => void;
  export const createDecorator: (handler: IHandler, allowedTypes?: string | ITargetType[] | null | undefined) => IDecorator;
}
declare module '@qiwi/decorator-utils/target/es5/meta' {
  import { IMetadataProvider } from '@qiwi/decorator-utils/target/es5/@qiwi/substrate';
  export const injectMeta: (prv: IMetadataProvider, scope: string, path: string, value: unknown, target: any) => void;
}
declare module '@qiwi/decorator-utils/target/es5/index' {
  /** @module @qiwi/decorator-utils */
  import { constructDecorator } from '@qiwi/decorator-utils/target/es5/decorator';
  export { injectMeta } from '@qiwi/decorator-utils/target/es5/meta';
  export * from '@qiwi/decorator-utils/target/es5/resolver';
  export * from '@qiwi/decorator-utils/target/es5/decorator';
  export default constructDecorator;
}
declare module '@qiwi/decorator-utils' {
  export * from '@qiwi/decorator-utils/target/es5/index';
}
