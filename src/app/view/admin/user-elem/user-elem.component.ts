import { Component, OnInit, Input } from '@angular/core';
import { UserDto } from 'src/app/model/user/user-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-elem',
  templateUrl: './user-elem.component.html',
  styleUrls: ['./user-elem.component.css']
})
export class UserElemComponent implements OnInit {

  @Input()
  user: UserDto;
  loading = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  toggleUserActivation(load: boolean) {
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

}
