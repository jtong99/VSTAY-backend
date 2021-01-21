VSTAY backend
Defined scripts
Start app on container in dev mode on port 4000:

## Requirements

Make sure following command available on your system:

- docker
- docker-compose
- node
- npm
- nvm
- git

Recommend VSCode Extension:

- EditorConfig for VS Code

## Commit message syntax

tag: [action] [target]

Tags:
'feat',
'fix',
'build',
'chore',
'docs',
'improv',
'perf',
'refactor',
'revert',
'style',
'test',

Actions: `add`, `create`, `remove`, `modify`, `change`

Targets: name of functions, attributes or objects...

## Development Rules

- Always run app with defined scripts.
- Commit with the messages point to what you have been done within that commit.

## Start server

```
cp .env.example .env
npm install
npm run docker:dev
```
