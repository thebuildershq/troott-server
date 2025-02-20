export interface CreateUserDTO {
    firstName?: string;
    lastName?: string;
    username?: string;
    phoneCode?: string;
    phoneNumber?: string;
    userType: string;
    email: string;
    password: string;
    role: string;
    isCreator: boolean;
  }
  
  export interface EditUserDTO {
    firstName?: string;
    lastName?: string;
    username?: string;
    phoneCode?: string;
    phoneNumber?: string;
  }
  