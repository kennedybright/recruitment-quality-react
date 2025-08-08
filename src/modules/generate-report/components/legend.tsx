import { Text, View } from '@react-pdf/renderer'
import { legendStyles } from './stylesheet'
import { useCalltypes, useFormFields, useFramecodes } from '../../../lib/maf-api/hooks/qa.hooks'
import { FC } from 'react'

export const CallTypes: FC = () => {
    const { data: callTypes } = useCalltypes()
    return (
        <View style={legendStyles.section}>
            <Text style={legendStyles.sectionHeader}>CALLTYPES</Text>
            {callTypes?.map((ct, index) => (
                <View key={index} style={legendStyles.row}>
                    <Text style={legendStyles.label}>{ct.label}</Text>
                    <Text style={legendStyles.value}>{ct.value}</Text>
                </View>
            ))}
        </View>
    )
}

export const FrameCodes: FC = () => {
    const { data: frameCodes } = useFramecodes()
    return (
        <View style={legendStyles.section}>
            <Text style={legendStyles.sectionHeader}>FRAMECODES</Text>
            {frameCodes?.map((fc, index) => (
                <View key={index} style={legendStyles.row}>
                    <Text style={legendStyles.label}>{fc.label}</Text>
                    <Text style={legendStyles.value}>{fc.value}</Text>
                </View>
            ))}
        </View>
    )
}

export const Questions: FC = () => {
    const { data: questions } = useFormFields(1001, "scoring_dropdown")
    return (
        <View style={legendStyles.section}>
            <Text style={legendStyles.sectionHeader}>QUESTIONS</Text>
            {questions?.map((qf, index) => (
                <View key={index} style={legendStyles.row}>
                    <Text style={[legendStyles.label, {width: 12}]}>{index + 1}</Text>
                    <Text style={legendStyles.value}>{qf.name}</Text>
                </View>
            ))}
        </View>
    )
}