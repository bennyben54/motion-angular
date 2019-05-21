import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Http, RequestOptionsArgs, Headers } from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _accessToken: string;

  public get accessToken(): string {
    return this._accessToken;
  }

  constructor(private router: Router, private http: HttpClient) { }

  obtainAccessToken(loginData) {
    const httpParams = new HttpParams()
      .set('username', loginData.username)
      .set('password', loginData.password)
      .set('grant_type', 'password')
      .set('scope', 'resource:read');

    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
      .set('Authorization', 'Basic ' + btoa('first-client:noonewilleverguess');
    
      const options = {
      headers: httpHeaders
    };

    this.http.post<any>(
      'http://localhost:8080/oauth/token',
      httpParams.toString(),
      options)
      .subscribe(
        data => {
          console.log(data);
          this.saveToken(data);
        },
        err => alert('Invalid Credentials'));
  }

  saveToken(token) {
    // var expireDate = new Date().getTime() + (1000 * token.expires_in);
    this._accessToken = token.access_token;
    this.router.navigate(['/']);
  }

  checkCredentials() {
    if (!this.accessToken) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this._accessToken = undefined;
    this.router.navigate(['/login']);
  }

  // getResource(resourceUrl) : Observable<Foo>{
  //   var headers = new Headers({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
  //     'Authorization': 'Bearer '+Cookie.get('access_token')});
  //   var options = new RequestOptions({ headers: headers });
  //   return this._http.get(resourceUrl, options)
  //                  .map((res:Response) => res.json())
  //                  .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  // }
}