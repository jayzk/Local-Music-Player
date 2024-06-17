import React from 'react'
import Navbar from '../Components/Navbar'
import { NavLink, Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    // <>
    //     <Navbar/>
    //     <Outlet/>
    // </>
    <div className="flex">
        <Navbar />
        <div className="w-screen bg-gradient-to-tl from-slate-800 via-purple-700 to-slate-800">
            <Outlet />
        </div>
    </div>
  )
}
