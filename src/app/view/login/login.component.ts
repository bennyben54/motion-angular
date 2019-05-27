import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { UserLogin } from '../../model/auth/user-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginData = new UserLogin();

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.checkCredentials();
  }

  login() {
    this.authService.obtainAccessToken(this.loginData);
  }

}
