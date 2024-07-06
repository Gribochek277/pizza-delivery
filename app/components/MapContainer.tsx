'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Button, Modal } from 'react-daisyui'

export default function MapContainer(props: any) {
    const {isClient} = props;
    const Map = useMemo(() => dynamic(
      () => import('@/app/components/Map/Map'),
      { 
        loading: () => <span className="loading loading-ring loading-lg"></span>,
        ssr: false
      }
    ), [])

    const [visible, toggleVisible] = useState<boolean>(false);
    const [orderName, setOrderNametValue] = useState('');
    const [orderTimeStamp, setOrderTimeStampValue] = useState('');
    const [markers, setMarkers] = useState<[number, number, string, number, number][]>([]);


    async function pressButton()
    {
      const payload = {            
        name: orderName,
        timeStamp: parseInt(orderTimeStamp),
        lat: markers[0][0],
        len: markers[0][1]
    }
      try {
        const res = await fetch('http://localhost:3000/api/marks',{
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'content-type': 'application/json'
          }
        })
        console.log(res)
        if(res.ok){
          
        }else{
          console.log("Oops! Something is wrong.")
        }
      } catch (error) {
          console.log(error)
      }
    }

    function handleAddMarker(newMarker: [number, number, string, number, number]) {
      setMarkers([newMarker]);
  }
  
    return <div className="container mx-auto">
      <div className='my-5 '>
        <Map position={[51.505, -0.09]} zoom={13} isClient={isClient} onAddMarker={handleAddMarker}/>
      </div>
      { isClient && <div>
      <div className='rounded-box bg-slate-400 w-auto h-200'>
      <div className="container mx-10 my-5">
        <div className="card bg-base-100 w-96 shadow-xl my-5 m-auto">
          <div className="card-body">
            <h2 className="card-title">Please fill you order details</h2>
            <p>Please enter name of a delivery</p>
            <input 
              type="text" 
              placeholder="Type here" 
              className="input input-bordered input-secondary w-full max-w-xs"
              onChange={e => { setOrderNametValue(e.currentTarget.value); }}/>
            <p>Please enter desired interval in minutes when delivery should be in place</p>
            <input 
              type="number" 
              placeholder="Type here" 
              className="input input-bordered input-secondary w-full max-w-xs"
              onChange={e => { setOrderTimeStampValue(e.currentTarget.value); }}/>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={pressButton}>Buy Now</button>
            </div>
          </div>
        </div>          
      </div>
      </div>
      </div>}
      
    </div>
  }

  