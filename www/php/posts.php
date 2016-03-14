<?php
session_start();
include("sqlconnect.php");

$catagory = $_REQUEST['catagory'];

$query = "Select * from `posts` where catagory='Jobs'";
$rowSet = mysqli_query($link, $query);
$records = array();

while($row = mysqli_fetch_assoc($rowSet)){
	array_push($records, $row);	
}

echo json_encode($records);

?>

//api key AIzaSyBrvJZfEABsQ9d4fzqd3A_LbKnQ0QbVFjw
//256941818117