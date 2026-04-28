/// <reference types="jest" />

import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("health", () => {
    it("should return the service status", () => {
      const response = appController.getHealth();

      expect(response).toMatchObject({
        service: "isp.billing.be",
        status: "ok",
      });
      expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
    });
  });
});
