
# Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018

# Chapter 07


## Simple docker command

```
mkdir static
echo "<html><body>I-IoT</body></html>" > static/index.html

docker build --tag micropy .
docker run -p 80:8080 micropy

```


## OpenTSDB Commands

```
git clone https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things
cd Chatpter07/opentsdb
docker build . --tag iiot:opentsdb
docker run -v data:/data/hbase -p 4242:4242 --name opentsdb iiot:opentsdb 


```


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


  curl -X GET http://localhost:4242/api/search/lookup?m=sys.cpu
```