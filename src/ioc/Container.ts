export type InstanceType<T> = { new(...args: any[]): T };
export type InstanceFactory<T> = (container: Container) => T;
export type InstanceReference<T> = string | InstanceType<T>;

function makeAlias(reference: InstanceReference<any> | InstanceType<any>): string {
    if (typeof reference === 'string') {
        return reference;
    }

    return (reference as any).name;
}

class LockedError extends Error {
    constructor() {
        super('Container is locked - nothing can be registered!')
    }
}

function getAndRemove(reference: string, data: Map<string, any>): any {
    let value = data.get(reference);

    data.delete(reference);

    return value;
}

export default class Container {

    private locked = false;

    private resolvedInstances = new Map<string, any>();

    private registeredInstances = new Map<string, any>();
    private registeredTypes = new Map<string, InstanceType<any>>();
    private registeredFactories = new Map<string, InstanceFactory<any>>();

    registerInstance<T>(reference: InstanceReference<T>, instance: T) {

        if (this.locked) {
            throw new LockedError();
        }
        
        this.registerResolver(makeAlias(reference), instance, this.registeredInstances);
    }

    registerType<T>(reference: string, type: InstanceType<T>): void;
    registerType<T>(reference: InstanceType<T>): void;

    registerType<T>(reference: string | InstanceType<T>, type?: InstanceType<T>) {

        if (this.locked) {
            throw new LockedError();
        }

        if (typeof reference === 'string') {
            this.registerResolver(reference, type, this.registeredTypes);
        } else {
            this.registerResolver(makeAlias(reference), reference, this.registeredTypes);
        }
    }

    registerFactory<T>(reference: InstanceReference<T>, factory: InstanceFactory<T>) {

        if (this.locked) {
            throw new LockedError();
        }
        
        this.registerResolver(makeAlias(reference), factory, this.registeredFactories);
    }

    get<T>(reference: InstanceReference<T>): T {

        this.locked = true;

        let alias = makeAlias(reference);

        if (!this.resolvedInstances.has(alias)) {
            this.resolvedInstances.set(alias, this.resolveInstance(alias));
        }

        return this.resolvedInstances.get(alias);
    }

    private resolveInstance<T>(reference: string): T {

        let instance = getAndRemove(reference, this.registeredInstances);

        if (instance !== null && typeof instance !== 'undefined') {
            return instance;
        }

        let type = getAndRemove(reference, this.registeredTypes);

        if (type) {
            return new type(this);
        }

        let factory = getAndRemove(reference, this.registeredFactories);

        if (factory) {
            let result = factory(this);

            if (result === null || typeof result === 'undefined') {
                throw new Error(`'${reference}' not created!`);
            }

            return result;
        }

        throw new Error(`'${reference}' not registered!`);
    }

    has(reference: InstanceReference<any>): boolean {

        let alias = makeAlias(reference);

        return !![
            this.resolvedInstances,
            this.registeredInstances,
            this.registeredTypes,
            this.registeredFactories
        ].find(i => i.has(alias));
    }
    
    private registerResolver(alias: string, resolver: any, targetResolvers: Map<string, any>) {
        [
            this.registeredInstances,
            this.registeredFactories,
            this.registeredTypes
        ].forEach(resolvers => {
            if (resolvers === targetResolvers) {
                resolvers.set(alias, resolver);
            } else {
                resolvers.delete(alias);
            }
        });
    }
}