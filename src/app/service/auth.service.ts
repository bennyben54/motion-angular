import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Http, RequestOptionsArgs, Headers } from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserLogin } from '../model/auth/user-login';
import { Token } from '../model/auth/token';
import { UserInfo } from '../model/auth/user-info';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly x_app_beo_token = 'x-beo-app-token';
  private readonly oauthServer = 'http://localhost:8080/oauth';
  private readonly appName = 'first-client';
  private readonly appSecret = 'noonewilleverguess';

  private _accessToken: Token;
  private _user: UserInfo;

  public get user(): UserInfo {
    return this._user;
  }

  public get accessToken(): Token {
    return this._accessToken;
  }

  constructor(private router: Router, private http: HttpClient) { }

  obtainAccessToken(loginData: UserLogin) {
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
        this.oauthServer + '/token',
        httpParams.toString(),
        options)
        .subscribe(
          data => {
            console.log(data);
            this.saveToken(data);
            this.checkToken();
          },
          err => alert('Invalid Credentials'));
  }

  checkToken() {
    const httpHeaders = new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
        .set('Authorization', this.computeBasic());
        const options = {
          headers: httpHeaders
        };
        this.http.post<UserInfo>(
          this.oauthServer + '/check_token?token=' + this.accessToken.access_token,
          null,
          options)
          .subscribe(
            data => {
              console.log(data);
              this._user = data;
              this.router.navigate(['/']);
            },
            err => {
              this.router.navigate(['/login']);
            });
  }

  private computeBasic(): string {
    return 'Basic ' + btoa(this.appName + ':' + this.appSecret);
  }

  saveToken(token: Token) {
    // var expireDate = new Date().getTime() + (1000 * token.expires_in);
    this._accessToken = token;
    window.localStorage.setItem(this.x_app_beo_token, JSON.stringify(token));
  }

  checkCredentials() {
    this._accessToken = JSON.parse(window.localStorage.getItem('x-beo-app-token'));
    if (!this.accessToken) {
      this.router.navigate(['/login']);
    } else {
      if (!this.user) {
        this.checkToken();
      }
      if (this.user.authorities.find(s => s === 'ADMIN')) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  logout() {
    this._accessToken = undefined;
    window.localStorage.removeItem(this.x_app_beo_token);
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