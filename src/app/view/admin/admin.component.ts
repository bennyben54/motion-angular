import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { UserDto } from 'src/app/model/user/user-dto';
import { HttpClient } from '@angular/common/http';
import { SubscribeService } from 'src/app/service/subscribe.service';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MatTableDataSource, MatTable } from '@angular/material';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  users: UserDto[] = [];
  usersColumns: string[] = ['username', 'authorities', 'enabled', 'action'];
  usersDataSource: MatTableDataSource<UserDto>;
  @ViewChild('usersTable') usersTable: MatTable<UserDto>;


  subscribers: UserDto[] = [];
  subscribersColumns: string[] = ['username', 'action'];
  subscribersDataSource: MatTableDataSource<UserDto>;
  @ViewChild('subscribersTable') subscribersTable: MatTable<any>;

  constructor(private authService: AuthService, private http: HttpClient, private subscribeService: SubscribeService) { }

  ngOnInit() {
    console.log('AdminComponent.checkCredentials()');
    this.authService.checkCredentials();
    this.fetchUsers();
    this.fetchSubscribers();
    this.listenToSubscitionAccept();
  }

  private fetchUsers() {
    this.http.get<UserDto[]>(`${environment.servers.userApi}/list`)
    .subscribe(
      data => {
        this.users = data;
        this.usersDataSource = new MatTableDataSource<UserDto>(this.users);
      },
      err => console.error('Error fetching users', err)
    );
  }

  private fetchSubscribers() {
    this.http.get<UserDto[]>(`${environment.servers.userApi}/list/subscribers`)
    .subscribe(
      data => {
        this.subscribers = data;
        this.subscribersDataSource = new MatTableDataSource<UserDto>(this.subscribers);
      },
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

        this.subscribersTable.renderRows();
        this.usersTable.renderRows();
      }
    );
  }

}
