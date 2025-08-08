module.exports = {
  appName: 'usremoterecqa',
  appEntry: {
    index: './src/index.ts',
    'generate-report': './src/modules/generate-report/GenerateNewReport.tsx',
    'qaforms-audio-smp': './src/modules/qaforms/screens/audio-smp/AudioSMP.tsx',
    'qaforms-ai-audio-smp': './src/modules/qaforms/screens/audio-smp-ai/AIAudioSMP.tsx',
    'edit-forms': './src/modules/edit-forms/EditForms.tsx',
    'operations': './src/modules/analytics/operations/Operations.tsx',
    // 'qaforms-tam': './src/modules/qaforms/screens/tam-video/qaforms-tam.tsx',
  },
}
