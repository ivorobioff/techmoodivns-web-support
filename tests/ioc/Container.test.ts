import Container from "./../../src/ioc/Container";

test('registers an instance, and then checks and retrieves it', () => {
    let container  = new Container();
    let instance = new SomeService();

    expect(container.has(SomeService)).toBeFalsy()

    container.registerInstance(SomeService, instance);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.get(SomeService)).toEqual(instance);
});

test('registers a factory, and then checks and retrieves the instance', () => {
    let container  = new Container();
    let instance = new SomeService();

    expect(container.has(SomeService)).toBeFalsy()

    container.registerFactory(SomeService, () => instance);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.get(SomeService)).toEqual(instance);
});

test('registers a type, and then checks and retrieves its instance', () => {
    let container  = new Container();
    
    expect(container.has(SomeService)).toBeFalsy()

    container.registerType(SomeService);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.get(SomeService)).toBeInstanceOf(SomeService);
});

class SomeService {

}