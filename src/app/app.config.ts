// app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import {
  HttpInterceptorFn,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { REQUIRE_CREDENTIALS } from './shared/tokens/withcredentials.token';

const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo activa cookies si la request lo pide vía HttpContext
  if (req.context.get(REQUIRE_CREDENTIALS)) {
    req = req.clone({ withCredentials: true });
  }
  return next(req);
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(), // backend basado en fetch
      withInterceptors([withCredentialsInterceptor]),
    ),
  ],
};
