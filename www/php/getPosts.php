<?php
session_start();
include("sqlconnect.php");

$catagory = $_REQUEST['catagory'];

$query = "Select * from `posts` where catagory=$catagory";
$rowSet = mysqli_query($link, $query);
$records = array();

while($row = mysqli_fetch_assoc($rowSet)){
	array_push($records, $row);	
}

json_encode($records);

?>