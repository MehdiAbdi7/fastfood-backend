export interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  tel: string;
  password: string;
  role: "admin" | "staff";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(plain: string): Promise<boolean>;
}
