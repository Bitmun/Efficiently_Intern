FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 3000

CMD ["nodemon", "--watch", "src", "--exec", "npm", "run", "start:dev"]
