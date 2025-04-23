import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  map,
  filter,
  tap,
  toArray,
  batch,
  flatten,
  take,
  skip,
  merge,
  fromIterable,
  interval,
  flatMap,
  compact
} from '.'

describe('Stream Utils', () => {
  async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  describe('compact', () => {
    it('should filter out falsy values', async () => {
      const stream = fromIterable([
        1,
        undefined,
        2,
        null,
        3,
        null,
        undefined
      ]).pipeThrough(compact())
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3])
    })

    it('should handle async streams', async () => {
      const stream = fromIterable([
        Promise.resolve(1),
        Promise.resolve(null),
        Promise.resolve(2)
      ]).pipeThrough(compact())
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2])
    })

    it('should handle empty streams', async () => {
      const stream = fromIterable([]).pipeThrough(compact())
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })
  })

  describe('map', () => {
    it('should transform each chunk', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(map(n => n * 2))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([2, 4, 6])
    })

    it('should handle async transformations', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(
        map(async n => {
          await delay(10)
          return n * 2
        })
      )
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([2, 4, 6])
    })
  })

  describe('flatMap', () => {
    it('should transform and flatten chunks', async () => {
      const stream = fromIterable(['hello', 'world']).pipeThrough(
        flatMap(str => str.split(''))
      )
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([
        'h',
        'e',
        'l',
        'l',
        'o',
        'w',
        'o',
        'r',
        'l',
        'd'
      ])
    })

    it('should handle async transformations', async () => {
      const stream = fromIterable(['a', 'b']).pipeThrough(
        flatMap(async str => {
          await delay(10)
          return [str, str.toUpperCase()]
        })
      )
      const actual = await toArray(stream)
      expect(actual).toStrictEqual(['a', 'A', 'b', 'B'])
    })

    it('should handle empty arrays', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(flatMap(() => []))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })
  })

  describe('filter', () => {
    it('should filter chunks based on predicate', async () => {
      const stream = fromIterable([1, 2, 3, 4, 5]).pipeThrough(
        filter(n => n % 2 === 0)
      )
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([2, 4])
    })

    it('should handle async predicates', async () => {
      const stream = fromIterable([1, 2, 3, 4, 5]).pipeThrough(
        filter(async n => {
          await delay(10)
          return n % 2 === 0
        })
      )
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([2, 4])
    })
  })

  describe('tap', () => {
    it('should execute side effect without modifying chunks', async () => {
      const tapped: number[] = []
      const stream = fromIterable([1, 2, 3]).pipeThrough(
        tap(n => {
          tapped.push(n)
        })
      )
      const actual = await toArray(stream)

      expect(actual).toStrictEqual([1, 2, 3])
      expect(tapped).toStrictEqual([1, 2, 3])
    })

    it('should handle async side effects', async () => {
      const tapped: number[] = []
      const stream = fromIterable([1, 2, 3]).pipeThrough(
        tap(async n => {
          await delay(10)
          tapped.push(n)
        })
      )
      const actual = await toArray(stream)

      expect(actual).toStrictEqual([1, 2, 3])
      expect(tapped).toStrictEqual([1, 2, 3])
    })
  })

  describe('toArray', () => {
    it('should collect all chunks into an array', async () => {
      const stream = fromIterable([1, 2, 3])
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3])
    })

    it('should handle empty streams', async () => {
      const stream = fromIterable([])
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })
  })

  describe('batch', () => {
    it('should batch chunks into arrays of specified size', async () => {
      const stream = fromIterable([1, 2, 3, 4, 5]).pipeThrough(batch(2))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([[1, 2], [3, 4], [5]])
    })

    it('should handle empty streams', async () => {
      const stream = fromIterable([]).pipeThrough(batch(2))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })

    it('should handle batch size larger than stream length', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(batch(5))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([[1, 2, 3]])
    })
  })

  describe('flatten', () => {
    it('should flatten arrays into individual chunks', async () => {
      const stream = fromIterable([[1, 2], [3, 4], [5]]).pipeThrough(flatten())
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3, 4, 5])
    })

    it('should handle empty arrays', async () => {
      const stream = fromIterable([[], [], []]).pipeThrough(flatten())
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })

    it('should handle empty streams', async () => {
      const stream = fromIterable([]).pipeThrough(flatten())
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })
  })

  describe('take', () => {
    it('should limit the number of chunks', async () => {
      const stream = fromIterable([1, 2, 3, 4, 5]).pipeThrough(take(3))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3])
    })

    it('should handle limit larger than stream length', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(take(5))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3])
    })

    it('should handle limit of zero', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(take(0))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })
  })

  describe('skip', () => {
    it('should skip the specified number of chunks', async () => {
      const stream = fromIterable([1, 2, 3, 4, 5]).pipeThrough(skip(2))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([3, 4, 5])
    })

    it('should handle skip count larger than stream length', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(skip(5))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })

    it('should handle skip count of zero', async () => {
      const stream = fromIterable([1, 2, 3]).pipeThrough(skip(0))
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3])
    })
  })

  describe('merge', () => {
    it('should merge multiple streams', async () => {
      const stream1 = fromIterable([1, 2, 3])
      const stream2 = fromIterable([4, 5, 6])
      const merged = merge(stream1, stream2)
      const actual = await toArray(merged)

      // Since merge doesn't guarantee order, we just check that all items are present
      expect(actual).toHaveLength(6)
      expect(actual).toStrictEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6]))
    })

    it('should handle empty streams', async () => {
      const stream1 = fromIterable([])
      const stream2 = fromIterable([1, 2, 3])
      const merged = merge(stream1, stream2)
      const actual = await toArray(merged)
      expect(actual).toStrictEqual([1, 2, 3])
    })

    it('should handle all empty streams', async () => {
      const stream1 = fromIterable([])
      const stream2 = fromIterable([])
      const merged = merge(stream1, stream2)
      const actual = await toArray(merged)
      expect(actual).toStrictEqual([])
    })
  })

  describe('fromIterable', () => {
    it('should create a stream from an array', async () => {
      const stream = fromIterable([1, 2, 3])
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3])
    })

    it('should create a stream from an async iterable', async () => {
      async function* generator() {
        yield 1
        yield 2
        yield 3
      }

      const stream = fromIterable(generator())
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([1, 2, 3])
    })

    it('should handle empty iterables', async () => {
      const stream = fromIterable([])
      const actual = await toArray(stream)
      expect(actual).toStrictEqual([])
    })
  })

  describe('interval', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should emit values at specified intervals', async () => {
      const stream = interval(1000).pipeThrough(take(3))

      const promise = toArray(stream)

      // Advance time to get 3 values
      vi.advanceTimersByTime(3000)

      const actual = await promise
      expect(actual).toStrictEqual([0, 1, 2])
    })
  })

  describe('Composition', () => {
    it('should support chaining multiple operations', async () => {
      const stream = fromIterable([1, 2, 3, 4, 5, 6])
        .pipeThrough(filter(n => n % 2 === 0))
        .pipeThrough(map(n => n * 10))
        .pipeThrough(take(2))

      const actual = await toArray(stream)
      expect(actual).toStrictEqual([20, 40])
    })

    it('should support complex transformations', async () => {
      const tapped: number[] = []

      const stream = fromIterable([1, 2, 3, 4, 5, 6, 7, 8, 9])
        .pipeThrough(filter(n => n % 3 === 0))
        .pipeThrough(
          tap(n => {
            tapped.push(n)
          })
        )
        .pipeThrough(map(n => n * n))
        .pipeThrough(batch(2))

      const actual = await toArray(stream)
      expect(actual).toStrictEqual([[9, 36], [81]])
      expect(tapped).toStrictEqual([3, 6, 9])
    })
  })
})
