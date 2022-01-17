import Container from "./../../src/ioc/Container";

test('registers an instance, and then checks and retrieves it', () => {
    let container  = new Container();
    let instance1 = new SomeService();
    let instance2 = new SomeService();

    expect(container.has(SomeService)).toBeFalsy();
    expect(container.has('some')).toBeFalsy();

    container.registerInstance(SomeService, instance1);
    container.registerInstance('some', instance2);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.has('some')).toBeTruthy();

    expect(container.get(SomeService)).toBe(instance1);
    expect(container.get('some')).toBe(instance2);
});

test('registers a factory, and then checks and retrieves the instance', () => {
    let container  = new Container();
    let instance1 = new SomeService();
    let instance2 = new SomeService();

    expect(container.has(SomeService)).toBeFalsy();
    expect(container.has('some')).toBeFalsy();

    container.registerFactory(SomeService, () => instance1);
    container.registerFactory('some', () => instance2);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.has('some')).toBeTruthy();

    expect(container.get(SomeService)).toBe(instance1);
    expect(container.get('some')).toBe(instance2);
});

test('registers a type, and then checks and retrieves its instance', () => {
    let container  = new Container();
    
    expect(container.has(SomeService)).toBeFalsy();
    expect(container.has('some')).toBeFalsy();

    container.registerType(SomeService);
    container.registerType('some', SomeService);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.has('some')).toBeTruthy();

    let instance1 = container.get(SomeService);
    let instance2 = container.get('some');

    expect(instance1).toBeInstanceOf(SomeService);
    expect(instance2).toBeInstanceOf(SomeService);
    expect(instance1).not.toBe(instance2);
});

class SomeService {

}