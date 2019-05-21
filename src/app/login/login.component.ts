import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginData = { username: '', password: '' };

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  login() {
    this.authService.obtainAccessToken(this.loginData);
  }

}
