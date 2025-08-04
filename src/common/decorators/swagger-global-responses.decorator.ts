import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiGlobalResponses() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized (JWT missing or invalid)',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden (insufficient permissions)',
    }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  );
}
