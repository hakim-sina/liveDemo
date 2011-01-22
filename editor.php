<?php
include('inc/corefuncs.php');
include('inc/connection.inc.php');
nukeMagicQuotes();
$key = $_GET['key'];
$referer = parse_url($_SERVER['HTTP_REFERER']);
$url = $referer[host];
$conn = dbConnect('query');
$getKey = "SELECT * FROM sites
				   WHERE url = '$url' ";
$getdb = $conn->query($getKey) or die(mysqli_error($conn));
$row = $getdb->fetch_assoc();
$apiKey = $row['apikey'];
if($apiKey == $key){
	$file = 'editor.js';
	header("Cache-Control: no-cache, must-revalidate"); 
	header("Pragma: no-cache"); 
	header("Content-type: text/javascript"); 
	header("Content-disposition: inline; filename=".$file);
	header('Location: '.$file);
}else{
	print("alert('wrong api key $url')");
}
?>