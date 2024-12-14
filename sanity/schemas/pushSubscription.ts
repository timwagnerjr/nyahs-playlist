export default {
    name: 'pushSubscription',
    title: 'Push Subscription',
    type: 'document',
    fields: [
        {
            name: 'endpoint',
            type: 'string',
        },
        {
            name: 'keys',
            type: 'object',
            fields: [
                { name: 'p256dh', type: 'string' },
                { name: 'auth', type: 'string' }
            ]
        },
        {
            name: 'userId',
            type: 'string',
        },
        {
            name: 'createdAt',
            type: 'datetime',
            default: () => new Date().toISOString(),
        }
    ]
}; 