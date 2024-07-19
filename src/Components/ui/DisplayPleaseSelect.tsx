import { FolderIcon } from '@heroicons/react/20/solid'
import React from 'react'

export default function DisplayPleaseSelect() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <FolderIcon className="size-48 animate-bounce" />
        <p>Please select your music directory</p>
      </div>
  )
}
