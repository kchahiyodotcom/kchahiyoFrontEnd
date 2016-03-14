<?php
// API access key from Google API's Console

header('Access-Control-Allow-Origin: *');
session_start();
include_once ("sqlconnect.php");

$title = $_REQUEST['title'];
$message = $_REQUEST['message'];
$subtitle = $_REQUEST['subtitle'];
$tickerText = $_REQUEST['tickerText'];

define( 'API_ACCESS_KEY', 'AIzaSyBrvJZfEABsQ9d4fzqd3A_LbKnQ0QbVFjw' );
$noOfDevices = 0;
$query = 	"SELECT * FROM  `user_app_keys`";
		$registrationIds = array();
		$result = mysqli_query($link, $query);
		while ($row = mysqli_fetch_assoc($result)){
						array_push($registrationIds, $row["user_app_id"]);
						$noOfDevices++;
					}

//$registrationIds = array( $_GET['id'] );
// prep the bundle
$msg = array
(
	'vibrate'	=> 1,
	'sound'		=> 1,
	'largeIcon'	=> 'http://cinemagharhd.com/icon/icon_small.png',
	'icon'	=> 'icon_small'
);
$msg['title']	= $title;
$msg['subtitle']	= $subtitle;
$msg['message']	= $message;
$msg['tickerText']	= $tickerText;

$fields = array
(
	'registration_ids' 	=> $registrationIds,
	'data'			=> $msg
);
 
$headers = array
(
	'Authorization: key=' . API_ACCESS_KEY,
	'Content-Type: application/json'
);
 
$ch = curl_init();
curl_setopt( $ch,CURLOPT_URL, 'https://android.googleapis.com/gcm/send' );
curl_setopt( $ch,CURLOPT_POST, true );
curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
$result = curl_exec($ch );
curl_close( $ch );
if($result['success'] >= 0){
	echo "<br><h1>Push Notification Successfully broadcasted to $noOfDevices devices</h1><br>".
			"<p>Title : $msg[title]<br>".
			"<p>Subtitle : $msg[subtitle]<br>".
			"<p>Message : $msg[message]<br>".
			"<p>Ticker Text : $msg[tickerText]<br>";
}else{
	echo "<h1 style='color:red;'>Falure </h1>";
}
echo $result;