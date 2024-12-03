module.exports = {
  app: {
    name: 'US Remote Recruitment QA',
    displayCode: 'usremoterecqa',
    token: '6b128c4d-0e93-40bd-8461-3fdf8cd0f9d2',
    entryPoint: '',
    frontendLayerVersion: 2,
    reactVersion: 17,
  },
  initScripts: ['vendors', 'commons'],
  menus: [
    {
      name: 'QA Forms',
      menuType: 'SIDE_NAV',
      children: [
        {
          name: 'Audio & SMP QA Form',
          screenId: 'qa-form-audio-smp',
          menuType: 'SIDE_NAV',
        },
        {
          name: 'Generate New Reports',
          screenId: 'generate-report',
          menuType: 'SIDE_NAV',
        },
      ],
    }
  ],
}
