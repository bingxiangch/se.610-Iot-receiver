// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import {
  Card,
  Text,
  ColGrid,
  Title,
  Badge,
  Button,
  ButtonInline,
  Col,
  Block,
  Flex
} from '@tremor/react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
// Original library had incompatibilities with React-leaflet v4.
import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import api from '../common/api'
import { StateFilterDropdown } from './StateFilterDropdown'

// Deleting default icon
delete L.Icon.Default.prototype._getIconUrl

// Used to set icon for markers
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

const MapMarkers = (props) => {
  // Devices that need to be rendered as markers on the map.
  const [devices, setDevices] = useState([])

  // Getting map reference
  const map = useMap()
  // Hook to listen for map moving events.
  useMapEvent('moveend', (e) => {
    setVisibleDevices(devices)
  })

  const setVisibleDevices = (devs) => {
    // Prevent showing individual device cards if zoom is less than 15.
    if (map.getZoom() >= 15) {
      let visibleDevices = devs.filter(function (item) {
        // Fitting the devices on the map bounds
        return map
          .getBounds()
          .contains({ lat: item.location.lat, lon: item.location.long })
      })
      props.onDevicesAdd(visibleDevices)
      // If there are cards visible, then they need to be removed.
    } else if (props.deviceCards.length > 0) {
      props.onDevicesAdd([])
    }
  }

  useEffect(() => {
    // If map cannot be found, return immediately.
    if (!map) return
    // Getting devices from api with state filtering
    api
      .get(
        `http://localhost:4000/devices?state=${props.state === 'Any' ? '' : props.state}`
      )
      .then((res) => {
        setDevices(res.data.devices)
        setVisibleDevices(res.data.devices)
        // Updating total device count to parent component.
        props.setDeviceCount(res.data.deviceCount)
      })
      .catch((err) => {
        console.error('Error encountered while fetching. ', err)
      })
  }, [props.state, map])

  return (
    <MarkerClusterGroup chunkedLoading={true} disableClusteringAtZoom={15}>
      {/* Creating markers of every device in state */}
      {devices.map((item) => (
        <Marker key={item.device_id} position={[item.location.lat, item.location.long]}>
          <Popup>
            <strong>Device ID</strong>: {item.device_id} <br />
            <Flex>
              <Link to={'/details'} state={{ device: item }}>
                <ButtonInline size="xs" text="Show details" color="blue" />
              </Link>
              <ButtonInline
                size="xs"
                text="Zoom to location"
                color="blue"
                handleClick={() => {
                  map.setView(
                    {
                      lat: item.location.lat,
                      lng: item.location.long
                    },
                    17,
                    {
                      animate: true
                    }
                  )
                }}
              />
            </Flex>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}

const DeviceMap = (props) => {
  return (
    <MapContainer
      className="markercluster-map"
      center={[61.49911, 23.78712]}
      zoom={9}
      scrollWheelZoom={true}
      // Giving ref attribute the setMap hook
      ref={props.setMap}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapMarkers
        state={props.state}
        setDeviceCount={props.setDeviceCount}
        deviceCards={props.deviceCards}
        onDevicesAdd={props.onDevicesAdd}
      />
    </MapContainer>
  )
}

export const MapView = () => {
  // Devices that are visible on the map
  // Used to create the device cards
  const [devices, setDevices] = useState([])
  const [deviceCount, setDeviceCount] = useState(0)
  const [state, setState] = useState('Any')
  // Map reference that is set by the MapContainer using ref
  const [map, setMap] = useState(null)
  const colors = {
    Operational: 'emerald',
    Shutdown: 'red'
  }

  // Function to set the devices visible on the map to state
  function onDevicesAdd(addedDevices) {
    setDevices(addedDevices)
  }

  return (
    <main className="bg-slate-50 p-6 sm:p-10">
      <h1 className="text-xl font-bold tr-text-left">Map</h1>
      <Text>View the devices on the map</Text>
      <ColGrid numColsLg={12} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        <Col numColSpanLg={8} numColSpanMd={12}>
          {/* Map column */}
          <div className="rounded overflow-hidden shadow-lg">
            <div className="px-6 py-4">
              <div className="h-70v w-full">
                <DeviceMap
                  setDeviceCount={setDeviceCount}
                  onDevicesAdd={onDevicesAdd}
                  deviceCards={devices}
                  setMap={setMap}
                  state={state}
                />
              </div>
            </div>
          </div>
        </Col>
        {/* Device column */}
        <Col numColSpanLg={4} numColSpanMd={12}>
          <StateFilterDropdown onStateChange={setState} deviceCount={deviceCount} />
          <Flex justifyContent="justify-start">
            <h2 className="text-xl font-bold tr-text-left mt-3 mr-2">
              Devices visible on map
            </h2>
            <Badge
              text={devices.length}
              color="huld-sky-blue"
              size="sm"
              tooltip="Number of individual devices visible on the map"
              marginTop="mt-3"
            />
          </Flex>
          <Block spaceY="space-y-6" marginTop="mt-5">
            <div className="w-full h-full h-60v max-h-screen overflow-y-auto flex flex-col flex-grow">
              {devices.map((item) => (
                <div key={item.device_id} className="p-1">
                  <Card marginTop="mt-2">
                    <Title>{item.device_id}</Title>
                    <Badge
                      text={item.state}
                      color={colors[item.state]}
                      marginTop="mt-4"
                    />
                    <Flex>
                      <Link to={'/details'} state={{ device: item }}>
                        <Button text="Details" color="blue" marginTop="mt-4" />
                      </Link>
                      <Button
                        text="Zoom to device"
                        color="blue"
                        handleClick={() => {
                          // If map reference exists, zooming map to the marker on map.
                          if (map) {
                            map.setView(
                              {
                                lat: item.location.lat,
                                lng: item.location.long
                              },
                              17
                            )
                          }
                        }}
                        marginTop="mt-4"
                      />
                    </Flex>
                  </Card>
                </div>
              ))}
              {devices.length < 1 ? (
                <Title marginTop="mt-6">
                  No devices found or zoom is not close enough.
                </Title>
              ) : (
                <></>
              )}
            </div>
          </Block>
        </Col>
      </ColGrid>
    </main>
  )
}
