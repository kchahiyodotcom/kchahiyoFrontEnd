<?php
	header('Access-Control-Allow-Origin: *');
	include('sqlconnect.php');
	session_start();
	
	$query = 	"SELECT *
					FROM post_catagories";
	
	$rowSet = mysqli_query($link, $query);
	$rows = array();
	while($row = mysqli_fetch_assoc($rowSet)){
		array_push($rows, $row);
	}
	$payload = array('status'=>'success', 'content'=>$rows);
	echo json_encode($payload);
?>