import Image from 'next/image'
import Link from 'next/link'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

export default function Home() {
  return (
        <main>
           <div ><Link className = 'btn btn-primary"' href="/map">Go to map</Link></div>
        </main>
  )
}
