export type InstanceType<T> =  {new(...args: any[]) : T};
export type InstanceFactory<T> = (container: Container) => T;
export type InstanceReference<T> = string | InstanceType<T>;

function alias(reference: InstanceReference<any> | InstanceType<any>): string {
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

export default class Container {
    
    private locked = false;

    private instances = new Map<string, any>();

    private registeredTypes = new Map<string, InstanceType<any>>();
    private registeredFactories = new Map<string, InstanceFactory<any>>();

    registerInstance<T>(reference: InstanceReference<T>, instance: T) {

        if (this.locked) {
            throw new LockedError();
        }

        this.instances.set(alias(reference), instance);
    }

    registerType<T>(reference: string, type: InstanceType<T>): void;
    registerType<T>(reference: InstanceType<T>): void;

    registerType<T>(reference: string | InstanceType<T>, type?: InstanceType<T>) {
        
        if (this.locked) {
            throw new LockedError();
        }

        if (typeof reference === 'string') {
            this.registeredTypes.set(reference, type as InstanceType<T>);
        } else {
            this.registeredTypes.set(alias(reference), reference);
        }
    }

    registerFactory<T>(reference: InstanceReference<T>, factory: InstanceFactory<T>) {

        if (this.locked) {
            throw new LockedError();
        }
        
        this.registeredFactories.set(alias(reference), factory);
    }

    get<T>(reference: InstanceReference<T>): T {

        this.locked = true;

        let name = alias(reference);

        if (!this.instances.has(name)) {
            this.instances.set(name, this.resolveInstance(name));
        }

        return this.instances.get(name);
    }

    private resolveInstance<T>(reference: string): T {
        
        if (this.registeredTypes.has(reference)) {
            return new (this.registeredTypes.get(reference) as InstanceType<T>)(this);
        }

        if (this.registeredFactories.has(reference)) {
            return (this.registeredFactories.get(reference) as InstanceFactory<T>)(this);
        }

        throw new Error(`'${reference}' is not registered!`);
    }
    
    has(reference: InstanceReference<any>): boolean {
        return !![
            this.instances, 
            this.registeredTypes,
            this.registeredFactories
        ].find(i =>  i.has(alias(reference)));
    }
}