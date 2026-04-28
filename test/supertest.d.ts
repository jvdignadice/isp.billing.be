declare module "supertest" {
  type ExpectHandler = (response: unknown) => void;

  interface Test {
    get(url: string): Test;
    post(url: string): Test;
    send(body: unknown): Test;
    expect(status: number): Test;
    expect(handler: ExpectHandler): Promise<void>;
  }

  interface RequestFactory {
    (app: unknown): Test;
  }

  const request: RequestFactory;
  export = request;
}
