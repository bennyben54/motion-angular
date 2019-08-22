import { Component, OnInit, OnDestroy } from '@angular/core';
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

  camera1Loading = false;
  camera2Loading = false;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    console.log('HomeComponent.ngOnInit()');
    this.camera1Loading = true;
    this.camera2Loading = true;
  }

  authenticateUrl(link: string): string {
    return link + '?bearer=' + this.authService.accessToken.access_token;
  }

  camera1Loaded() {
    this.camera1Loading = false;
  }

  camera2Loaded() {
    this.camera2Loading = false;
  }

}
