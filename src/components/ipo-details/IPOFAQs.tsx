import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Plus, Minus } from 'lucide-react-native'
import { AccordionSection } from './common'
import type { DisplayIPO } from '../../types'

export const IPOFAQs = ({ ipo }: { ipo: DisplayIPO }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  return (
    <AccordionSection value="faqs" title="FAQs">
      <VStack className="rounded-xl border border-outline-100 overflow-hidden">
        {(ipo.faqs?.length ? ipo.faqs : []).length > 0 ? (
          ipo.faqs!.map((faq, index) => {
            const isExpanded = expandedFAQ === index
            return (
              <Pressable
                key={index}
                onPress={() => setExpandedFAQ(isExpanded ? null : index)}
                className={`p-4 justify-between items-start flex-col w-full ${index !== (ipo.faqs?.length || 1) - 1 ? 'border-b border-outline-100' : ''}`}
              >
                <HStack className="w-full justify-between items-center">
                  <Text className="text-typography-900 text-[13px] flex-1 font-medium pr-4">{faq.question}</Text>
                  <Box>
                    {isExpanded ? (
                      <Icon as={Minus} className="text-typography-400 w-5 h-5" />
                    ) : (
                      <Icon as={Plus} className="text-typography-400 w-5 h-5" />
                    )}
                  </Box>
                </HStack>
                {isExpanded && (
                  <Text className="text-typography-500 text-[12px] leading-relaxed mt-3 w-full text-justify">
                    {faq.answer}
                  </Text>
                )}
              </Pressable>
            )
          })
        ) : (
          <Box className="p-4">
            <Text className="text-typography-400 text-[13px]">FAQs not available</Text>
          </Box>
        )}
      </VStack>
    </AccordionSection>
  )
}
