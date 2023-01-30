// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import {
  Card,
  Block,
  Title,
  Text,
  ColGrid,
  Col,
  Subtitle,
  Flex,
  Metric,
  Icon,
  Badge
} from '@tremor/react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { colors } from './DevicesView'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { DetailsMainCardLoader, DetailsMapLoader } from './Loaders'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '../common/api'
import { getAsLocaleString } from '../common/utils'
import { DropdownChart } from './DropdownChart'

// Used to set icon for markers
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

const plugColors = {
  true: 'emerald',
  false: 'red'
}

export const RecentDetails = (props) => {
  const device = props.device
  const [deviceData, setDeviceData] = useState(null)
  const [loading, setLoading] = useState(true)

  const getData = async () => {
    api
      .get(`http://localhost:4000/devices/${device.device_id}`)
      .then((res) => {
        setDeviceData(res.data[0])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (deviceData === null) getData()
  }, [])

  return (
    <>
      <ColGrid numColsLg={10} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        <Col numColSpanLg={6}>
          <Card hFull={true}>
            {loading ? (
              <DetailsMainCardLoader className="mt-4" aria-label="Loading Spinner" />
            ) : (
              deviceData && (
                <>
                  <Block spaceY="space-y-2">
                    <Flex
                      justifyContent="justify-start"
                      spaceX="space-x-2"
                      truncate={true}
                    >
                      <Title>Status:</Title>
                      <Badge text={deviceData.state} color={colors[deviceData.state]} />
                    </Flex>
                    <Title>Battery</Title>
                    <Flex spaceX="space-x-2" truncate={true}>
                      <Block>
                        <Text>Output:</Text>
                        <Metric>{deviceData.output_battery}</Metric>
                        <Subtitle>kW</Subtitle>
                      </Block>
                      <Block>
                        <Text>Current charge:</Text>
                        <Metric>{deviceData.charge_battery.toFixed(0)}</Metric>
                        <Subtitle>mAh</Subtitle>
                      </Block>
                      <Block>
                        <Text>Total capacity:</Text>
                        <Metric>{deviceData.capacity_battery}</Metric>
                        <Subtitle>mAh</Subtitle>
                      </Block>
                      <Block>
                        <Text>Voltage:</Text>
                        <Metric>{deviceData.voltage_battery.toFixed(1)}</Metric>
                        <Subtitle>V</Subtitle>
                      </Block>
                    </Flex>
                    <Title>Solar panel</Title>
                    <Flex marginTop="mt-2" alignItems="align-center">
                      <Block>
                        <Text>Energy:</Text>
                        {deviceData && (
                          <Metric>{deviceData.energy_solar.toFixed(2)}</Metric>
                        )}
                        <Subtitle>kW</Subtitle>
                      </Block>
                      <Block>
                        <Text>Light:</Text>
                        {deviceData && <Metric>{deviceData.lux_solar.toFixed(0)}</Metric>}
                        <Subtitle>lx</Subtitle>
                      </Block>
                    </Flex>
                    <Title marginTop="mt-2">Switches:</Title>
                    <Block spaceY="space-y-2">
                      <Flex justifyContent="justify-start" spaceX="space-x-2.5">
                        <Text>Plug 1:</Text>
                        <Badge
                          color={plugColors[deviceData.switches.plug_1.state]}
                          text={deviceData.switches.plug_1.state ? 'On' : 'Off'}
                        />
                      </Flex>
                      <Flex justifyContent="justify-start" spaceX="space-x-2.5">
                        <Text>Plug 2:</Text>
                        <Badge
                          color={plugColors[deviceData.switches.plug_2.state]}
                          text={deviceData.switches.plug_2.state ? 'On' : 'Off'}
                        />
                      </Flex>
                    </Block>
                    <Block>
                      <Text marginTop="mt-8">
                        Last updated: {getAsLocaleString(deviceData.create_time)}
                      </Text>
                    </Block>
                  </Block>
                </>
              )
            )}
          </Card>
        </Col>
        <Col numColSpanLg={4}>
          <Block spaceY="space-y-6">
            <Card>
              {loading ? (
                <DetailsMapLoader className="mt-4" aria-label="Loading Spinner" />
              ) : (
                deviceData && (
                  <>
                    <Title>Device location</Title>
                    <Icon icon={MapPinIcon} />
                    <Text>{deviceData.location.lat}</Text>
                    <Text>{deviceData.location.long}</Text>
                    <div className="h-80 mt-4">
                      <MapContainer
                        center={[deviceData.location.lat, deviceData.location.long]}
                        zoom={12}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                          position={[deviceData.location.lat, deviceData.location.long]}
                        />
                      </MapContainer>
                    </div>
                  </>
                )
              )}
            </Card>
          </Block>
        </Col>
      </ColGrid>
      <ColGrid numColsLg={2} numColsSm={1} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        <Col>
          <DropdownChart
            deviceId={device.device_id}
            title="Battery charge"
            category="Battery charge"
            dataKey="avg_charge"
            formatterSuffix="mAh"
          />
        </Col>
        <Col>
          <DropdownChart
            deviceId={device.device_id}
            title="Power output"
            category="Power output"
            dataKey="total_output"
            formatterSuffix="kW"
          />
        </Col>
        <Col>
          <DropdownChart
            deviceId={device.device_id}
            title="Solar panel light intensity"
            category="Light intensity"
            dataKey="lux_avg"
            formatterSuffix="lx"
          />
        </Col>
        <Col>
          <DropdownChart
            deviceId={device.device_id}
            title="Solar panel energy"
            category="Solar energy"
            dataKey="solar_energy_avg"
            formatterSuffix="kW"
          />
        </Col>
      </ColGrid>
    </>
  )
}
