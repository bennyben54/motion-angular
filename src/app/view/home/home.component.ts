import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  readonly camera1Url = `${environment.servers.camera1}`;
  readonly camera2Url = `${environment.servers.camera2}`;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    console.log('HomeComponent.ngOnInit()');
  }

  authenticateUrl(link: string): string {
    return link + '?bearer=' + this.authService.accessToken.access_token;
  }

}
