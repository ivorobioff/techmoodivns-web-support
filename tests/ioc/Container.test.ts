import Container from "./../../src/ioc/Container";

test('registers an instance, and then checks and retrieves it', () => {
    let container  = new Container();
    let instance = new SomeService();

    container.registerInstance(SomeService, instance);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.get(SomeService)).toEqual(instance);
});

test('registers a factory, then checks and retrieves the instance', () => {
    let container  = new Container();
    let instance = new SomeService();

    container.registerFactory(SomeService, () => instance);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.get(SomeService)).toEqual(instance);
});

class SomeService {

}