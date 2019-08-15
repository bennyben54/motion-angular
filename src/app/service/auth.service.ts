import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserLogin } from '../model/auth/user-login';
import { Token } from '../model/auth/token';
import { UserInfo } from '../model/auth/user-info';
import { LoadingService } from './loading.service';
import { LoadingId } from '../model/loading/loading-id.enum';
import { AuthorityType } from '../model/auth/authority-type.enum';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly x_app_beo_token = 'x-beo-app-token';
  private readonly x_app_beo_user = 'x-beo-app-user';

  private _accessToken: Token;
  private _user: UserInfo;

  public get user(): UserInfo {
    return this._user;
  }

  public get accessToken(): Token {
    return this._accessToken;
  }

  constructor(private router: Router, private http: HttpClient, private loadingService: LoadingService) { }

  isLogged(): boolean {
    return !!this.accessToken && !!this.user;
  }

  isAdmin(): boolean {
    if (!this.user) {
      return false;
    }
    return !!this.user.authorities.find(a => a === AuthorityType.ROLE_ADMIN);
}

  obtainAccessToken(loginData: UserLogin) {
    this.loadingService.startLoading(LoadingId.LOGIN);
    const httpParams = new HttpParams()
      .set('username', loginData.username)
      .set('password', loginData.password)
      .set('grant_type', 'password')
      .set('scope', 'resource:read');

    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
      .set('Authorization', this.computeBasic());

    const options = {
      headers: httpHeaders
    };

    this.http.post<Token>(
      environment.servers.oauth + '/token',
      httpParams.toString(),
      options)
      .subscribe(
        data => {
          this.saveToken(data);
          this.checkToken();
        },
        err => {
          this.loadingService.stopLoading(LoadingId.LOGIN);
          alert('Invalid Credentials');
        });
  }

  private checkToken() {
    const httpHeaders = new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
        .set('Authorization', this.computeBasic());
        const options = {
          headers: httpHeaders
        };
        this.http.post<UserInfo>(
          environment.servers.oauth + '/check_token?token=' + this.accessToken.access_token,
          null,
          options)
          .subscribe(
            data => {
              this.saveUserInfo(data);
              if (this.isAdmin()) {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/']);
              }
              this.loadingService.stopLoading(LoadingId.LOGIN);
            },
            err => {
              this.logout();
              this.loadingService.stopLoading(LoadingId.LOGIN);
            });
  }

  private computeBasic(): string {
    return 'Basic ' + btoa(environment.oauth.appName + ':' + environment.oauth.appSecret);
  }

  private saveToken(token: Token) {
    // var expireDate = new Date().getTime() + (1000 * token.expires_in);
    this._accessToken = token;
    window.localStorage.setItem(this.x_app_beo_token, JSON.stringify(token));
  }

  private saveUserInfo(userInfo: UserInfo) {
    this._user = userInfo;
    window.localStorage.setItem(this.x_app_beo_user, JSON.stringify(userInfo));
  }

  checkCredentials() {
    this._accessToken = JSON.parse(window.localStorage.getItem(this.x_app_beo_token));
    this._user = JSON.parse(window.localStorage.getItem(this.x_app_beo_user));
    if (!this.accessToken) {
      this.logout();
    } else if (!this.user) {
        this.checkToken();
    // } else if (this.user.exp * 1000 > new Date().getTime()) {
    //   this.logout();
    }
  }

  logout() {
    this._accessToken = undefined;
    this._user = undefined;
    window.localStorage.removeItem(this.x_app_beo_token);
    window.localStorage.removeItem(this.x_app_beo_user);
    this.router.navigate(['/login']);
  }

  // getResource(resourceUrl): Observable<Foo>{
  //   var headers = new Headers({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
  //     'Authorization': 'Bearer '+Cookie.get('access_token')});
  //   var options = new RequestOptions({ headers: headers });
  //   return this._http.get(resourceUrl, options)
  //                  .map((res:Response) => res.json())
  //                  .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  // }
}