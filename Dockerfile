# Build Stage
FROM node:current-alpine AS build

WORKDIR /build

COPY package.json package-lock.json ./

RUN npm install && npm cache clean --force

COPY . .

RUN npm run build



# Production Stage
FROM nginx:stable-alpine AS production

WORKDIR /usr/share/nginx/html

COPY --from=build /build/dist .

EXPOSE 80

CMD ["nginx","-g","daemon off;"]