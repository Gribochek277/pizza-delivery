import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import L from "leaflet"
import "leaflet-easybutton"
import "leaflet-easybutton/src/easy-button.css"
import { useEffect, useState } from "react"

type Point = {
  id: number
  coords: [number, number],
  eta: number 
};


export default function MyMap(props: any) {
  const { position, zoom, isClient, saveMarkers, onAddMarker} = props  

  const [markerPosition, setMarkerPosition] = useState(position)
  const [markers, setMarkers] = useState<[number, number, string, number, number][]>([])
  const [isLoading, setLoading] = useState(true)
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/marks')
      const data = await response.json()
      console.log(isClient)
      const elements = data.map(element => [element.lat, element.len, element.name, element.timeStamp]);

    
        setMarkers(prevMarkers => [...prevMarkers, ...elements]);
    

      setLoading(false);
    }

    if(!isClient)
    { 
        fetchData();
    }
    else
    {setLoading(false);}
    
  }, [])

  if (isLoading) return <p>Loading...</p>

 
function calculateHaversineDistance(pointA: [number, number], pointB: [number, number]): number {
    const [lat1, lon1] = pointA;
    const [lat2, lon2] = pointB;
    const R = 6371; 
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

function calculateEdgeWeight(pointA: Point, pointB: Point): number {
    const distanceWeight = calculateHaversineDistance(pointA.coords, pointB.coords);
    const timeWeight = Math.abs(pointA.eta - pointB.eta) / 60; 
    return distanceWeight + timeWeight;
}

function calculateWeightMatrix(points: Point[]): number[][] {
    const numPoints = points.length;
    const weightMatrix: number[][] = Array.from({ length: numPoints }, () => Array(numPoints).fill(0));

    for (let i = 0; i < numPoints; i++) {
        for (let j = 0; j < numPoints; j++) {
            if (i !== j) {
                weightMatrix[i][j] = calculateEdgeWeight(points[i], points[j]);
            }
        }
    }

    return weightMatrix;
}

function calculateRouteLength(route: number[], weightMatrix: number[][]): number {
    let totalLength = 0;
    for (let i = 0; i < route.length - 1; i++) {
        totalLength += weightMatrix[route[i]][route[i + 1]];
    }
    totalLength += weightMatrix[route[route.length - 1]][route[0]]; 
    return totalLength;
}

function findShortestRoute(points: Point[]): { route: number[], distance: number } {
  
    const numPoints = points.length;
    const weightMatrix = calculateWeightMatrix(points);

    const permute = (permutation: number[]): number[][] => {
        const result: number[][] = [];
        const generate = (n: number, arr: number[]): void => {
            if (n === 1) {
                result.push(arr.slice());
                return;
            }
            generate(n - 1, arr);
            for (let i = 0; i < n - 1; i++) {
                if (n % 2 === 0) {
                    [arr[i], arr[n - 1]] = [arr[n - 1], arr[i]];
                } else {
                    [arr[0], arr[n - 1]] = [arr[n - 1], arr[0]];
                }
                generate(n - 1, arr);
            }
        };
        generate(permutation.length, permutation.slice());
        return result;
    };

    const permutations = permute([...Array(numPoints).keys()]);

    let shortestRoute: number[] = [];
    let minDistance = Infinity;

    permutations.forEach(permutation => {
        const currentDistance = calculateRouteLength(permutation, weightMatrix);
        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            shortestRoute = permutation;
        }
    });

    return { route: shortestRoute, distance: minDistance };
}

const points: Point[] = markers.map(m=> (
  { 
    id: m[4],
    coords: [m[0],m[1]],
    eta: m[3]    
  }));

let { route, distance } = {route:[], distance: 0};

if(!isClient)
{
    const shrtestWay  = findShortestRoute(points);
    route = shrtestWay.route;
}

const markersRoute = route.map(x=>
  markers[x]
)

  function AddButton() {
    const map = useMap()

    useEffect(() => {
      const button = L.easyButton("fa-map-marker", () => {
        map.locate().on("locationfound", function (e) {
          console.log(e.latlng);
          setMarkerPosition(e.latlng)
          map.flyTo(e.latlng, map.getZoom())
          L.circleMarker(e.latlng, {radius: 10}).addTo(map);          
        })
      })
      button.addTo(map)

      return () => {
        map.removeControl(button)
      }
    }, [map])

    return null
  }

  function AddMarkerOnClick() {
    useMapEvents({
      click(e) {
        const newMarkerPosition: [number, number, string, number, number]= [e.latlng.lat, e.latlng.lng, 'test click', 100, -1]
        if(isClient) {
          onAddMarker(newMarkerPosition);
          setMarkers([newMarkerPosition])
        }
      },
    })

    return (
      <>
        {markers.map((position, idx) => (
          <Marker key={`${position[2]}-${idx}`} position={[position[0], position[1]]}>
            <Popup>
              Marker {idx + 1} Est time to be in {position[3]} minutes
            </Popup>
          </Marker>
        ))}
      </>
    )
  }

  const getPolylineCoords = (points: [number, number, string, number, number][]): [number, number][] => { 
    return points.map(point => [point[0], point[1]]);
  };

  let polylineCoords = getPolylineCoords(markersRoute).reverse();

  if(isClient) {polylineCoords = [];}

  return <MapContainer center={position} zoom={zoom}  style={{ height: "700px" }}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
     <Polyline positions={polylineCoords} color="blue" />
    <Marker position={markerPosition}>
      <Popup>
        Im here
      </Popup>
    </Marker>
    <AddMarkerOnClick />
    <AddButton />
  </MapContainer>
}