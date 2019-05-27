import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { UserLogin } from '../../model/auth/user-login';
import { LoadingService } from 'src/app/service/loading.service';
import { Subscription } from 'rxjs';
import { LoadingId } from 'src/app/model/loading/loading-id.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  public loginData = new UserLogin();

  private subscriptions: Subscription[] = [];

  loading = false;

  constructor(private authService: AuthService, private loadingService: LoadingService) { }

  ngOnInit() {
    this.subscriptions.push(
      this.loadingService.getLoadingObservable(LoadingId.LOGIN).subscribe(
        val => this.loading = val
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  login() {
    this.authService.obtainAccessToken(this.loginData);
  }

}
