import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { UserDto } from 'src/app/model/user/user-dto';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  users: UserDto[] = [];

  constructor(private authService: AuthService, private http: HttpClient) { }

  ngOnInit() {
    console.log('AdminComponent.checkCredentials()');
    this.authService.checkCredentials();
    this.fetchUsers();
  }

  private fetchUsers() {
    this.http.get<UserDto[]>('http://localhost:8080/api/user/list')
    .subscribe(
      data => this.users = data,
      err => console.error('Error fetching users', err)
    );
  }

}
