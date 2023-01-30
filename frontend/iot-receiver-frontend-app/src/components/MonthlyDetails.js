// Author: Oskari Niskanen
import React, { useEffect, useState } from 'react'
import {
  Card,
  Block,
  Title,
  Text,
  ColGrid,
  Subtitle,
  Flex,
  Icon,
  Legend,
  BarList,
  DonutChart,
  Accordion,
  AccordionHeader,
  AccordionBody,
  AccordionList
} from '@tremor/react'
import {
  Battery100Icon,
  SunIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  LightBulbIcon,
  SignalIcon,
  BoltIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import api from '../common/api'
import { getAsLocaleString } from '../common/utils'

export const MonthlyDetails = (props) => {
  const device = props.device
  const stateRateColors = ['green', 'red', 'slate']
  const [monthlyData, setMonthlyData] = useState(null)
  const [stateRates, setStateRates] = useState({})
  const [plugRates, setPlugRates] = useState({})
  const [loading, setLoading] = useState(true)

  // Sets the plug rates and state rates into a format that donut charts can display them
  const setRates = (data) => {
    let monthlyStateRates = {}
    let monthlyPlugRates = {}
    // Looping through each entry in data
    data.forEach((month) => {
      // For each month, set the state rates to a JSON object
      monthlyStateRates[month.id] = [
        {
          name: 'Operational',
          // Multiplying the rates by 100, because the database returns them as values between 0 and 1.
          value: month.operational_rate * 100
        },
        {
          name: 'Shutdown',
          value: month.shutdown_rate * 100
        },
        {
          name: 'Fault',
          value: month.fault_rate * 100
        }
      ]
      monthlyPlugRates[month.id] = {
        plugs: {
          'Plug 1': [
            // Plug on rate is calculated from the plug off rate.
            { name: 'On', value: (1 - month.plugoffrate1) * 100 },
            { name: 'Off', value: month.plugoffrate1 * 100 }
          ],
          'Plug 2': [
            { name: 'On', value: (1 - month.plugoffrate2) * 100 },
            { name: 'Off', value: month.plugoffrate2 * 100 }
          ]
        }
      }
    })
    // Setting objects to state
    setStateRates(monthlyStateRates)
    setPlugRates(monthlyPlugRates)
  }

  useEffect(() => {
    if (monthlyData === null) {
      setLoading(true)
      api
        .get(`http://localhost:4000/data/monthly/${device.device_id}`)
        .then((res) => {
          setMonthlyData(res.data)
          setRates(res.data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [monthlyData, device.device_id])

  // Format output as percentages
  const stateFormatter = (val) => `${val.toString()} %`

  return monthlyData?.length ? (
    <AccordionList marginTop="mt-5">
      {monthlyData?.map((month) => (
        <Accordion key={month.id}>
          <AccordionHeader>
            {new Date(month.create_time).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long'
            })}
          </AccordionHeader>
          <AccordionBody>
            <div>
              <ColGrid numColsMd={2} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
                <Card hFull={true}>
                  <Flex justifyContent="justify-start" truncate={true}>
                    <Icon
                      icon={Battery100Icon}
                      color="green"
                      variant="simple"
                      size="lg"
                    />
                    <Title>Battery output</Title>
                  </Flex>
                  <Block marginTop="mt-2">
                    <Flex spaceX="space-x-2" truncate={true}>
                      <Block>
                        <Text>Total output</Text>
                        <Title>{month.output_battery_sum.toFixed(2)}</Title>
                        <Subtitle>kWh</Subtitle>
                      </Block>
                      <Block>
                        <Text>Average output</Text>
                        <Title>{month.output_battery_avg.toFixed(0)}</Title>
                        <Subtitle>kW</Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                  <Block marginTop="mt-5">
                    <Flex spaceX="space-x-1" truncate={true}>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowUpCircleIcon}
                            color="huld-sky-blue"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Maximum</Text>
                        </Flex>
                        <Title>{month.output_battery_max.toFixed(2)} kW</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.output_battery_max_timestamp)}
                        </Subtitle>
                      </Block>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowDownCircleIcon}
                            color="red"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Minimum</Text>
                        </Flex>
                        <Title>{month.output_battery_min.toFixed(2)} kW</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.output_battery_min_timestamp)}
                        </Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                </Card>
                <Card hFull={true}>
                  <Flex justifyContent="justify-start" truncate={true}>
                    <Icon icon={BoltIcon} color="yellow" variant="simple" size="lg" />
                    <Title>Battery charge</Title>
                  </Flex>
                  <Block marginTop="mt-2">
                    <Flex spaceX="space-x-2" truncate={true}>
                      <Block>
                        <Text>Average charge</Text>
                        <Title>{month.charge_battery_avg.toFixed(1)}</Title>
                        <Subtitle>mAh</Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                  <Block marginTop="mt-5">
                    <Flex spaceX="space-x-1" truncate={true}>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowUpCircleIcon}
                            color="huld-sky-blue"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Maximum</Text>
                        </Flex>
                        <Title>{month.charge_battery_max.toFixed(1)} mAh</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.charge_battery_max_timestamp)}
                        </Subtitle>
                      </Block>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowDownCircleIcon}
                            color="red"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Minimum</Text>
                        </Flex>
                        <Title>{month.charge_battery_min.toFixed(1)} mAh</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.charge_battery_min_timestamp)}
                        </Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                </Card>
                <Card hFull={true}>
                  <Flex justifyContent="justify-start" spaceX="space-x-1" truncate={true}>
                    <Icon icon={SunIcon} color="yellow" variant="simple" size="lg" />
                    <Title>Solar panel</Title>
                  </Flex>
                  <Block marginTop="mt-2">
                    <Flex spaceX="space-x-1" truncate={true}>
                      <Block>
                        <Text>Total output</Text>
                        <Title>{month.energy_solar_sum.toFixed(1)}</Title>
                        <Subtitle>kWh</Subtitle>
                      </Block>
                      <Block>
                        <Text>Average output</Text>
                        <Title>{month.energy_solar_avg.toFixed(1)}</Title>
                        <Subtitle>kW</Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                  <Block marginTop="mt-5">
                    <Flex spaceX="space-x-1" truncate={true}>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowUpCircleIcon}
                            color="huld-sky-blue"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Maximum</Text>
                        </Flex>
                        <Title>{month.energy_solar_max.toFixed(2)} kW</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.energy_solar_max_timestamp)}
                        </Subtitle>
                      </Block>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowDownCircleIcon}
                            color="red"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Minimum</Text>
                        </Flex>
                        <Title>{month.energy_solar_min.toFixed(2)} kW</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.energy_solar_min_timestamp)}
                        </Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                </Card>
                <Card hFull={true}>
                  <Flex justifyContent="justify-start" spaceX="space-x-1" truncate={true}>
                    <Icon icon={LightBulbIcon} color="red" variant="simple" size="lg" />
                    <Title>Light intensity</Title>
                  </Flex>
                  <Block marginTop="mt-2">
                    <Flex spaceX="space-x-1" truncate={true}>
                      <Block>
                        <Text>Average brightness</Text>
                        <Title>{month.lux_solar_avg.toFixed(0)}</Title>
                        <Subtitle>lx</Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                  <Block marginTop="mt-5">
                    <Flex spaceX="space-x-1" truncate={true}>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowUpCircleIcon}
                            color="huld-sky-blue"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Maximum</Text>
                        </Flex>
                        <Title>{month.lux_solar_max} lx</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.lux_solar_max_timestamp)}
                        </Subtitle>
                      </Block>
                      <Block>
                        <Flex justifyContent="justify-start">
                          <Icon
                            icon={ArrowDownCircleIcon}
                            color="red"
                            variant="simple"
                            size="sm"
                          />
                          <Text>Minimum</Text>
                        </Flex>
                        <Title>{month.lux_solar_min} lx</Title>
                        <Subtitle truncate={true}>
                          at {getAsLocaleString(month.lux_solar_min_timestamp)}
                        </Subtitle>
                      </Block>
                    </Flex>
                  </Block>
                </Card>
                <Card hFull={true}>
                  <Flex justifyContent="justify-start" spaceX="space-x-1" truncate={true}>
                    <Icon
                      icon={SignalIcon}
                      color="huld-sky-blue"
                      variant="simple"
                      size="lg"
                    />
                    <Title>Device state</Title>
                  </Flex>
                  <Block marginTop="mt-2">
                    <Legend
                      categories={stateRates[month.id].map((state) => state.name)}
                      colors={stateRateColors}
                      marginTop="mt-6"
                    />
                    <Flex spaceX="space-x-1" truncate={true}>
                      <DonutChart
                        data={stateRates[month.id]}
                        colors={stateRateColors}
                        category="value"
                        dataKey="name"
                        valueFormatter={stateFormatter}
                        marginTop="mt-6"
                      />
                    </Flex>
                  </Block>
                  <Block marginTop="mt-5">
                    <Flex spaceX="space-x-1" truncate={true}>
                      <Block>
                        <BarList
                          data={stateRates[month.id]}
                          valueFormatter={stateFormatter}
                          color="huld-sky-blue"
                          marginTop="mt-6"
                        />
                      </Block>
                    </Flex>
                  </Block>
                </Card>
                <Card hFull={true}>
                  <Flex justifyContent="justify-start" spaceX="space-x-1" truncate={true}>
                    <Icon icon={ServerIcon} color="zinc" variant="simple" size="lg" />
                    <Title>Plug rates</Title>
                  </Flex>
                  <Block marginTop="mt-2">
                    <Legend
                      categories={['On', 'Off']}
                      colors={['green', 'red']}
                      marginTop="mt-6"
                    />
                    {Object.keys(plugRates[month.id]?.plugs).map((plug) => {
                      return (
                        <DonutChart
                          key={plug}
                          data={plugRates[month.id].plugs[plug]}
                          colors={['emerald', 'red']}
                          category="value"
                          label={plug.charAt(0).toUpperCase() + plug.slice(1)}
                          dataKey="name"
                          valueFormatter={stateFormatter}
                          marginTop="mt-6"
                        />
                      )
                    })}
                  </Block>
                </Card>
              </ColGrid>
            </div>
          </AccordionBody>
        </Accordion>
      ))}
    </AccordionList>
  ) : !loading ? (
    <p className="text-elem tremor-base tr-mt-5 tr-text-gray-700 tr-text-lg tr-font-medium">
      Monthly statistical data not available yet.
    </p>
  ) : null
}
