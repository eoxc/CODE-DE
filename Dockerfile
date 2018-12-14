FROM ubuntu:18.04

RUN apt update && \
    apt install -y git npm && \
    rm -rf /var/lib/apt/lists/* && \
    git clone https://github.com/eoxc/CODE-DE.git

ENV BRANCH master

CMD cd CODE-DE && \
    git checkout ${BRANCH} && \
    git pull && \
    npm install && \
    npm run build

# Usage:
# docker build . -t code-de-bundling
# docker run -v `pwd`/dist:/CODE-DE/dist/ --env BRANCH=1.0 code-de-bundling
