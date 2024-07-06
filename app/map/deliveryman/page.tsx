
'use client'

import React from 'react'
import MapContainer from '../../components/MapContainer'

const MapPage = () => {
  return (
    <div style={{width: '100%', height: '700px'}}>
          <MapContainer isClient={false}/>
    </div>
  )
}

export default MapPage