import  * as fs  from 'fs'
const  param=`interface=ap0
driver=nl80211
ctrl_interface=/data/misc/wifi/hostapd
ssid=mxBox
channel=6
ieee80211n=1
hw_mode=g
ignore_broadcast_ssid=0
max_num_sta=5
eap_server=1
wps_state=2
config_methods=display physical_display push_button
device_name=AndroidAP
manufacturer=MediaTek Inc.
model_name=MTK Wireless Model
model_number=66xx
serial_number=1.0
device_type=10-0050F204-5
wpa=2
rsn_pairwise=CCMP
wpa_psk=b283e10696a32fd90f9b04d03a6f48a1a20d87c580d44101762d21e1f8291366
`//" mxBox    qaqzwswxedec       "wpa_psk=5e7305e3d278cd3a543fd4f139369442f9981597aa195a5339e5a48d2e850108

export default ()=>fs.readFile('/data/misc/wifi/softap.conf','utf8',(err,data:string)=>{
    const softAP =" mxBox    qaqzwswxedec       " 
    if(!err){
        if(data !== softAP){
            fs.writeFile('/data/misc/wifi/hostapd.conf', param,(err)=>{if (err) console.error('set.ap.js:',err)})
            fs.writeFile('/data/misc/wifi/softap.conf', softAP,(err)=>{if (err) console.error('set.ap.js:',err)})
        }
    }else console.error(err)
})