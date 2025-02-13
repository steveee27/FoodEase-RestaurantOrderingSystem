import React, { useEffect, useState } from 'react'
import { ICart, IShowCart } from '../menu/components/cart/Cart.interfaces';
import { useNavigate } from "react-router-dom";

import BackIcon from "../../assets/back-icon-arrow.svg";
import WriteIcon from "../../assets/write-icon.svg";
import CardIcon from '../../assets/card-icon.svg'
import CashIcon from '../../assets/cash-icon.svg'

import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import db from '../../firebase';
import { IMenu } from '../../interfaces/Menu.interfaces';
import ChangePaymentModal from './components/change_payment_modal/ChangePaymentModal';

function Checkout() {
    const navigate = useNavigate();

    const [total, setTotal] = useState<number>(0);

    const [cartItems, setCartItems] = useState<IShowCart[]>([]);
    const [cart, setCart] = useState<ICart[]>([]);
    const [nickname, setNickname]  = useState<string>('');
    const [tableNo, setTableNo]  = useState<number>(-1);
    const [orderForError, setOrderForError] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
    const [isOpenPaymentSelection, setIsOpenPaymentSelection] = useState<boolean>(false);

    useEffect(() => {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
            const currCartData: ICart[] = JSON.parse(cartData);
            setCart(currCartData)
        }
    }, [])

    const getDatafromID = async (id: string) => {
        const docRef = doc(db, "menu", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data;
        } else {
            console.log("No such document!");
        }
    }

    useEffect(() => {
        const fetchCartItems = async () => {
            const items = await Promise.all(cart.map(async (item) => {
                const data = await getDatafromID(item.id);
                return {
                    menu: data as IMenu,
                    count: item.count
                } as IShowCart;
            }));
            setCartItems(items);
        };

        fetchCartItems();
    }, [cart]);

    useEffect(() => {
        let subTotal = 0;
        cartItems.forEach((item: IShowCart) => {
            const itemTotalPrice = item.menu.price * item.count;
            subTotal += itemTotalPrice;
        })
        let taxFees = subTotal * 0.1;

        setTotal(subTotal + taxFees)
    }, [cartItems])


    const onHandlePayment = () => {
        // Get time
        const time_now = new Date();

        // Add to order history
        const orderData = {cart, nickname, tableNo, time_now, total, paymentMethod};

        const orderCollection = collection(db, "order_history");
        addDoc(orderCollection, orderData)
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });

        // UNTUK CLEAR DATA DI LOCAL STORAGE KETIKA UDH PAYMENT
        localStorage.removeItem('cart');
    }

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
        setIsOpenPaymentSelection(false);
    };

    return (
        <div className='w-full mx-auto h-full bg-[#FFF7D1]'>
            {/* Header */}
            <div className="flex p-[10%]">
                <img
                    src={BackIcon}
                    alt=""
                    className="mr-[10%] cursor-pointer"
                    onClick={() => {
                        navigate('/');
                    }}
                />
                <div className='w-full flex justify-center pr-4'>
                    <h1 className="text-[#FFB0B0] font-bold text-3xl">Payment</h1>
                </div>
            </div>
            {/* Body */}
            <div className="bg-white h-screen rounded-t-[2.5rem] justify-center align-middle">
                {/* Order For */}
                <div className='flex flex-col pt-[10%] px-[10%]'>
                    <div className='flex items-center'>
                        <label className="font-bold text-2xl mr-2" htmlFor='order_for'>Order For</label>
                        <img src={WriteIcon} alt="" />
                    </div>
                    <div className="flex mt-[5%] flex-col">
                        <input 
                            type="text" 
                            id='order_for' 
                            name='order_for' 
                            title="Order For" 
                            placeholder="Nickname..." 
                            className="w-[100%] h-[2.5rem] rounded-full px-[1rem] bg-[#FFF7D1]" 
                            // value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value)
                                setOrderForError("");
                                // console.log(nickname)
                            }}
                        />
                        <input 
                            type="text" 
                            id='order_for' 
                            name='order_for' 
                            title="Table Number" 
                            placeholder="Table Number..." 
                            className="w-[100%] h-[2.5rem] rounded-full px-[1rem] bg-[#FFF7D1] mt-2" 
                            // value={tableNo}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (!isNaN(parseInt(value)) && parseInt(value) > 0) {
                                    setTableNo(parseInt(value)); 
                                    setOrderForError("");
                                    // console.log(tableNo)
                                }
                            }}
                        />
                        <p className='text-red-500 text-sm font-medium mt-2'>{orderForError}</p>
                    </div>
                </div>
                {/* Order Summary */}
                <div className='flex flex-col pt-[10%] px-[10%]'>
                    <label className="text-xl font-medium" htmlFor='order_summary'>Order Summary</label>
                    <div className='flex justify-between flex-row mt-[5%]'>
                        <div className='flex flex-col'>
                            {cartItems.map((item: IShowCart, index) => (
                                <div key={index} className='flex font-light'>
                                    <p>{item.menu.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className='flex flex-col pr-[10%]'>
                            {cartItems.map((item: IShowCart, index) => (
                                <div key={index} className='flex text-[#FFD09B] font-bold'>
                                    <p>{item.count} items</p>
                                </div>
                            ))}
                        </div>
                        {/* Total Price */}
                        <p className="self-center text-xl text-[#FFD09B] font-semibold">{total / 1000} K</p>
                    </div>
                    <hr className='border-[#FFD09B] mt-[10%]' />
                </div>
                {/* Payment Method */}
                <div className='flex flex-col pt-[5%] px-[10%]'>
                    <div className='flex justify-between'>
                        <label className="text-xl font-medium" htmlFor='payment_method'>Payment Method</label>
                        <div 
                            className='rounded-full text-white bg-[#FFD09B] px-5 text-xs text-center py-0 flex justify-center items-center leading-none'
                            onClick={()=>{setIsOpenPaymentSelection(true)}}
                        >
                            Edit
                        </div>
                    </div>
                    <div className='flex mt-[5%] items-center'>
                        {paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card' ?
                        (
                            <img src={CardIcon} alt="" />
                        ) :
                        (
                            <img src={CashIcon} alt="" />
                        )
                        }
                        <img src="" alt="" />
                        <p className='ml-5 flex font-light'>{paymentMethod}</p>
                    </div>
                    <hr className='border-[#FFD09B] mt-[10%]' />
                </div>
                {/* Order Time */}
                <div className='flex flex-col pt-[5%] px-[10%]'>
                    <label className="text-xl font-medium">Order Time</label>
                    <div className='flex mt-[5%] justify-between'>
                        <p className='flex font-light'>Estimated Time</p>
                        <p className='self-center text-xl text-[#FFD09B] font-semibold'>25 mins</p>
                    </div>
                    <hr className='border-[#FFD09B] mt-[10%]' />
                </div>
                
                {/* Order Button */}
                <div className='flex justify-center items-center'>
                    <div 
                        className='w-[40%] my-[20%] bg-[#FFD09B] rounded-full py-3 px-4' 
                        onClick={() => {
                            // cek isi order for
                            if(nickname === ''){
                                setOrderForError('Please fill in your nickname for the order')
                                return;
                            }
                            else if (tableNo === -1){
                                setOrderForError('Please fill in your valid designated table number')
                                return;
                            }
                            onHandlePayment();
                            navigate('/order-confirmed');
                        }}
                    >
                            <p className='text-xl text-white text-center'>Order Now</p>
                    </div>
                </div>
            </div>

            {isOpenPaymentSelection && (
                <div 
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50" 
                    onClick={() => {setIsOpenPaymentSelection(false)}}
                >
                    <ChangePaymentModal 
                        selectedMethod={paymentMethod} 
                        handlePaymentSelectionChange={handlePaymentMethodChange}
                    />
                </div>
            )}
        </div>

    )
}

export default Checkout;