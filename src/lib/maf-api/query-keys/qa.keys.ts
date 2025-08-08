const qaKeys = {
    all: ['qa'] as const,
    apps: () => [...qaKeys.all, 'apps'] as const, // QA Apps list (all lines of business)
    formFields: (appID: number, fieldType?: string) => [...qaKeys.all, 'formFields', appID, fieldType ?? null] as const, // Audio/SMP, TAM Video, etc.
    formFieldsMap: (apps: number[]) => [...qaKeys.all, 'formFieldsMap', apps.join(',')] as const,
    auditTracking: () => [...qaKeys.all, 'auditTracking'] as const, // QA Audit reasoning codes
    riList: () => [...qaKeys.all, 'riList'] as const, // Research Interviewers (RI's) data
    calltypes: () => [...qaKeys.all, 'calltypes'] as const,
    sitenames: () => [...qaKeys.all, 'sitenames'] as const,
    framecodes: () => [...qaKeys.all, 'framecodes'] as const,
    mcaCategories: () => [...qaKeys.all, 'mcaCategories'] as const,
    skipLogicAudio: () => [...qaKeys.all, 'skipLogicAudio'] as const, // Disable/Skip logic for Audio/SMP QA Monitoring
    qaScoring: (appID: number) => [...qaKeys.all, 'qaScoring', appID] as const // QA Scoring by LOB
}

export default qaKeys