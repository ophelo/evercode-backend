FROM node:17.5

WORKDIR /server

RUN apt-get update && \
    apt-get -qy full-upgrade && \
    apt-get install -qy curl && \
    apt-get install -qy curl && \
    curl -sSL https://get.docker.com/ | sh

COPY . .

RUN npm install

RUN usermod -aG docker root

CMD [ "docker", "run", "hello-world"]

# CMD [ "npm", "run", "dev" ]

