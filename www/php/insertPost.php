<?php

	include('sqlconnect.php');
	session_start();

	$email = $_REQUEST['email'];
	$password = $_REQUEST['password'];
	$date = date("Y-m-d");
	$title = $_REQUEST['title'];
	$content = $_REQUEST['content'];
	$catagory = $_REQUEST['catagory'];
	$sub_catagory = $_REQUEST['sub_catagory'];
	$post_zip = $_REQUEST['post_zip'];
	$post_city = $_REQUEST['post_city'];
	$post_near_city = $_REQUEST['post_near_city'];

	$query = "Select * from users where email = $email and password = $password";

	$rowSet = mysqli_query($link, $query);

	if($row = mysqli_fetch_assoc($rowSet)){
		$userId = $row['uid'];
		$username = $row['first_name'] . ' ' . $row['second_name'];

		/*$query = "Insert into posts('date',
									'username', 
									'title', 
									'content', 
									'userId', 
									'catagory', 
									'sub_catagory', 
									'post_zip', 
									'post_state', 
									'post_city',
									'post_near_city') 
					value('$date',
						'$username',
						'$title',
						'$content',
						'$userId',
						'$catagory',
						'$sub_catagory',
						'$post_zip',
						'$post_state',
						'$post_city',
						'$post_near_city')";
			*/
	}

?>