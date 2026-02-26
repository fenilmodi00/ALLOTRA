import React, { useState } from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { ThumbsUp, ThumbsDown } from 'lucide-react-native'
import { AccordionSection } from './common'
import { TabGroup } from '../common/TabGroup'
import type { DisplayIPO } from '../../types'
import { growwColors } from '../../design-system/tokens/colors'

export const IPOProsCons = ({ ipo }: { ipo: DisplayIPO }) => {
  const [prosConsTab, setProsConsTab] = useState('pros')

  const prosConsTabs = [
    { key: 'pros', label: 'Pros' },
    { key: 'cons', label: 'Cons' },
  ]

  return (
    <AccordionSection value="pros-cons" title="Pros and cons">
      <TabGroup
        tabs={prosConsTabs}
        defaultTab="pros"
        onTabChange={(key) => setProsConsTab(key)}
      />

      <VStack className="gap-5">
        {prosConsTab === 'pros' ? (
          ((ipo.growwDetails?.pros?.length ? ipo.growwDetails.pros : ipo.strengths) || []).map((item, index) => (
            <HStack key={`pro-${index}`} className="gap-3 items-start pr-4">
              <Box className="mt-0.5">
                <Icon as={ThumbsUp} className="w-[18px] h-[18px] text-[#00b386] fill-[#00b386]" />
              </Box>
              <Text className="text-typography-600 text-[13px] leading-[20px] flex-1 text-justify">{item}</Text>
            </HStack>
          ))
        ) : (
          ((ipo.growwDetails?.cons?.length ? ipo.growwDetails.cons : ipo.risks) || []).map((item, index) => (
            <HStack key={`con-${index}`} className="gap-3 items-start pr-4">
              <Box className="mt-0.5">
                <Icon as={ThumbsDown} className="w-[18px] h-[18px] text-error-500 fill-error-500" />
              </Box>
              <Text className="text-typography-600 text-[13px] leading-[20px] flex-1 text-justify">{item}</Text>
            </HStack>
          ))
        )}
        {(prosConsTab === 'pros' && !(ipo.growwDetails?.pros?.length || ipo.strengths?.length)) && (
          <Text className="text-typography-400 text-[13px]">No pros available</Text>
        )}
        {(prosConsTab === 'cons' && !(ipo.growwDetails?.cons?.length || ipo.risks?.length)) && (
          <Text className="text-typography-400 text-[13px]">No cons available</Text>
        )}
      </VStack>
    </AccordionSection>
  )
}
