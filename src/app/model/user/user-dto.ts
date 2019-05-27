import { AuthorityType } from '../auth/authority-type.enum';

export class UserDto {
    id: string;
    username: string;
    enabled: boolean;
    authorities: AuthorityType[];

    constructor(id?: string,
        username?: string,
        enabled?: boolean,
        authorities?: AuthorityType[]) {
            this.id = id;
            this.username = username;
            this.enabled = enabled;
            this.authorities = authorities;
        }
}
