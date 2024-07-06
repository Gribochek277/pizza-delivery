'use client'

import React from 'react'
import MapContainer from '../../components/MapContainer'

const MapClientPage = () => {
  return (
    <div style={{width: '100%', height: '700px'}}>
          <MapContainer isClient={true}/>
    </div>
  )
}

export default MapClientPage