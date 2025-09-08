
FROM node:18


WORKDIR /app


COPY package*.json ./

RUN npm ci


COPY . .


RUN chmod +x node_modules/.bin/next


RUN npx next build


EXPOSE 8080


CMD ["npm", "run", "start", "--", "-p", "8080"]
