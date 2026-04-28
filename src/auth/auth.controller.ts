import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { RegisterRequestDto } from "./dto/register-request.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginRequest);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body() registerRequest: RegisterRequestDto,
  ): Promise<LoginResponseDto> {
    return this.authService.register(registerRequest);
  }
}
