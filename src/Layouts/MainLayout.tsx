import Navbar from '../Components/Navbar'
import BottomPlayer from '../Components/BottomPlayer'
import { Outlet } from 'react-router-dom'
import { SettingsProvider } from './SettingsContext'

export default function MainLayout() {
  return (
    <SettingsProvider>
      <div className='h-screen'>
        <div className="flex h-[87%]">
          <Navbar />
          <div className="w-screen bg-slate-800">
              <Outlet />
          </div>
        </div>
        <div className='h-[13%] bg-gradient-to-t from-violet-500 to-fuchsia-500'>
          <BottomPlayer />
        </div>
      </div>
    </SettingsProvider>
  )
}
