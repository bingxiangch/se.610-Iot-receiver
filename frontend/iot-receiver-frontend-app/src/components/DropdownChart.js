// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import {
  Dropdown,
  Card,
  DropdownItem,
  Datepicker,
  ColGrid,
  Col,
  Title,
  LineChart,
  Icon,
  Flex
} from '@tremor/react'
import api from '../common/api'
import { getAsLocaleString } from '../common/utils'
import { ChartLoader } from './Loaders'
import { FaceFrownIcon } from '@heroicons/react/24/outline'

export const DropdownChart = (props) => {
  const [granularity, setGranularity] = useState('hour')
  const [data, setData] = useState([{}])
  const [loading, setLoading] = useState(false)

  // Converts Date object to ISO String with timezone
  const toISOStringWithTimezone = (date, end) => {
    const tzOffset = -date.getTimezoneOffset()
    const diff = tzOffset >= 0 ? '%2B' : '-'
    const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0')
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(end ? '23' : '00') +
      ':' +
      pad(end ? '59' : '00') +
      ':' +
      pad(end ? '59' : '00') +
      diff +
      pad(tzOffset / 60) +
      ':' +
      pad(tzOffset % 60)
    )
  }
  const initialDates = {
    // Setting initial start date 30 days backwards.
    startDate: toISOStringWithTimezone(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      false
    ),
    endDate: toISOStringWithTimezone(new Date(), true)
  }
  const [dates, setDates] = useState(initialDates)

  // Handles changes of date picker
  const handleDateChange = (start, end) => {
    setDates({
      ...dates,
      startDate: toISOStringWithTimezone(start, false),
      endDate: toISOStringWithTimezone(end, true)
    })
  }

  // Processes api response and creates an array of data points for the chart.
  const getDataPoints = (data, field, category, cumulative) => {
    if (data?.length) {
      let dataPoints = []
      // Make a list of data points for the field given as a parameter
      for (let i = 0; i < data.length; i++) {
        dataPoints.push({
          // Setting values under the granularity key
          [granularity]: getGranulatedTimeString(data[i].time, granularity),
          [category]:
            data[i][field] !== 0
              ? parseFloat(data[i][field].toFixed(2))
              : parseFloat(data[i][field])
        })
      }
      setData(dataPoints)
    } else {
      setData([{}])
    }
  }
  // Function returns time string with the chosen granularity.
  function getGranulatedTimeString(time, granularity) {
    switch (granularity) {
      case 'minute':
        return getAsLocaleString(time)
      case 'hour':
        return getAsLocaleString(time, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      case 'day':
        return getAsLocaleString(time, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        })
      case 'week':
        // Creating a string of the week beginning date and the ending date of the week.
        let week = `${getAsLocaleString(time, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        })} - ${getAsLocaleString(new Date(time).setDate(new Date(time).getDate() + 6), {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        })}`
        return week
      case 'month':
        return getAsLocaleString(time, {
          year: 'numeric',
          month: 'long'
        })
      default:
        return getAsLocaleString(time)
    }
  }

  useEffect(() => {
    setLoading(true)
    // Get data from api
    api
      .get(
        `http://localhost:4000/data/${props.deviceId}?timeFormat=${granularity}&startDate=${dates.startDate}&endDate=${dates.endDate}`
      )
      .then((res) => {
        getDataPoints(res.data[props.deviceId], props.dataKey, props.category, false)
      })
      .catch((err) => {
        console.error('Error encountered.', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [granularity, dates])

  return (
    <Card>
      <Title>{props.title}</Title>
      <ColGrid numCols={8} gapY="gap-y-2" gapX="gap-x-6" marginTop="mt-2">
        <Col numColSpanLg={3} numColSpanMd={3} numColSpan={2}>
          <Dropdown
            defaultValue={'hour'}
            handleSelect={(value) => setGranularity(value)}
            maxWidth="max-w-fit"
          >
            <DropdownItem value={'minute'} text="Minute" />
            <DropdownItem value={'hour'} text="Hour" />
            <DropdownItem value={'day'} text="Day" />
            <DropdownItem value={'week'} text="Week" />
            <DropdownItem value={'month'} text="Month" />
          </Dropdown>
        </Col>
        <Col numColSpanLg={5} numColSpanMd={5} numColSpan={8}>
          <Datepicker
            placeholder="Select..."
            enableRelativeDates={true}
            handleSelect={(start, end) => handleDateChange(start, end)}
            defaultRelativeFilterOption={'t'}
            color="blue"
            maxWidth="max-w-lg"
          />
        </Col>
      </ColGrid>
      {loading ? (
        <ChartLoader className="mt-4" aria-label="Loading Spinner" />
      ) : data.length > 0 && Object.keys(data[0]).length > 0 ? (
        <LineChart
          data={data}
          valueFormatter={
            props.formatterSuffix
              ? (val) =>
                  `${Intl.NumberFormat('us').format(val).toString()} ${
                    props.formatterSuffix
                  }`
              : undefined
          }
          dataKey={granularity}
          categories={[props.category]}
          colors={['blue']}
          marginTop="mt-6"
          yAxisWidth="w-15"
        />
      ) : (
        <div className="tremor-base tr-w-full tr-h-80 tr-mt-6">
          <Flex justifyContent="justify-center">
            <Icon icon={FaceFrownIcon} size="md" color="red" />
            <Title>No data available for chosen period.</Title>
          </Flex>
        </div>
      )}
    </Card>
  )
}
