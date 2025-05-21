export interface UserData {
    username: string;
    password: string;
}

export interface UserDB extends Omit<UserData, 'password'>{
  id: number;
  friends: { id: number, username: string }[];
  pendingFriendshipsReceived: { id: number, username: string }[];
  pendingFriendshipsSent: { id: number, username: string }[];
  idSocket: string;
  icon: string;
}

export interface Links{
  name: string;
  path: string;
}
