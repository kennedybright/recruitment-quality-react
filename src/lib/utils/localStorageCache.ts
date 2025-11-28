const getExpirationTime = (durationMins) => {
    const now = new Date()
    // Calculate the expiration time in milliseconds
    return now.getTime() + durationMins * 60 * 1000
}

export const setCacheWithExpiration = (key, data, durationMins = 30) => {
    const item = {
        value: data,
        expiry: getExpirationTime(durationMins),
    }
    localStorage.setItem(key, JSON.stringify(item))
}

export const getCacheWithValidation = (key) => {
    const itemStr = localStorage.getItem(key)

    if (!itemStr) {
        return null
    }

    const item = JSON.parse(itemStr)
    const now = new Date()

    // Check if the cache has expired
    if (now.getTime() > item.expiry) {
        // Cache is stale, remove it
        localStorage.removeItem(key)
        return null
    }

    // Cache is valid
    return item.value
}