import React from 'react'
import { IMenu } from '../../../../interfaces/Menu.interfaces'
import { useNavigate } from 'react-router-dom';

const MenuCard = (props: IMenu) => {
    const { menu } = props
    const navigate = useNavigate();
    

    return (
        <>
            {menu &&
                <div className='w-full flex justify-center flex-col items-center mt-3' onClick={() => {navigate("/menu-detail", { state: { menu } })}}>
                    <div className='flex items-center w-[95%]'>
                        <img src={"https://utfs.io/f/" + menu.imageKey} alt="" className='rounded-3xl'/>
                    </div>
                    <div className='px-5 pt-3 flex justify-between w-full flex-col'>
                        <div className='flex justify-between items-center w-full'>
                            <p className="font-bold text-xl">{menu.name}</p>
                            <p className='text-[#FFB0B0] font-bold text-xl'>{menu.price/1000} K</p>
                        </div>
                        <p className="text-base">{menu.description}</p>
                    </div>
                </div> 
            }
            <hr className='bg-[#FFD09B] my-[7%] mx-5 h-[0.8%]' />
        </>
    )
}

export default MenuCard