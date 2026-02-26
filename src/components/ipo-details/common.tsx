import React from 'react'
import { AccordionItem, AccordionHeader, AccordionTrigger, AccordionTitleText, AccordionIcon, AccordionContent } from '@/components/ui/accordion'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react-native'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { growwColors } from '../../design-system/tokens/colors'

export const AccordionSection = ({ value, title, children }: { value: string, title: string, children: React.ReactNode }) => {
  return (
    <AccordionItem value={value} className="bg-white border-b border-outline-100">
      <AccordionHeader>
        <AccordionTrigger className="px-4 py-4 focus:bg-transparent">
          {({ isExpanded }: { isExpanded: boolean }) => (
            <>
              <AccordionTitleText className="text-[17px] font-bold text-typography-900">{title}</AccordionTitleText>
              {isExpanded ? (
                <AccordionIcon as={ChevronUp} className="ml-3 text-typography-500 w-5 h-5" />
              ) : (
                <AccordionIcon as={ChevronDown} className="ml-3 text-typography-500 w-5 h-5" />
              )}
            </>
          )}
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent className="px-4 pb-6 pt-0">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}

export interface TimelineItemProps {
  title: string
  date: string | null | undefined
  isActive: boolean
  showInfo?: boolean
  color?: string
}

export const TimelineItem = ({ title, date, isActive, showInfo, color = '#00b386' }: TimelineItemProps) => (
  <HStack className="pl-0 py-3 items-start">
    <Box className="w-5 items-center mr-3 mt-[2px] z-10">
      {isActive ? (
        <Box
          className="w-5 h-5 rounded-full border-[2px] items-center justify-center bg-white"
          style={{ borderColor: color }}
        >
          <Box className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        </Box>
      ) : (
        <Box className="w-[14px] h-[14px] rounded-full border-[2px] border-outline-200 bg-white" />
      )}
    </Box>
    <Box className="pb-1">
      <HStack className="items-center">
        <Text className={`font-bold ${isActive ? 'text-typography-900' : 'text-typography-600'} text-[14px]`}>{title}</Text>
        {showInfo && <Icon as={Clock} className="w-3 h-3 ml-1 text-typography-400" />}
      </HStack>
      <Text className="text-typography-500 text-xs mt-0.5">{date || 'TBA'}</Text>
    </Box>
  </HStack>
)
