// Author: Oskari Niskanen
import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Title, Flex, TabList, Tab } from '@tremor/react'
import { RecentDetails } from './RecentDetails'
import { MonthlyDetails } from './MonthlyDetails'
import { MonthlyCharts } from './MonthlyCharts'

export const DetailsView = () => {
  const location = useLocation()
  const device = location.state.device
  const [selectedView, setSelectedView] = useState(1)

  const renderSelectedView = (view) => {
    switch (view) {
      case 1:
        return <RecentDetails device={device} />
      case 2:
        return <MonthlyDetails device={device} />
      case 3:
        return <MonthlyCharts device={device} />
      default:
        return <></>
    }
  }
  return (
    <main className="bg-slate-50 p-6 sm:p-10 flex-auto">
      <h1 className="text-xl font-bold tr-text-left">Details</h1>
      <Flex justifyContent="justify-start" spaceX="space-x-2" truncate={true}>
        <Title>Identifier: {device?.device_id}</Title>
      </Flex>
      <TabList
        defaultValue={1}
        handleSelect={(value) => setSelectedView(value)}
        marginTop="mt-6"
      >
        <Tab value={1} text="Overview" />
        <Tab value={2} text="Monthly statistics" />
        <Tab value={3} text="Monthly charts" />
      </TabList>
      {renderSelectedView(selectedView)}
    </main>
  )
}
