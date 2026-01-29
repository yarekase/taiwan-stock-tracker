import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_tw_stocks():
    url ="https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"
    print("抓取資料")

    try:
        response = requests.get(url, verify=False, timeout=10)
        data = response.json()

        formatted_data = [
            {
                "id": item["Code"],
                "name": item["Name"],
                "currentPrice": item["ClosingPrice"]
            }
            for item in data
        ]

        with open("stock.json","w",encoding="utf-8") as f:
            json.dump(formatted_data,f,ensure_ascii=False,indent=2)

        print(f"成功抓取{len(formatted_data)}筆股票")
    
    except Exception as e:
        print(f"抓取失敗：{e}")

if __name__ == "__main__":
    get_tw_stocks()