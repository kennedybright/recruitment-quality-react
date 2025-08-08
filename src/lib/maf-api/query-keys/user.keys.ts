const userKeys = {
    all: ['users'] as const,
    currentUser: (email: string) => [...userKeys.all, 'currentUser', email] as const,
    qaUsers: () => [...userKeys.all, 'qaUsers'] as const,
    teamManager: () => [...userKeys.all, 'teamManager'] as const,
}

export default userKeys