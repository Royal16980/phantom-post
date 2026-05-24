Set-Location "C:\Users\ADMIN\Downloads\phantom-post"
$body = '{"ssoProtection":null,"passwordProtection":null}'
vercel curl "https://api.vercel.com/v9/projects/phantom-post?teamId=team_01CKdo5YRCourL9eD7i184XW" -X PATCH -H "Content-Type: application/json" -d $body 2>&1
Write-Host "Done"
