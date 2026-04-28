import { Injectable } from "@nestjs/common";

export interface HealthCheckResponse {
  service: string;
  status: "ok";
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthCheckResponse {
    return {
      service: "isp.billing.be",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
