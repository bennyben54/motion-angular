import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { UserDto } from 'src/app/model/user/user-dto';
import { HttpClient } from '@angular/common/http';
import { SubscribeService } from 'src/app/service/subscribe.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  users: UserDto[] = [];

  subscribers: UserDto[] = [];

  constructor(private authService: AuthService, private http: HttpClient, private subscribeService: SubscribeService) { }

  ngOnInit() {
    console.log('AdminComponent.checkCredentials()');
    this.authService.checkCredentials();
    this.fetchUsers();
    this.fetchSubscribers();
    this.listenToSubscitionAccept();
  }

  private fetchUsers() {
    this.http.get<UserDto[]>('http://localhost:8080/api/user/list')
    .subscribe(
      data => this.users = data,
      err => console.error('Error fetching users', err)
    );
  }

  private fetchSubscribers() {
    this.http.get<UserDto[]>('http://localhost:8080/api/user/list/subscribers')
    .subscribe(
      data => this.subscribers = data,
      err => console.error('Error fetching subscribers', err)
    );
  }

  private listenToSubscitionAccept() {
    this.subscribeService.$subscribedUserObs
    .pipe(filter(obs => !!obs && !!obs.subscriber && !!obs.user))
    .subscribe(
      obs => {
        this.users.push(obs.user);
        const i = this.subscribers.indexOf(obs.subscriber);
        this.subscribers.splice(i, 1);
      }
    );
  }

}
