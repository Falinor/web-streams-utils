# Web streams utils

A TypeScript library providing utility functions for working with the Web Stream
API.

## Installation

```bash
npm install web-streams-utils
```

## Features

- Fully typed with TypeScript
- Zero dependencies
- Works in both Node.js and browsers
- Provides common stream operations like map, filter, tap, etc.
- Compatible with the standard Web Streams API
- Supports both ESM and CommonJS imports

## Usage

### ESM (ECMAScript Modules)

```typescript
import { fromIterable, map, filter, toArray } from 'web-streams-utils'

async function example() {
  const inputData = [1, 2, 3, 4, 5]

  const stream = fromIterable(inputData)
    .pipeThrough(filter(n => n % 2 === 0)) // Keep even numbers
    .pipeThrough(map(n => n * 2)) // Double each number

  const result = await toArray(stream)
  console.log(result) // [4, 8]
}

example()
```

### CommonJS

```javascript
const { fromIterable, map, filter, toArray } = require('web-streams-utils')

async function example() {
  const inputData = [1, 2, 3, 4, 5]

  const stream = fromIterable(inputData)
    .pipeThrough(filter(n => n % 2 === 0))
    .pipeThrough(map(n => n * 2))

  const result = await toArray(stream)
  console.log(result) // [4, 8]
}

example()
```

## API Reference

### Transformation Functions

- `map<T, R>(fn: (chunk: T) => R | Promise<R>): TransformStream<T, R>`
- `filter<T>(predicate: (chunk: T) => boolean | Promise<boolean>): TransformStream<T, T>`
- `tap<T>(fn: (chunk: T) => void | Promise<void>): TransformStream<T, T>`
- `batch<T>(size: number): TransformStream<T, T[]>`
- `flatten<T>(): TransformStream<T[], T>`
- `take<T>(limit: number): TransformStream<T, T>`
- `skip<T>(count: number): TransformStream<T, T>`
- `scan<T, R>(scanner: (accumulator: R, chunk: T) => R | Promise<R>, initialValue: R): TransformStream<T, R>`
- `compact<T>(): TransformStream<T, NonNullable<T>>`
- `flatMap<T, R>(fn: (chunk: T) => R[] | Promise<R[]>): TransformStream<T, R>`
- `reduce<T>(reducer: (accumulator: T, chunk: T) => T | Promise<T>): TransformStream<T, T>`

### Stream Creation

- `fromIterable<T>(iterable: Iterable<T> | AsyncIterable<T>): ReadableStream<T>`
- `interval(period: number): ReadableStream<number>`

### Stream Combination

- `merge<T>(...streams: ReadableStream<T>[]): ReadableStream<T>`

### Consumption

- `toArray<T>(stream: ReadableStream<T>): Promise<T[]>`

## Documentation

The complete API documentation is available at [https://falinor.github.io/web-streams-utils/](https://falinor.github.io/web-streams-utils/).

You can also generate the documentation locally:

```bash
yarn docs
```

The documentation will be available in the `docs/` directory.

## Development

### Setup

```bash
corepack enable
yarn install
```

### Testing

```bash
yarn test
yarn test:watch
yarn test:coverage
```

### Formatting

```bash
yarn format
```

### Committing Changes

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
for commit messages. You can use the following command to create a commit:

```bash
yarn commit
```

### Releasing

This project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/)
for automated versioning and releases. Releases are automatically triggered by
GitHub Actions when changes are pushed to the main branch. The workflow will:

1. Analyze commit messages to determine the next version
2. Generate release notes
3. Update the CHANGELOG.md
4. Publish to npm
5. Create a GitHub release
6. Deploy documentation to GitHub Pages

The release process requires the following GitHub secrets to be set:

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `NPM_TOKEN`: Your npm authentication token with publish permissions

## Browser Support

This library supports all modern browsers and Node.js 16+. It uses the Web
Streams API, which is available in all modern browsers and Node.js.

## License

MIT
