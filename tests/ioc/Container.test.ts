import Container from "./../../src/ioc/Container";

test('registers an instance, and then checks and retrieves it', () => {
    let container = new Container();
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
    let container = new Container();
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
    let container = new Container();

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

test('register and then override', () => {
    let container = new Container();

    var instance1 = new SomeService();
    var instance2 = new SomeService();

    container.registerType(SomeService);
    container.registerInstance(SomeService, instance1);
    container.registerFactory(SomeService, () => instance2);

    expect(container.get(SomeService)).toBe(instance2);
});


test('register and retrieve and register again', () => {
    let container = new Container();

    container.registerType(SomeService);

    container.get(SomeService);

    expect(() => container.registerType(SomeService))
        .toThrowError(Error('Container is locked - nothing can be registered!'));
});

test('register factoring producing nothing', () => {
    let container = new Container();

    container.registerFactory(SomeService, () => null);

    expect(() => container.get(SomeService))
        .toThrowError(Error("'SomeService' not created!"));
});

test('missing', () => {
    let container = new Container();

    expect(() => container.get(SomeService))
        .toThrowError(Error("'SomeService' not registered!"));
});

class SomeService {

}