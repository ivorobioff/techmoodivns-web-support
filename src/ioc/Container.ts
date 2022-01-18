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

    private instances = new Map<string, any>();

    private factories = new Map<string, InstanceFactory<any>>();

    registerInstance<T>(reference: InstanceReference<T>, instance: T) {

        if (this.locked) {
            throw new LockedError();
        }

        this.factories.set(makeAlias(reference), () => instance);        
    }

    registerType<T>(reference: string, type: InstanceType<T>): void;
    registerType<T>(reference: InstanceType<T>): void;

    registerType<T>(reference: string | InstanceType<T>, type?: InstanceType<T>) {

        if (this.locked) {
            throw new LockedError();
        }

        if (typeof reference === 'string') {
            this.factories.set(reference, (c) => new type!(c));
        } else {
            this.factories.set(makeAlias(reference), (c) => new reference(c));
        }
    }

    registerFactory<T>(reference: InstanceReference<T>, factory: InstanceFactory<T>) {

        if (this.locked) {
            throw new LockedError();
        }

        this.factories.set(makeAlias(reference), factory);        
    }

    get<T>(reference: InstanceReference<T>): T {

        this.locked = true;

        let alias = makeAlias(reference);

        if (!this.instances.has(alias)) {
            
            let factory = this.factories.get(alias);

            if (!factory) {
                throw new Error(`'${alias}' not registered!`);
            }

            let instance = factory(this);

            if (instance === null || typeof instance === 'undefined') {
                throw new Error(`'${alias}' not created!`);
            }

            this.instances.set(alias, instance);

            this.factories.delete(alias);
        }

        return this.instances.get(alias);
    }

    has(reference: InstanceReference<any>): boolean {

        let alias = makeAlias(reference);

        return this.instances.has(alias) || this.factories.has(alias);
    }
}