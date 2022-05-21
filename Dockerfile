FROM node:17.5

WORKDIR /server

COPY . .

RUN "yarn"

CMD [ "yarn", "dev" ]

