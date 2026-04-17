@echo off
git init
git remote add origin https://github.com/Canteen-Automation/RIT-Canteen.git
git checkout -b Abiram
git add .
git commit -m "Pushing code to Abiram branch"
git push -u origin Abiram --force
