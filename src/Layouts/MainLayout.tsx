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
      <div className="flex h-[85%]">
        <Navbar />
        <div className="w-screen bg-gradient-to-tl from-slate-800 via-purple-700 to-slate-800">
            <Outlet />
        </div>
      </div>
      <div className='h-[15%]'>
        <BottomPlayer />
      </div>
    </div>
  )
}
