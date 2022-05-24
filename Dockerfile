FROM node:17.8

WORKDIR /server

COPY . .

RUN "yarn"

CMD [ "yarn", "dev" ]

