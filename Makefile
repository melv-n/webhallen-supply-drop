IMAGE=mirageous/webhallen-supply-drop
TAG=latest
PLATFORM?=linux/amd64

build:
	docker build --platform=$(PLATFORM) -t $(IMAGE):$(TAG) .

push: build
	docker push $(IMAGE):$(TAG)

run:
	docker run --rm -it --env-file .env $(IMAGE):$(TAG) 