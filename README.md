# Stream Utils

A TypeScript library providing utility functions for working with Web Streams
API.

## Installation

```bash
npm install stream-utils
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
import { fromIterable, map, filter, toArray } from 'stream-utils'

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
const { fromIterable, map, filter, toArray } = require('stream-utils')

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
-
`filter<T>(predicate: (chunk: T) => boolean | Promise<boolean>): TransformStream<T, T>`
- `tap<T>(fn: (chunk: T) => void | Promise<void>): TransformStream<T, T>`
- `batch<T>(size: number): TransformStream<T, T[]>`
- `flatten<T>(): TransformStream<T[], T>`
- `take<T>(limit: number): TransformStream<T, T>`
- `skip<T>(count: number): TransformStream<T, T>`

### Stream Creation

- `fromIterable<T>(iterable: Iterable<T> | AsyncIterable<T>): ReadableStream<T>`
- `interval(period: number): ReadableStream<number>`

### Stream Combination

- `merge<T>(...streams: ReadableStream<T>[]): ReadableStream<T>`

### Consumption

- `toArray<T>(stream: ReadableStream<T>): Promise<T[]>`

## Documentation

A complete documentation is automatically generated from the source code using
TypeDoc.

To generate the documentation:

```bash
npm run docs
```

The documentation will be available in the `docs/` directory.

## Development

### Setup

```bash
yarn install
yarn prepare
```

### Testing

```bash
yarn test
yarn test:watch
yarn run test:coverage
```

### Formatting

```bash
npm run format
```

### Committing Changes

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
for commit messages. You can use the following command to create a commit:

```bash
npm run commit
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

The release process requires the following GitHub secrets to be set:

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `NPM_TOKEN`: Your npm authentication token with publish permissions

## Browser Support

This library supports all modern browsers and Node.js 16+. It uses the Web
Streams API, which is available in all modern browsers and Node.js.

## License

MIT
