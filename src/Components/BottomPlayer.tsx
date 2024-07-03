import React from 'react'
import AudioControls from './AudioControls'

export default function BottomPlayer() {
  return (
    <div className='flex h-full justify-center content-center items-center w-screen'>
        <AudioControls fileUrl={'media-loader:///C:/Users/jayde/Music/Galantis-NoMoney-Copy.wav'} />
    </div>
  )
}
