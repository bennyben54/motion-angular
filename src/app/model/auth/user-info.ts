import { AuthorityType } from './authority-type.enum';

export class UserInfo {

    active: boolean;
    exp: number;
    user_name: string;
    authorities: AuthorityType[];
    client_id: string;
    scope: string[];

    constructor(
        active?: boolean,
        exp?: number,
        user_name?: string,
        authorities?: AuthorityType[],
        client_id?: string,
        scope?: string[]
    ) {
        this.active = active;
        this.exp = exp;
        this.user_name = user_name;
        this.authorities = authorities;
        this.client_id = client_id;
        this.scope = scope;
    }

}
