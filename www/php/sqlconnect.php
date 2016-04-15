<?php

$link = mysqli_connect("mysql6.000webhost.com", "a7127834_nish", "UTAcmptr12345", "a7127834_kcDB");
if (!$link) {
    die('Could not connect: ' . mysql_error());
}


function close_link(){
	global $link;
 mysqli_close($link);	
}

?>

