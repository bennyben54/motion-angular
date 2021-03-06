import { Component, OnInit, Input } from '@angular/core';
import { UserDto } from 'src/app/model/user/user-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SubscribeService, UserManagementAction } from 'src/app/service/subscribe.service';

@Component({
  selector: 'app-user-elem',
  templateUrl: './user-elem.component.html',
  styleUrls: ['./user-elem.component.css']
})
export class UserElemComponent implements OnInit {

  @Input()
  user: UserDto;
  loading = false;

  constructor(private http: HttpClient, private subscribeService: SubscribeService) { }

  ngOnInit() {
  }

  toggleUserActivation() {
    this.loading = true;
    this.http.put<boolean>(`${environment.servers.userApi}/${this.user.id}/${this.user.enabled ? 'disable' : 'enable'}`, null)
    .subscribe(
      data => {
        this.user.enabled = data;
        this.loading = false;
      },
      err => {
        console.error('Error updating user', this.user, err);
        this.loading = false;
      }
    );
  }

  deleteUser() {
    this.loading = true;
    this.http.delete<void>(`${environment.servers.userApi}/${this.user.id}`)
    .subscribe(
      data => {
        this.subscribeService.subscribedUser.next(
          {subscriber: null, user: this.user, action: UserManagementAction.DELETE_USER}
          );
        this.loading = false;
      },
      err => {
        console.error('Error deleting user', this.user, err);
        this.loading = false;
      }
    );
  }

}
