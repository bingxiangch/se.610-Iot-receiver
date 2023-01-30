// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Title,
  Badge,
  Button,
  Toggle,
  ToggleItem,
  Block,
  Flex,
  ColGrid,
  Col,
  Icon
} from '@tremor/react'

import api from '../common/api'
import { getAsLocaleString } from '../common/utils'
import { Pagination } from './Pagination'
import { Bars3Icon, Squares2X2Icon, FaceFrownIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { StateFilterDropdown } from './StateFilterDropdown'

export const colors = {
  Operational: 'emerald',
  Shutdown: 'red',
  'Connection lost': 'yellow'
}

export const DevicesView = () => {
  const [selectedView, setSelectedView] = useState(1)
  const [deviceData, setDeviceData] = useState(null)
  const [totalDevices, setTotalDevices] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [state, setState] = useState('Any')

  const handleStateChange = (value) => {
    setState(value)
    setCurrentPage(1)
  }
  // Getting devices when component renders
  useEffect(() => {
    setLoading(true)
    // Get from API with pagination and state filtering.
    api
      .get(
        `http://localhost:4000/devices/?pageNumber=${currentPage}&pageSize=${pageSize}&state=${
          state === 'Any' ? '' : state
        }`
      )
      .then((res) => {
        setDeviceData(res.data.devices)
        setTotalDevices(res.data.deviceCount)
      })
      .catch((err) => {
        console.error('Error encountered.', err)
      })
      .finally(() => {
        setLoading(false)
      })
    // useEffect is triggered if current page, page size, state filter or total devices change.
  }, [currentPage, pageSize, state, totalDevices])

  return (
    <main className="bg-slate-50 p-6 sm:p-10 flex-auto">
      <h1 className="text-xl font-bold tr-text-left">Devices</h1>

      <Card marginTop="mt-2">
        <StateFilterDropdown
          deviceCount={totalDevices}
          onStateChange={handleStateChange}
        />
        <ColGrid numCols={4}>
          <Col numColSpanLg={2} numColSpan={4}>
            <Toggle
              defaultValue={1}
              handleSelect={(value) => setSelectedView(value)}
              marginTop="mt-6"
            >
              <ToggleItem value={1} icon={Bars3Icon} text="List" />
              <ToggleItem value={2} icon={Squares2X2Icon} text="Cards" />
            </Toggle>
          </Col>
          <Col numColSpanLg={2} numColSpan={4}>
            <Pagination
              totalDevices={totalDevices}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </Col>
        </ColGrid>
        <Block marginTop="mt-6">
          {deviceData && deviceData.length > 0 ? (
            <>
              {selectedView === 1 ? (
                <Table marginTop="mt-5">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>ID</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Last updated</TableHeaderCell>
                      <TableHeaderCell></TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deviceData.map((item) => (
                      <TableRow key={item.device_id}>
                        <TableCell>{item.device_id}</TableCell>
                        <TableCell>
                          <Badge text={item.state} color={colors[item.state]} />
                        </TableCell>
                        <TableCell>
                          <Text>{getAsLocaleString(item.create_time)}</Text>
                        </TableCell>
                        <TableCell>
                          <Link to={'/details'} state={{ device: item }}>
                            <Button text="Details" color="blue" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <ColGrid numColsLg={4} gapX="gap-x-5" marginTop="mt-5" gapY="gap-y-5">
                  {deviceData.map((item) => (
                    <Col key={item.device_id}>
                      <Card marginTop="mt-2">
                        <Flex truncate={true}>
                          <Title>{item.device_id}</Title>
                        </Flex>
                        <Badge
                          text={item.state}
                          color={colors[item.state]}
                          marginTop="mt-4"
                        />
                        <Flex>
                          <Block>
                            <Text marginTop="mt-4">Last updated:</Text>
                            <Text marginTop="mt-2">
                              {getAsLocaleString(item.create_time)}
                            </Text>
                          </Block>
                          <Link to={'/details'} state={{ device: item }}>
                            <Button text="Details" color="blue" marginTop="mt-4" />
                          </Link>
                        </Flex>
                      </Card>
                    </Col>
                  ))}
                </ColGrid>
              )}
            </>
          ) : (
            !loading && (
              <Flex justifyContent="justify-center">
                <Icon icon={FaceFrownIcon} size="md" color="red" />
                <p className="text-elem tremor-base tr-mt-0 tr-text-gray-700 tr-text-lg tr-font-medium">
                  No devices found with the selected filter.
                </p>
              </Flex>
            )
          )}
        </Block>
        {totalDevices > 10 && (
          <Pagination
            totalDevices={totalDevices}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        )}
      </Card>
    </main>
  )
}
