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
        <div className="w-screen bg-slate-300">
            <Outlet />
        </div>
    </div>
  )
}
