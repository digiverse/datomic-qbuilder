# Datomic Q-Builder GUI Client


## REST API
Change development REST api host create `.env` file with `VITE_API_HOST` variable before starting `vite dev`
```
VITE_API_HOST=http://localhost:8080
```


## Development stack
- Node Javascript V8 engine, package manager: [NodeJS](https://nodejs.org/) & [NPM](https://npmjs.com)
- Frontend framework: [Vue3](https://vuejs.org/)
- Typescript (JS superset): [Typescript](https://www.typescriptlang.org/)
- UI components, theming, icons: [Quasar](https://quasar.dev) & [Material icons](https://fonts.google.com/icons?selected=Material+Icons)
- Bundler and packer: [ViteJS](https://vitejs.dev/)
- Test framework: [Vitest](https://vitest.dev/)
- Linting and code-style: [eslint](https://eslint.org/) & [prettier](https://prettier.io/)
- CSS extension language: [sass](https://sass-lang.com/)



## Project Setup

```bash
npm i
```

## Running the Web Client

### Compile and Hot-Reload for Development

```bash
npm run dev:client
```

Point your browser to 

`http://localhost:3000/`

## Other build targets

### Type-Check, Compile and Minify for Production

```bash
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```bash
npm run lint
```

### Generate Client API

```bash
npm run generate-client
```

This target generates the client API from `./qbuilder-client-open-api.json` file.
The client API is placed in `./service` folder.

To update the `./qbuilder-client-open-api.json`, run the following command:
```bash
curl http://localhost:8080/api/swagger.json --output qbuilder-client-open-api.json 
```
NOTE: the datomic qbuilder server must be running.

## TODO - not yet available:

### Compile and Hot-Reload for Development with mock server

```bash
npm run dev
```
### Run Tests with [Vitest](https://vitest.dev/)

```bash
npm run test
```

