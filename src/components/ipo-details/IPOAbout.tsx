import React from 'react'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { AccordionSection } from './common'
import { ExpandableText } from '../common/ExpandableText'
import type { DisplayIPO } from '../../types'

export const IPOAbout = ({ ipo }: { ipo: DisplayIPO }) => {
  return (
    <AccordionSection value="about" title="About">
      <HStack className="justify-between items-center mb-4">
        <Text className="text-typography-500 text-[13px]">Founded in</Text>
        <Text className="text-typography-900 font-bold text-[13px]">{ipo.growwDetails?.aboutCompany?.yearFounded || ipo.foundedYear || 'N/A'}</Text>
      </HStack>
      <HStack className="justify-between items-center mb-5">
        <Text className="text-typography-500 text-[13px]">MD/CEO</Text>
        <Text className="text-typography-900 font-bold text-[13px]">{ipo.growwDetails?.aboutCompany?.managingDirector || ipo.mdCeo || 'N/A'}</Text>
      </HStack>

      <ExpandableText
        content={ipo.growwDetails?.aboutCompany?.aboutCompany || ipo.about || ipo.description || "No description available."}
        maxLength={150}
      />
    </AccordionSection>
  )
}
