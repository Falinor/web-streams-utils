type SyncOrAsync<T> = T | Promise<T>

/**
 * Remove null and undefined values from a stream
 *
 * @category Transformation
 * @returns A TransformStream that filters out null and undefined values
 * @example
 * ```ts
 * const readable = new ReadableStream({
 *   start(controller) {
 *     const items = [1, null, 2, undefined, 3]
 *     items.forEach(item => {
 *       controller.enqueue(item)
 *     })
 *   }
 * })
 * const stream = readable.pipeThrough(compact());
 * // If readable emits [1, null, 2, undefined, 3], the result will be [1, 2, 3]
 * ```
 */
export function compact<T>(): TransformStream<T, NonNullable<T>> {
  return new TransformStream({
    async transform(chunk, controller) {
      if (chunk !== null && chunk !== undefined) {
        controller.enqueue(chunk)
      }
    }
  })
}

/**
 * Map function for transforming stream chunks
 *
 * @category Transformation
 * @param fn - The transformation function to apply to each chunk
 * @returns A TransformStream that applies the transformation
 * @example
 * ```ts
 * const stream = readable.pipeThrough(map(x => x * 2));
 * ```
 */
export function map<T, R>(
  fn: (chunk: T) => SyncOrAsync<R>
): TransformStream<T, R> {
  return new TransformStream({
    async transform(chunk, controller) {
      controller.enqueue(await fn(chunk))
    }
  })
}

/**
 * Map and flatten stream chunks
 *
 * @category Transformation
 * @param fn - The transformation function that returns an array
 * @returns A TransformStream that applies the transformation and flattens the result
 * @example
 * ```ts
 * const stream = readable.pipeThrough(flatMap(word => word.split(''));
 * ```
 */
export function flatMap<T, R>(
  fn: (chunk: T) => SyncOrAsync<R[]>
): TransformStream<T, R> {
  const mapper = map<T, R[]>(fn)
  const flattener = flatten<R>()
  mapper.readable.pipeThrough(flattener)
  return {
    readable: flattener.readable,
    writable: mapper.writable
  }
}

/**
 * Filter function for filtering stream chunks
 *
 * @category Transformation
 * @param predicate - The predicate function to determine which chunks to keep
 * @returns A TransformStream that only passes chunks that satisfy the predicate
 * @example
 * ```ts
 * const stream = readable.pipeThrough(filter(x => x > 10));
 * ```
 */
export function filter<T>(
  predicate: (chunk: T) => SyncOrAsync<boolean>
): TransformStream<T, T> {
  return new TransformStream({
    async transform(chunk, controller) {
      if (await predicate(chunk)) {
        controller.enqueue(chunk)
      }
    }
  })
}

/**
 * Tap function for side effects without modifying the stream
 *
 * @category Transformation
 * @param fn - The function to execute for each chunk (for side effects)
 * @returns A TransformStream that passes chunks unchanged after executing the function
 * @example
 * ```ts
 * const stream = readable.pipeThrough(tap(x => console.log(`Processing: ${x}`)));
 * ```
 */
export function tap<T>(
  fn: (chunk: T) => SyncOrAsync<void>
): TransformStream<T, T> {
  return new TransformStream({
    async transform(chunk, controller) {
      await fn(chunk)
      controller.enqueue(chunk)
    }
  })
}

/**
 * Collect all stream chunks into an array
 *
 * @category Consumption
 * @param stream - The readable stream to collect
 * @returns A promise that resolves to an array of all chunks
 * @example
 * ```ts
 * const result = await toArray(readable);
 * console.log(result); // [1, 2, 3, ...]
 * ```
 */
export async function toArray<T>(stream: ReadableStream<T>): Promise<T[]> {
  const array: T[] = []
  await stream.pipeTo(
    new WritableStream<T>({
      write(chunk: T) {
        array.push(chunk)
      }
    })
  )
  return array
}

/**
 * Batch chunks into arrays of specified size
 *
 * @category Transformation
 * @param size - The size of each batch
 * @returns A TransformStream that groups chunks into batches
 * @example
 * ```ts
 * const stream = readable.pipeThrough(batch(3));
 * // If readable emits [1, 2, 3, 4, 5], the result will be [[1, 2, 3], [4, 5]]
 * ```
 */
