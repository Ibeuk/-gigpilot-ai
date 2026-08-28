import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that enforces JWT authentication.
 * Apply to routes or controllers that require a logged-in user.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
