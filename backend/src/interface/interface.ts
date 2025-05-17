export interface User{
    id: number;
    username: string;
    password: string;
}

export interface UserNotPassword extends Omit<User, 'password'>{}