package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	url := "https://dvw62573.live.dynatrace.com/api/v1/entity/infrastructure/processes?timeframe=30m&actualMonitoringState=OFF&expectedMonitoringState=ON&includeDetails=true"
	token := "dt0c01.LNDDLLZ5QECEDBRFDFCUOWGC.JLQQY3S3GD2HMK4RWDFB23AAARPMHCKWLV7FBUAKELKHER3JIS3A6IUNEFAITA4T"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	req.Header.Set("Authorization", "Api-token "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return
	}

	var data []map[string]interface{}

	err = json.Unmarshal(body, &data)
	if err != nil {
		fmt.Println(err)
		return
	}

	for _, p := range data {
		if p["restartRequired"].(bool) {
			fmt.Printf("displayName: %v\n", p["displayName"])
		}
	}

}
