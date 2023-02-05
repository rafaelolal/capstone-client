import Head from 'next/head'
import Image from 'next/image' // TODO: Delete image import and file
import { Inter } from '@next/font/google' // TODO: Delete?

const inter = Inter({ subsets: ['latin'] }) // TODO: Delete?

export default function Home() {
  return (
    <>
      <Head>
        <title>Capstone</title>
        {/* TODO: Change description */}
        <meta name='description' content='' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {/* TODO: Change icon */}
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div>HI</div>
    </>
  )
}