export function batch<T>(size: number): TransformStream<T, T[]> {
  let buffer: T[] = []

  return new TransformStream({
    transform(chunk, controller) {
      buffer.push(chunk)

      if (buffer.length >= size) {
        controller.enqueue([...buffer])
        buffer = []
      }
    },
    flush(controller) {
      if (buffer.length > 0) {
        controller.enqueue(buffer)
      }
    }
  })
}

/**
 * Flatten a stream of arrays into individual chunks
 *
 * @category Transformation
 * @returns A TransformStream that flattens arrays into individual chunks
 * @example
 * ```ts
 * const stream = readable.pipeThrough(flatten());
 * // If readable emits [[1, 2], [3, 4]], the result will be [1, 2, 3, 4]
 * ```
 */
export function flatten<T>(): TransformStream<T[], T> {
  return new TransformStream({
    transform(chunk, controller) {
      chunk.forEach(item => {
        controller.enqueue(item)
      })
    }
  })
}

/**
 * Limit the number of chunks from a stream
 *
 * @category Transformation
 * @param limit - The maximum number of chunks to pass through
 * @returns A TransformStream that limits the number of chunks
 * @example
 * ```ts
 * const stream = readable.pipeThrough(take(3));
 * // Only the first 3 chunks will pass through
 * ```
 */
export function take<T>(limit: number): TransformStream<T, T> {
  let count = 0

  return new TransformStream({
    transform(chunk, controller) {
      if (count < limit) {
        controller.enqueue(chunk)
        count++
      }

      if (count >= limit) {
        // Hmm not sure about that
        controller.terminate()
      }
    }
  })
}

/**
 * Skip a number of chunks from the beginning of a stream
 *
 * @category Transformation
 * @param count - The number of chunks to skip
 * @returns A TransformStream that skips the specified number of chunks
 * @example
 * ```ts
 * const stream = readable.pipeThrough(skip(2));
 * // The first 2 chunks will be skipped
 * ```
 */
export function skip<T>(count: number): TransformStream<T, T> {
  let skipped = 0

  return new TransformStream({
    transform(chunk, controller) {
      if (skipped < count) {
        skipped++
        return
      }

      controller.enqueue(chunk)
    }
  })
}

/**
 * Merge multiple streams into a single stream
 *
 * @category Combination
 * @param streams - The streams to merge
 * @returns A ReadableStream that emits chunks from all input streams
 * @example
 * ```ts
 * const mergedStream = merge(stream1, stream2, stream3);
 * ```
 */
export function merge<T>(...streams: ReadableStream<T>[]): ReadableStream<T> {
  return new ReadableStream<T>({
    async start(controller) {
      try {
        await Promise.all(
          streams.map(async stream => {
            const reader = stream.getReader()
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                controller.enqueue(value)
              }
            } finally {
              reader.releaseLock()
            }
          })
        )
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}

/**
 * Create a ReadableStream from an iterable
 *
 * @category Stream Creation
 * @param iterable - The iterable or async iterable to convert to a stream
 * @returns A ReadableStream that emits items from the iterable
 * @example
 * ```ts
 * const stream = fromIterable([1, 2, 3]);
 * // or
 * const stream = fromIterable(asyncGenerator());
 * ```
 */
export function fromIterable<T>(
  iterable: Iterable<T> | AsyncIterable<T>
): ReadableStream<T> {
  return new ReadableStream<T>({
    async start(controller) {
      try {
        for await (const item of iterable) {
          controller.enqueue(item)
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}

/**
 * Create a ReadableStream that emits values at specified intervals
 *
 * @category Stream Creation
 * @param period - The interval in milliseconds between emissions
 * @returns A ReadableStream that emits incrementing numbers at the specified interval
 * @example
 * ```ts
 * const stream = interval(1000); // Emits 0, 1, 2, ... every second
 * ```
 */
export function interval(period: number): ReadableStream<number> {
  let counter = 0

  return new ReadableStream<number>({
    start(controller) {
      const id = setInterval(() => {
        controller.enqueue(counter++)
      }, period)

      return () => {
        clearInterval(id)
      }
    }
  })
}
