// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import { Card, Title, ColGrid, LineChart } from '@tremor/react'
import api from '../common/api'
import { ChartLoader } from './Loaders'

export const MonthlyCharts = (props) => {
  const device = props.device
  const [monthlyData, setMonthlyData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Returns data for graphs
  const getGraphDataByField = (dataField, fieldCategory) => {
    let graphList = []
    // Make a list of data points for the field given as a parameter
    for (let i = 0; i < monthlyData.length; i++) {
      graphList.push({
        month: new Date(monthlyData[i].create_time).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short'
        }),
        [fieldCategory]: parseFloat(monthlyData[i][dataField].toFixed(2))
      })
    }
    return graphList
  }

  useEffect(() => {
    if (monthlyData === null) {
      setLoading(true)
      api
        .get(`http://localhost:4000/data/monthly/${device.device_id}`)
        .then((res) => {
          setMonthlyData(res.data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [monthlyData, device.device_id])

  // Charts are conditionally rendered with the following logic:
  // If loading -> Show loaders
  // if not loading and data available: Show charts
  // If not loading and no data available: Hide charts and show "no data available text"
  return (
    <>
      <ColGrid numColsLg={2} numColsSm={1} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        {loading ? (
          <ChartLoader className="mt-4" aria-label="Loading Spinner" />
        ) : (
          monthlyData.length > 0 && (
            <Card>
              <Title>Average solar energy</Title>
              <LineChart
                data={getGraphDataByField('energy_solar_avg', 'kW')}
                dataKey="month"
                categories={['kW']}
                colors={['blue']}
                valueFormatter={undefined}
                marginTop="mt-6"
                yAxisWidth="w-15"
              />
            </Card>
          )
        )}

        {loading ? (
          <ChartLoader className="mt-4" aria-label="Loading Spinner" />
        ) : (
          monthlyData.length > 0 && (
            <Card>
              <Title>Average light intensity</Title>
              <LineChart
                data={getGraphDataByField('lux_solar_avg', 'lx')}
                dataKey="month"
                categories={['lx']}
                colors={['blue']}
                valueFormatter={undefined}
                marginTop="mt-6"
                yAxisWidth="w-10"
              />
            </Card>
          )
        )}

        {loading ? (
          <ChartLoader className="mt-4" aria-label="Loading Spinner" />
        ) : (
          monthlyData.length > 0 && (
            <Card>
              <Title>Average battery charge </Title>
              <LineChart
                data={getGraphDataByField('charge_battery_avg', 'mAh')}
                dataKey="month"
                categories={['mAh']}
                colors={['blue']}
                valueFormatter={undefined}
                marginTop="mt-6"
                yAxisWidth="w-10"
              />
            </Card>
          )
        )}

        {loading ? (
          <ChartLoader className="mt-4" aria-label="Loading Spinner" />
        ) : (
          monthlyData.length > 0 && (
            <Card>
              <Title>Average battery output</Title>
              <LineChart
                data={getGraphDataByField('output_battery_avg', 'kW')}
                dataKey="month"
                categories={['kW']}
                colors={['blue']}
                valueFormatter={undefined}
                marginTop="mt-6"
                yAxisWidth="w-10"
              />
            </Card>
          )
        )}
      </ColGrid>
      {!loading && monthlyData?.length === 0 && (
        <Title marginTop="mt-5">Monthly chart data not available yet.</Title>
      )}
    </>
  )
}
