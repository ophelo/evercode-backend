FROM node:16

WORKDIR /server

COPY . .

RUN "yarn"

CMD [ "yarn", "dev" ]

