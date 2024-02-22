#!/bin/sh

echo 
echo '--- Execute Git hook ---------------'
echo 'For more information, see .git/hooks/pre-push'
echo
echo '*** npm script ***'
cd clause-helper-app

echo '* Test runs'
npm run test
echo

cd ..
echo '*** npm script completed ***'

echo
echo '--- Completed execuiting Git hook ---------------'
echo