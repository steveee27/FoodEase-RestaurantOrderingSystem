import React, { useEffect, useState } from "react";
import { IMenu } from "../../../../interfaces/Menu.interfaces";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../../../../layout/container";
import BackIcon from "../../../../assets/back-icon-arrow.svg";
import MinusIcon from "../../../../assets/less-icon.svg";
import AddIcon from "../../../../assets/add-icon.svg";
import AddToCart from "../../../../assets/add-to-cart-icon.svg";
import { ICart } from "../cart/Cart.interfaces";
import _ from "lodash";

const MenuDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { menu } = location.state;

    const [count, setCount] = useState<number>(1);
    const [cartItems, setCartItems] = useState<ICart[]>([]);
    const [cartItemsCount, setCartItemsCount] = useState<number>(0);

    const handleAddToCart = async (newMenu: IMenu, count: number) => {
        //kalau jumlah makanan 0, gaperlu masukin ke cart
        if(count === 0) return;

        // kalau ada yg bisa di masukkan ke cart
        const currCartItems = _.cloneDeep(cartItems);
        const isMenuInCart = currCartItems.findIndex((obj: ICart) => obj.id === newMenu.id);

        // kalau new menu yang mau dimasukin
        if(isMenuInCart === -1){
            const newCartItem: ICart = {
                id: newMenu.id,
                count: count,
            }
            const updatedCartItems = [...currCartItems, newCartItem];
            setCartItems(updatedCartItems);
            localStorage.setItem('cart', JSON.stringify(updatedCartItems));
            setTimeout(() => {
                navigate('/');
            }, 0);

        }
        // kalau menunya udah masuk
        else {
            const updatedCartItems = currCartItems.map((item: ICart) => {
                if (item.id === newMenu.id) {
                    return { ...item, count: item.count + count };
                }
                return item;
            });
            setCartItems(updatedCartItems);
            localStorage.setItem('cart', JSON.stringify(updatedCartItems));
            setTimeout(() => {
                navigate('/');
            }, 0);
        }
    }

    // get local storage that store items globally
    useEffect(() => {
        const cartData = localStorage.getItem('cart')
        if (cartData) {
            const currCartData: ICart[] = JSON.parse(cartData);
            setCartItems(currCartData)
        }
    }, []);

    return (
    <>
        <Container>
            <div className="">
                {/* HEADER */}
                <div className="flex pt-[10%] px-[10%]">
                    <img
                        src={BackIcon}
                        alt=""
                        className="mr-[5%] cursor-pointer"
                        onClick={() => {
                            navigate(-1);
                        }}
                    />
                    <p className="text-[#FFB0B0] font-bold text-xl">{menu.name}</p>
                </div>
                
                
                <div className="mt-[7%] bg-[#F5F5F5] w-full h-[97vh] p-[5%] rounded-t-3xl">
                    <div className="w-full flex justify-center flex-col items-center mt-3">
                        {/* PICT & DESC */}
                        <div className="flex items-center w-[95%]">
                            <img
                            src={"https://utfs.io/f/" + menu.imageKey}
                            alt=""
                            className="rounded-3xl"
                            />
                        </div>
                        <div className="px-5 pt-3 flex justify-between w-full flex-col">
                            <div className="flex justify-between items-center w-full">
                                <p className="text-[#FFB0B0] font-bold text-xl">
                                    {menu.price / 1000} K
                                </p>
                                <div className="flex">
                                    <img src={MinusIcon} alt="" onClick={() => {setCount((prevCount) => Math.max(0, prevCount - 1))}}/>
                                    <p className="mx-5 text-xl">{count}</p>
                                    <img src={AddIcon} alt="" onClick={() => {setCount((prevCount) => prevCount + 1)}}/>
                                </div>
                            </div>
                            <hr className="bg-[#FFD09B] my-[5%] h-1" />
                            <p className="text-base">{menu.description}</p>
                        </div>

                        {/* ADD TO CART BUTTON */}
                        <div 
                            className="bg-[#FFD09B] rounded-full flex p-3 px-5 mt-[25%]" 
                            onClick={() => {
                                        handleAddToCart(menu, count);
                                    }}
                        >
                                <img src={AddToCart} alt="" />
                                <p className="ml-4 font-bold text-xl text-[#F5F5F5]">Add to Cart </p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    </>
);
};

export default MenuDetail;
