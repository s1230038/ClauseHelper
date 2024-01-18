#!/bin/sh

echo 
echo '--- Execute Git hook ---'
echo 'For more information, see .git/hooks/pre-commit'
echo
echo '*** npm script ***'
cd clause-helper-app

echo 'Secretlint checking files':
npm run secretlint
# If secretlint errors, stop the commit
if [ $? -eq 1 ]; then
    echo "secretlint failed. Commit stopped."
    exit 1
fi
echo

echo 'ESLint automatically formats files:'
npm run format

cd ..
echo '*** npm script completed ***'

echo
echo '--- Completed execuiting Git hook ---'
echo