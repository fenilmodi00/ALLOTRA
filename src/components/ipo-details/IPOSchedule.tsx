import React from 'react'
import { Box } from '@/components/ui/box'
import { AccordionSection, TimelineItem } from './common'
import type { DisplayIPO } from '../../types'
import { formatDate } from '../../utils/formatters'

interface IPOScheduleProps {
  ipo: DisplayIPO
}

export const IPOSchedule = ({ ipo }: IPOScheduleProps) => {
  const today = new Date();
  const parseDate = (d?: string) => d ? new Date(d) : null;

  const openDate = parseDate(ipo.growwDetails?.startDate || ipo.dates.open);
  const closeDate = parseDate(ipo.growwDetails?.endDate || ipo.dates.close);
  const allotmentDate = parseDate(ipo.growwDetails?.allotmentDate || ipo.dates.allotment);
  const listingDate = parseDate(ipo.growwDetails?.listingDate || ipo.dates.listing);

  // Determine Status Color
  let statusColor = '#f97316'; // orange default for upcoming
  if (openDate && today >= openDate) {
    statusColor = '#eab308'; // yellow if open
  }
  if (closeDate && today >= closeDate) {
    statusColor = '#00b386'; // green if closed
  }

  const getProgressHeight = () => {
    if (listingDate && today >= listingDate) return '100%';
    if (allotmentDate && today >= allotmentDate) return '75%';
    if (closeDate && today >= closeDate) return '50%';
    if (openDate && today >= openDate) return '25%';
    return '0%';
  };

  return (
    <AccordionSection value="schedule" title="Schedule">
      <Box className="relative">
        {/* Progress Line Background */}
        <Box className="absolute left-[9px] top-[24px] bottom-[24px] w-[2px] bg-outline-100" />

        {/* Dynamic Progress Line */}
        <Box
          className="absolute left-[9px] top-[24px] w-[2px] z-0"
          style={{
            height: getProgressHeight() as any,
            backgroundColor: statusColor
          }}
        />
        <TimelineItem
          title="IPO open date"
          date={formatDate(ipo.growwDetails?.startDate || ipo.dates.open || '')}
          isActive={openDate ? today >= openDate : false}
          color={statusColor}
        />
        <TimelineItem
          title="IPO close date"
          date={formatDate(ipo.growwDetails?.endDate || ipo.dates.close || '')}
          isActive={closeDate ? today >= closeDate : false}
          color={statusColor}
        />
        <TimelineItem
          title="Allotment date"
          date={formatDate(ipo.growwDetails?.allotmentDate || ipo.dates.allotment || '')}
          isActive={allotmentDate ? today >= allotmentDate : false}
          color={statusColor}
        />
        <TimelineItem
          title="Funds unblock or debit"
          date={formatDate(ipo.growwDetails?.allotmentDate || ipo.dates.allotment || '')}
          isActive={allotmentDate ? today >= allotmentDate : false}
          showInfo={true}
          color={statusColor}
        />
        <TimelineItem
          title="Tentative listing date"
          date={formatDate(ipo.growwDetails?.listingDate || ipo.dates.listing || '')}
          isActive={listingDate ? today >= listingDate : false}
          color={statusColor}
        />
      </Box>
    </AccordionSection>
  )
}
