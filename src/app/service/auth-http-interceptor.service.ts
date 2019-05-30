import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpInterceptorService implements HttpInterceptor {

  private readonly camerasUrl = [environment.servers.camera1, environment.servers.camera2];

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (
      (req.url.startsWith(environment.servers.userApi)
      ||
      !!this.camerasUrl.find(url => req.url.startsWith(url))
      )
      && !!this.authService.accessToken
    ) {
      console.log(req);
      return next.handle(req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + this.authService.accessToken.access_token)
      }));
    }
    return next.handle(req);
  }
}
