cd mcma-core
call npm version %1
call npm publish
cd ../mcma-data
call npm version %1
call npm publish
cd ../mcma-api
call npm version %1
call npm publish
cd ../mcma-worker
call npm version %1
call npm publish
cd ../mcma-aws
call npm version %1
call npm publish