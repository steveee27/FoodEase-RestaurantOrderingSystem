import React from 'react'
import Container from '../../layout/container'
import OrderConfirmedPic from '../../assets/order-confirmed-pic.svg'
import { useNavigate } from 'react-router-dom';

function formatDate(date: any) {
    // Get day of the week, date, and time
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const dayOfMonth = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour format to 12-hour format
    const formattedHours = hours % 12 || 12;

    // Get the ordinal suffix (e.g., "1st", "2nd", "3rd", "4th")
    const getOrdinalSuffix = (num: any) => {
        if (num === 11 || num === 12 || num === 13) return "th";
        const lastDigit = num % 10;
        if (lastDigit === 1) return "st";
        if (lastDigit === 2) return "nd";
        if (lastDigit === 3) return "rd";
        return "th";
    };

    const ordinalSuffix = getOrdinalSuffix(dayOfMonth);

    // Format: "Thu, 29th, 4:00 PM"
    return `${dayOfWeek}, ${dayOfMonth}${ordinalSuffix}, ${formattedHours}:${minutes} ${period}`;
}

function OrderConfirmed() {
    const now = new Date();
    const formattedDate = formatDate(now);
    const navigate = useNavigate();

    return (
    <Container>
        <div className='flex flex-col justify-center items-center mt-[15%]'>
            <img src={OrderConfirmedPic} alt="" />
            <p className='text-4xl text-[#FFD09B] font-bold'>¡Order Confirmed!</p>
            <p className='text-[#FFD09B] font-bold w-[70%] break-words text-center mb-[10%] mt-1'>Your order has been placed succesfully</p>
            <p className='text-[#FFD09B] font-bold w-[70%] text-center'>Order by: {formattedDate}</p>

            <div 
                className='w-[50%] my-[10%] bg-[#FFB0B0] rounded-full py-2 px-4 flex items-center justify-center' 
                onClick={() => {
                    navigate('/');
                }}
            >
                    <p className='text-2xl text-white text-center'>Back to Menu</p>
            </div>

            <p 
                className='text-[#FFD09B] font-bold w-[70%] text-center mb-[10%] mt-1'
            >
                If you have any questions, <br/>
                please reach out directly to our staff
            </p>
        </div>
    </Container>
    )
}

export default OrderConfirmed