FROM node
WORKDIR /app
RUN npm i -g pm2
COPY package.json /app/
RUN yarn install
COPY . .
CMD ["pm2-runtime", "random.js"]