import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserAuthRepository } from "./repositories/user-auth.repository";
import { PasswordVerifierService } from "./services/password-verifier.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configuredExpirySeconds = Number(
          configService.get<string>("JWT_EXPIRES_IN_SECONDS") ?? 3600,
        );
        const jwtExpirySeconds =
          Number.isFinite(configuredExpirySeconds) &&
          configuredExpirySeconds > 0
            ? configuredExpirySeconds
            : 3600;

        return {
          secret:
            configService.get<string>("JWT_SECRET") ?? "dev-only-jwt-secret",
          signOptions: {
            expiresIn: jwtExpirySeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserAuthRepository, PasswordVerifierService],
  exports: [AuthService],
})
export class AuthModule {}
