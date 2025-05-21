export interface User{
    id: number;
    username: string;
    password: string;
    friends: { username: string }[];
    pendingFriendshipsReceived: { id: number, username: string }[];
    pendingFriendshipsSent: { id: number, username: string }[];
    friendRequestsSentDeclined: { id: number, username: string }[],
    idSocket: string;
}

export interface UserNOPass extends Omit<User, 'password'>{}