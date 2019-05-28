import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserLogin } from 'src/app/model/auth/user-login';
import { UserDto } from 'src/app/model/user/user-dto';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css']
})
export class SubscribeComponent implements OnInit {

  private subscribeData = new UserDto();

  loading = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  subscribe() {
    this.http.post<UserDto>(
      'http://localhost:8080/api/user/subscribe',
      this.subscribeData)
      .subscribe(
        data => {
          this.subscribeData = data;
        },
        err => {
          console.error('Subscrition failed', err);
        }
      );
  }

}
