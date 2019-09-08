import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { UserDto } from 'src/app/model/user/user-dto';
import { HttpClient } from '@angular/common/http';
import { SubscribeService, UserManagementAction } from 'src/app/service/subscribe.service';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MatTableDataSource, MatTable } from '@angular/material';
import { Router } from '@angular/router';

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

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private subscribeService: SubscribeService,
    private router: Router) { }

  ngOnInit() {
    this.authService.checkCredentials();
    if (this.authService.isAdmin()) {
      this.fetchUsers();
      this.fetchSubscribers();
      this.listenToSubscitionAccept();
    } else {
      this.router.navigate(['/']);
    }
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
    .pipe(filter(obs => !!obs && (!!obs.subscriber || !!obs.user)))
    .subscribe(
      obs => {
        if (!obs.action) {
          this.users.push(obs.user);
          const i = this.subscribers.indexOf(obs.subscriber);
          this.subscribers.splice(i, 1);
        } else if (obs.action === UserManagementAction.DELETE_USER) {
          const i = this.users.indexOf(obs.user);
          this.users.splice(i, 1);
        } else if (obs.action === UserManagementAction.DELETE_SUBSCRIPTION) {
          const i = this.subscribers.indexOf(obs.subscriber);
          this.subscribers.splice(i, 1);
        }

        this.subscribersTable.renderRows();
        this.usersTable.renderRows();
      }
    );
  }

}
