export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export const toFormattedNumber = (value: number) => {
    let newValue = ''

    const removeSpaces = value!.toString().replace(/\s/g, '')
    const isHasFractions =
        ~removeSpaces.indexOf(',') || ~removeSpaces.indexOf('.')
    const withFractions = parseFloat(removeSpaces.replace(',', '.'))
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    if (isHasFractions) {
        newValue = withFractions
    } else {
        newValue = parseInt(removeSpaces, 10)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    return newValue
}