import React from 'react';
import CardIcon from '../../../../assets/card-icon.svg'
import CashIcon from '../../../../assets/cash-icon.svg'

interface ChangePaymentModalProps {
    selectedMethod: string;
    handlePaymentSelectionChange: (selectedMethod: string) => void;
}

const ChangePaymentModal: React.FC<ChangePaymentModalProps> = ({ selectedMethod, handlePaymentSelectionChange }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-80 mx-auto">
            <div className='text-center text-lg font-bold mb-7'>Change Your Payment Method</div>
            <div className="flex flex-col gap-4">
                {/* Credit Card */}
                <div className="flex items-center justify-between w-full">
                    <div className='flex items-center'>
                        <img src={CardIcon} alt="" />
                        <span className="ml-4 text-gray-700">Credit Card</span>
                    </div>
                    <input
                        type="radio"
                        id="credit"
                        name="payment"
                        value="Credit Card"
                        checked={selectedMethod === 'Credit Card'}
                        onChange={() => handlePaymentSelectionChange('Credit Card')}
                        className="hidden peer"
                    />
                    <label
                        htmlFor="credit"
                        className="w-[15px] h-[15px] rounded-full border-2 border-[#FFB0B0] flex justify-center items-center cursor-pointer peer-checked:bg-[#FFB0B0]"
                    >
                        <span className="hidden peer-checked:block w-[50%] h-[50%] bg-[#FFB0B0] rounded-full"></span>
                    </label>
                    
                </div>
                <hr className="w-full h-px bg-yellow-400" />

                {/* Debit Card */}
                <div className="flex items-center justify-between w-full">
                    <div className='flex items-center'>
                        <img src={CardIcon} alt="" />
                        <span className="ml-4 text-gray-700">Debit Card</span>
                    </div>
                    <input
                        type="radio"
                        id="debit"
                        name="payment"
                        value="Debit Card"
                        checked={selectedMethod === 'Debit Card'}
                        onChange={() => handlePaymentSelectionChange('Debit Card')}
                        className="hidden peer"
                    />
                    <label
                        htmlFor="debit"
                        className="w-[15px] h-[15px] rounded-full border-2 border-[#FFB0B0] flex justify-center items-center cursor-pointer peer-checked:bg-[#FFB0B0]"
                    >
                        <span className="hidden peer-checked:block w-[50%] h-[50%] bg-[#FFB0B0] rounded-full"></span>
                    </label>
                    
                </div>
                <hr className="w-full h-px bg-yellow-400"/>

                {/* Cash */}
                <div className="flex items-center justify-between w-full">
                    <div className='flex items-center'>
                        <img src={CashIcon} alt="" />
                        <span className="ml-4 text-gray-700">Cash</span>
                    </div>
                    <input
                        type="radio"
                        id="cash"
                        name="payment"
                        value="Cash"
                        checked={selectedMethod === 'Cash'}
                        onChange={() => handlePaymentSelectionChange('Cash')}
                        className="hidden peer"
                    />
                    <label
                        htmlFor="cash"
                        className="w-[15px] h-[15px] rounded-full border-2 border-[#FFB0B0] flex justify-center items-center cursor-pointer peer-checked:bg-[#FFB0B0]"
                    >
                        <span className="hidden peer-checked:block w-[50%] h-[50%] bg-[#FFB0B0] rounded-full"></span>
                    </label>
                    
                </div>
            </div>
            {/* <p className="text-center mt-6 text-gray-600">Selected Payment Method: <span className="font-bold">{selectedMethod}</span></p> */}
        </div>
    );
};

export default ChangePaymentModal;
