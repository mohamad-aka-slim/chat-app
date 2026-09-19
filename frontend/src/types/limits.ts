// Length limits mirroring backend model columns / pydantic Field bounds.
export const LIMITS = {
    username: { min: 2, max: 50 },
    roomName: { min: 1, max: 100 },
    roomDescription: { max: 500 },
    message: { min: 1, max: 2000 },
} as const;