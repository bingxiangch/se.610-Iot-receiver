// Author: Oskari Niskanen
import React, { useState } from 'react'
import { Flex, Dropdown, DropdownItem, Badge, Col, ColGrid } from '@tremor/react'

import { FunnelIcon } from '@heroicons/react/24/outline'

export const StateFilterDropdown = (props) => {
  const [filterState, setFilterState] = useState('Any')
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      <ColGrid numCols={9} gapX="gap-x-4">
        <Col numColSpan={9}>
          <p className="text-left">Filter by device state</p>
        </Col>
        <Col numColSpan={9} numColSpanSm={5} numColSpanMd={5} numColSpanLg={5}>
          <Dropdown
            defaultValue={filterState}
            handleSelect={(value) => {
              props.onStateChange(value)
              setFilterState(value)
            }}
            maxWidth="max-w-min"
            marginTop="mt-2"
          >
            <DropdownItem value={'Any'} text="Any" />
            <DropdownItem value={'Operational'} text="Operational" />
            <DropdownItem value={'Shutdown'} text="Shutdown" />
            <DropdownItem value={'Fault'} text="Fault" />
          </Dropdown>
        </Col>
        <Col numColSpan={9} numColSpanSm={4} numColSpanMd={4} numColSpanLg={4}>
          <Badge
            text={props.deviceCount + ' devices'}
            color="huld-light-blue"
            size="md"
            icon={FunnelIcon}
            tooltip="Total number of devices with the selected state"
            marginTop="mt-3"
          />
        </Col>
      </ColGrid>
    </Flex>
  )
}
/*
 
*/
