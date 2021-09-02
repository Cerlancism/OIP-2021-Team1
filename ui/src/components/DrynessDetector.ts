import { SensorModel } from "./Client"

import sampleDataRaw from "/data/sample.json"

export const sampleData = (sampleDataRaw as SensorModel[])

const TimePeriodSeconds = 300
const FrequencyAnomalyThreshold = 0.05
const FrequencyDrynessThreshold = 0.9

export function isDired(data: SensorModel[], offset: number)
{
    const partition = timedPartition(data, offset).map(x => x.humidity)
    const frequencyAnalysed = frequency(partition)
    const frequencyPercented = frequencyPercent(frequencyAnalysed)
    const result = lowerBoundPercent(frequencyPercented)
    return { result: result >= FrequencyDrynessThreshold, percent: result }
}

export function lowerBoundPercent(data: Map<number, number>)
{
    const sortedKeys = sort([...data.keys()])

    let sum = 0

    for (let index = 0; index < sortedKeys.length && index < 2; index++)
    {
        const value = data.get(sortedKeys[index]);
        sum += value
    }
    return sum
}

export function meanHumidity(data: SensorModel[], offset = data.length)
{
    return mean(timedPartition(data, offset).map(x => x.humidity))
}

function sum(data: number[])
{
    return data.reduce((a, b) => a + b, 0)
}

function mean(data: number[])
{
    return sum(data) / data.length
}

function sort(data: number[])
{
    return data.sort((a, b) => a - b)
}

function median(data: number[])
{
    const sorted = sort(data)
    return sorted[data.length / 2]
}

function frequency(data: number[])
{
    const result = new Map<number, number>()

    for (const iterator of data)
    {
        const current = result.get(iterator)
        if (!current)
        {
            result.set(iterator, 1)
        }
        else
        {
            result.set(iterator, current + 1)
        }
    }
    return result
}

function frequencyPercent(data: Map<number, number>)
{
    const total = sum([...data.values()])

    const significants = [...data.keys()].filter(x => data.get(x) / total >= FrequencyAnomalyThreshold)
    const eliminatedTotal = sum(significants.map(x => data.get(x)))

    return new Map(significants.map(x => [x, data.get(x) / eliminatedTotal]))
}

function timedPartition(data: SensorModel[], offset = data.length)
{
    let start = offset - TimePeriodSeconds

    if (start < 0)
    {
        start = 0
    }

    return data.slice().splice(start, offset - start)
}

function medianHumidity(data: SensorModel[])
{
    return median(timedPartition(data).map(x => x.humidity))
}

// for (let index = 300, previous = meanHumidity(sampleData, 0); index < sampleData.length; index += 1)
// {
//     const current = meanHumidity(sampleData, index)
//     // console.log(index, current, current - previous)
//     const f = frequencyPercent(frequency(timedPartition(sampleData, index).map(x => x.humidity)))

//     const obj = sort([...f.keys()]).reduce((a, b) =>
//     {
//         a[b.toString()] = (f.get(b) * 100).toFixed(1) + "%"
//         return a
//     }, {})

//     console.log(index, obj, isDriedByLowestPercent(f))
//     previous = current
// }