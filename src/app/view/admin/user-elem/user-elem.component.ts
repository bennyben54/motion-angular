import { Component, OnInit, Input } from '@angular/core';
import { UserDto } from 'src/app/model/user/user-dto';

@Component({
  selector: 'app-user-elem',
  templateUrl: './user-elem.component.html',
  styleUrls: ['./user-elem.component.css']
})
export class UserElemComponent implements OnInit {

  @Input()
  user: UserDto;

  constructor() { }

  ngOnInit() {
  }

}
