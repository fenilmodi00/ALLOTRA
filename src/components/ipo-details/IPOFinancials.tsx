import React from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { AccordionSection } from './common'
import { FinancialsChart } from '../charts/FinancialsChart'
import type { DisplayIPO } from '../../types'

export const IPOFinancials = ({ ipo }: { ipo: DisplayIPO }) => {
  return (
    <AccordionSection value="financials" title="Financials">
      {ipo.financials && ipo.financials.length > 0 ? (
        <FinancialsChart financials={ipo.financials} />
      ) : (
        <Box className="items-center justify-center py-8">
          <Text className="text-typography-400 text-[13px]">Financial data not available</Text>
        </Box>
      )}
    </AccordionSection>
  )
}
