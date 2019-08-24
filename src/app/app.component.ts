import { Component, OnInit } from '@angular/core';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'motion-angular';

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.checkCredentials();
  }

  isLogged(): boolean {
    return this.authService.isLogged();
  }
}
