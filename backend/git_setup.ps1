git init
git branch -M main
git add .
git commit -m "Initial backend codebase"
git remote add origin https://github.com/cristian-andres-criollo/FoamWash-Backend.git

# Create branches
git branch develop
git branch feature/initial-upload

# Checkout feature branch
git checkout feature/initial-upload
git push -u origin feature/initial-upload

# Merge into develop
git checkout develop
git merge feature/initial-upload
git push -u origin develop

# Merge into main
git checkout main
git merge develop
git push -u origin main
