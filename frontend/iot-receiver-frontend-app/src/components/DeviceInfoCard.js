// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import { Card, Title, Metric, Block, Subtitle } from '@tremor/react'
import { MiniCardLoader } from './Loaders'

export const DeviceInfoCard = ({ title, fieldName, devices, units }) => {
  const [fieldValues, setFieldValues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (devices.length) {
      setLoading(true)
      let fieldVals = []
      // Calculating mean of selected property
      fieldVals.push({
        fName: 'Average',
        fValue:
          devices.reduce(function (a, b) {
            return a + b[fieldName]
          }, 0) / devices.length
      })

      // Sorting devices by selected field
      let sorted = [...devices].sort((a, b) => a[fieldName] - b[fieldName])
      // Finding mid point
      let mid = devices.length >> 1
      // Setting mid point value as the field value
      fieldVals.push({
        fName: 'Median',
        fValue:
          devices.length % 2
            ? sorted[mid][fieldName]
            : (sorted[mid - 1][fieldName] + sorted[mid][fieldName]) / 2
      })

      // Calculating sum of object properties that was selected
      fieldVals.push({
        fName: 'Sum',
        fValue: devices.reduce(function (a, b) {
          return a + b[fieldName]
        }, 0)
      })
      setFieldValues(fieldVals)
      setLoading(false)
    }
  }, [devices, fieldName])

  return (
    <Card hFull={true}>
      <Title>{title}</Title>
      {loading ? (
        <MiniCardLoader />
      ) : (
        fieldValues.map((field) => {
          return (
            <Block marginTop="mt-2" key={field.fName}>
              <Title>{field.fName}</Title>

              {field.fValue > 1000000 ? (
                <>
                  <Metric>{(field.fValue / 1000).toFixed(2)}</Metric>
                  <Subtitle>{units.big}</Subtitle>
                </>
              ) : (
                <>
                  <Metric>{field.fValue.toFixed(2)}</Metric>
                  <Subtitle>{units.small}</Subtitle>
                </>
              )}
            </Block>
          )
        })
      )}
    </Card>
  )
}
