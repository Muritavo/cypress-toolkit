const FirebaseConfigShapeExample = {
    "emulators": {
        "auth": {
            "port": 9099,
        },
        "functions": {
            "port": 5001,
        },
        "firestore": {
            "port": 8080,
        },
        "hosting": {
            "port": 5000,
        },
        "storage": {
            "port": 9199,
        },
        "pubsub": {
            "port": 8055,
        },
        "ui": {
            "enabled": true,
            "port": 4000,
        }
    },
} as const

export type FirebaseConfigShape = typeof FirebaseConfigShapeExample