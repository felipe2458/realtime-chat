export interface User{
    id: number;
    username: string;
    password: string;
    friends: { username: string }[];
    pendingFriendshipsReceived: { id: number, username: string }[];
    pendingFriendshipsSent: { id: number, username: string }[];
    friendRequestsDeclined: { sent: { id: number, username: string }[], received: { id: number, username: string }[] },
    friendRemoved: { id: number, username: string }[];
    removedByFriend: { id: number,username: string }[]
    idSocket: string;
}

export interface UserNoPass extends Omit<User, 'password'>{}