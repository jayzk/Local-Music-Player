import React from 'react'
import defaultThumbNail from "../../public/assets/default-thumbnail.png"

export default function () {
    const testData = [
        { song: "The Sliding Mr. Bones (Next Stop, Pottersville)", artist: "Malcolm Lockyer", year: 1961 },
        { song: "Witchy Woman", artist: "The Eagles", year: 1972 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
        { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
      ];

      const handleRowClick = (song: any) => {
        console.log("Row clicked: ", song);
        // Add your logic here
      };

  return (
    <div className='h-full mx-2'>
        <div className='h-[10%] pr-2'>
            <table className="table-fixed w-full">
                <thead className='text-left text-slate-300'>
                    <tr>
                        <th className='w-[5%]'>#</th>
                        <th>Song</th>
                        <th>Artist</th>
                        <th>Year</th>
                    </tr>
                </thead>
            </table>
        </div>
        <div className='h-[90%] overflow-hidden overflow-y-auto scroller'>
            <table className="table-fixed w-full">
                <tbody className='text-slate-100'>
                    {testData.map((song, index) => (
                    <tr key={index} className='hover:bg-slate-600 cursor-pointer' onClick={() => handleRowClick(song)}>
                        <td className='w-[5%]'>{index+1}</td>
                        <td className='flex items-center'>
                            <img src={defaultThumbNail} className='size-10 mr-2' />
                            {song.song}
                        </td>
                        <td>{song.artist}</td>
                        <td>{song.year}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    
  )
}
