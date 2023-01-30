// Author: Oskari Niskanen & Michel Leermakers
import React from 'react'
import { Text, Button, Flex, Dropdown, DropdownItem, Subtitle } from '@tremor/react'

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import { useMediaQuery } from '../common/useMediaQuery'

export const Pagination = (props) => {
  const changePage = (page) => {
    props.setCurrentPage(page)
  }
  const changeSize = (size) => {
    props.setPageSize(size)
  }
  return (
    <Flex
      justifyContent={
        useMediaQuery('(min-width: 768px)') ? 'justify-end' : 'justify-start'
      }
      spaceX="space-x-2"
      marginTop="mt-6"
    >
      {useMediaQuery('(min-width: 768px)') && (
        <>
          <Subtitle>Show:</Subtitle>
          <Dropdown
            defaultValue={props.pageSize}
            handleSelect={(value) => {
              changePage(1)
              changeSize(value)
            }}
            maxWidth="max-w-fit"
            marginTop="mt-0"
          >
            <DropdownItem value={20} text="20 rows" />
            <DropdownItem value={50} text="50 rows" />
            <DropdownItem value={100} text="100 rows" />
          </Dropdown>
          <Button
            text="10"
            icon={ChevronDoubleLeftIcon}
            disabled={props.currentPage === 1 ? true : false}
            importance="secondary"
            handleClick={() => {
              if (props.currentPage > 10) {
                changePage(props.currentPage - 10)
              } else {
                changePage(1)
              }
            }}
          />
        </>
      )}

      <Button
        icon={ChevronLeftIcon}
        disabled={props.currentPage === 1 ? true : false}
        color="blue"
        importance="secondary"
        handleClick={() => {
          if (props.currentPage !== 1) {
            changePage(props.currentPage - 1)
          }
        }}
      />
      <Text id="page-count">{`Page ${props.currentPage} / ${
        props.totalDevices > 0 ? Math.ceil(props.totalDevices / props.pageSize) : 1
      }`}</Text>
      <Button
        icon={ChevronRightIcon}
        color="blue"
        disabled={
          props.currentPage === Math.ceil(props.totalDevices / props.pageSize) ||
          props.totalDevices === 0
            ? true
            : false
        }
        importance="secondary"
        handleClick={() => {
          if (props.currentPage !== Math.ceil(props.totalDevices / props.pageSize)) {
            changePage(props.currentPage + 1)
          }
        }}
      />

      {useMediaQuery('(min-width: 768px)') && (
        <>
          <Button
            icon={ChevronDoubleRightIcon}
            text="10"
            disabled={
              props.currentPage === Math.ceil(props.totalDevices / props.pageSize) ||
              props.totalDevices === 0
                ? true
                : false
            }
            iconPosition="right"
            importance="secondary"
            handleClick={() => {
              if (
                props.currentPage + 10 <
                Math.ceil(props.totalDevices / props.pageSize)
              ) {
                changePage(props.currentPage + 10)
              } else {
                changePage(Math.ceil(props.totalDevices / props.pageSize))
              }
            }}
          />
        </>
      )}
    </Flex>
  )
}
