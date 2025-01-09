import chooseGif from '/assets/choose.gif';
import manualGif from '/assets/manual.gif';
import youtubeGif from '/assets/youtube.gif';
import thumbnailGif from '/assets/thumbnail.gif';
import { HandRaisedIcon } from "@heroicons/react/20/solid";

type Props = {}

export default function Guide({}: Props) {
  return (
    <div className='h-full w-full text-white p-4 scroller overflow-hidden overflow-y-auto'>
        <section className='mb-3'>
          <div className='flex w-full'>
            <div className='w-1/2 flex flex-col justify-center items-center'>
              <h1 className='h1'>Introduction</h1>
              <p className='text-justify'>
                Welcome to <b>Locafy</b>, a local music player app! This guide is designed to help you quickly 
                get acquainted with all the features and make the most of your listening experience.
              </p>
            </div>
            
            <div className='w-1/2 flex justify-center items-center'>
              <HandRaisedIcon className='size-[40%] animate-wave' />
            </div>
          </div>
          
        </section>
        <section className='mb-10'>
          <h1 className='h1'>Choosing a Folder</h1>
          <p className='text-justify'>
            When you first launch the app, you'll be prompted to select a folder to store your 
            music files. We recommend selecting or creating an empty folder for the best experience.
            Once you've chosen a folder, three items will be automatically created inside: a  
            <b> Songs folder</b>, a <b>Thumbnails folder</b>, and an <b>SQLite database file </b> 
            to manage your library.
          </p>
          <div className='w-[70%] mt-2 border-4 border-indigo-500/100 rounded'>
            <img src={chooseGif} />
          </div>
        </section>
        <section className='pb-2'>
          <h1 className='h1'>Storing Music</h1>
          <p>
            You have <b>two</b> options for storing your music in the app:
          </p>
          <ol className='list-decimal list-outside ms-8'>
            <li className='text-justify'>
              The first option is to add music you've already downloaded. Simply move your files 
              into the 'Songs' folder located in your selected directory. After that, 
              click the Refresh button, and the app will automatically detect and add your music 
              to the library!
              <img src={manualGif} className='my-8 border-4 border-indigo-500/100 rounded' />
            </li>
            <li className='text-justify'>
              The second option allows you to download and add music directly from <b>YouTube! </b> 
              You can choose to download both the audio and thumbnails to add to your library. 
              However, we <b>recommend</b> using a <b>VPN</b> so please use this feature 
              responsibly and at your own discretion.
              <img src={youtubeGif} className='my-8 border-4 border-indigo-500/100 rounded' />
            </li>
          </ol>
        </section>
        <section className='pb-2'>
          <h1 className='h1'>Adding Thumbnails</h1>
          <p className='text-justify'>
            To add thumbnails and link them to a song, simply place your images in the 
            <b> 'Thumbnails' folder</b>. Then, return to the home page, select the song, and choose 
            the <b>'Change Thumbnail' option</b>. From there, locate your image, select it, and 
            click <b>Save</b> to apply the thumbnail.
          </p>
          <div className='w-[70%] mt-2 border-4 border-indigo-500/100 rounded'>
            <img src={thumbnailGif} />
          </div>
        </section>
        
    </div>
  )
}