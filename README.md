# Mock para justificativas de ticket Gerdau


### adicione o seguinte código no arquivo scrapp-web/src/api/axiosInstance
```javascript
// @TODO remove this, mock propose only.
AxiosInstance.interceptors.request.use(function (config) {
  if(config.url.startsWith("ticket-detail-buyer") || config.url.startsWith("ticket-justify")) {
    config.baseURL = "http://localhost:5000";
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

```

### agora rode esta api com
```bash
node index.js
```

> Para abrir Chrome/Brave sem CORS, utilize:

#### Brave Windows 
```bash
brave.exe --user-data-dir="C://Chrome dev session" --disable-web-security "localhost:3000"
```
#### Chrome Windows
```bash
chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security "localhost:3000"
```

#### Chrome Linux
```bash
google-chrome --disable-web-security
```


#### Request de criação
```bash
curl --location --request POST 'http://localhost:5000/ticket-justify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "TICKET": "000012592826",
    "TYPE_JUSTIFY": 4,
    "OTHERS_DESCRIPTION": "Um salve pra Mané Garrincha"
}'
```