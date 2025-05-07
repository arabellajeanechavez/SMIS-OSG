import { User } from './user';

export type Token = {
    type: User;
    email: string;
    expires: number;
    password: string;
    signature: string;
};

export type Auth = {
    email: string;
    password: string;
    type: User;
};