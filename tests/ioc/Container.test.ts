import Container from "./../../src/ioc/Container";

test('registers, then checks and retrieves the instance', () => {
    let container  = new Container();
    let instance = new SomeService();

    container.registerInstance(SomeService, instance);

    expect(container.has(SomeService)).toBeTruthy();
    expect(container.get(SomeService)).toEqual(instance);
});

class SomeService {

}