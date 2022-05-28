FROM node:17.8

RUN apt-get update && \
    apt-get -qy full-upgrade && \
    apt-get install -qy curl && \
    apt-get install -y uidmap && \
    apt-get install -y iptables && \
    apt-get install -y kmod && \
    curl -sSL https://get.docker.com/ | sh

COPY . .

RUN npm install

CMD [ "npm", "run", "dev" ]

