import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingId } from 'src/app/model/loading/loading-id.enum';
import { LoadingService } from 'src/app/service/loading.service';
import { UserLogin } from '../../model/auth/user-login';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  public loginData = new UserLogin();

  private subscriptions: Subscription[] = [];

  loading = false;
  hide = true;

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    if (this.authService.isLogged()) {
      this.router.navigate(['/']);
    } else {
      this.route.queryParamMap.subscribe(params => {
        if (params.get('error') === 'true') {
          this.manageLoginError();
        }
      });
      this.subscriptions.push(
        this.loadingService.getLoadingObservable(LoadingId.LOGIN).subscribe(
          val => this.loading = val
        )
      );
    }
  }

  private manageLoginError() {
    const snackBarConfig = MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY();
    snackBarConfig.verticalPosition = 'top';
    snackBarConfig.duration = 3000;
    this.snackBar.open('Wrong login / password !', 'x', snackBarConfig);
    this.snackBar._openedSnackBarRef.onAction()
      .subscribe(() => this.router.navigate(['/login']), err => console.error('snackbar error', err));
    this.snackBar._openedSnackBarRef.afterDismissed()
      .subscribe(() => this.router.navigate(['/login']), err => console.error('snackbar error', err));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  login() {
    this.authService.obtainAccessToken(this.loginData);
  }

  goToSubscribe() {
    this.router.navigate(['/subscribe']);
  }

}
