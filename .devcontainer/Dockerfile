# Update the VARIANT arg in docker-compose.yml to pick a Node version: 10, 12, 14
ARG VARIANT=12

FROM quay.io/estuary/flow:v0.1.0-53-g3c899c1
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

# Copy in Estuary Flow release binaries.
COPY --from=0 /usr/local/bin/* /usr/local/bin/
# Generate Flow catalog JSON-Schema for integration with VSCode.
RUN flowctl json-schema > /usr/local/etc/flow.schema.json

# Update args in docker-compose.yaml to set the UID/GID of the "flow" user.
# ARG USER_UID=1000
# ARG USER_GID=$USER_UID
# RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then \
#         groupmod --gid $USER_GID flow \
#         && usermod --uid $USER_UID --gid $USER_GID flow \
#         && chmod -R $USER_UID:$USER_GID /home/flow \
#         && chmod -R $USER_UID:root /usr/local/share/nvm /usr/local/share/npm-global; \
#     fi

COPY requirements.txt /usr/local/etcd/flow-doc-requirements.txt
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
        postgresql-client \
        pv \
        python3-pip \
        python3-setuptools \
    && pip3 install -r /usr/local/etcd/flow-doc-requirements.txt
