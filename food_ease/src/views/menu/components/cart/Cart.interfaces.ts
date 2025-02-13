import { IMenu } from "../../../../interfaces/Menu.interfaces";

export interface ICart {
    id: string;
    count: number;
}

export interface IShowCart {
    menu: IMenu;
    count: number;
}

export interface CartProps {
    cartItems: IShowCart[]; 
    onHandleCloseCart: () => void;
    onHandleAddCount: (id: string) => void;
    onHandleMinusCount: (id: string) => void;
}