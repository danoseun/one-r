#
# WhatsApp Support API
#

PROJECT = "WhatsApp Support API"


all: install compile server

debug: ;@echo "Debugging ${PROJECT}.....http://0.0.0.0:8080/debug?port=5858 to start debugging"; \
	export NODE_PATH=.; \
	node-inspector & npm start;

test: ;@echo "Testing ${PROJECT}....."; \
	export NODE_PATH=.; \
	npm test;

compile: ;@echo "Building ${PROJECT}....."; \
	export NODE_PATH=.; \
	yarn build;

server : ;@echo ${$NODE_ENV} "Starting ${PROJECT}....."; \
	export NODE_PATH=.; \
	npx sequelize db:migrate && \
	pm2 reload 0 --update-env

install: ;@echo "Installing ${PROJECT}....."; \
	yarn

clean : ;
	rm -rf node_modules


.PHONY: test server install clean
