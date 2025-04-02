import { Text, View } from '@react-pdf/renderer'
import { legendStyles } from './stylesheet'

const loadLegend = async () => {
  try {
    const { getLegendData } = await import('../../../lib/utils/qa-reports')
    return await getLegendData()
  } catch(error) {
    console.log("Error loading the legend: ", error)
  }
}
const legend = await loadLegend()

export const CallTypes = () => (
  <View style={legendStyles.section}>
    <Text style={legendStyles.sectionHeader}>CALLTYPES</Text>
    {legend.callTypes?.map((ct, index) => (
      <View key={index} style={legendStyles.row}>
        <Text style={legendStyles.label}>{ct.label}</Text>
        <Text style={legendStyles.value}>{ct.value}</Text>
      </View>
    ))}
  </View>
)

export const FrameCodes = () => (
  <View style={legendStyles.section}>
    <Text style={legendStyles.sectionHeader}>FRAMECODES</Text>
    {legend.frameCodes?.map((fc, index) => (
      <View key={index} style={legendStyles.row}>
        <Text style={legendStyles.label}>{fc.label}</Text>
        <Text style={legendStyles.value}>{fc.value}</Text>
      </View>
    ))}
  </View>
)

export const Questions = () => (
  <View style={legendStyles.section}>
    <Text style={legendStyles.sectionHeader}>QUESTIONS</Text>
    {legend.questionFields?.map((qf, index) => (
      <View key={index} style={legendStyles.row}>
        <Text style={[legendStyles.label, {width: 12}]}>{index + 1}</Text>
        <Text style={legendStyles.value}>{qf}</Text>
      </View>
    ))}
  </View>
)