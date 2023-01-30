// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import {
  Title,
  Block,
  Tab,
  TabList,
  ColGrid,
  Card,
  Col,
  BarChart,
  Bold,
  Flex,
  Metric,
  Text,
  Button,
  Subtitle,
  Dropdown,
  DropdownItem
} from '@tremor/react'
import { Link } from 'react-router-dom'
import api from '../common/api'
import { MiniCardLoader } from './Loaders'
import { DeviceInfoCard } from './DeviceInfoCard'

const settings = {
  'Battery charge': {
    field: 'charge_battery',
    fieldName: 'Battery charge',
    unit: 'mAh'
  },
  'Battery output': {
    field: 'output_battery',
    fieldName: 'Battery output',
    unit: 'kW'
  },
  'Solar panel output': {
    field: 'energy_solar',
    fieldName: 'Solar panel output',
    unit: 'kW'
  },
  'Light intensity': {
    field: 'lux_solar',
    fieldName: 'Light intensity',
    unit: 'lx'
  }
}

// Shows bar chart of total devices and their distribution to different states.
const TotalDeviceChart = ({ devices }) => {
  return (
    <>
      <Text textAlignment="text-right">Total devices:</Text>
      <Text textAlignment="text-right">{devices.length}</Text>
      <Title>Device Status</Title>
      <BarChart
        data={getDeviceStates(devices)}
        dataKey="name"
        categories={['Devices']}
        colors={['blue', 'teal', 'amber']}
        valueFormatter={undefined}
        marginTop="mt-4"
        yAxisWidth="w-12"
        height="h-64"
      />
    </>
  )
}

// Card that has dropdown with selectable fields. Devices with max and min value of selected field are shown.
const PerformersCard = (props) => {
  const [performers, setPerformers] = useState({})
  const [filter, setFilter] = useState('Battery charge')
  const [filterField, setFilterField] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (props.devices.length) {
      const filtField = settings[filter].field
      setFilterField(settings[filter].field)
      // Filtering device with biggest value in the selected field.
      const maxDev = props.devices.reduce(function (prev, current) {
        return prev[filtField] > current[filtField] ? prev : current
      })
      // Filtering device with lowest value in the field.
      const minDev = props.devices.reduce(function (prev, current) {
        return prev[filtField] < current[filtField] ? prev : current
      })
      // Set lowest and highest performer to state.
      setPerformers({ maxDevice: maxDev, minDevice: minDev })
    }
    setLoading(false)
  }, [props.devices, filter])

  return (
    <Card>
      {loading ? (
        <MiniCardLoader className="mt-4" aria-label="Loading Spinner" />
      ) : (
        <>
          <Title>Devices by field</Title>
          <Dropdown
            defaultValue={filter}
            handleSelect={(value) => {
              setFilter(value)
            }}
            maxWidth="max-w-min"
            marginTop="mt-2"
          >
            <DropdownItem value={'Battery charge'} text="Battery charge" />
            <DropdownItem value={'Battery output'} text="Battery output" />
            <DropdownItem value={'Solar panel output'} text="Solar panel output" />
            <DropdownItem value={'Light intensity'} text="Light intensity" />
          </Dropdown>
          <Title>{props.fieldName}</Title>

          <Block marginTop="mt-4" spaceY="space-y-2">
            <Title>Maximum</Title>
            {performers.maxDevice ? (
              <Card>
                <Bold>{performers.maxDevice.device_id}</Bold>
                <Flex marginTop="mt-2" truncate={true}>
                  <Block>
                    <Metric>{performers.maxDevice[filterField]?.toFixed(0)}</Metric>
                    <Subtitle>{settings[filter].unit}</Subtitle>
                  </Block>
                  <Link to={'/details'} state={{ device: performers.maxDevice }}>
                    <Button text="Details" color="blue"></Button>
                  </Link>
                </Flex>
              </Card>
            ) : (
              <Title>No devices found.</Title>
            )}
          </Block>

          <Block marginTop="mt-4" spaceY="space-y-2">
            <Title>Minimum</Title>
            {performers.minDevice ? (
              <Card>
                <Bold>{performers.minDevice.device_id}</Bold>
                <Flex marginTop="mt-2" truncate={true}>
                  <Block>
                    <Metric>{performers.minDevice[filterField]?.toFixed(0)}</Metric>
                    <Subtitle>{settings[filter].unit}</Subtitle>
                  </Block>
                  <Link to={'/details'} state={{ device: performers.minDevice }}>
                    <Button text="Details" color="blue"></Button>
                  </Link>
                </Flex>
              </Card>
            ) : (
              <Title>No devices found.</Title>
            )}
          </Block>
        </>
      )}
    </Card>
  )
}

