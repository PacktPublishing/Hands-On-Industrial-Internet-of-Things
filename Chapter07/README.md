
# Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018

# Chapter 07

## Timeseries curl

```
curl -d '{"metric": "sys.cpu", "timestamp": 1529176746, "value": 90, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put

curl -d '{"metric": "sys.cpu", "timestamp": 1529176756, "value": 100, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put

  curl -d '{"metric": "sys.cpu", "timestamp": 1529176766, "value": 110, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put


curl -d '{"metric": "sys.cpu", "timestamp": 1529176776, "value": 111, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put


curl -d '{"metric": "sys.cpu", "timestamp": 1529176876, "value": 211, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put
```