import { AuthService } from './../../service/auth.service';
import { UserLogin } from './../../model/auth/user-login';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auto-login',
  templateUrl: './auto-login.component.html',
  styleUrls: ['./auto-login.component.css']
})
export class AutoLoginComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const username = params.get('username');
      const password = params.get('password');
      if (username && password) {
        const loginData = new UserLogin();
        loginData.username = username;
        loginData.password = password;
        this.authService.obtainAccessToken(loginData, '/cam?user=answerer');
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

}
