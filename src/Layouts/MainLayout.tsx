import React from 'react'
import Navbar from '../Components/Navbar'
import BottomPlayer from '../Components/BottomPlayer'
import { NavLink, Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    // <>
    //     <Navbar/>
    //     <Outlet/>
    // </>
    <div className='h-screen'>
      <div className="flex h-[87%]">
        <Navbar />
        <div className="w-screen bg-slate-800">
            <Outlet />
        </div>
      </div>
      <div className='h-[13%] bg-gradient-to-r from-violet-500 to-fuchsia-500'>
        <BottomPlayer />
      </div>
    </div>
  )
}
