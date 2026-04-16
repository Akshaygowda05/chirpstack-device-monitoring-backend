FROM node:22
WORKDIR /src/server

COPY package*.json ./

RUN npm install
COPY . .

RUN npm install -g nodemon ts-node typescript

CMD ["nodemon", "src/server.ts","--exec","ts-node"]
