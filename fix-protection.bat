@echo off
cd /d C:\Users\ADMIN\Downloads\phantom-post
vercel curl "https://api.vercel.com/v9/projects/phantom-post?teamId=team_01CKdo5YRCourL9eD7i184XW" --method PATCH --header "Content-Type: application/json" --data "{\"ssoProtection\":null}"
echo Done
