import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

interface HealthResponseBody {
  service: string;
  status: string;
  timestamp: string;
}

interface LoginResponseBody {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const users = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        password: string;
        role: string;
      }
    >();

    users.set("admin@ispbilling.com", {
      id: "demo-user-id",
      name: "Billing Admin",
      email: "admin@ispbilling.com",
      password: "admin12345",
      role: "ADMIN",
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        user: {
          findUnique: jest
            .fn()
            .mockImplementation(({ where }: { where: { email: string } }) => {
              return Promise.resolve(users.get(where.email) ?? null);
            }),
          create: jest
            .fn()
            .mockImplementation(
              ({
                data,
              }: {
                data: { name: string; email: string; password: string };
              }) => {
                const createdUser = {
                  id: `user-${users.size + 1}`,
                  name: data.name,
                  email: data.email,
                  password: data.password,
                  role: "CUSTOMER",
                };
                users.set(data.email, createdUser);
                return Promise.resolve(createdUser);
              },
            ),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("/api/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/health")
      .expect(200)
      .expect((response: unknown) => {
        const { body } = response as { body: HealthResponseBody };
        expect(body.service).toBe("isp.billing.be");
        expect(body.status).toBe("ok");
        expect(body.timestamp).toEqual(expect.any(String));
      });
  });

  it("/api/auth/login (POST)", () => {
    return request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "admin@ispbilling.com",
        password: "admin12345",
      })
      .expect(200)
      .expect((response: unknown) => {
        const { body } = response as { body: LoginResponseBody };
        expect(body.accessToken).toEqual(expect.any(String));
        expect(body.tokenType).toBe("Bearer");
        expect(body.expiresIn).toEqual(expect.any(String));
        expect(body.user.email).toBe("admin@ispbilling.com");
      });
  });

  it("/api/auth/register (POST)", () => {
    return request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        name: "New Customer",
        email: "customer1@ispbilling.com",
        password: "customer123",
      })
      .expect(201)
      .expect((response: unknown) => {
        const { body } = response as { body: LoginResponseBody };
        expect(body.accessToken).toEqual(expect.any(String));
        expect(body.tokenType).toBe("Bearer");
        expect(body.user.email).toBe("customer1@ispbilling.com");
        expect(body.user.name).toBe("New Customer");
      });
  });
});
