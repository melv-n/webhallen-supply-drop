IMAGE=mirageous/webhallen-supply-drop
TAG=latest

build:
	docker build -t $(IMAGE):$(TAG) .

push: build
	docker push $(IMAGE):$(TAG)

run:
	docker run --rm -it --env-file .env $(IMAGE):$(TAG) 