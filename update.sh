docker build . -t docker-registry.etiam.si/roleta-etiam-si:latest
docker push docker-registry.etiam.si/roleta-etiam-si
kubectl rollout restart deployment roleta-etiam-si -n roleta-etiam-si
