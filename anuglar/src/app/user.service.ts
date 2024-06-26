import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  CurrentUser:any;
  AccountType!: string;
  IsAuthenticated!:boolean;

  constructor() { }

  UpdateAuthentication(AuthenticationStatus :boolean):void{
    this.IsAuthenticated = AuthenticationStatus;
  }

  UpdateCurrentUserInfo(User: any){
    this.CurrentUser = User;
    this.UpdateRestFields();
  }
  UpdateRestFields(){
    if(this.CurrentUser.account_type == "1"){
      this.AccountType = "participant"
    }
    else{
      this.AccountType = "researcher"
    }
  }

  getCurrentUserService(): Promise<UserService> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this);
      }, 1000); // Simulate async operation, adjust timeout as needed
    });
  }
  

  ResetUser(){
    this.AccountType = "";
    this.IsAuthenticated = false;
    this.CurrentUser = undefined;
  }
}
