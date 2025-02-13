import React, { Children, ReactElement, ReactHTML, ReactNode } from 'react'

interface IContainer {
    children: ReactNode
}

const Container = (props: IContainer) => {
    const { children } = props;
    return (
        <div className='h-screen w-screen bg-[#FFF7D1] flex justify-center items-center'>
            <div className='relative h-full w-full flex'>
                <div className='w-full h-full'>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Container