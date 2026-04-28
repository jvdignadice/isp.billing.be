import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { LoginRequestDto } from "./dto/login-request.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { RegisterRequestDto } from "./dto/register-request.dto";
import { UserAuthRepository } from "./repositories/user-auth.repository";
import { PasswordVerifierService } from "./services/password-verifier.service";

interface AuthUserCandidate {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly passwordVerifierService: PasswordVerifierService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
    const normalizedEmail = loginRequest.email.trim().toLowerCase();
    const normalizedPassword = loginRequest.password.trim();
    const userCandidate = await this.resolveUserCandidate(normalizedEmail);

    if (!userCandidate) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isPasswordValid = this.passwordVerifierService.verify(
      normalizedPassword,
      userCandidate.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.buildLoginResponse({
      id: userCandidate.id,
      email: userCandidate.email,
      name: userCandidate.name,
      role: userCandidate.role,
    });
  }

  async register(
    registerRequest: RegisterRequestDto,
  ): Promise<LoginResponseDto> {
    const normalizedName = registerRequest.name.trim();
    const normalizedEmail = registerRequest.email.trim().toLowerCase();
    const normalizedPassword = registerRequest.password.trim();

    const existingUser =
      await this.userAuthRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException("Account already exists for this email.");
    }

    const passwordHash = this.passwordVerifierService.hash(normalizedPassword);
    const createdUser = await this.userAuthRepository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      password: passwordHash,
    });

    return this.buildLoginResponse({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
    });
  }

  private async resolveUserCandidate(
    email: string,
  ): Promise<AuthUserCandidate | null> {
    try {
      const dbUser = await this.userAuthRepository.findByEmail(email);

      if (dbUser) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          password: dbUser.password,
        };
      }
    } catch {
      // Fall through to demo credentials to keep local FE integration usable.
    }

    const demoUser = this.getDemoUser();
    if (email !== demoUser.email) {
      return null;
    }

    return demoUser;
  }

  private getDemoUser(): AuthUserCandidate {
    return {
      id: this.configService.get<string>("AUTH_DEMO_USER_ID") ?? "demo-user-id",
      email:
        this.configService.get<string>("AUTH_DEMO_EMAIL")?.toLowerCase() ??
        "admin@ispbilling.com",
      name: this.configService.get<string>("AUTH_DEMO_NAME") ?? "Billing Admin",
      role: UserRole.ADMIN,
      password:
        this.configService.get<string>("AUTH_DEMO_PASSWORD") ?? "admin12345",
    };
  }

  private getJwtExpiresIn(): string {
    const configuredExpirySeconds = Number(
      this.configService.get<string>("JWT_EXPIRES_IN_SECONDS") ?? 3600,
    );
    const jwtExpirySeconds =
      Number.isFinite(configuredExpirySeconds) && configuredExpirySeconds > 0
        ? configuredExpirySeconds
        : 3600;

    return `${jwtExpirySeconds}s`;
  }

  private async buildLoginResponse(payload: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }): Promise<LoginResponseDto> {
    const accessToken = await this.jwtService.signAsync({
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: this.getJwtExpiresIn(),
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    };
  }
}
