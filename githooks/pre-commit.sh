#!/bin/sh

echo 
echo '--- Execute Git hook ---'
echo 'For more information, see .git/hooks/pre-commit'
echo 

echo 'ESLint automatically formats files:'
cd clause-helper-app
npm run format

echo
echo '--- Finish execuiting Git hook ---'
echo