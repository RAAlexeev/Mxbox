echo -e "interface=ap0
driver=nl80211
ctrl_interface=/data/misc/wifi/hostapd
ssid=MX
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
wpa_psk=7161717A7773777865646563" > /data/misc/wifi/hostapd.conf