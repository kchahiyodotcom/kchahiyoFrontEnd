<?php
	include('sqlconnect.php');
	session_start();
	if(isset($_REQUEST['zip'])){
		$zip = $_REQUEST['zip'];

		
		$query = 	"SELECT *
					FROM zipcodes
					WHERE zip = '$zip'
					LIMIT 1";

		$rowSet = mysqli_query($link, $query);
		
		if($row = mysqli_fetch_assoc($rowSet)){
			echo json_encode($row);
		}
		else{
			echo json_encode(['status'=>'error']);
		}
	}else{
		echo 'parameters missing';
	}
?>