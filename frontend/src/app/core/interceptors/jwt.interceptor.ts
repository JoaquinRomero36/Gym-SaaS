import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError, of } from 'rxjs';
import { AuthService } from '../auth.service';

let isRefreshing = false;
const refreshSubject$ = new BehaviorSubject<string | null>(null);

function addAuth(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.accessToken();
  const authed = token ? addAuth(req, token) : req;

  return next(authed).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      if (req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh')) {
        return throwError(() => err);
      }
      return handle401(authed, auth, next);
    }),
  );
};

function handle401(
  req: HttpRequest<unknown>,
  auth: AuthService,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (!auth.isAuthenticated()) {
    auth.logout();
    return throwError(() => new Error('Unauthenticated'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject$.next(null);

    return auth.refresh().pipe(
      switchMap(res => {
        isRefreshing = false;
        refreshSubject$.next(res.access_token);
        return next(addAuth(req, res.access_token));
      }),
      catchError(err => {
        isRefreshing = false;
        auth.logout();
        return throwError(() => err);
      }),
    );
  }

  return refreshSubject$.pipe(
    filter((t): t is string => !!t),
    take(1),
    switchMap(token => next(addAuth(req, token))),
  );
}