export const HomeView = () => {
  const [selectedView, setSelectedView] = useState(1)
  const [devices, setDevices] = useState([])

  useEffect(() => {
    // Getting data for all cards to prevent multiple api calls.
    api
      .get('http://localhost:4000/devices')
      .then((res) => {
        setDevices(res.data.devices)
      })
      .catch((err) => {})
  }, [])

  return (
    <main className="bg-slate-50 p-6 sm:p-10 flex-auto">
      <h1 className="text-xl font-bold tr-text-left">Home</h1>
      <TabList
        defaultValue={1}
        handleSelect={(value) => setSelectedView(value)}
        marginTop="mt-6"
      >
        <Tab value={1} text="Overview" />
        <Tab value={2} text="Statistics" />
      </TabList>

      {selectedView === 1 ? (
        <>
          <ColGrid
            numColsMd={2}
            numColsLg={6}
            numCols={2}
            gapX="gap-x-3"
            gapY="gap-y-3"
            marginTop="mt-6"
          >
            <Col numColSpan={2} numColSpanMd={3} numColSpanLg={2}>
              <DeviceInfoCard
                title="Battery charge across devices"
                fieldName="charge_battery"
                units={{ big: 'Ah', small: 'mAh' }}
                devices={devices}
              />
            </Col>
            <Col numColSpan={2} numColSpanMd={3} numColSpanLg={2}>
              <DeviceInfoCard
                title="Battery output across devices"
                fieldName="output_battery"
                units={{ big: 'MW', small: 'kW' }}
                devices={devices}
              />
            </Col>
            <Col numColSpan={2} numColSpanMd={2} numColSpanLg={2}>
              <DeviceInfoCard
                title="Solar panel output across devices"
                fieldName="energy_solar"
                units={{ big: 'MW', small: 'kW' }}
                devices={devices}
              />
            </Col>
            <Col numColSpan={2} numColSpanMd={2} numColSpanLg={3}>
              <PerformersCard devices={devices} />
            </Col>
            <Col numColSpan={2} numColSpanMd={2} numColSpanLg={3}>
              <Card hFull={true}>
                <TotalDeviceChart devices={devices} />
              </Card>
            </Col>
          </ColGrid>
        </>
      ) : (
        <div className="h-70v">
          <ColGrid
            numColsMd={2}
            numColsLg={2}
            gapX="gap-x-6"
            gapY="gap-y-6"
            marginTop="mt-6"
          >
            <Col numColSpan={2}>
              <Title>To be done...</Title>
            </Col>
          </ColGrid>
        </div>
      )}
    </main>
  )
}

function getDeviceStates(devices) {
  let arr = [
    {
      name: 'Operational',
      Devices: 0
    },
    {
      name: 'Shutdown',
      Devices: 0
    },
    {
      name: 'Fault',
      Devices: 0
    }
  ]

  devices.forEach((item) => {
    if (item.state === 'Operational') {
      arr[0].Devices++
    } else if (item.state === 'Shutdown') {
      arr[1].Devices++
    } else if (item.state === 'Fault') {
      arr[2].Devices++
    }
  })

  return arr
}
