import React, { useEffect, useState } from 'react';
import { CartProps, ICart, IShowCart } from './Cart.interfaces';
import CartIcon from '../../../../assets/view-cart-icon.svg';
import AddToCartIcon from '../../../../assets/add-to-cart-icon-2.svg';
import MinusIcon from "../../../../assets/minus-icon-in-cart.svg";
import AddIcon from "../../../../assets/add-icon-in-cart.svg";
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC<CartProps> = ({ cartItems, onHandleCloseCart, onHandleAddCount, onHandleMinusCount }) => {
    const [subtotal, setSubtotal] = useState<number>(0);
    const [taxFees, setTaxFees] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    const navigate = useNavigate();

    useEffect(() => {
        let tempSubtotal = 0;
        cartItems.forEach((item: IShowCart) => {
            const itemTotalPrice = item.menu.price * item.count;
            tempSubtotal += itemTotalPrice;
        })
        setSubtotal(tempSubtotal)

        let tempTaxFees = tempSubtotal * 0.1;
        setTaxFees(tempTaxFees)

        setTotal(subtotal + taxFees)
    }, [cartItems, subtotal, taxFees])

    

    return (
        <div className="flex justify-between items-center flex-col overflow-scroll">
            <div className='mt-[15%] flex items-center justify-center'>
                <img src={CartIcon} alt="" />
                <p className='font-bold text-2xl text-white ml-3'>Cart</p>
            </div>
            <hr className='border-yellow-400 my-[10%] px-5 h-[5%] z-70 w-[85%] border-[1px]'/>

            {cartItems.length > 0 ? (
                <>
                    <p className='font-bold text-xl text-white ml-3'>You have {cartItems.length} items in the cart</p>
                    
                    {cartItems.map((item: IShowCart) => (
                        <>
                            <div className='flex mt-5 mx-5'>
                                <img src={"https://utfs.io/f/" + item.menu.imageKey} alt="" className='rounded-2xl w-[35%]'/>
                                <div className='flex flex-col ml-2 w-[65%]'>
                                    <p className='text-white w-[60%] break-words'>{item.menu.name}</p>
                                    <div className='flex justify-between'>
                                        <p className='text-white'>Rp {item.menu.price / 1000} K</p>
                                        <div className="flex">
                                            <img src={MinusIcon} alt="" onClick={() => {onHandleMinusCount(item.menu.id)}}/>
                                            <p className="mx-3 text-white">{item.count}</p>
                                            <img src={AddIcon} alt="" onClick={() => {onHandleAddCount(item.menu.id)}}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <hr className='border-[#FFDECF] my-[3%] px-5 h-[5%] z-70 w-[80%]'/> */}
                        </>
                    ))}

                    <hr className='border-[#FFDECF] my-[10%] px-5 h-[5%] z-70 w-[85%] border-[1px]'/>

                    <div className='mx-[5%] flex flex-col w-full'>
                        <div className='flex justify-between'>
                            <p className='text-l text-white ml-5'>Subtotal</p>
                            <p className='text-l text-white mr-5'>Rp { subtotal / 1000 } K</p>
                        </div>
                        <div className='flex justify-between w-full'>
                            <p className='text-l text-white ml-5'>Tax and Fees</p>
                            <p className='text-l text-white mr-5'>Rp { taxFees / 1000 } K</p>
                        </div>
                    </div>

                    <hr className='border-[#FFDECF] my-[10%] px-5 h-[5%] z-70 w-[85%] border-[1px]'/>

                    <div className='flex justify-between w-full'>
                        <p className='text-l text-white ml-5'>Total</p>
                        <p className='text-l text-white mr-5'>Rp { total / 1000 } K</p>
                    </div>

                    <div 
                        className='my-[15%] bg-[#FFD09B] rounded-full py-3 px-4' 
                        onClick={() => {
                            onHandleCloseCart();
                            navigate('/checkout');
                        }}
                    >
                        <p className='font-bold text-xl text-white'>Checkout</p>
                    </div>
                </>
            ) : (
                <div className="flex justify-between items-center flex-col">
                    <p className='font-bold text-xl text-white ml-3 mb-[30%]'>Your cart is empty</p>

                    <div className="flex justify-between items-center flex-col" onClick={() => {onHandleCloseCart()}}>
                        <img src={AddToCartIcon} alt="" />
                        <p className='font-bold text-2xl text-white ml-3 w-[60%] text-center'>Want to add something?</p>
                    </div>

                </div>
            )
            
            }

        </div>
    );
};

export default Cart;